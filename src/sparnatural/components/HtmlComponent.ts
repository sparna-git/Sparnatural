import BaseClassFactory from "./baseClassFactory/BaseClassFactory";

// keyboard users get the focus moved to what comes next after a choice, mouse users keep theirs
let keyboardUser = false;
// confirmations of keyboard actions that move the focus : said before the next focused element
let pendingConfirmations: string[] = [];
document.addEventListener("keydown", () => {
  keyboardUser = true;
  // a new action : what was not said is not relevant anymore
  pendingConfirmations = [];
}, true);
// a real move of the mouse : screen readers activate buttons with a click that does not move it
document.addEventListener("mousemove", (e: MouseEvent) => {
  if (e.movementX || e.movementY) keyboardUser = false;
}, true);
// the last focused element was in Sparnatural : when it disappears, the focus is given back there.
// Screen readers activate a button without any key reaching the page, the focus tells it.
let focusWasInside = false;
document.addEventListener("focusin", (e: FocusEvent) => {
  focusWasInside = !!(e.target as Element).closest?.(".Sparnatural");
}, true);

// a confirmation not said with a new focus within half a second is said on its own
let flushTimer: number = null;
function sayPendingLater(root: Element) {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    if (pendingConfirmations.length === 0) return;
    const message = pendingConfirmations.join(". ");
    pendingConfirmations = [];
    root?.dispatchEvent(new CustomEvent("announce", { bubbles: true, detail: message }));
  }, 500);
}

export interface IRenderable {
  render: () => this;
}

export class HTMLComponent implements IRenderable {
  baseCssClass: string;
  static BaseClassFactory = new BaseClassFactory();

  parentComponent: HTMLComponent;
  widgetHtml: JQuery<HTMLElement>;
  html: JQuery<HTMLElement>;
  // TODO this is only temporarly. Some components (ActionWhere) don't need to be attached on there parentcomponent but somewhere else
  htmlParent: JQuery<HTMLElement> = null;

  constructor(
    baseCssClass: string,
    ParentComponent: HTMLComponent,
    widgetHtml: JQuery<HTMLElement>
  ) {
    this.baseCssClass = baseCssClass;
    this.parentComponent = ParentComponent;

    // create the HTML element
    this.html = HTMLComponent.BaseClassFactory.getBaseClass(this.baseCssClass);
    
    this.widgetHtml = widgetHtml;
  }

  #attachComponentHtml() {
    // sometimes components don't need to be rendered under their parentcomponent but under htmlParent... like ActionWhere
    if (this.htmlParent) {
      this.htmlParent.append(this.html);
    } else {
      $(this.html).appendTo(this.parentComponent.html);
    }
  }

  #initHtml() {
    if (this.widgetHtml != null) {
      // remove existing html
      this.html = HTMLComponent.BaseClassFactory.getBaseClass(
        this.baseCssClass
      );
      this.html.append(this.widgetHtml);
    } else {
      this.html = HTMLComponent.BaseClassFactory.getBaseClass(
        this.baseCssClass
      );
    }
  }

  render() {
    if (this.html != null) {
      // TODO: Probably useless? it's always going to be null if super.render() called in the begining of render()
      this.html.empty();
      this.html.remove();
    }
    this.#initHtml();
    this.#attachComponentHtml();
    return this;
  }

  destroy() {
    this.html?.remove();
  }

  /**
   * @returns moves up the component hierarchy and returns the one that does not have a parent component
   */
  getRootComponent():HTMLComponent {
    if(this.parentComponent == null) {
      return this;
    } else {
      return this.parentComponent.getRootComponent();
    }
  }

  /**
   * Utility function to switch css class of an element from oldState to newState.
   */
  static switchState(
    el: HTMLElement,
    oldState: string,
    newState: string
  ) {
    el.classList.remove(oldState);
    el.classList.add(newState);
  };

  /**
   * Tells screen readers that a clickable element is a button, and what it does.
   */
  static setAriaButton(el: JQuery<HTMLElement>, label: string) {
    el.attr({ role: "button", "aria-label": label });
    // the icon inside has no name : the screen reader must stop on the button
    el.find("svg").attr("aria-hidden", "true");
    HTMLComponent.setKeyboardButton(el);
  };

  /**
   * Asks screen readers to read a message, without moving the focus. See the live region in SparnaturalComponent.
   */
  static announce(el: HTMLElement, message: string, focusMoves = false) {
    // the action moves the focus for a keyboard user : the message is said with the next focused
    // element, see focusWithConfirmation(). Said on its own, it would come after it.
    if (focusMoves && HTMLComponent.focusFollows()) {
      pendingConfirmations.push(message);
      sayPendingLater(el.closest(".Sparnatural"));
      return;
    }
    el.dispatchEvent(new CustomEvent("announce", { bubbles: true, detail: message }));
  };

  /**
   * Moves the focus, the confirmations of the last action said first, once : "Sélection : Lieu. Choisir l'objet".
   * The context, when given, comes between them : "Choisir la valeur de l'objet Type de Lieu".
   */
  static focusWithConfirmation(target: HTMLElement, context?: string) {
    const prefix = [...pendingConfirmations, context].filter(Boolean);
    if (prefix.length > 0) {
      const label = target.getAttribute("aria-label");
      const name = label ?? target.textContent.trim().replace(/\s+/g, " ");
      target.setAttribute("aria-label", `${prefix.join(". ")}. ${name}`);
      pendingConfirmations = [];
      // its own name comes back when the focus leaves it
      target.addEventListener("blur", () => {
        label === null ? target.removeAttribute("aria-label") : target.setAttribute("aria-label", label);
      }, { once: true });
    }
    target.focus();
  };

  /**
   * Gives a new name to a button, but only once the focus has left it : right after a click, the screen
   * reader says what happened, the new name is read when coming back on the button.
   */
  static renameOnBlur(el: JQuery<HTMLElement>, label: string) {
    const target = el[0];
    if (document.activeElement === target) {
      target.addEventListener("blur", () => target.setAttribute("aria-label", label), { once: true });
    } else {
      target.setAttribute("aria-label", label);
    }
  };

  /**
   * True when the focus should follow an action to what comes next : keyboard used, or the focus was in
   * Sparnatural. False at the loading of the page, so that Sparnatural does not take the focus.
   */
  static focusFollows(): boolean {
    const active = document.activeElement;
    if (keyboardUser || active?.closest(".Sparnatural")) return true;
    // the focused element was removed by the action itself
    return (!active || active === document.body) && focusWasInside;
  };

  /**
   * Lets the keyboard reach a clickable element with Tab and activate it with Enter or Space, like a button.
   */
  static setKeyboardButton(el: JQuery<HTMLElement>) {
    el.attr("tabindex", "0");
    // namespaced : called again on the same element, it does not add a second handler
    el.off("keydown.sparnaturalButton").on("keydown.sparnaturalButton", (e: JQuery.KeyDownEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      // a MouseEvent rather than click() : the icons are SVG elements, which have no click()
      e.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  };
}

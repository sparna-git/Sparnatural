import BaseClassFactory from "./baseClassFactory/BaseClassFactory";

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
}

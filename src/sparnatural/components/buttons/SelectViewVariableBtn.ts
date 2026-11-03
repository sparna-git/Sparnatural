import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";
import { I18n } from "../../settings/I18n";

/*
    Switch Component having a binary state:
    selected: Switching between the states with onClick
*/
export class SelectViewVariableBtn extends HTMLComponent {

  selected = false;
  alwaysDisabled = false;
  callBack;

  visible = false;
  // the label of the class, known only once it is selected
  getClassLabel: () => string;

  constructor(
    ParentComponent: HTMLComponent,
    callBack: (selected: boolean) => void,
    getClassLabel: () => string
  ) {
    let widgetHtml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE); //default
    super("selectViewVariableBtn", ParentComponent, widgetHtml);
    this.callBack = callBack;
    this.getClassLabel = getClassLabel;
  }

  render() {
    if (this.selected) {
      this.widgetHtml = $(UiuxConfig.ICON_SELECTED_VARIABLE);
    } else {
      this.widgetHtml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE);
    }
    // the name says what a click does : "Afficher" or "Masquer"
    const labelKey = this.selected ? "HideFromResults.label" : "ShowInResults.label";
    HTMLComponent.setAriaButton(
      this.widgetHtml,
      I18n.labels[labelKey].replace("{label}", this.getClassLabel())
    );
    super.render();
    if(!this.alwaysDisabled) {
      this.#addClickListener();
    } else {
      this.disable()
    }

    if(!this.visible) {
      this.html.hide();
    }
    
    return this;
  }



  #addClickListener() {
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      // one Variable always(!) needs to be selected
      let lastSelectedVar = false
      this.widgetHtml[0].dispatchEvent(new CustomEvent("getSelectedVarLength",{bubbles:true,detail:(length:number)=>{
        // add here Toast notification
        if(length < 2 && this.selected === true) lastSelectedVar = true
      }}))
      if(lastSelectedVar) return
      this.selected = this.selected ? false : true;
      this.render();
      this.callBack(this.selected);
    });
  }

  #removeClickListener() {
    this.widgetHtml.off("click");
  }

  setAlwaysDisabled(ad:boolean) {
    this.alwaysDisabled = ad;
    if(this.alwaysDisabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  show() {
    this.visible = true;
    this.render();
  }

  hide() {
    this.visible = false;
    this.render();
  }

  disable() {
    this.html.addClass("disabled");
    this.widgetHtml.attr("aria-disabled", "true");
    this.#removeClickListener();
  }

  enable() {
    // can never be reenabled if always disabled
    if(this.alwaysDisabled) return;

    // make sure we don't enable twise
    if(this.html.hasClass("disabled")) {
      this.html.removeClass("disabled");
      this.widgetHtml.removeAttr("aria-disabled");
      this.#addClickListener();
    }
  }

  click() {
    this.widgetHtml[0].dispatchEvent(new Event("click"))
  }

}

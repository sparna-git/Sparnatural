import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";

/*
    Switch Component having a binary state:
    selected: Switching between the states with onClick
*/
export class SelectViewVariableBtn extends HTMLComponent {

  selected = false;
  alwaysDisabled = false;
  callBack;
  
  constructor(
    ParentComponent: HTMLComponent,
    callBack: (selected: boolean) => void
  ) {
    let widgetHtml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE); //default
    super("selectViewVariableBtn", ParentComponent, widgetHtml);
    this.callBack = callBack;
  }

  render() {
    if (this.selected) {
      this.widgetHtml = $(UiuxConfig.ICON_SELECTED_VARIABLE);
    } else {
      this.widgetHtml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE);
    }
    super.render();
    if(!this.alwaysDisabled) {
      this.#addClickListener();
    } else {
      this.disable()
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

  disable() {
    this.html.addClass("disabled");
    this.#removeClickListener();
  }

  enable() {
    // can never be reenabled if always disabled
    if(this.alwaysDisabled) return;

    // make sure we don't enable twise
    if(this.html.hasClass("disabled")) {
      this.html.removeClass("disabled");
      this.#addClickListener();
    }
  }

  click() {
    this.widgetHtml[0].dispatchEvent(new Event("click"))
  }

}

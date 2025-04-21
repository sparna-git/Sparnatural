import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";

/*
  
    Switch Component having a binary state:
    selected: Switching between the states with onClick
*/
class SelectViewVariableBtn extends HTMLComponent {
  selected = false;
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
    this.#addClickListener();
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

  disable() {
    this.html.addClass("disabled");
    this.#removeClickListener();
  }

  enable() {
    // make sure we don't enable twise
    if(this.html.hasClass("disabled")) {
      this.html.removeClass("disabled");
      this.#addClickListener();
    }
  }

}
export default SelectViewVariableBtn;

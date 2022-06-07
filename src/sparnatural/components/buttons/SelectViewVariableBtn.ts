import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";

/*
    Switch Component having a binary state:
    selected: Switching beteween the states on Click
*/
class SelectViewVariableBtn extends HTMLComponent {
  selected = false;
  callBack
  constructor(ParentComponent: HTMLComponent, callBack: (selected:boolean) => void) {
    let widgetHtml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE); //default
    super("selectViewVariableBtn", ParentComponent, widgetHtml);
    this.callBack = callBack
  }

  render() {
    if (this.selected) {
      this.widgetHtml = $(UiuxConfig.ICON_SELECTED_VARIABLE);
    } else {
      this.widgetHtml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE);
    }
    super.render();
    this.#addClickListener()
    return this;
  }
  #addClickListener(){
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      this.selected = this.selected ? false : true;
      this.selected
        ? this.html.addClass("VariableSelected")
        : this.html.removeClass("VariableSelected");
      this.render()
      this.callBack(this.selected);
    });
  }
}
export default SelectViewVariableBtn;

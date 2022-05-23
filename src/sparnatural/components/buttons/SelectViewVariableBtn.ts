import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../../HtmlComponent";

/*
    Switch Component having a binary state:
    selected: Switching beteween the states on Click
*/
class SelectViewVariableBtn extends HTMLComponent {
  selected = false;
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE); //default
    super("selectViewVariableBtn", ParentComponent, widgetHtml);
    this.html.on("click", (e: JQuery.ClickEvent) => {
      this.selected = this.selected ? false : true;
      this.selected
        ? this.html.addClass("VariableSelected")
        : this.html.removeClass("VariableSelected");
      let newWidgetHml: JQuery<HTMLElement>;
      if (this.selected) {
        newWidgetHml = $(UiuxConfig.ICON_SELECTED_VARIABLE);
      } else {
        newWidgetHml = $(UiuxConfig.ICON_NOT_SELECTED_VARIABLE);
      }
      this.updateWidgetHtml(newWidgetHml);
      callBack();
    });
  }

  render() {
    super.render();
    return this;
  }
}
export default SelectViewVariableBtn;

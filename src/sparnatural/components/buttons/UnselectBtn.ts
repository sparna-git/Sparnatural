import HTMLComponent from "../HtmlComponent";
import UiuxConfig from "../IconsConstants";

class UnselectBtn extends HTMLComponent {
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(`<span>${UiuxConfig.ICON_REG_XMARK}</span>`);
    super("unselect", ParentComponent, widgetHtml);
    // add clicklistener
    this.widgetHtml.on("click", function (e: JQuery.ClickEvent) {
      callBack();
    });
  }

  render(): this {
    super.render();
    return this;
  }
}
export default UnselectBtn;

import HTMLComponent from "../HtmlComponent";
import UiuxConfig from "../IconsConstants";

class EditBtn extends HTMLComponent {
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(`<span>edit</span>`);
    super("edit", ParentComponent, widgetHtml);
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
export default EditBtn;

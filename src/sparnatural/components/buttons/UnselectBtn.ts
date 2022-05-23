import HTMLComponent from "../../HtmlComponent";

class UnselectBtn extends HTMLComponent {
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(
      '<i class="far fa-times-circle"></i>'
    );
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

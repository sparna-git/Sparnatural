import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../../HtmlComponent";

class ShowHideBtn extends HTMLComponent {
  selected = false;
  constructor(
    ParentComponent: HTMLComponent,
    callBack: (displayed: boolean) => void
  ) {
    let widgetHtml = $(`<a class="displayButton">
        ${UiuxConfig.ICON_ARROW_TOP} 
        ${UiuxConfig.ICON_ARROW_BOTTOM}
        </a>`);
    super("VariableSelectorDisplay", ParentComponent, widgetHtml);
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      this.selected = this.selected ? false : true;
      this.selected
        ? this.html.addClass("displayed")
        : this.html.removeClass("displayed");
      callBack(this.selected);
    });
  }

  render(): this {
    super.render();
    return this;
  }
}
export default ShowHideBtn;

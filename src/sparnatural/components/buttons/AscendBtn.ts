import UiuxConfig from "../IconsConstants";
import HTMLComponent from "../HtmlComponent";

class AscendBtn extends HTMLComponent {
  selected = false;
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(UiuxConfig.ICON_AZ);
    super("asc", ParentComponent, widgetHtml);
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      if(!this.selected) {
        callBack();
      }
    });
  }

  setSelected = (selected: boolean) => {
    this.selected = selected;
    this.selected
        ? this.html.addClass("selected")
        : this.html.removeClass("selected");
  }

  render(): this {
    super.render();
    return this;
  }
}
export default AscendBtn;

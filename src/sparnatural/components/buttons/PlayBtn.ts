import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";

class PlayBtn extends HTMLComponent {
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    //TODO generateQuery enable disable as binary state
    let widgetHtml = $(`${UiuxConfig.ICON_PLAY}`);
    super("playBtn", ParentComponent, widgetHtml);
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      callBack();
    });
  }

  render(): this {
    super.render();
    return this;
  }

  disable() {
    this.widgetHtml.addClass('submitDisable loadingEnabled');
  }

  enable() {
    this.widgetHtml.removeClass('loadingEnabled');
  }
}
export default PlayBtn;

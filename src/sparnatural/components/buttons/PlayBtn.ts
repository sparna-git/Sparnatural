import UiuxConfig from "../IconsConstants";
import HTMLComponent from "../HtmlComponent";

class PlayBtn extends HTMLComponent {
  callback: () => void;


  constructor(ParentComponent: HTMLComponent, callback: () => void) {
    //TODO generateQuery enable disable as binary state
    let widgetHtml = $(`${UiuxConfig.ICON_PLAY}`);
    super("playBtn", ParentComponent, widgetHtml);
    this.callback = callback;
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      callback();
    });
  }

  render(): this {
    super.render();
    return this;
  }

  disable() {
    // set a disabled CSS class, trigger the loader, and remove click event
    this.html.addClass('submitDisable loadingEnabled');
    this.widgetHtml.off("click");
  }

  /**
   * Triggered when query has finished executing. Just removes the loading but keep the button disabled
   */
  removeLoading() {
    this.html.removeClass('loadingEnabled');
  }

  /**
   * Re-enables the grey button
   */
  enable() {
    this.html.removeClass('submitDisable');
    // re-enable the click event
    let that = this;
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      that.callback();
    });
  }

}
export default PlayBtn;

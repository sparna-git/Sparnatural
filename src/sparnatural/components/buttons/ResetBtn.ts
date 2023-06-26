import UiuxConfig from "../IconsConstants";
import HTMLComponent from "../HtmlComponent";
import { TOOLTIP_CONFIG } from "../../settings/defaultSettings";
import TippyInfo from "./TippyInfo";

class ResetBtn extends HTMLComponent {
  tippySettings: any;

  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(
      '<p class="reset-form"><a>' + UiuxConfig.ICON_RESET + "</a></p>"
    );

    super("reset-wrapper", ParentComponent, widgetHtml);
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      callBack();
    });

    // set a tooltip on the reset button
    /*
    this.tippySettings = Object.assign({}, TOOLTIP_CONFIG);
    this.tippySettings.placement = 'right-start';
    this.tippySettings.offset = [-15, -54];
    this.tippySettings.delay = [300, 0];
    */
  }
  render(): this {
    super.render();
    // new TippyInfo(this, "blah blah", this.tippySettings);
    return this;
  }
}
export default ResetBtn;

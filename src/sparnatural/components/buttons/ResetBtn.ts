import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";
import { I18n } from "../../settings/I18n";

export class ResetBtn extends HTMLComponent {
  tippySettings: any;

  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(
      `<p class="reset-form"><a title="${I18n.labels["Reset.tooltip"]}">${UiuxConfig.ICON_RESET}</a></p>`
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

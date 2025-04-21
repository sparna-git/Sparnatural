import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";
import TippyInfo from "./TippyInfo";

class InfoBtn extends HTMLComponent {
  infoMessage: string;
  tippySettings: any;
  constructor(
    parentComponent: HTMLComponent,
    infoMessage: string,
    tippySettings?: any
  ) {
    let widgetHtml = $(`${UiuxConfig.ICON_CIRCLE_INFO}`);
    super("circle-info", parentComponent, widgetHtml);
    this.infoMessage = infoMessage;
    this.tippySettings = tippySettings;
  }
  render(): this {
    super.render();
    new TippyInfo(this, this.infoMessage, this.tippySettings);
    return this;
  }
}
export default InfoBtn;

import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";

export class ArrowComponent extends HTMLComponent {
  arrowStyle: UiuxConfig;
  constructor(ParenComponent: HTMLComponent, arrowStyle: UiuxConfig) {
    let baseCssClass: string = "componentFrontArrow"; //default
    if (arrowStyle == UiuxConfig.COMPONENT_ARROW_BACK)
      baseCssClass = "componentBackArrow";

    super(baseCssClass, ParenComponent, null);
    this.arrowStyle = arrowStyle;
    this.widgetHtml = $(arrowStyle);
  }
  render() {
    // if it's a Front Arrow then prepend the html
    super.render();
    return this;
  }
}

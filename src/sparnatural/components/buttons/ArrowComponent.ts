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
    // only a decoration : nothing to read for a screen reader
    this.widgetHtml = $(arrowStyle).attr("aria-hidden", "true");
  }
  render() {
    // if it's a Front Arrow then prepend the html
    super.render();
    return this;
  }
}

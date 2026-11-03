import { HTMLComponent } from "../HtmlComponent";
import UiuxConfig from "../IconsConstants";

export class UnselectBtn extends HTMLComponent {
  constructor(ParentComponent: HTMLComponent, label: string, callBack: () => void) {
    let widgetHtml = $(`<span>${UiuxConfig.ICON_REG_XMARK}</span>`);
    super("unselect", ParentComponent, widgetHtml);
    HTMLComponent.setAriaButton(this.widgetHtml, label);
    // add clicklistener
    this.widgetHtml.on("click", function (e: JQuery.ClickEvent) {
      e.stopPropagation();
      callBack();
    });
  }

  render(): this {
    super.render();
    return this;
  }
}

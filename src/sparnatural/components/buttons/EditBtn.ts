import { HTMLComponent } from "../HtmlComponent";
import UiuxConfig from "../IconsConstants";
import { I18n } from "../../settings/I18n";

export class EditBtn extends HTMLComponent {
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(`<span>${UiuxConfig.ICON_PEN}</span>`);
    super("edit", ParentComponent, widgetHtml);
    HTMLComponent.setAriaButton(this.widgetHtml, I18n.labels["EditValue.label"]);
    // add clicklistener
    this.widgetHtml.on("click", function (e: JQuery.ClickEvent) {
      callBack();
    });
  }

  render(): this {
    super.render();
    return this;
  }
}

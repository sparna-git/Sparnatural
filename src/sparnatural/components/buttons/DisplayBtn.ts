import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";
import { I18n } from "../../settings/I18n";

export class DisplayBtn extends HTMLComponent {
  selected = false;
  callBack: (displayed: boolean) => void;
  constructor(
    ParentComponent: HTMLComponent,
    callBack: (displayed: boolean) => void
  ) {
    let widgetHtml = $(`<a class="displayButton">
        ${UiuxConfig.ICON_ARROW_BOTTOM}
        </a>`);
    super("VariableSelectorDisplay", ParentComponent, widgetHtml);
    this.callBack = callBack;
  }

  render(): this {
    // the name says what a click does : "Afficher" or "Masquer"
    const labelKey = this.selected ? "HideResultOptions.label" : "ShowResultOptions.label";
    HTMLComponent.setAriaButton(this.widgetHtml, I18n.labels[labelKey]);
    super.render();
    this.#addClickListener();
    return this;
  }

  #addClickListener() {
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      this.selected = this.selected ? false : true;
      if (this.selected) {
        this.widgetHtml = $(`<a class="displayButton">
        ${UiuxConfig.ICON_ARROW_TOP}
        </a>`);
      } else {
        this.widgetHtml = $(`<a class="displayButton">
        ${UiuxConfig.ICON_ARROW_BOTTOM}
        </a>`);
      }
      this.callBack(this.selected);
      this.render();
    });
  }
}

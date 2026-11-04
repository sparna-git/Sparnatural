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
    HTMLComponent.setAriaButton(this.widgetHtml, this.#name());
    super.render();
    this.#addClickListener();
    return this;
  }

  // the name says what a click does : "Afficher" or "Masquer"
  #name(): string {
    return I18n.labels[this.selected ? "HideResultOptions.label" : "ShowResultOptions.label"];
  }

  #addClickListener() {
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      this.selected = this.selected ? false : true;
      // only the icon is changed : the button keeps the focus
      this.widgetHtml.html(this.selected ? UiuxConfig.ICON_ARROW_TOP : UiuxConfig.ICON_ARROW_BOTTOM);
      this.widgetHtml.find("svg").attr("aria-hidden", "true");
      HTMLComponent.renameOnBlur(this.widgetHtml, this.#name());
      this.callBack(this.selected);
      const key = this.selected ? "Announce.resultOptionsShown" : "Announce.resultOptionsHidden";
      HTMLComponent.announce(this.html[0], I18n.labels[key]);
    });
  }
}

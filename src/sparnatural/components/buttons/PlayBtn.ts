import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";
import { I18n } from "../../settings/I18n";

export class PlayBtn extends HTMLComponent {
  callback: () => void;

  constructor(ParentComponent: HTMLComponent, callback: () => void) {
    //TODO generateQuery enable disable as binary state
    let widgetHtml = $(
      `<span title="${I18n.labels["Submit.tooltip"]}">${UiuxConfig.ICON_PLAY}</span>`
    );
    super("playBtn", ParentComponent, widgetHtml);
    HTMLComponent.setAriaButton(this.widgetHtml, I18n.labels["Submit.tooltip"]);
    this.callback = callback;
    // add clicklistener
    let that = this;
    this.widgetHtml.on("click", function (e: JQuery.ClickEvent) {
      // don't call the callback when the button is disabled
      if (!that.isDisabled()) {
        callback();
      }
    });
  }

  render(): this {
    super.render();
    return this;
  }

  /**
   * @returns true when the button is disabled
   */
  isDisabled(): boolean {
    return this.html.hasClass("submitDisable");
  }

  disable() {
    // set a disabled CSS class, trigger the loader
    this.html.addClass("submitDisable loadingEnabled");
    // screen readers say "unavailable" when coming back on the button, not right after the click
    const btn = this.widgetHtml[0];
    if (document.activeElement === btn) {
      btn.addEventListener("blur", () => this.#markDisabled(), { once: true });
    } else {
      this.#markDisabled();
    }
  }

  #markDisabled() {
    // it may have been enabled again meanwhile
    if (this.isDisabled()) this.widgetHtml.attr("aria-disabled", "true");
  }

  /**
   * Triggered when query has finished executing. Just removes the loading but keep the button disabled
   */
  removeLoading() {
    this.html.removeClass("loadingEnabled");
  }

  /**
   * Re-enables the grey button
   */
  enable() {
    this.html.removeClass("submitDisable");
    this.widgetHtml.removeAttr("aria-disabled");
  }
}

import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";
import { Order } from "../../SparnaturalQueryIfc";
import { I18n } from "../../settings/I18n";

export class AscendBtn extends HTMLComponent {
  selected = false;
  constructor(ParentComponent: HTMLComponent, callBack: (order:Order) => void) {
    let widgetHtml = $(UiuxConfig.ICON_AZ);
    super("asc", ParentComponent, widgetHtml);
    HTMLComponent.setAriaButton(this.widgetHtml, I18n.labels["SortAsc.label"]);
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      if(!this.selected) {
        callBack(Order.ASC);
      }
    });
  }

  setSelected = (selected: boolean) => {
    this.selected = selected;
    // the state is in the name, e.g. "Trier de A à Z, sélectionné"
    const label = I18n.labels["SortAsc.label"];
    this.widgetHtml.attr("aria-label", selected ? `${label}, ${I18n.labels["Selected.label"]}` : label);
    this.selected
        ? this.html.addClass("selected")
        : this.html.removeClass("selected");
  }

  render(): this {
    super.render();
    return this;
  }
}

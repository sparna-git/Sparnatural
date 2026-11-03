import UiuxConfig from "../IconsConstants";
import { HTMLComponent } from "../HtmlComponent";
import { Order } from "../../SparnaturalQueryIfc";
import { I18n } from "../../settings/I18n";

export class NoOrderBtn extends HTMLComponent {
  selected: boolean = false;

  constructor(ParentComponent: HTMLComponent, callBack: (order:Order) => void) {
    let widgetHtml = $(UiuxConfig.ICON_NO_ORDER);
    super("none", ParentComponent, widgetHtml);
    HTMLComponent.setAriaButton(this.widgetHtml, I18n.labels["NoSort.label"]);
    
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      if(!this.selected) {
        // notify other buttons
        callBack(Order.NOORDER);
      }
    });
  }

  setSelected = (selected: boolean) => {
    this.selected = selected;
    // the state is in the name, e.g. "Pas de tri, sélectionné"
    const label = I18n.labels["NoSort.label"];
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

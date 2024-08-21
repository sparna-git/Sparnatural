import UiuxConfig from "../IconsConstants";
import HTMLComponent from "../HtmlComponent";
import { Order } from "../../generators/json/ISparJson";

class DescendBtn extends HTMLComponent {
  selected: boolean = false;
  constructor(ParentComponent: HTMLComponent, callBack: (order:Order) => void) {
    let widgetHtml = $(UiuxConfig.ICON_ZA);
    super("asc", ParentComponent, widgetHtml);
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      if(!this.selected) {
        callBack(Order.DESC);
      }
    });
  }

  setSelected = (selected: boolean) => {
    this.selected = selected;
    this.selected
        ? this.html.addClass("selected")
        : this.html.removeClass("selected");
  }

  render(): this {
    super.render();
    return this;
  }
}
export default DescendBtn;

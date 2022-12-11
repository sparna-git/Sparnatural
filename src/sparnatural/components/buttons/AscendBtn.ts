import UiuxConfig from "../IconsConstants";
import HTMLComponent from "../HtmlComponent";
import { Order } from "../../generators/ISparJson";

class AscendBtn extends HTMLComponent {
  selected = false;
  constructor(ParentComponent: HTMLComponent, callBack: (order:Order) => void) {
    let widgetHtml = $(UiuxConfig.ICON_AZ);
    super("asc", ParentComponent, widgetHtml);
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      if(!this.selected) {
        callBack(Order.ASC);
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
export default AscendBtn;

import UiuxConfig from "../IconsConstants";
import HTMLComponent from "../HtmlComponent";
import { Order } from "../../SparnaturalQuery";

class NoOrderBtn extends HTMLComponent {
  selected: boolean = false;
  
  constructor(ParentComponent: HTMLComponent, callBack: (order:Order) => void) {
    let widgetHtml = $(UiuxConfig.ICON_NO_ORDER);
    super("none", ParentComponent, widgetHtml);
    
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
    this.selected
        ? this.html.addClass("selected")
        : this.html.removeClass("selected");
  }

  render(): this {
    super.render();
    return this;
  }
}
export default NoOrderBtn;

import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";

class NoOrderBtn extends HTMLComponent {
  selected: boolean = false;
  
  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(UiuxConfig.ICON_NO_ORDER);
    super("none", ParentComponent, widgetHtml);
    
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      if(!this.selected) {
        // notify other buttons
        callBack();
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

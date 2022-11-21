import UiuxConfig from "../IconsConstants";
import ArrowComponent from "./ArrowComponent";
import HTMLComponent from "../HtmlComponent";

class AddWidgetValueBtn extends HTMLComponent {
  frontArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_FRONT);
  backArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_BACK);
  callBack: () => void;

  constructor(ParentComponent: HTMLComponent, callBack: () => void) {
    super("AddWidgetValueBtn", ParentComponent, null);
    this.callBack = callBack;
  }

  render(): this {
    super.render();
    this.backArrow.render();
    const widgetHtml = $(`<p><span>+</span></p>`);
    this.html.append(widgetHtml);
    this.frontArrow.render();
    this.#addEventListener(this.html);
    return this;
  }

  #addEventListener(el: JQuery<HTMLElement>) {
    el[0].addEventListener("click", () => {
      this.callBack();
    });
  }
}
export default AddWidgetValueBtn;

import UiuxConfig from "../IconsConstants";
import { ArrowComponent } from "./ArrowComponent";
import { HTMLComponent } from "../HtmlComponent";

export class AddWidgetValueBtn extends HTMLComponent {
  frontArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_FRONT);
  backArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_BACK);
  label: string;
  callBack: () => void;

  constructor(ParentComponent: HTMLComponent, label: string, callBack: () => void) {
    super("AddWidgetValueBtn", ParentComponent, null);
    this.label = label;
    this.callBack = callBack;
  }

  render(): this {
    super.render();
    this.backArrow.render();
    const widgetHtml = $(`<p><span>+</span></p>`);
    this.html.append(widgetHtml);
    this.frontArrow.render();
    HTMLComponent.setAriaButton(this.html, this.label);
    this.#addEventListener(this.html);
    return this;
  }

  #addEventListener(el: JQuery<HTMLElement>) {
    el[0].addEventListener("click", () => {
      this.callBack();
    });
  }
}

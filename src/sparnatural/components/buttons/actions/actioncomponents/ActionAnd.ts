import { I18n } from "../../../../settings/I18n";
import { HTMLComponent } from "../../../HtmlComponent";


class ActionAnd extends HTMLComponent {
  btn: JQuery<HTMLElement>;
  constructor(parentComponent: HTMLComponent, callBack: () => void) {
    let widgetHtml = $(`<span class="trait-and-bottom"></span>`);
    super("ActionAnd", parentComponent, widgetHtml);
    this.btn = $(`<a>${I18n.labels.And}</a>`);
    this.widgetHtml = this.widgetHtml.add(this.btn);
    this.btn[0].addEventListener("click", () => {
      callBack();
    });
  }
  render() {
    super.render();
    return this;
  }
}
export default ActionAnd;

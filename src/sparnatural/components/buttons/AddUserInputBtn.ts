import { HTMLComponent } from "../HtmlComponent";

export class AddUserInputBtn extends HTMLComponent {
  callBack: () => void;
  constructor(
    parentComponent: HTMLComponent,
    btnText: string,
    callBack: () => void
  ) {
    let widgetHtml = $(`<button class="button-add">
        ${btnText}
        </button>`);
    super("AddUserInputBtn", parentComponent, widgetHtml);
    this.callBack = callBack;
  }

  render(): this {
    super.render();
    this.widgetHtml[0].addEventListener("click", () => {
      this.callBack();
    });
    return this;
  }
}

import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../HtmlComponent";

class VariableOptionsSelectBtn extends HTMLComponent {
  selected = false;
  constructor(
    ParentComponent: HTMLComponent,
    callBack: (selected: boolean) => void
  ) {
    let input = $(`
    <input type="checkbox">
      <span class="slider round">
      </span>
    </input>
    `);

    let swithHtml = $(`<label class="switch"> </label>`).append(input);

    let labelName = $(
      `<p>${getSettings().langSearch.SwitchVariablesNames} </p>`
    );

    let widgetHtml =
      //$(`<label class="switch">
      //  </label>
      // `).append(input).prepend($(`<p>${getSettings().langSearch.SwitchVariablesNames}</p>`))

      $(labelName).append(swithHtml);
    super("variablesOptionsSelect", ParentComponent, widgetHtml);
    // add clicklistener
    input[0].addEventListener("change", (e) => {
      this.selected = this.selected ? false : true;
      this.selected
        ? this.html.addClass("selected")
        : this.html.removeClass("selected");
      callBack(this.selected);
    });
  }

  render(): this {
    this.htmlParent = this.ParentComponent.htmlParent;
    super.render();
    return this;
  }
}
export default VariableOptionsSelectBtn;

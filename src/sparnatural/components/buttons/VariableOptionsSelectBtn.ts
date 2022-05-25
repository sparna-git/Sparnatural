import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../HtmlComponent";

class VariableOptionsSelectBtn extends HTMLComponent {
  selected = false;
  constructor(
    ParentComponent: HTMLComponent,
    callBack: (selected: boolean) => void
  ) {
    let widgetHtml = 
    $(`<p>${getSettings().langSearch.SwitchVariablesNames}</p><label class="switch">
        <input type="checkbox">
          <span class="slider round">
          </span>
        </input>
      </label>
     `)
    super("variablesOptionsSelect", ParentComponent, widgetHtml);
    // add clicklistener
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      this.selected = this.selected ? false : true;
      this.selected
        ? this.html.addClass("selected")
        : this.html.removeClass("selected");
      callBack(this.selected);
    });
  }

  render(): this {
    this.htmlParent = this.ParentComponent.htmlParent
    super.render();
    return this;
  }
}
export default VariableOptionsSelectBtn;

import BaseOptionComponent from "./BaseOptionComponent";
import { OptionsGroup, OptionTypes } from "../OptionsGroup";
import { I18n } from "../../../../../../settings/I18n";

/*
    Not Exists Component. Get's rendered by OptionsGroup if this is enabled.
    When Clicked changes the SPARQL of the query to a NOTEXISTS form
*/
class OptionalComponent extends BaseOptionComponent {
  stateType = OptionTypes.OPTIONAL;
  // If you would like to change the shape of the Arrow. Do it here
  constructor(ParentComponent: OptionsGroup) {
    super("Optional", OptionTypes.OPTIONAL, ParentComponent, "optional");
  }

  render(): this {
    this.label = I18n.labels.labelOptionOptional;
    super.render();
    this.#addEventListeners();
    return this;
  }

  #addEventListeners() {
    this.html.on("click", (e) => {
      e.stopPropagation();
      this.onChange();
    });
  }
}
export default OptionalComponent;

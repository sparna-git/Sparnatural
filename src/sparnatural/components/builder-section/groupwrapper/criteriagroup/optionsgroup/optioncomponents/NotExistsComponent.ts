import BaseOptionComponent from "./BaseOptionComponent";
import { getSettings } from "../../../../../../../configs/client-configs/settings";
import { OptionsGroup, OptionTypes } from "../OptionsGroup";

/*
    Not Exists Component. Get's rendered by OptionsGroup if this is enabled.
    When Clicked changes the SPARQL of the query to a NOTEXISTS form
*/
class NotExistsComponent extends BaseOptionComponent {
  // If you would like to change the shape of the Arrow. Do it here
  constructor(ParentComponent: OptionsGroup) {
    super("NotExists", OptionTypes.NOTEXISTS, ParentComponent, "notExists");
  }

  render(): this {
    this.label = getSettings().langSearch.labelOptionNotExists;
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

export default NotExistsComponent;

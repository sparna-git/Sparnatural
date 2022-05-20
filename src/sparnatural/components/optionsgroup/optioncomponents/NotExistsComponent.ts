import { getSettings } from "../../../../configs/client-configs/settings";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import BaseOptionComponent from "./BaseOptionComponent";
import { OptionsGroup } from "../OptionsGroup";

/*
    Not Exists Component. Get's rendered by OptionsGroup if this is enabled.
    When Clicked changes the SPARQL of the query to a NOTEXISTS form
*/
class NotExistsComponent extends BaseOptionComponent {
  specProvider: ISpecProvider;
  // If you would like to change the shape of the Arrow. Do it here
  constructor(
    ParentComponent: OptionsGroup,
    specProvider: ISpecProvider,
    crtGroupId: number
  ) {
    super("NotExists", ParentComponent, specProvider, "notExists", crtGroupId);
  }

  render(): this {
    this.objectId =
      this.ParentOptionsGroup.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal;
    // TODO already checked in OptionsGroup?
    if (this.specProvider.isEnablingNegation(this.objectId)) {
      this.label = getSettings().langSearch.labelOptionNotExists;
    }
    super.render();

    this.#addEventListeners();
    return this;
  }
  #addEventListeners() {
    this.html.on("click", (e) => {
      e.stopPropagation();
      this.onChange("optionalEnabled");
    });
  }
}

export default NotExistsComponent;

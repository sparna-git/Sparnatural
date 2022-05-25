import BaseOptionComponent from "./BaseOptionComponent";
import { OptionsGroup } from "../OptionsGroup";
import { getSettings } from "../../../../../../../configs/client-configs/settings";
import ISpecProvider from "../../../../../../spec-providers/ISpecProviders";

/*
    Not Exists Component. Get's rendered by OptionsGroup if this is enabled.
    When Clicked changes the SPARQL of the query to a NOTEXISTS form
*/
class OptionalComponent extends BaseOptionComponent {
  // If you would like to change the shape of the Arrow. Do it here
  constructor(
    ParentComponent: OptionsGroup,
    specProvider: ISpecProvider,
    crtGroupId: number
  ) {
    super("Optional", ParentComponent, specProvider, "optional", crtGroupId);
  }

  render(): this {
    this.objectId =
      this.ParentOptionsGroup.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal;
    this.label = getSettings().langSearch.labelOptionOptional;
    
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
export default OptionalComponent;

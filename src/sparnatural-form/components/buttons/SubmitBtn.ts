import { getSettings } from "../../../sparnatural-form/settings/defaultsSettings";
import SearchBtn from "./SearchBtn";
import SparnaturalFormComponent from "../../../sparnatural-form/components/SparnaturalFormComponent";
import { SparnaturalFormElement } from "../../../SparnaturalFormElement";
import ResetBtn from "./ResetBtn";

class SubmitSection {
  searchBtn: SearchBtn;
  resetBtn: ResetBtn;
  ParentSparnatural: SparnaturalFormComponent;
  container: JQuery<HTMLElement>;

  constructor(
    ParentSparnatural: SparnaturalFormComponent,
    containerId: string
  ) {
    this.ParentSparnatural = ParentSparnatural;
    this.container = $(`#${containerId}`); // Using jQuery to select the container by ID
    this.resetBtn = new ResetBtn(this.resetForm.bind(this));
    // Create the Search button
    this.searchBtn = new SearchBtn(this.submitAction.bind(this));

    // Render the button inside the container
    this.render();
  }
  render(): this {
    // Vérifie si les boutons existent déjà dans le conteneur
    if (
      this.container.find("#Reset").length === 0 &&
      this.container.find("#Search").length === 0
    ) {
      console.log("Rendering buttons...");
      this.resetBtn.render(this.container);
      this.searchBtn.render(this.container);
      console.log("Buttons rendered:", this.resetBtn, this.searchBtn);
    } else {
      console.log("Buttons already exist, skipping rendering.");
    }

    return this;
  }

  // Define submit action
  submitAction = () => {
    if (getSettings().submitButton) {
      console.log("SubmitSection: Submit button clicked");
      let e = new CustomEvent(SparnaturalFormElement.EVENT_SUBMIT, {
        bubbles: true,
        detail: this.ParentSparnatural,
      });
      this.container[0].dispatchEvent(e);
      console.log(e);
      console.log("Submit event dispatched.");
    }
  };

  // Reset form action
  resetForm = () => {
    this.ParentSparnatural.resetForm();
  };

  enableSubmit() {
    this.searchBtn.enable();
  }

  disableSubmit() {
    this.searchBtn.disable();
  }
}

export default SubmitSection;

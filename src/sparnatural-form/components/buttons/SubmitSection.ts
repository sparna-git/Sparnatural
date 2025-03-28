import SearchBtn from "./SearchBtn";
import SparnaturalFormComponent from "../SparnaturalFormComponent";
import { SparnaturalFormElement } from "../../../SparnaturalFormElement";
import ResetBtn from "./ResetBtn";
import ISettings from "../../settings/ISettings";
import { Form } from "../../FormStructure";

class SubmitSection {
  private settings: ISettings;
  searchBtn: SearchBtn;
  formConfig: Form;
  resetBtn: ResetBtn;
  ParentSparnatural: SparnaturalFormComponent;
  container: JQuery<HTMLElement>;

  constructor(
    ParentSparnatural: SparnaturalFormComponent,
    container: JQuery<HTMLElement>, // On passe un élément directement
    settings: ISettings
  ) {
    this.ParentSparnatural = ParentSparnatural;
    this.container = container;
    this.resetBtn = new ResetBtn(this.resetForm.bind(this));

    if (this.ParentSparnatural.formConfig.variables) {
      this.searchBtn = new SearchBtn(
        this.submitAction.bind(this),
        this.exportAction.bind(this)
      );
    } else {
      this.searchBtn = new SearchBtn(this.submitAction.bind(this), undefined);
    }

    this.settings = settings;
    this.render();
  }

  render(): this {
    // Vérifie si les boutons existent déjà dans le conteneur
    /* if (
      this.container.find("#Reset").length === 0 &&
      this.container.find("#Search").length === 0
    ) {*/
    console.log("Rendering buttons...");
    this.resetBtn.render(this.container);
    this.searchBtn.render(this.container);
    console.log("Buttons rendered:", this.resetBtn, this.searchBtn);
    /*} else {
      console.log("Buttons already exist, skipping rendering.");
    }*/
    return this;
  }

  //Export action
  exportAction = (): void => {
    console.log("SubmitSection: Export button clicked");
    //verifier si la formConfig contient les variables
    console.log("FormConfig:", this.ParentSparnatural.formConfig.variables);
    if (!this.ParentSparnatural.formConfig.variables) {
      console.error("SubmitSection: FormConfig not found");
      return undefined;
    }
    const exportEvent = new CustomEvent(SparnaturalFormElement.EVENT_SUBMIT, {
      bubbles: true,
      detail: {
        type: "export",
      },
    });
    console.log("Export Event:", exportEvent);
    this.container[0].dispatchEvent(exportEvent);
  };

  // Submit form action

  submitAction = () => {
    if (this.settings.submitButton) {
      console.log("SubmitSection: Submit button clicked");
      const submitEvent = new CustomEvent(SparnaturalFormElement.EVENT_SUBMIT, {
        bubbles: true,
        detail: {
          type: "onscreen",
        },
      });
      this.container[0].dispatchEvent(submitEvent);
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

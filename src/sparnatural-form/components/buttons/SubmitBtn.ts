import { SparnaturalFormAttributes } from "../../../SparnaturalFormAttributes";
import SearchBtn from "./SearchBtn";
import SparnaturalFormComponent from "../../../sparnatural-form/components/SparnaturalFormComponent";
import { SparnaturalFormElement } from "../../../SparnaturalFormElement";
import ResetBtn from "./ResetBtn";
import CleanQuery from "../CleanQuery"; // Import de CleanQuery
import ISettings from "../../settings/ISettings";
import HTMLComponent from "../../../sparnatural/components/HtmlComponent";

class SubmitSection {
  private settings: ISettings;
  searchBtn: SearchBtn;
  resetBtn: ResetBtn;
  ParentSparnatural: SparnaturalFormComponent;
  container: JQuery<HTMLElement>;
  private isLoading: boolean = false; //etat de chargement

  constructor(
    ParentSparnatural: SparnaturalFormComponent,
    containerId: string,
    settings: ISettings
  ) {
    this.ParentSparnatural = ParentSparnatural;
    this.container = $(`#${containerId}`); // Using jQuery to select the container by ID
    this.resetBtn = new ResetBtn(this.resetForm.bind(this));
    this.searchBtn = new SearchBtn(this.submitAction.bind(this));
    this.settings = settings;
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

  setLoadingState(isLoading: boolean): void {
    this.isLoading = isLoading;

    const searchBtn = this.container.find("#Search");

    if (isLoading) {
      // Ajoutez une classe pour afficher l'animation
      searchBtn.prop("disabled", true);
      searchBtn.html('<div class="spinner"></div>'); // Spinner
    } else {
      // Remettez le bouton à l'état normal
      searchBtn.prop("disabled", false);
      searchBtn.text("Search");
    }
  }

  submitAction = () => {
    if (this.settings.submitButton) {
      console.log("SubmitSection: Submit button clicked");

      // Step 1: Trigger HandleOptional
      this.ParentSparnatural.HandleOptional();

      // Step 2: Get the final cleaned query
      const lastQuery = this.ParentSparnatural.cleanQueryResult;

      const cleanQueryProcessor = new CleanQuery(
        lastQuery,
        this.ParentSparnatural.settings as SparnaturalFormAttributes
      );
      const finalCleanQuery = cleanQueryProcessor.cleanQueryToUse();

      console.log("Final Clean Query Ready for Submission:", finalCleanQuery);

      // Step 3: Dispatch the submit event with the cleaned query
      const queryPayload = {
        queryJson: finalCleanQuery,
        queryString: JSON.stringify(finalCleanQuery, null, 2), // Example
      };

      const submitEvent = new CustomEvent(SparnaturalFormElement.EVENT_SUBMIT, {
        bubbles: true,
        detail: queryPayload,
      });

      this.container[0].dispatchEvent(submitEvent);
      console.log("Submit Event Dispatched with Final Query:", queryPayload);
    }
  };

  // Define submit action
  submitAction3 = () => {
    if (this.settings.submitButton) {
      console.log("SubmitSection: Submit button clicked");

      // Étape 1 : Récupérer la dernière cleanQuery après HandleOptional
      this.ParentSparnatural.HandleOptional(); // Appliquer HandleOptional pour mettre à jour la cleanQueryResult
      const lastQuery = this.ParentSparnatural.cleanQueryResult;

      console.log("Last query after HandleOptional:", lastQuery);
      // Étape 2 : Appliquer CleanQuery pour effectuer un traitement final
      const cleanQueryProcessor = new CleanQuery(
        lastQuery,
        this.ParentSparnatural.settings as SparnaturalFormAttributes
      );
      const finalCleanQuery = cleanQueryProcessor.cleanQueryToUse();

      // Étape 3 : Déclencher un événement avec la requête nettoyée
      const queryPayload = {
        queryJson: finalCleanQuery,
        queryString: JSON.stringify(finalCleanQuery, null, 2), // Conversion en JSON pour illustration
      };

      // Déclencher l'événement
      const submitEvent = new CustomEvent(SparnaturalFormElement.EVENT_SUBMIT, {
        bubbles: true,
        detail: queryPayload, // Passer la requête nettoyée dans l'événement
      });

      this.container[0].dispatchEvent(submitEvent);
      console.log("Submit event dispatched with payload:", queryPayload);
    }
  };
  // Define submit action
  submitAction1 = () => {
    let e = new CustomEvent(SparnaturalFormElement.EVENT_SUBMIT, {
      bubbles: true,
      detail: this.ParentSparnatural,
    });
    this.container[0].dispatchEvent(e);
    console.log(e);
    console.log("Submit event dispatched.");
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

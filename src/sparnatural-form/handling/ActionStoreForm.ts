import SparnaturalFormComponent from "../components/SparnaturalFormComponent";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import { QueryGeneratorForm } from "./actions/GenerateQueryForm";
import SparnaturalComponent from "../../sparnatural/components/SparnaturalComponent";

class ActionStoreForm {
  sparnaturalForm: SparnaturalFormComponent;
  specProvider: any;
  quiet = false; // Pour éviter d'exécuter des actions quand c'est nécessaire de "garder le silence"
  language = "en"; //default
  sparqlVarID = 0;

  constructor(
    sparnaturalForm: SparnaturalFormComponent,
    specProvider: ISparnaturalSpecification
  ) {
    this.sparnaturalForm = sparnaturalForm;
    this.specProvider = specProvider;
    this.#addFormEventListeners(); // Ajout des écouteurs d'événements
  }

  // Ajouter les écouteurs d'événements sur les actions du formulaire
  #addFormEventListeners() {
    // Quand une valeur est ajoutée à un widget
    this.sparnaturalForm.html[0].addEventListener(
      "valueAdded",
      (event: CustomEvent) => {
        console.log("Valeur ajoutée dans un widget !");
        console.log("SparnaturalForm", this.sparnaturalForm);
        new QueryGeneratorForm(this).generateQuery();
      }
    );

    // Quand une valeur est supprimée d'un widget
    this.sparnaturalForm.html[0].addEventListener(
      "valueRemoved",
      (event: CustomEvent) => {
        console.log("Valeur supprimée d'un widget !");
        new QueryGeneratorForm(this).generateQuery();
      }
    );

    // Soumettre la requête quand le formulaire est soumis
    this.sparnaturalForm.html[0].addEventListener(
      "submitFormQuery",
      (event: CustomEvent) => {
        console.log("Le formulaire a été soumis !");
        new QueryGeneratorForm(this).generateQuery();
      }
    );
  }
}

export default ActionStoreForm;

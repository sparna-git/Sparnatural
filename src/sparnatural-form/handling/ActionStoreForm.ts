import SparnaturalFormComponent from "../components/SparnaturalFormComponent";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import { QueryGeneratorForm } from "./actions/GenerateQueryForm";

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
    // Ajouter un écouteur pour l'événement "anyValueSelected" dans ActionStoreForm
    this.sparnaturalForm.html[0].addEventListener(
      "anyValueSelected",
      (event: CustomEvent) => {
        new QueryGeneratorForm(this).generateQuery(); // Générer la requête mise à jour
      }
    );

    // Ajouter un écouteur pour l'événement "defaultValueSelected" dans ActionStoreForm
    this.sparnaturalForm.html[0].addEventListener(
      "removeAnyValueOption",
      (event: CustomEvent) => {
        new QueryGeneratorForm(this).generateQuery(); // Générer la requête mise à jour
      }
    );

    // Ajouter un écouteur pour l'événement "notExist" dans ActionStoreForm
    this.sparnaturalForm.html[0].addEventListener(
      "notExist",
      (event: CustomEvent) => {
        new QueryGeneratorForm(this).generateQuery(); // Générer la requête mise à jour
      }
    );

    // Ajouter un écouteur pour l'événement "removeNotExistOption" dans ActionStoreForm
    this.sparnaturalForm.html[0].addEventListener(
      "removeNotExistOption",
      (event: CustomEvent) => {
        new QueryGeneratorForm(this).generateQuery(); // Générer la requête mise à jour
      }
    );
  }
}

export default ActionStoreForm;

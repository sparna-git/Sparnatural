import { WidgetFactory } from "../../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import { Branch, ISparJson } from "../../sparnatural/generators/json/ISparJson";
import { I18n } from "../../sparnatural/settings/I18n";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import SparnaturalSpecificationFactory from "../../sparnatural/spec-providers/SparnaturalSpecificationFactory";
import ISettings from "../settings/ISettings";
import { SparnaturalFormI18n } from "../settings/SparnaturalFormI18n";
import ActionStoreForm from "../handling/ActionStore"; // Importer le store
import { Catalog } from "../../sparnatural/settings/Catalog";
import SubmitSection from "./buttons/SubmitSection";
import { SparnaturalFormElement } from "../../SparnaturalFormElement";
import FormField from "./FormField";
import { Binding, Form } from "../FormStructure";

/**
 * the content of all HTML element attributes
 */
class SparnaturalFormComponent extends HTMLComponent {
  // Sparnatural configuration
  settings: ISettings;

  SubmitSection: SubmitSection;

  specProvider: ISparnaturalSpecification;

  // The JSON query from the "query" attribute
  jsonQuery: ISparJson;

  cleanQueryResult: ISparJson | null; // Ajout pour stocker la clean query

  actionStoreForm: ActionStoreForm; // Ajouter une référence à l'ActionStoreForm

  catalog: Catalog;

  formConfig: Form; // Stocker la configuration du formulaire ici

  constructor(settings: ISettings) {
    // this is a root component : Does not have a ParentComponent!
    super("SparnaturalForm", null, null);
    this.settings = settings;
    this.cleanQueryResult = null; // Initialise cleanQueryResult
  }

  //methode to handle the optional branches of the query and return the adjusted query
  public HandleOptional(): ISparJson | null {
    //verify if the query is initialized
    if (!this.jsonQuery || !this.jsonQuery.branches) {
      console.error(
        "jsonQuery is not initialized or does not contain branches."
      );
      return null;
    }

    //copy the query to avoid modifying the original query
    const copiedQuery = JSON.parse(JSON.stringify(this.jsonQuery));

    if (!this.formConfig) {
      return null;
    }
    this.formConfig = this.formConfig; // Store the form configuration here
    // Get the form variables and query variables
    const formVariables = this.formConfig.bindings.map(
      (binding: Binding) => binding.variable
    );
    console.log("formVariables", formVariables);
    const queryVariables = this.jsonQuery.variables.map((v: any) => v.value);
    console.log("queryVariables", queryVariables);
    console.log("queryVariables", queryVariables);

    // Adjust optional flags for all branches without removing them
    this.adjustOptionalFlags(copiedQuery.branches);

    /*console.log(
      "Adjusted query without branch removal:",
      JSON.stringify(copiedQuery, null, 2)
    );*/
    this.cleanQueryResult = copiedQuery; // update the global cleanQuery attribute
    return copiedQuery; // return the adjusted query
  }

  //methode qui ajuste les branches optionnelles
  private adjustOptionalFlags(
    branches: Branch[],
    parentOptional: boolean = false
  ) {
    branches.forEach((branch: Branch) => {
      const formVariable = branch.line.o;
      const hasValues = branch.line.values && branch.line.values.length > 0;
      // Remove the optional flag if the branch has values
      if (
        hasValues ||
        branch.children.some(
          (child: Branch) => child.line.values && child.line.values.length > 0
        )
      ) {
        branch.optional = false;
      } else {
        // If no values and not in form/query, propagate the optional flag from the parent
        branch.optional = branch.optional || parentOptional;
      }

      // Recursively adjust the optional flags for child branches
      if (branch.children && branch.children.length > 0) {
        this.adjustOptionalFlags(branch.children, branch.optional);
      }
    });
  }

  render(): this {

    // Initialisation des labels et du catalogue
    this.#initSparnaturalStaticLabels();
    this.#initCatalog();

    // Chargement des paramètres et génération du formulaire
    this.initSpecificationProvider((sp: ISparnaturalSpecification) => {
      this.specProvider = sp;

      this.initJsonQuery((query: ISparJson) => {
        this.jsonQuery = query;
        this.actionStoreForm = new ActionStoreForm(this, this.specProvider);

        // Charger le fichier de configuration du formulaire
        const formUrl = this.settings.form;
        $.getJSON(formUrl, (formConfig) => {
          if (!formConfig || !formConfig.bindings) {
            console.error("formConfig or formConfig.bindings is undefined");
            return;
          }

          this.formConfig = formConfig; // Stocker la configuration du formulaire ici

          // Initialisation des labels
          this.#initSparnaturalFormStaticLabels(formConfig);

          // Génération des champs du formulaire
          formConfig.bindings.forEach((binding: Binding) => {
            const fieldGenerator = new FormField(
              binding,
              this.html[0],
              this.specProvider,
              this.jsonQuery,
              new WidgetFactory(this, this.specProvider, this.settings, null)
            );
            fieldGenerator.generateField();
          });

          // Détection du nombre de champs pour rendre la section sticky
          if (formConfig.bindings.length > 10) {
            this.makeFormScrollable();
          }

          // Ajouter les boutons Reset/Search
          if (this.settings.submitButton) {
            let id = "submit";
            const submitBtn = document.createElement("div");
            submitBtn.setAttribute("id", id);
            submitBtn.setAttribute("class", "submitSection");
            this.html[0].appendChild(submitBtn);
            this.SubmitSection = new SubmitSection(this, id, this.settings);
            this.SubmitSection.render();
          }

          // fire init event at the end
          this.html[0].dispatchEvent(
            new CustomEvent(SparnaturalFormElement.EVENT_INIT, {
              bubbles: true,
              detail: {
                sparnaturalForm: this,
              },
            })
          );
        }).fail((error) => {
          console.error("Error loading form configuration:", error);
        });
      });
    });

    return this;
  }

  // Méthode pour rendre le formulaire scrollable et ajouter un espace pour la SubmitSection
  makeFormScrollable1(): void {
    const formContainer = this.html[0];
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("sparnatural-form-container");

    // Déplacer le contenu du formulaire dans le conteneur scrollable
    while (formContainer.firstChild) {
      containerDiv.appendChild(formContainer.firstChild);
    }

    // Ajouter le conteneur au formulaire principal
    formContainer.appendChild(containerDiv);
  }

  makeFormScrollable(): void {
    const formContainer = this.html[0];
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("sparnatural-form-container");

    // Déplacer le contenu du formulaire dans le conteneur scrollable
    while (formContainer.firstChild) {
      containerDiv.appendChild(formContainer.firstChild);
    }

    // Ajouter le conteneur au formulaire principal
    formContainer.appendChild(containerDiv);

    // Vérifiez si le contenu dépasse la hauteur visible
    const isScrollable = containerDiv.scrollHeight > containerDiv.clientHeight;

    // Ajouter ou retirer la classe `scrollable` en fonction de la scrollabilité
    if (isScrollable) {
      containerDiv.classList.add("scrollable");
    } else {
      containerDiv.classList.remove("scrollable");
    }
  }

  //methode to reset the form

  resetForm() {
    console.log("Resetting the entire form...");

    // Effacer tous les éléments enfants du formulaire pour le vider
    while (this.html[0].firstChild) {
      this.html[0].removeChild(this.html[0].firstChild);
    }

    // Réinitialiser la requête JSON pour supprimer toutes les valeurs sélectionnées
    this.jsonQuery.branches.forEach((branch: Branch) => {
      branch.line.values = []; // Vider toutes les valeurs
    });

    // Ajouter un événement pour vider l'éditeur SPARQL
    const resetEditorEvent = new CustomEvent("resetEditor", {
      bubbles: true,
      detail: { queryString: "", queryJson: this.jsonQuery },
    });
    this.html[0].dispatchEvent(resetEditorEvent);

    // Recréer le formulaire en appelant la méthode `render`
    this.render();
    console.log("Form reset and re-rendered successfully.");
  }

  /**
   * Reads and parse the configuration provided in the "src" attribute, and fires a callback when ready
   * @param callback the function that is called with the ISpecificationProvider instance created after reading the config
   */
  initSpecificationProvider(callback: (sp: ISparnaturalSpecification) => void) {
    let specProviderFactory = new SparnaturalSpecificationFactory();
    specProviderFactory.build(
      this.settings.src,
      this.settings.language,
      // here : catalog parameter that we could add to the form
      undefined,
      (sp: ISparnaturalSpecification) => {
        // call the call back when done
        callback(sp);
      }
    );
  }

  #initCatalog() {
    let settings = this.settings;
    let me = this;
    if (settings.catalog) {
      $.getJSON(settings.catalog, function (data) {
        me.catalog = new Catalog(data);
      }).fail(function (response) {
        console.error(
          "Sparnatural - unable to load catalog file : " + settings.catalog
        );
      });
    }
  }

  /**
   * Reads the Sparnatural query
   * @param callback
   */
  initJsonQuery(callback: (query: ISparJson) => void) {
    let queryUrl = this.settings.query;

    $.when(
      $.getJSON(queryUrl, function (data) {
        callback(data as ISparJson);
      }).fail(function (response) {
        console.error(
          "Sparnatural - unable to load JSON query file : " + queryUrl
        );
      })
    ).done(function () {});
  }

  /**
   * Initialize the static labels used to render sparnatural-form
   */

  #initSparnaturalFormStaticLabels(formConfig: Form) {
    const lang = this.settings.language === "fr" ? "fr" : "en";
    SparnaturalFormI18n.init(lang, formConfig);
  }

  // method is exposed from the HTMLElement
  enablePlayBtn = () => {
    this.SubmitSection.searchBtn.removeLoading();
  };

  // method is exposed from the HTMLElement
  disablePlayBtn = () => {
    this.SubmitSection.searchBtn.disable();
  };
  /**
   * Initialize the static labels used to render the widgets from Sparnatural
   */
  #initSparnaturalStaticLabels() {
    if (this.settings.language === "fr") {
      I18n.init("fr");
    } else {
      I18n.init("en");
    }
  }
  //methode to check if the form is empty
  isEmpty(): boolean {
    return null;
  }
}
export default SparnaturalFormComponent;

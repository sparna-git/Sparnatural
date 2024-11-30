import { WidgetFactory } from "../../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import { Branch, ISparJson } from "../../sparnatural/generators/json/ISparJson";
import { I18n } from "../../sparnatural/settings/I18n";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import SparnaturalSpecificationFactory from "../../sparnatural/spec-providers/SparnaturalSpecificationFactory";
import { SparnaturalFormAttributes } from "../../SparnaturalFormAttributes";
import ISettings from "../settings/ISettings";
import { SparnaturalFormI18n } from "../settings/SparnaturalFormI18n";
import UnselectBtn from "../../sparnatural/components/buttons/UnselectBtn";
import ActionStoreForm from "../handling/ActionStore"; // Importer le store
import { Catalog } from "../../sparnatural/settings/Catalog";
import { getSettings } from "../settings/defaultsSettings";
import SubmitSection from "./buttons/SubmitBtn";
import { SparnaturalFormElement } from "../../SparnaturalFormElement";
import FormField from "./FormFieldGenerator";
import { Binding, Form } from "../FormStructure";

class SparnaturalFormComponent extends HTMLComponent {
  // the content of all HTML element attributes
  formSettings: ISettings;
  // Sparnatural configuration
  SubmitSection: SubmitSection;

  specProvider: ISparnaturalSpecification;
  // The JSON query from the "query" attribute
  jsonQuery: ISparJson;

  cleanQueryResult: ISparJson | null; // Ajout pour stocker la clean query

  actionStoreForm: ActionStoreForm; // Ajouter une référence à l'ActionStoreForm

  catalog: Catalog;

  constructor(attributes: SparnaturalFormAttributes) {
    // this is a root component : Does not have a ParentComponent!
    super("SparnaturalForm", null, null);
    this.formSettings = attributes;
    this.formSettings.customization = {};
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
    //get the form configuration url
    console.log("formSettings", this.formSettings);
    let formUrl = this.formSettings.form;

    //initialize the form configuration
    let formConfig: Form = null;

    // Charge the JSON form configuration synchronously via $.ajax (en synchronous mode)
    $.ajax({
      url: formUrl,
      dataType: "json",
      async: false,
      success: (data) => {
        formConfig = data;
      },
      error: (error) => {
        console.error("Error loading form configuration:", error);
        return null;
      },
    });
    // If the form configuration is not loaded
    if (!formConfig) {
      return null;
    }
    // Get the form variables and query variables
    const formVariables = formConfig.bindings.map(
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

  //render the form
  render(): this {
    //init the static labels
    this.#initSparnaturalStaticLabels();
    //init the catalog
    this.#initCatalog();

    //get les settings
    this.initSpecificationProvider((sp: ISparnaturalSpecification) => {
      //get the specification provider
      this.specProvider = sp;

      //init the query
      this.initJsonQuery((query: ISparJson) => {
        //get the query
        this.jsonQuery = query;

        // ActonStoreForm for listening to form actions
        this.actionStoreForm = new ActionStoreForm(this, this.specProvider);

        //get the url of the form configuration file
        let formUrl = this.formSettings.form;

        // Load the form configuration file asynchronously via $.getJSON
        $.getJSON(formUrl, (formConfig) => {
          if (!formConfig || !formConfig.bindings) {
            console.error("formConfig or formConfig.bindings is undefined");
            return;
          }

          // Initialize labels after loading formConfig
          this.#initSparnaturalFormStaticLabels(formConfig);

          formConfig.bindings.forEach((binding: Binding) => {
            const fieldGenerator = new FormField(
              binding,
              this.html[0], // form container
              this.specProvider,
              this.jsonQuery,
              new WidgetFactory(
                this,
                this.specProvider,
                this.formSettings,
                null
              )
            );
            fieldGenerator.generateField();
          });

          // Add the submit button if it is set in the settings
          if (getSettings().submitButton) {
            const submitBtn = document.createElement("div");
            submitBtn.setAttribute("id", "submit");
            this.html[0].appendChild(submitBtn);
            this.SubmitSection = new SubmitSection(this, "submit").render();
          }
        }).fail((error) => {
          console.error("Error loading form configuration:", error);
        });
      });

      // Dispatch an event to notify that the form has been initialized
      this.html[0].dispatchEvent(
        new CustomEvent(SparnaturalFormElement.EVENT_INIT, {
          bubbles: true,
          detail: {
            sparnaturalForm: this,
          },
        })
      );
    });

    return this;
  }

  //methode to reset the form
  //a faire add a methode when we reset we push the initial query to the sparql editor
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
      this.formSettings.src,
      this.formSettings.language,
      // here : catalog parameter that we could add to the form
      undefined,
      (sp: ISparnaturalSpecification) => {
        // call the call back when done
        console.log("sp", sp);
        callback(sp);
      }
    );
  }

  #initCatalog() {
    let settings = getSettings();
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
    let queryUrl = this.formSettings.query;

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
    const lang = getSettings().language === "fr" ? "fr" : "en";
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
    if (getSettings().language === "fr") {
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

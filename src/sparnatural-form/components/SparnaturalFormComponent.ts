import { WidgetFactory } from "../../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import { ISparJson } from "../../sparnatural/generators/json/ISparJson";
import { I18n } from "../../sparnatural/settings/I18n";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import ISpecificationEntity from "../../sparnatural/spec-providers/ISpecificationEntity";
import SparnaturalSpecificationFactory from "../../sparnatural/spec-providers/SparnaturalSpecificationFactory";
import { SparnaturalFormAttributes } from "../../SparnaturalFormAttributes";
import ISettings from "../settings/ISettings";
import { SparnaturalFormI18n } from "../settings/SparnaturalFormI18n";
import UnselectBtn from "../../sparnatural/components/buttons/UnselectBtn";
import "../style/form.scss";
import {
  QueryGenerator,
  QueryUpdatedPayload,
} from "../../sparnatural/statehandling/actions/GenerateQuery";
import ActionStoreForm from "../handling/ActionStoreForm"; // Importer le store
import { Catalog } from "../../sparnatural/settings/Catalog";
import { getSettings } from "../settings/defaultsSettings";

class SparnaturalFormComponent extends HTMLComponent {
  // the content of all HTML element attributes
  formSettings: ISettings;
  // Sparnatural configuration
  specProvider: ISparnaturalSpecification;
  // The JSON query from the "query" attribute
  jsonQuery: ISparJson;

  actionStoreForm: ActionStoreForm; // Ajouter une référence à l'ActionStoreForm
  catalog: Catalog;

  constructor(attributes: SparnaturalFormAttributes) {
    // this is a root component : Does not have a ParentComponent!
    super("SparnaturalForm", null, null);

    this.formSettings = attributes;
    this.formSettings.customization = {};
  }

  //method to clean the query
  public cleanQuery(): ISparJson | null {
    // Same cleaning logic as before
    if (!this.jsonQuery || !this.jsonQuery.branches) {
      console.error(
        "jsonQuery is not initialized or does not contain branches."
      );
      return;
    }

    const copiedQuery = JSON.parse(JSON.stringify(this.jsonQuery));

    let formUrl = this.formSettings.form;
    $.getJSON(formUrl, (formConfig) => {
      const formVariables = formConfig.bindings.map(
        (binding: any) => binding.variable
      );
      const queryVariables = this.jsonQuery.variables.map((v: any) => v.value);

      const cleanBranches = (branches: any[]) => {
        return branches.filter((branch: any) => {
          const formVariable = branch.line.o;
          const existsInForm = formVariables.includes(formVariable);
          const existsInQuery = queryVariables.includes(formVariable);
          const hasValues = branch.line.values && branch.line.values.length > 0;

          if (existsInForm && !hasValues && !existsInQuery) {
            return false;
          }

          if (branch.children && branch.children.length > 0) {
            branch.children = cleanBranches(branch.children);
          }

          return true;
        });
      };

      copiedQuery.branches = cleanBranches(copiedQuery.branches);
      console.log("Cleaned query:", JSON.stringify(copiedQuery, null, 2));
      return copiedQuery; // Retourne la requête nettoyée
    }).fail((error) => {
      console.error("Error loading form configuration:", error);
      return null; // Ajoute une valeur de retour temporaire
    });
    return null; // Ajoute une valeur de retour temporaire
  }

  //cela va sortir en class submitQuery
  //methode to execute the query from the button
  submitQuery(): void {
    // ici executer la requete
    console.log("action executer la requete");
    this.handlePostExecutionTask(); // Exécution de la nouvelle tâche
  }
  // Nouvelle méthode pour gérer le bouton
  handlePostExecutionTask(): void {}

  //render the form
  render(): this {
    //init the language for the static labels
    this.#initSparnaturalFormStaticLabels();
    //init the catalog
    this.#initCatalog();
    //init the static labels for the widgets
    this.#initSparnaturalStaticLabels();

    //get les settings
    this.initSpecificationProvider((sp: ISparnaturalSpecification) => {
      //get the specification provider
      this.specProvider = sp;
      console.log("sp", sp);

      //init the query
      this.initJsonQuery((query: ISparJson) => {
        //get the query
        this.jsonQuery = query;

        //formSettings
        console.log("settings", this.formSettings);

        // ActonStoreForm for listening to form actions
        this.actionStoreForm = new ActionStoreForm(this, sp);

        //get the form configuration
        let formUrl = this.formSettings.form;
        $.getJSON(formUrl, (formConfig) => {
          //get the variables from the form configuration
          formConfig.bindings.forEach((binding: any) => {
            const variable = binding.variable;

            //create the label for each variable
            const label = document.createElement("label");
            label.setAttribute("for", variable);
            //set the label text from the form configuration
            label.innerText =
              (binding.node.name[this.formSettings.language] ||
                binding.node.name["en"]) + " :";
            //style the label
            label.style.fontSize = "18px";
            this.html[0].appendChild(label);
            //create a line between the label and the widget
            const hr = document.createElement("hr");
            hr.classList.add("hr");
            this.html[0].appendChild(hr);

            //method that will find the line in the query that corresponds to the variable in the form configuration
            const findInBranches = (branches: any[]): any => {
              for (const branch of branches) {
                if (branch.line.o === variable) {
                  return branch.line;
                } else if (branch.children && branch.children.length > 0) {
                  const result = findInBranches(branch.children);
                  if (result) return result;
                }
              }
              return null;
            };

            //find the line in the query that corresponds to the variable in the form configuration
            const queryLine = findInBranches(query.branches);
            //if the line is found
            if (queryLine) {
              const subject = queryLine.sType;
              const predicate = queryLine.p;
              const object = queryLine.oType;

              let specEntity: ISpecificationEntity =
                this.specProvider.getEntity(subject);
              let connectingProperty = this.specProvider.getProperty(predicate);
              const propertyType = connectingProperty.getPropertyType(object);

              let wf: WidgetFactory = new WidgetFactory(
                this,
                this.specProvider,
                this.formSettings,
                null
              );
              //build the widget for the variable
              let theWidget = wf.buildWidget(
                propertyType,
                { variable: queryLine.s, type: specEntity.getId() },
                { variable: "predicate", type: connectingProperty.getId() },
                { variable: queryLine.o, type: object }
              );
              //render the widget
              theWidget.render();
              this.html[0].appendChild(theWidget.html[0]);

              //append the selected values to the form
              const valueDisplay = document.createElement("div");
              valueDisplay.setAttribute("id", `selected-value-${variable}`);
              valueDisplay.classList.add("value-display-container");
              valueDisplay.style.marginTop = "5px";
              this.html[0].appendChild(valueDisplay);

              //this part is for the selected values display for each widget
              //exemple for widget country when we select a country it will be displayed in the form
              const selectedValues = new Set<any>();

              //method to update the selected values display every time a value is added or removed
              const updateValueDisplay = () => {
                valueDisplay.innerHTML = "";
                selectedValues.forEach((val) => {
                  const valueContainer = document.createElement("div");
                  valueContainer.classList.add("selected-value-container");

                  const valueLabel = document.createElement("span");
                  valueLabel.innerText = `${val.label}`;
                  valueLabel.classList.add("selected-value-label");
                  valueContainer.appendChild(valueLabel);

                  const removeBtn = new UnselectBtn(this, () => {
                    selectedValues.delete(val);
                    theWidget.onRemoveValue(
                      theWidget
                        .getWidgetValues()
                        .find((w) => w.value.label === val.label)
                    );
                    updateValueDisplay();
                    queryLine.values = Array.from(selectedValues);

                    // Ajouter l'événement 'valueRemoved' ici
                    this.html[0].dispatchEvent(
                      // using acrtionStoreForm to dispatch the event and put the new generated query on the SPARQL Editor
                      new CustomEvent("valueRemoved", {
                        bubbles: true,
                        detail: { value: val, variable: variable }, // Tu peux ajouter plus de détails si nécessaire
                      })
                    );

                    this.cleanQuery(); // Automatically clean the query after removing a value
                  }).render();

                  valueContainer.appendChild(removeBtn.html[0]);
                  valueDisplay.appendChild(valueContainer);
                });
              };

              //
              theWidget.html[0].addEventListener(
                "renderWidgetVal",
                (e: CustomEvent) => {
                  e.stopImmediatePropagation();

                  if (!e.detail || !e.detail.value) {
                    throw Error(
                      'No widgetValue received. Widget Value needs to be provided for "renderWidgetVal"'
                    );
                  }

                  // Access 'value' directly
                  const valueToInject = Array.isArray(e.detail.value)
                    ? e.detail.value
                    : [e.detail.value]; // If value is not an array, convert it into one

                  console.log("Values to inject:", valueToInject);

                  valueToInject.forEach((val: any) => {
                    if (typeof val !== "object" || !val.label) {
                      console.warn("Invalid value structure received:", val);
                      return; // Skip if the value is not properly structured
                    }

                    const existingValue = Array.from(selectedValues).find(
                      (existingVal: any) => existingVal.label === val.label
                    );

                    if (!existingValue) {
                      // Add the value if it’s not already in the set
                      selectedValues.add(val); // Add the full object dynamically
                      console.log("Added value:", val);

                      // Add to widgetValues only if it doesn't already exist
                      if (
                        !theWidget
                          .getWidgetValues()
                          .some(
                            (widgetValue) =>
                              widgetValue.value.label === val.label
                          )
                      ) {
                        theWidget.addWidgetValue(val);
                      }

                      // Update the selected values display
                      updateValueDisplay();

                      // Update the JSON query
                      queryLine.values = Array.from(selectedValues);
                      this.cleanQuery(); // Automatically clean the query after adding a value

                      // Ajouter l'événement 'valueAdded' ici
                      this.html[0].dispatchEvent(
                        // using acrtionStoreForm to dispatch the event and put the new generated query on the SPARQL Editor
                        new CustomEvent("valueAdded", {
                          bubbles: true,
                          detail: { value: val, variable: variable },
                        })
                      );

                      console.log(
                        "Updated query after addition:",
                        JSON.stringify(query, null, 2)
                      );
                    } else {
                      console.warn(
                        "Value already exists in the set:",
                        val.label
                      );
                    }
                  });
                }
              );
            }
          });

          //create the submit button to execute the query
          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");

          const submitButton = document.createElement("button");
          submitButton.innerText = "Submit";
          submitButton.addEventListener("click", () => this.submitQuery()); // Only submits the query
          buttonContainer.appendChild(submitButton);

          this.html[0].appendChild(buttonContainer);
        }).fail((error) => {
          console.error("Error loading form configuration:", error);
        });
      });
    });

    return this;
  }

  /**
   * Reads and parse the configuration provided in the "src" attribute, and fires a callback when ready
   * @param callback the function that is called with the ISpecificationProvider instance created after reading the config
   */
  initSpecificationProvider(callback: any) {
    let specProviderFactory = new SparnaturalSpecificationFactory();
    specProviderFactory.build(
      this.formSettings.src,
      this.formSettings.language,
      (sp: any) => {
        // call the call back when done
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
  #initSparnaturalFormStaticLabels() {
    if (getSettings().language === "fr") {
      SparnaturalFormI18n.init("fr");
    } else {
      SparnaturalFormI18n.init("en");
    }
  }
  // method is exposed from the HTMLElement
  enablePlayBtn = () => {
    //this.SubmitSection.playBtn.removeLoading();
    // buttonsubmit
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

  isEmpty(): any {
    return null;
  }
}

export default SparnaturalFormComponent;

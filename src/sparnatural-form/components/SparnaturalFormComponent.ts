import { WidgetFactory } from "../../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import { ISparJson } from "../../sparnatural/generators/json/ISparJson";
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

  //methode to clean the query each time a value is added or removed
  public cleanQuery(): ISparJson | null {
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
    let formConfig: any = null;

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
      (binding: any) => binding.variable
    );
    console.log("formVariables", formVariables);
    const queryVariables = this.jsonQuery.variables.map((v: any) => v.value);
    console.log("queryVariables", queryVariables);

    // Adjust optional flags for all branches without removing them
    this.adjustOptionalFlags(copiedQuery.branches);

    console.log(
      "Adjusted query without branch removal:",
      JSON.stringify(copiedQuery, null, 2)
    );
    this.cleanQueryResult = copiedQuery; // update the global cleanQuery attribute
    return copiedQuery; // return the adjusted query
  }

  //methode qui ajuste les branches optionnelles
  private adjustOptionalFlags(
    branches: any[],
    parentOptional: boolean = false
  ) {
    branches.forEach((branch: any) => {
      const formVariable = branch.line.o;
      const hasValues = branch.line.values && branch.line.values.length > 0;
      // Remove the optional flag if the branch has values
      if (
        hasValues ||
        branch.children.some(
          (child: any) => child.line.values && child.line.values.length > 0
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
    //add resume section to the form that will contain the selected values for each variable
    //like country: |France (x)|
    /*
    let resumeSection = document.createElement("div");
    resumeSection.setAttribute("id", "resume");
    let resumeTitle = document.createElement("h3");
    resumeTitle.innerText = "Resume";
    resumeSection.appendChild(resumeTitle);
    resumeSection.style.marginBottom = "20px";
    this.html[0].appendChild(resumeSection);
*/
    //clean the query
    this.cleanQuery();
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

          // Build the widget for each variable in the form configuration
          formConfig.bindings.forEach((binding: any) => {
            const variable = binding.variable;

            // create a div that contains this form field
            const formFieldDiv = document.createElement("div");
            formFieldDiv.classList.add("formField");
            this.html[0].appendChild(formFieldDiv);

            // Create a label for the widget and append it to the form
            const label = document.createElement("label");

            label.setAttribute("for", variable);
            label.innerHTML = `<strong>${SparnaturalFormI18n.getLabel(
              variable
            )}</strong>`;

            label.style.fontSize = "18px";
            formFieldDiv.appendChild(label);

            const label1 = label.cloneNode(true);
            // resumeSection.appendChild(label1);

            // Find the line in the query that corresponds to the variable
            const findInBranches = (branches: any[]): any => {
              for (const branch of branches) {
                if (branch.line.o === variable) return branch.line;
                if (branch.children && branch.children.length > 0) {
                  const result = findInBranches(branch.children);
                  if (result) return result;
                }
              }
              return null;
            };
            const queryLine = findInBranches(query.branches);

            const findtheBranch = (branches: any[]): any => {
              for (const branch of branches) {
                if (branch.line.o === variable) return branch;
                if (branch.children && branch.children.length > 0) {
                  const result = findtheBranch(branch.children);
                  if (result) return result;
                }
              }
              return null;
            };
            const branch = findtheBranch(query.branches);

            const findthebranchparentofchildren = (branches: any[]): any => {
              for (const branch of branches) {
                if (branch.children && branch.children.length > 0) {
                  const result = findtheBranch(branch.children);
                  if (result) return branch;
                }
              }
              return false;
            };
            const branchparent = findthebranchparentofchildren(query.branches);
            console.log("branchparent", branchparent);

            if (queryLine) {
              const subject = queryLine.sType;
              const predicate = queryLine.p;
              const object = queryLine.oType;
              const specEntity = this.specProvider.getEntity(subject);
              const connectingProperty =
                this.specProvider.getProperty(predicate);
              const propertyType = connectingProperty.getPropertyType(object);

              const wf = new WidgetFactory(
                this,
                this.specProvider,
                this.formSettings,
                null
              );

              const theWidget = wf.buildWidget(
                propertyType,
                { variable: queryLine.s, type: specEntity.getId() },
                { variable: "predicate", type: connectingProperty.getId() },
                { variable: queryLine.o, type: object }
              );
              theWidget.render();
              formFieldDiv.appendChild(theWidget.html[0]);
              /**/
              const selectedValues = new Set<any>();

              const valueDisplay = document.createElement("div");

              valueDisplay.setAttribute("id", `selected-value-${variable}`);
              valueDisplay.classList.add("value-display-container");
              valueDisplay.style.marginTop = "5px";
              formFieldDiv.appendChild(valueDisplay);

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

                    formFieldDiv.dispatchEvent(
                      new CustomEvent("valueRemoved", {
                        bubbles: true,
                        detail: { value: val, variable: variable },
                      })
                    );
                    this.cleanQuery();
                    updateOptionVisibility();
                  }).render();
                  valueContainer.appendChild(removeBtn.html[0]);
                  valueDisplay.appendChild(valueContainer);
                });
              };

              theWidget.html[0].addEventListener(
                "renderWidgetVal",
                (e: CustomEvent) => {
                  e.stopImmediatePropagation();
                  const valueToInject = Array.isArray(e.detail.value)
                    ? e.detail.value
                    : [e.detail.value];

                  valueToInject.forEach((val: any) => {
                    const existingValue = Array.from(selectedValues).find(
                      (existingVal: any) => existingVal.label === val.label
                    );

                    if (!existingValue) {
                      selectedValues.add(val);
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
                      updateValueDisplay();

                      queryLine.values = Array.from(selectedValues);
                      this.cleanQuery();
                      updateOptionVisibility(); // Update options visibility

                      // Dispatch valueAdded event
                      formFieldDiv.dispatchEvent(
                        new CustomEvent("valueAdded", {
                          bubbles: true,
                          detail: { value: val, variable: variable },
                        })
                      );
                    }
                  });
                }
              );
              //resumeSection.appendChild(valueDisplay);

              // Sauvegarde de l'état initial
              this.saveInitialOptionalState(this.jsonQuery.branches);

              // Création du conteneur d'options
              const optionContainer = document.createElement("div");
              optionContainer.classList.add("option-container");
              const anydiv = document.createElement("div");
              const anyValueToggle = document.createElement("input");
              const notExistDiv = document.createElement("div");
              notExistDiv.classList.add("not-exist-container");
              const notExistToggle = document.createElement("input");

              // Si la variable est optionnelle, on ajoute l'option "Any value"
              console.log("variable", variable);
              console.log("branch", branch);
              console.log("branchparent", branchparent);

              // Fonction de mise à jour de la visibilité des options
              const updateOptionVisibility = () => {
                const hasValues =
                  queryLine.values && queryLine.values.length > 0;

                if (hasValues) {
                  if (anyValueToggle) anyValueToggle.checked = false;
                  if (notExistToggle) notExistToggle.checked = false;
                  if (anyValueToggle) anyValueToggle.disabled = true;
                  if (notExistToggle) notExistToggle.disabled = true;
                  anydiv.style.display = "none";
                  notExistDiv.style.display = "none";
                } else {
                  if (anyValueToggle) anyValueToggle.disabled = false;
                  if (notExistToggle) notExistToggle.disabled = false;
                  anydiv.style.display = "block";
                  notExistDiv.style.display = "block";
                }
              };

              if (branch.optional || branchparent.optional) {
                // Création de l'élément "Any value"

                //anydiv.classList.add("any-value-container");

                const anyValueLabel = document.createElement("label");
                anyValueToggle.type = "checkbox";
                anyValueToggle.id = `any-value-${variable}`;
                anyValueToggle.classList.add("any-value-toggle");
                anyValueLabel.htmlFor = `any-value-${variable}`;
                anyValueLabel.innerHTML = "&nbsp;Any value";
                anydiv.appendChild(anyValueToggle);
                anydiv.appendChild(anyValueLabel);

                // Ajoute "Any value" au conteneur d'options
                optionContainer.appendChild(anydiv);

                anyValueToggle.addEventListener("change", () => {
                  if (anyValueToggle.checked) {
                    this.setAnyValueForWidget(variable);
                    notExistDiv.style.display = "none"; // Masquer "Not Exist"
                    notExistToggle.checked = false;
                    notExistToggle.disabled = true;

                    theWidget.disableWidget();

                    // Transformer "Any Value" en encadré
                    anyValueToggle.parentElement.classList.add(
                      "selected-value-container"
                    );

                    formFieldDiv.dispatchEvent(
                      new CustomEvent("anyValueSelected", {
                        bubbles: true,
                        detail: { variable: variable },
                      })
                    );
                    this.cleanQuery();
                  } else {
                    this.resetToDefaultValueForWidget(variable);
                    notExistToggle.disabled = false;
                    notExistDiv.style.display = "block"; // Afficher "Not Exist"
                    theWidget.enableWidget();

                    // Retirer le style encadré
                    anyValueToggle.parentElement.classList.remove(
                      "selected-value-container"
                    );

                    formFieldDiv.dispatchEvent(
                      new CustomEvent("removeAnyValueOption", {
                        bubbles: true,
                        detail: { variable: variable },
                      })
                    );
                    this.cleanQuery();
                  }
                });

                // Création de l'élément "Not Exist"
                const notExistLabel = document.createElement("label");
                notExistToggle.type = "checkbox";
                notExistToggle.id = `not-value-${variable}`;
                notExistToggle.classList.add("any-value-toggle");
                notExistLabel.htmlFor = `not-value-${variable}`;
                notExistLabel.innerHTML = "&nbsp;Not Exist";
                notExistDiv.appendChild(notExistToggle);
                notExistDiv.appendChild(notExistLabel);

                // Ajout de l'option "Not Exist" au conteneur d'options
                optionContainer.appendChild(notExistDiv);
                formFieldDiv.appendChild(optionContainer);

                updateOptionVisibility();

                // Gestion des événements pour le bouton "Not Exist"
                notExistToggle.addEventListener("change", () => {
                  if (notExistToggle.checked) {
                    this.setNotExistsForWidget(variable);
                    if (anyValueToggle) anyValueToggle.checked = false;
                    if (anyValueToggle) anyValueToggle.disabled = true;
                    anydiv.style.display = "none"; // Masquer "Any value"
                    theWidget.disableWidget();

                    formFieldDiv.dispatchEvent(
                      new CustomEvent("notExist", {
                        bubbles: true,
                        detail: { variable: variable },
                      })
                    );
                  } else {
                    this.removeNotExistsForWidget(variable);
                    if (anyValueToggle) anyValueToggle.disabled = false;
                    anydiv.style.display = "block"; // Afficher "Any value"
                    theWidget.enableWidget();

                    formFieldDiv.dispatchEvent(
                      new CustomEvent("removeNotExistOption", {
                        bubbles: true,
                        detail: { variable: variable },
                      })
                    );
                  }
                });

              }
            }
          });

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

  resetForm() {
    console.log("Resetting the entire form...");

    // Effacer tous les éléments enfants du formulaire pour le vider
    while (this.html[0].firstChild) {
      this.html[0].removeChild(this.html[0].firstChild);
    }

    // Réinitialiser la requête JSON pour supprimer toutes les valeurs sélectionnées
    this.jsonQuery.branches.forEach((branch: any) => {
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
  initSpecificationProvider(callback: any) {
    let specProviderFactory = new SparnaturalSpecificationFactory();
    specProviderFactory.build(
      this.formSettings.src,
      this.formSettings.language,
      // here : catalog parameter that we could add to the form
      undefined,
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

  #initSparnaturalFormStaticLabels(formConfig: any) {
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

  isEmpty(): any {
    return null;
  }

  private initialOptionalStates: { [variable: string]: any } = {};

  private saveInitialOptionalState(
    queryBranches: any[],
    parentOptionalChain: boolean[] = []
  ) {
    const saveState = (branches: any[], currentParentChain: boolean[]) => {
      branches.forEach((branch: any) => {
        const branchVariable = branch.line?.o;
        const currentChain = [...currentParentChain, branch.optional || false]; // Ajout du statut actuel à la chaîne

        const branchState: any = {
          optional: branch.optional,
          notExists: branch.notExists || false,
          parentOptionalChain: currentChain, // Stocke la chaîne d'optionalité pour cette branche
          children: branch.children
            ? saveState(branch.children, currentChain)
            : [],
        };

        // Sauvegarde de l'état initial si la branche a une variable
        if (branchVariable) {
          this.initialOptionalStates[branchVariable] = branchState;
        }
      });
    };

    saveState(queryBranches, parentOptionalChain);
  }

  //cette methode sert a
  public setAnyValueForWidget(variable: string) {
    console.log(`Setting "Any value" for variable: ${variable}`);
    const adjustOptionalFlags = (branches: any[], targetVariable: string) => {
      branches.forEach((branch: any) => {
        const formVariable = branch.line.o;
        if (formVariable === targetVariable && branch.optional === true) {
          console.log(
            `Removing "optional: true" for variable: ${targetVariable}`
          );
          delete branch.optional;
        }
        if (branch.children && branch.children.length > 0) {
          const childHasTargetVariable = branch.children.some(
            (child: any) => child.line.o === targetVariable
          );
          if (childHasTargetVariable && branch.optional === true) {
            console.log(
              `Removing "optional: true" for parent of variable: ${targetVariable}`
            );
            delete branch.optional;
          }
          adjustOptionalFlags(branch.children, targetVariable);
        }
      });
    };
    adjustOptionalFlags(this.jsonQuery.branches, variable);
  }
  public resetToDefaultValueForWidget(variable: string) {
    console.log(`Resetting to default state for variable: ${variable}`);

    const restoreInitialState = (branches: any[], targetVariable: string) => {
      branches.forEach((branch: any) => {
        if (branch.line && branch.line.o === targetVariable) {
          const initialState = this.initialOptionalStates[targetVariable];
          if (initialState) {
            // Restaure l'état initial de la branche
            branch.optional = initialState.optional;
            branch.notExists = initialState.notExists;
            // Restaure la chaîne d'optionalité parentale si elle existe
            this.restoreParentOptionalChain(
              branch,
              initialState.parentOptionalChain
            );
          }
        }
        if (branch.children && branch.children.length > 0) {
          restoreInitialState(branch.children, targetVariable);
        }
      });
    };

    restoreInitialState(this.jsonQuery.branches, variable);
    this.cleanQuery();
  }

  /**
   * Restaure l'état d'optionalité des parents en utilisant la chaîne d'optionalité enregistrée
   */
  private restoreParentOptionalChain(
    branch: any,
    parentOptionalChain: boolean[]
  ) {
    // Remonte la chaîne d'optionalité en restaurant chaque état parent
    let currentBranch = branch;
    for (let i = parentOptionalChain.length - 1; i >= 0; i--) {
      const parentOptional = parentOptionalChain[i];
      if (currentBranch) {
        currentBranch.optional = parentOptional;
        currentBranch = this.findParentBranch(
          this.jsonQuery.branches,
          currentBranch.line.o
        );
      }
    }
  }

  /**
   * Recherche le parent d'une branche donnée en utilisant sa variable
   */
  private findParentBranch(branches: any[], childVariable: string): any | null {
    for (const branch of branches) {
      if (
        branch.children &&
        branch.children.some((child: any) => child.line.o === childVariable)
      ) {
        return branch;
      }
      if (branch.children && branch.children.length > 0) {
        const foundParent = this.findParentBranch(
          branch.children,
          childVariable
        );
        if (foundParent) {
          return foundParent;
        }
      }
    }
    return null;
  }

  public setNotExistsForWidget(variable: string) {
    console.log(`Setting "notExists" for variable: ${variable}`);

    const addNotExistsFlag = (branches: any[], targetVariable: string) => {
      branches.forEach((branch: any) => {
        // Vérifie si la variable correspond
        if (branch.line && branch.line.o === targetVariable) {
          console.log(
            `Adding "notExists: true" for variable: ${targetVariable}`
          );
          branch.notExists = true; // Applique `notExists: true`

          // Supprime `optional: true` si présent
          if (branch.optional === true) {
            console.log(
              `Removing "optional: true" for variable: ${targetVariable}`
            );
            delete branch.optional;
          }
        }
        // Parcours récursif des enfants pour ajouter `notExists` et supprimer `optional`
        if (branch.children && branch.children.length > 0) {
          addNotExistsFlag(branch.children, targetVariable);
        }
      });
    };

    const adjustParentOptionalFlags = (
      branches: any[],
      targetVariable: string
    ) => {
      branches.forEach((branch: any) => {
        const childHasTargetVariable = branch.children.some(
          (child: any) => child.line.o === targetVariable
        );

        // Si un enfant correspond à la variable cible, on supprime le `optional: true` du parent
        if (childHasTargetVariable && branch.optional === true) {
          console.log(
            `Removing "optional: true" for parent of variable: ${targetVariable}`
          );
          delete branch.optional;
        }

        // Appel récursif pour ajuster les parents potentiels
        if (branch.children && branch.children.length > 0) {
          adjustParentOptionalFlags(branch.children, targetVariable);
        }
      });
    };

    // Applique les flags `notExists` et ajuste `optional`
    addNotExistsFlag(this.jsonQuery.branches, variable);
    adjustParentOptionalFlags(this.jsonQuery.branches, variable);

    // Nettoyage de la requête
    this.cleanQuery();
  }
  public removeNotExistsForWidget(variable: string) {
    console.log(`Removing "notExists" for variable: ${variable}`);

    const removeNotExistsFlag = (branches: any[], targetVariable: string) => {
      branches.forEach((branch: any) => {
        if (branch.line && branch.line.o === targetVariable) {
          // Supprime le flag notExists
          delete branch.notExists;

          // Restaure l’état initial d'optionalité pour cette variable et ses parents
          const initialState = this.initialOptionalStates[targetVariable];
          if (initialState) {
            branch.optional = initialState.optional;
            // Restaure la chaîne d'optionalité parentale
            this.restoreParentOptionalChain(
              branch,
              initialState.parentOptionalChain
            );
          }
        }
        if (branch.children && branch.children.length > 0) {
          removeNotExistsFlag(branch.children, targetVariable);
        }
      });
    };

    // Supprime le flag `notExists` pour la variable et restaure l’état d'optionalité
    removeNotExistsFlag(this.jsonQuery.branches, variable);
    this.cleanQuery();
  }
}
export default SparnaturalFormComponent;

/*

  public cleanQuery1(): ISparJson | null {
    // Vérifie si la query est initialisée
    if (!this.jsonQuery || !this.jsonQuery.branches) {
      console.error(
        "jsonQuery is not initialized or does not contain branches."
      );
      return null;
    }

    // Copie la query pour éviter de modifier l'original
    const copiedQuery = JSON.parse(JSON.stringify(this.jsonQuery));
    const originalQuery = JSON.parse(JSON.stringify(this.jsonQuery)); // Sauvegarde l'original pour la restauration

    // Récupère l'URL de la configuration de la forme
    let formUrl = this.formSettings.form;
    let formConfig: any = null;

    // Charge le fichier JSON de configuration de manière synchrone
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

    if (!formConfig) {
      return null;
    }

    // Liste des variables de form pour lesquelles nous devons appliquer le nettoyage
    const formVariables = formConfig.bindings.map(
      (binding: any) => binding.variable
    );
    const queryVariables = this.jsonQuery.variables.map((v: any) => v.value);

    // Fonction pour nettoyer et ajuster les branches optionnelles
    const cleanAndAdjustBranches = (
      branches: any[],
      parentOptional: boolean = false
    ): any[] => {
      return branches.filter((branch: any) => {
        const formVariable = branch.line.o;
        const hasValues = branch.line.values && branch.line.values.length > 0;
        const isTargetVariable = formVariables.includes(formVariable);
        const existsInQuery = queryVariables.includes(formVariable);

        // Condition pour supprimer la branche
        if (isTargetVariable && !hasValues && !existsInQuery) {
          return false; // Supprime si c'est une variable cible sans valeurs et non dans les variables de query
        }

        // Ajuste le drapeau optional
        if (
          hasValues ||
          branch.children.some(
            (child: any) => child.line.values && child.line.values.length > 0
          )
        ) {
          branch.optional = false;
        } else {
          branch.optional = branch.optional || parentOptional;
        }

        // Traite récursivement les branches enfants
        if (branch.children && branch.children.length > 0) {
          branch.children = cleanAndAdjustBranches(
            branch.children,
            branch.optional
          );
        }

        return true;
      });
    };

    // Applique le nettoyage et l'ajustement des drapeaux
    copiedQuery.branches = cleanAndAdjustBranches(copiedQuery.branches);

    // Fonction pour restaurer les branches supprimées si elles reçoivent des valeurs
    const restoreBranches = (branches: any[], originalBranches: any[]) => {
      originalBranches.forEach((originalBranch: any) => {
        const formVariable = originalBranch.line.o;
        const existingBranch = branches.find(
          (b: any) => b.line.o === formVariable
        );

        if (!existingBranch && originalBranch.line.values?.length > 0) {
          // Si la branche originale a des valeurs et n'existe pas dans la copie nettoyée
          branches.push(JSON.parse(JSON.stringify(originalBranch)));
        } else if (existingBranch && originalBranch.children?.length > 0) {
          // Appel récursif pour les enfants
          restoreBranches(existingBranch.children, originalBranch.children);
        }
      });
    };

    // Restaure les branches si des valeurs sont ajoutées
    restoreBranches(copiedQuery.branches, originalQuery.branches);

    this.cleanQueryResult = copiedQuery; // Met à jour l'attribut cleanQuery global
    return copiedQuery;
  }
*/

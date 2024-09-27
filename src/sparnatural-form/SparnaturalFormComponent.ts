import { WidgetFactory } from "../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import HTMLComponent from "../sparnatural/components/HtmlComponent";
import { ISparJson } from "../sparnatural/generators/json/ISparJson";
import { I18n } from "../sparnatural/settings/I18n";
import ISparnaturalSpecification from "../sparnatural/spec-providers/ISparnaturalSpecification";
import ISpecificationEntity from "../sparnatural/spec-providers/ISpecificationEntity";
import SparnaturalSpecificationFactory from "../sparnatural/spec-providers/SparnaturalSpecificationFactory";
import { SparnaturalFormAttributes } from "../SparnaturalFormAttributes";
import ISettings from "./ISettings";
import { SparnaturalFormI18n } from "./SparnaturalFormI18n";
import { Form } from "./FormStructure";

class SparnaturalFormComponent extends HTMLComponent {
  // the content of all HTML element attributes
  formSettings: ISettings;
  // Sparnatural configuration
  specProvider: ISparnaturalSpecification;
  // The JSON query from the "query" attribute
  jsonQuery: ISparJson;

  constructor(attributes: SparnaturalFormAttributes) {
    // this is a root component : Does not have a ParentComponent!
    super("SparnaturalForm", null, null);

    this.formSettings = attributes;
    this.formSettings.customization = {};
  }

  render(): this {
    this.#initSparnaturalFormStaticLabels();
    this.#initSparnaturalStaticLabels();

    // Step 1: Initialize the specification provider
    this.initSpecificationProvider((sp: ISparnaturalSpecification) => {
      this.specProvider = sp;

      // Step 2: Initialize the JSON query
      this.initJsonQuery((query: ISparJson) => {
        console.log("Successfully read query in " + this.formSettings.query);

        // Step 3: Fetch the form configuration (form.json)
        let formUrl = this.formSettings.form;
        $.getJSON(formUrl, (formConfig) => {
          console.log("Form configuration loaded:", formConfig);

          // Step 4: Iterate through the form configuration (bindings)
          formConfig.bindings.forEach((binding: any) => {
            const variable = binding.variable;
            const fieldName =
              binding.node.name[this.formSettings.language] ||
              binding.node.name["en"];
            console.log(
              "Processing variable:",
              variable,
              "with name:",
              fieldName
            );
            // Step 5: Recursively search for the variable in the query
            const findInBranches = (branches: any[]): any => {
              for (const branch of branches) {
                if (branch.line.o === variable) {
                  return branch.line; // Found the match
                } else if (branch.children && branch.children.length > 0) {
                  const result = findInBranches(branch.children);
                  if (result) return result;
                }
              }
              return null;
            };

            const queryLine = findInBranches(query.branches);
            if (queryLine) {
              const subject = queryLine.sType;
              const predicate = queryLine.p;
              const object = queryLine.oType;
              console.log(
                "Found subject, predicate, object:",
                subject,
                predicate,
                object
              );

              // Step 6: Use the specProvider to get the type of the field
              let specEntity: ISpecificationEntity =
                this.specProvider.getEntity(subject);
              let connectingProperty = this.specProvider.getProperty(predicate);
              const propertyType = connectingProperty.getPropertyType(object); // Get the type of property (e.g., text, list, autocomplete)
              console.log("Field type determined:", propertyType);

              // Step 7: Create the widget for this field using WidgetFactory based on property type
              let wf: WidgetFactory = new WidgetFactory(
                this,
                this.specProvider,
                (
                  this.getRootComponent() as SparnaturalFormComponent
                ).formSettings,
                null
              );
              let theWidget = wf.buildWidget(
                propertyType,
                {
                  variable: queryLine.s,
                  type: specEntity.getId(),
                },
                {
                  variable: "predicate",
                  type: connectingProperty.getId(),
                },
                {
                  variable: queryLine.o,
                  type: object,
                }
              );

              // Step 8: Render the widget
              theWidget.render();
              console.log(
                "Rendered widget for variable: ",
                variable,
                "with type:",
                propertyType
              );
            } else {
              console.warn("No match found for variable: ", variable);
            }
          });
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
    if (this.formSettings.language === "fr") {
      SparnaturalFormI18n.init("fr");
    } else {
      SparnaturalFormI18n.init("en");
    }
  }

  /**
   * Initialize the static labels used to render the widgets from Sparnatural
   */
  #initSparnaturalStaticLabels() {
    if (this.formSettings.language === "fr") {
      I18n.init("fr");
    } else {
      I18n.init("en");
    }
  }
}
export default SparnaturalFormComponent;

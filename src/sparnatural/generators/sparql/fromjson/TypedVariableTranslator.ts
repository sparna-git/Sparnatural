import { DataFactory } from "rdf-data-factory";
import { Pattern, Triple } from "sparqljs";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "../SparqlFactory";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";
import { RDFS } from "../../../spec-providers/BaseRDFReader";
import { OWL } from "../../../spec-providers/owl/OWLSpecificationProvider";
const factory = new DataFactory();

/**
 * Converts a variable with a type into the corresponding SPARQL pattern. The variables and type
 * are either "s" and "sType" or "o" and "oType".
 * Also adds the patterns to fetch the default label for the variable, if necessary
 */
export default class TypedVariableTranslator {
  // The original variable name
  #variableName: string;
  // The URI of the type in the config
  #variableType: string;
  // whether the variable is selected or not
  #variableIsSelected: boolean;
  // the config
  #specProvider: ISparnaturalSpecification;

  // the default label var name
  public defaultLabelVarName;

  settings: any;

  // patterns built in the build process
  public resultPtrns: Pattern[] = [];
  // can consist of multiple patterns in case there is a FILTER(lang(?var) = "xx") if the property is multilingual
  public defaultLblPatterns: Pattern[] = [];
  // the rdf:type triple
  #typeTriple: Triple;
  // whether the property is blocking the generation of the type triple (but not the default label triples)
  #propertyIsBlocking: boolean;

  public executedAfterPtrns: Pattern[] = [];

  constructor(
    variableName: string,
    variableType: string,
    variableIsSelected: boolean,
    propertyIsBlocking: boolean,
    specProvider: ISparnaturalSpecification,
    settings: any
  ) {
    this.#variableName = variableName;
    this.#variableType = variableType;
    this.#propertyIsBlocking = propertyIsBlocking;
    this.#specProvider = specProvider;
    this.#variableIsSelected = variableIsSelected;

    // build default label var name
    this.defaultLabelVarName = this.#variableName + "_label";
    this.settings = settings;
  }

  build() {
    this.#buildTypeTriple();
    // generate default label patterns only if the variable is selected
    // and only in the case the default label property exists
    if (this.#variableIsSelected && this.hasDefaultLabel()) {
      this.#buildDefaultLblTrpl();
    }
    this.#createResultPtrns();
  }

  /**
   * Generates the triple of the type
   */
  #buildTypeTriple() {
    console.log("buildTypeTriple on "+this.#variableName);
    console.log("propertyIsBlocking "+this.#propertyIsBlocking);
    if(!this.#propertyIsBlocking) {
      // Ne construisez pas le triple si l'entité n'a pas de critère de type
      if (this.#specProvider.getEntity(this.#variableType).hasTypeCriteria()) {
        let typePredicate;
        if (this.settings.typePredicate) {
          typePredicate = SparqlFactory.parsePropertyPath(
            this.settings.typePredicate
          );
        } else {
          typePredicate = factory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
          );
        }

        // Ne pas ajouter le type si la portée est RDFS.Resource ou OWL.Thing
        if (
          this.#variableType !== RDFS.RESOURCE.value &&
          this.#variableType !== OWL.THING.value
        ) {
          this.#typeTriple = SparqlFactory.buildTypeTriple(
            factory.variable(this.#variableName),
            typePredicate,
            factory.namedNode(this.#variableType)
          );
          //console.log(`Added type triple for ${this.#variableName}`);
        } else {
          console.warn(
            `Skipped adding type triple for ${
              this.#variableName
            } as it is RDFS.Resource or OWL.Thing`
          );
        }
      }
    }
  }

  #buildDefaultLblTrpl() {
    let defaultLabelProp: ISpecificationProperty =
      this.getDefaultLabelProperty();

    if (defaultLabelProp.isMultilingual()) {
      // default label property is multilingual
      // try to match it against the lang and defaultLang parameters of Sparnatural

      if (this.settings.language == this.settings.defaultLanguage) {
        // lang and defaultLang are the same
        // try to match with an equality on the language

        // ?Person_1 foaf:name ?Person_1_label
        this.defaultLblPatterns.push(
          SparqlFactory.buildBgpPattern([
            SparqlFactory.buildTriple(
              factory.variable(this.#variableName),
              factory.namedNode(defaultLabelProp.getId()),
              factory.variable(this.defaultLabelVarName)
            ),
          ])
        );
        // FILTER(?Person_1_label = "fr")
        this.defaultLblPatterns.push(
          SparqlFactory.buildFilterLangEquals(
            factory.variable(this.defaultLabelVarName),
            factory.literal(this.settings.language)
          )
        );
      } else {
        // the user langauge and default data language are different
        // use a pattern OPTIONAL {...} OPTIONAL {...} BIND(COALESCE(?x1,?x2) AS ?x)

        // OPTIONAL { ?Person_1 foaf:name ?Person_1_label_lang . FILTER(?Person_1_label_lang = "fr")}
        this.defaultLblPatterns.push(
          SparqlFactory.buildOptionalPattern([
            SparqlFactory.buildBgpPattern([
              SparqlFactory.buildTriple(
                factory.variable(this.#variableName),
                factory.namedNode(defaultLabelProp.getId()),
                factory.variable(this.defaultLabelVarName + "_lang")
              ),
            ]),
            SparqlFactory.buildFilterLangEquals(
              factory.variable(this.defaultLabelVarName + "_lang"),
              factory.literal(this.settings.language)
            ),
          ])
        );

        // OPTIONAL { ?Person_1 foaf:name ?Person_1_label_defaultLang . FILTER(?Person_1_label_defaultLang = "en")}
        this.defaultLblPatterns.push(
          SparqlFactory.buildOptionalPattern([
            SparqlFactory.buildBgpPattern([
              SparqlFactory.buildTriple(
                factory.variable(this.#variableName),
                factory.namedNode(defaultLabelProp.getId()),
                factory.variable(this.defaultLabelVarName + "_defaultLang")
              ),
            ]),
            SparqlFactory.buildFilterLangEquals(
              factory.variable(this.defaultLabelVarName + "_defaultLang"),
              factory.literal(this.settings.defaultLanguage)
            ),
          ])
        );

        // BIND(COALESCE(?Person_1_label,?Person_1_defaultLabel) AS ?Person_1_label)
        this.defaultLblPatterns.push(
          SparqlFactory.buildBindCoalescePattern(
            factory.variable(this.defaultLabelVarName + "_lang"),
            factory.variable(this.defaultLabelVarName + "_defaultLang"),
            factory.variable(this.defaultLabelVarName)
          )
        );
      }
    } else {
      // default label property is not multilingual
      // simply fetch it

      // ?Person_1 foaf:name ?Person_1_label
      this.defaultLblPatterns.push(
        SparqlFactory.buildBgpPattern([
          SparqlFactory.buildTriple(
            factory.variable(this.#variableName),
            factory.namedNode(defaultLabelProp.getId()),
            factory.variable(this.defaultLabelVarName)
          ),
        ])
      );
    }
  }

  #createResultPtrns() {
    // push the type triple first
    if (this.#typeTriple) {
      this.resultPtrns.push(SparqlFactory.buildBgpPattern([this.#typeTriple]));
    }

    if (this.defaultLblPatterns.length > 0) {
      if (
        this.getDefaultLabelProperty().isEnablingOptional() &&
        // don't put in optional if we are already doing an "OPTIONAL {...} OPTIONAL{...} BIND(COALESCE(...))" pattern
        !(this.settings.defaultLanguage != this.settings.language)
      ) {
        // in that case, we push an OPTIONAL { ... } pattern
        this.resultPtrns.push(
          SparqlFactory.buildOptionalPattern(this.defaultLblPatterns)
        );
      } else {
        // simply push the default label patterns
        this.resultPtrns.push(...this.defaultLblPatterns);
      }
    }
  }

  /**
   * @returns true in the case the current type has a default label property
   */
  hasDefaultLabel(): boolean {
    let defaultLabelProperty = this.#specProvider
      .getEntity(this.#variableType)
      ?.getDefaultLabelProperty();
    return defaultLabelProperty ? true : false;
  }

  /**
   * @returns The default label property from the configuration
   */
  getDefaultLabelProperty(): ISpecificationProperty {
    let defaultLabelProperty = this.#specProvider
      .getEntity(this.#variableType)
      ?.getDefaultLabelProperty();
    return this.#specProvider.getProperty(defaultLabelProperty);
  }
}

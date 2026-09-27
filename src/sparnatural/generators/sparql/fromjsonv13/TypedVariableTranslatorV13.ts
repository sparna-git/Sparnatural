import { Pattern, TripleNesting } from "@traqula/rules-sparql-1-1";
import SparqlFactoryV13 from "./SparqlFactoryV13";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";
import { Model, NodeShape, OWL, PropertyShape, RDFS } from "rdf-shacl-commons";
import { SHACLSpecificationEntity } from "../../../spec-providers/shacl/SHACLSpecificationEntity";
import BranchTranslatorV13 from "./BranchTranslatorV13";
import { PredicateObjectPair, SelectVariable, TermTypedVariable } from "../../../SparnaturalQueryIfc-v13";
import { JsonV13SparqlTranslator } from "./JsonV13SparqlTranslator";
import { SHACLSpecificationProperty } from "../../../spec-providers/shacl/SHACLSpecificationProperty";
import { SparnaturalQueryUtils } from "./SparnaturalQueryUtils";

/**
 * Converts a variable with a type into the corresponding SPARQL pattern. The variables and type
 * are either "s" and "sType" or "o" and "oType".
 * Also adds the patterns to fetch the default label for the variable, if necessary
 */
export default class TypedVariableTranslatorV13 {
  // The original variable name
  #variableName: string;
  // The URI of the type in the config
  #variableType: string;
  // whether to include default label patterns or not (only if the variable is selected)
  #includeDefaultLabel: boolean;
  // the full translator
  #translator: JsonV13SparqlTranslator;



  // the default label var name computed by this class
  public defaultLabelVarName: string;
  // patterns built in the build process
  public resultPtrns: Pattern[] = [];
  // can consist of multiple patterns in case there is a FILTER(lang(?var) = "xx") if the property is multilingual
  public defaultLblPatterns: Pattern[] = [];
  // the rdf:type triple
  #typeTriple: TripleNesting;
  // whether the property is blocking the generation of the type triple (but not the default label triples)
  #propertyIsBlocking: boolean;


  constructor(
    variableName: string,
    variableType: string,
    includeDefaultLabel: boolean,
    propertyIsBlocking: boolean,
    translator: JsonV13SparqlTranslator,
  ) {
    this.#variableName = variableName;
    this.#variableType = variableType;
    this.#propertyIsBlocking = propertyIsBlocking;
    this.#translator = translator;
    this.#includeDefaultLabel = includeDefaultLabel;

    // build default label var name
    this.defaultLabelVarName = this.#variableName + "_label";
  }

  build() {
    this.#buildTypeTriple();

    if (this.#includeDefaultLabel && this.hasDefaultLabel()) {
      this.#buildDefaultLblTrpl();
    }

    this.#createResultPtrns();
  }

  /**
   * Generates the triple of the type
   */
  #buildTypeTriple() {
    if (!this.#propertyIsBlocking) {
      // Ne construisez pas le triple si l'entité n'a pas de critère de type
      if (this.#translator.specProvider.getEntity(this.#variableType).hasTypeCriteria()) {
        let typePredicate;
        if (this.#translator.settings.typePredicate) {
          typePredicate = SparqlFactoryV13.parsePropertyPath(
            this.#translator.settings.typePredicate,
          );
        } else {
          typePredicate = SparqlFactoryV13.buildNamedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          );
        }

        // Ne pas ajouter le type si la portée est RDFS.Resource ou OWL.Thing
        if (
          this.#variableType !== RDFS.RESOURCE.value &&
          this.#variableType !== OWL.THING.value
        ) {
          this.#typeTriple = SparqlFactoryV13.buildTypeTriple(
            SparqlFactoryV13.buildVariable(this.#variableName),
            typePredicate,
            SparqlFactoryV13.buildNamedNode(this.#variableType),
          );
          //console.log(`Added type triple for ${this.#variableName}`);
        } else {
          console.warn(
            `Skipped adding type triple for ${
              this.#variableName
            } as it is RDFS.Resource or OWL.Thing`,
          );
        }
      }
    }
  }

  #buildDefaultLblTrpl() {
    let defaultLabelProp: ISpecificationProperty =
      this.getDefaultLabelProperty();

      
      console.log("Default label property for variable " + this.#variableName + " : ", defaultLabelProp);
      console.log(this.#variableType);

    if (defaultLabelProp.isMultilingual()) {
      // default label property is multilingual
      // try to match it against the lang and defaultLang parameters of Sparnatural

      if (this.#translator.settings.language == this.#translator.settings.defaultLanguage) {
        // lang and defaultLang are the same
        // try to match with an equality on the language

        // ?Person_1 foaf:name ?Person_1_label
        this.defaultLblPatterns.push(
          SparqlFactoryV13.buildBgpPattern([
            SparqlFactoryV13.buildTriple(
              SparqlFactoryV13.buildVariable(this.#variableName),
              SparqlFactoryV13.buildNamedNode(defaultLabelProp.getId()),
              SparqlFactoryV13.buildVariable(this.defaultLabelVarName),
            ),
          ]),
        );
        // FILTER(?Person_1_label = "fr")
        this.defaultLblPatterns.push(
          SparqlFactoryV13.buildFilterLangEquals(
            SparqlFactoryV13.buildVariable(this.defaultLabelVarName),
            SparqlFactoryV13.buildLiteral(this.#translator.settings.language),
          ),
        );
      } else {
        // the user langauge and default data language are different
        // use a pattern OPTIONAL {...} OPTIONAL {...} BIND(COALESCE(?x1,?x2) AS ?x)

        // OPTIONAL { ?Person_1 foaf:name ?Person_1_label_lang . FILTER(?Person_1_label_lang = "fr")}
        this.defaultLblPatterns.push(
          SparqlFactoryV13.buildOptionalPattern([
            SparqlFactoryV13.buildBgpPattern([
              SparqlFactoryV13.buildTriple(
                SparqlFactoryV13.buildVariable(this.#variableName),
                SparqlFactoryV13.buildNamedNode(defaultLabelProp.getId()),
                SparqlFactoryV13.buildVariable(this.defaultLabelVarName + "_lang"),
              ),
            ]),
            SparqlFactoryV13.buildFilterLangEquals(
              SparqlFactoryV13.buildVariable(this.defaultLabelVarName + "_lang"),
              SparqlFactoryV13.buildLiteral(this.#translator.settings.language),
            ),
          ]),
        );

        // OPTIONAL { ?Person_1 foaf:name ?Person_1_label_defaultLang . FILTER(?Person_1_label_defaultLang = "en")}
        this.defaultLblPatterns.push(
          SparqlFactoryV13.buildOptionalPattern([
            SparqlFactoryV13.buildBgpPattern([
              SparqlFactoryV13.buildTriple(
                SparqlFactoryV13.buildVariable(this.#variableName),
                SparqlFactoryV13.buildNamedNode(defaultLabelProp.getId()),
                SparqlFactoryV13.buildVariable(this.defaultLabelVarName + "_defaultLang"),
              ),
            ]),
            SparqlFactoryV13.buildFilterLangEquals(
              SparqlFactoryV13.buildVariable(this.defaultLabelVarName + "_defaultLang"),
              SparqlFactoryV13.buildLiteral(this.#translator.settings.defaultLanguage),
            ),
          ]),
        );

        // BIND(COALESCE(?Person_1_label,?Person_1_defaultLabel) AS ?Person_1_label)
        this.defaultLblPatterns.push(
          SparqlFactoryV13.buildBindCoalescePattern(
            SparqlFactoryV13.buildVariable(this.defaultLabelVarName + "_lang"),
            SparqlFactoryV13.buildVariable(this.defaultLabelVarName + "_defaultLang"),
            SparqlFactoryV13.buildVariable(this.defaultLabelVarName),
          ),
        );
      }
    } else {
      // default label property is not multilingual
      // simply fetch it

      // ?Person_1 foaf:name ?Person_1_label
      this.defaultLblPatterns.push(
        SparqlFactoryV13.buildBgpPattern([
          SparqlFactoryV13.buildTriple(
            SparqlFactoryV13.buildVariable(this.#variableName),
            SparqlFactoryV13.buildNamedNode(defaultLabelProp.getId()),
            SparqlFactoryV13.buildVariable(this.defaultLabelVarName),
          ),
        ]),
      );
    }
  }

  #createResultPtrns() {
    // push the type triple first
    if (this.#typeTriple) {
      this.resultPtrns.push(SparqlFactoryV13.buildBgpPattern([this.#typeTriple]));
    }

    if (this.defaultLblPatterns.length > 0) {
      if (
        this.getDefaultLabelProperty().isEnablingOptional() &&
        // don't put in optional if we are already doing an "OPTIONAL {...} OPTIONAL{...} BIND(COALESCE(...))" pattern
        !(this.#translator.settings.defaultLanguage != this.#translator.settings.language)
      ) {
        // in that case, we push an OPTIONAL { ... } pattern
        this.resultPtrns.push(
          SparqlFactoryV13.buildOptionalPattern(this.defaultLblPatterns),
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
    let defaultLabelProperty = this.#translator.specProvider
      .getEntity(this.#variableType)
      ?.getDefaultLabelProperty();
    return defaultLabelProperty ? true : false;
  }

  /**
   * @returns The default label property from the configuration
   */
  getDefaultLabelProperty(): ISpecificationProperty {
    let defaultLabelProperty = this.#translator.specProvider
      .getEntity(this.#variableType)
      ?.getDefaultLabelProperty();
    return this.#translator.specProvider.getProperty(defaultLabelProperty);
  }
}

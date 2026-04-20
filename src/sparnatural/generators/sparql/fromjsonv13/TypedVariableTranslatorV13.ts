import { DataFactory, NamedNode } from "rdf-data-factory";
import { Pattern, Triple, VariableExpression, VariableTerm } from "sparqljs";
import SparqlFactory from "../SparqlFactory";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";
import { Model, NodeShape, OWL, PropertyShape, RDFS } from "rdf-shacl-commons";
import { SHACLSpecificationEntity } from "../../../spec-providers/shacl/SHACLSpecificationEntity";
import BranchTranslatorV13 from "./BranchTranslatorV13";
import { PredicateObjectPair, SelectVariable, TermTypedVariable } from "../../../SparnaturalQueryIfc-v13";
import { JsonV13SparqlTranslator } from "./JsonV13SparqlTranslator";
import { SHACLSpecificationProperty } from "../../../spec-providers/shacl/SHACLSpecificationProperty";

const factory = new DataFactory();

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
  // whether the variable is selected or not
  #variableIsSelected: boolean;
  // extra property roles
  #withExtraPropertyRoles: string[];
  // the full translator
  #translator: JsonV13SparqlTranslator;



  // the default label var name computed by this class
  public defaultLabelVarName: string;
  // patterns built in the build process
  public resultPtrns: Pattern[] = [];
  // can consist of multiple patterns in case there is a FILTER(lang(?var) = "xx") if the property is multilingual
  public defaultLblPatterns: Pattern[] = [];
  // the rdf:type triple
  #typeTriple: Triple;
  // whether the property is blocking the generation of the type triple (but not the default label triples)
  #propertyIsBlocking: boolean;

  public extraPropertiesPatterns: Pattern[] = [];
  public extraPropertiesVars: (VariableExpression | VariableTerm)[] = [];

  constructor(
    variableName: string,
    variableType: string,
    variableIsSelected: boolean,
    withExtraPropertyRoles: string[],
    propertyIsBlocking: boolean,
    translator: JsonV13SparqlTranslator,
  ) {
    this.#variableName = variableName;
    this.#variableType = variableType;
    this.#propertyIsBlocking = propertyIsBlocking;
    this.#translator = translator;
    this.#variableIsSelected = variableIsSelected;
    this.#withExtraPropertyRoles = withExtraPropertyRoles;

    // build default label var name
    this.defaultLabelVarName = this.#variableName + "_label";
  }

  build() {
    this.#buildTypeTriple();

    if (this.#variableIsSelected && this.hasDefaultLabel()) {
      this.#buildDefaultLblTrpl();
    }
    if (this.#variableIsSelected && this.#withExtraPropertyRoles && this.#withExtraPropertyRoles.length > 0) {
      this.#buildExtraPropertiesPtrns();
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
          typePredicate = SparqlFactory.parsePropertyPath(
            this.#translator.settings.typePredicate,
          );
        } else {
          typePredicate = factory.namedNode(
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
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
            factory.namedNode(this.#variableType),
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

    if (defaultLabelProp.isMultilingual()) {
      // default label property is multilingual
      // try to match it against the lang and defaultLang parameters of Sparnatural

      if (this.#translator.settings.language == this.#translator.settings.defaultLanguage) {
        // lang and defaultLang are the same
        // try to match with an equality on the language

        // ?Person_1 foaf:name ?Person_1_label
        this.defaultLblPatterns.push(
          SparqlFactory.buildBgpPattern([
            SparqlFactory.buildTriple(
              factory.variable(this.#variableName),
              factory.namedNode(defaultLabelProp.getId()),
              factory.variable(this.defaultLabelVarName),
            ),
          ]),
        );
        // FILTER(?Person_1_label = "fr")
        this.defaultLblPatterns.push(
          SparqlFactory.buildFilterLangEquals(
            factory.variable(this.defaultLabelVarName),
            factory.literal(this.#translator.settings.language),
          ),
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
                factory.variable(this.defaultLabelVarName + "_lang"),
              ),
            ]),
            SparqlFactory.buildFilterLangEquals(
              factory.variable(this.defaultLabelVarName + "_lang"),
              factory.literal(this.#translator.settings.language),
            ),
          ]),
        );

        // OPTIONAL { ?Person_1 foaf:name ?Person_1_label_defaultLang . FILTER(?Person_1_label_defaultLang = "en")}
        this.defaultLblPatterns.push(
          SparqlFactory.buildOptionalPattern([
            SparqlFactory.buildBgpPattern([
              SparqlFactory.buildTriple(
                factory.variable(this.#variableName),
                factory.namedNode(defaultLabelProp.getId()),
                factory.variable(this.defaultLabelVarName + "_defaultLang"),
              ),
            ]),
            SparqlFactory.buildFilterLangEquals(
              factory.variable(this.defaultLabelVarName + "_defaultLang"),
              factory.literal(this.#translator.settings.defaultLanguage),
            ),
          ]),
        );

        // BIND(COALESCE(?Person_1_label,?Person_1_defaultLabel) AS ?Person_1_label)
        this.defaultLblPatterns.push(
          SparqlFactory.buildBindCoalescePattern(
            factory.variable(this.defaultLabelVarName + "_lang"),
            factory.variable(this.defaultLabelVarName + "_defaultLang"),
            factory.variable(this.defaultLabelVarName),
          ),
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
            factory.variable(this.defaultLabelVarName),
          ),
        ]),
      );
    }
  }

  #buildExtraPropertiesPtrns() {
    if(this.#withExtraPropertyRoles && this.#withExtraPropertyRoles.length > 0) {
      // first read the entity
      let e = this.#translator.specProvider.getEntity(this.#variableType);
      if(!(e instanceof SHACLSpecificationEntity)) return;
      let entity = e as SHACLSpecificationEntity;

      this.#withExtraPropertyRoles.forEach((propertyRole) => {
        // retrieve the properties with the given role
        let properties = (entity.shape as NodeShape).findPropertyShapesByDashPropertyRole(factory.namedNode(propertyRole));
        properties.forEach((property) => {

          let branchAndVar = this.#buildVirtualBranchAndSelectedVarForProperty(property); 

          let subjectTerm : TermTypedVariable = {
            type: "term",
            subType: "variable",
            value: this.#variableName,
            rdfType: this.#variableType
          };

          let branchTranslator = new BranchTranslatorV13(      
            branchAndVar.branch,
            subjectTerm,
            false, // isVeryFirst set to false
            false, // isInOption forced to false
            this.#translator
          );
          branchTranslator.build();
          this.extraPropertiesPatterns.push(...branchTranslator.getResultPtrns());
          this.extraPropertiesVars.push(branchAndVar.variable);
        });
      });
    }
  }

  #buildVirtualBranchAndSelectedVarForProperty(property: PropertyShape)
  : { branch: PredicateObjectPair, variable: VariableExpression | VariableTerm } {

    // generate a new variable name. Ideal is to use the range name, just as in Sparnatural
    // but we default to other options if we cannot
    let variableName;
    if(property.getRangeShapes().length == 1) {
      // single range, use the type of the range shape for the variable
      variableName = this.#translator.generateNewVariableName(property.getRangeShapes()[0].resource.value);
    } else if(property.getShPath().termType == "NamedNode") {
      // multiple ranges, but a simple property path, use the property name for the variable
      variableName = this.#variableName + "_" + Model.getSparqlVariableNameFromUri(property.getShPath().value);
    } else {
      variableName = this.#variableName + "_" + Model.getSparqlVariableNameFromUri(property.resource.value);
    }

    // either there is a single range and we use it, but we cannot set it if there are multiple ranges
    let range = property.getRangeShapes().length > 0 ? property.getRangeShapes()[0].resource.value : undefined;
    
    let variableTerm: TermTypedVariable = {
      type: "term",
      subType: "variable",
      value: variableName,
      rdfType: range
    };

    // 1. Build base virtual criteria
    let pair:PredicateObjectPair = {
      type: "predicateObjectPair",
      predicate: {
        type: "term",
        subType: "namedNode",
        value: property.resource.value
      },
      object: {
        type: "objectCriteria",
        variable: variableTerm,
      }
    };

    // 2. set subType to "optional" if the property is not mandatory according to SHACL shapes
    let specProperty = this.#translator.specProvider.getProperty(property.resource.value) as SHACLSpecificationProperty;
    if(
      specProperty
      && (
        // either no sh:minCount is defined, or sh:minCount is 0
        !(specProperty.shape as PropertyShape).getShMinCount()
        ||
        (specProperty.shape as PropertyShape).getShMinCount() === 0) 
    ) {
      pair.subType = "optional";
    }

    // 3. aggregate the variable if the property can be repeated according to SHACL shapes (maxCount > 1 or qualifiedMaxCount > 1 or no maxCount at all)
    let finalSelectedVar: VariableExpression | VariableTerm = factory.variable(variableName);
    if(
      specProperty
      && (
        // sh:maxCount is anything but 1
        (specProperty.shape as PropertyShape).getShMaxCount() !== 1
        ||
        // sh:qualifiedMaxCount is anything but 1
        (specProperty.shape as PropertyShape).getShQualifiedMaxCount() !== 1
      )
    ) {
      finalSelectedVar = SparqlFactory.buildAggregateFunctionExpression(
        "GROUP_CONCAT",
        factory.variable(variableName),
        factory.variable(variableName+"_concat"),
      );
    }
    
    return {
      branch: pair,
      variable: finalSelectedVar
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
        !(this.#translator.settings.defaultLanguage != this.#translator.settings.language)
      ) {
        // in that case, we push an OPTIONAL { ... } pattern
        this.resultPtrns.push(
          SparqlFactory.buildOptionalPattern(this.defaultLblPatterns),
        );
      } else {
        // simply push the default label patterns
        this.resultPtrns.push(...this.defaultLblPatterns);
      }
    }

    // also concat extra properties patterns if any
    if(this.extraPropertiesPatterns.length > 0) {
      this.resultPtrns.push(...this.extraPropertiesPatterns);
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

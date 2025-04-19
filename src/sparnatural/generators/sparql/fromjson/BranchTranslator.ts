import { DataFactory } from "rdf-data-factory";
import { Pattern, Variable } from "sparqljs";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "../SparqlFactory";
import ValueBuilderIfc, { ValueBuilderFactory } from "../ValueBuilder";
import {
  Branch,
  ISparJson,
  VariableExpression,
  VariableTerm,
} from "../../../ISparJson";
import TypedVariableTranslator from "./TypedVariableTranslator";

const factory = new DataFactory();

/**
 * Translates a Branch JSON structure into SparqlJs structure
 */
export default class BranchTranslator {
  // The JSON branch to convert to SPARQL
  #branch: Branch;
  // The full query from which the branch is extracted
  #fullQuery: ISparJson;
  #specProvider: ISparnaturalSpecification;
  // whether this branch is a children of another branch
  #isVeryFirst: boolean;
  #isInOption: boolean;

  // to translate widget values to SPARQL
  #valueBuilder: ValueBuilderIfc;

  // intermediate patterns
  #startClassPtrn: Pattern[] = [];
  #endClassPtrn: Pattern[] = [];
  #intersectionPtrn: Pattern[] = [];
  #whereChildPtrns: Pattern[] = [];
  #valuePtrns: Pattern[] = [];
  #executedAfterPtrns: Pattern[] = [];

  // final result
  #resultPtrns: Pattern[] = [];

  // default vars gathered from children
  #defaultVars: Variable[] = [];
  settings: any;

  constructor(
    // the branch to convert
    branch: Branch,
    // the full query (we need it to test if variables are selected)
    fullQuery: ISparJson,
    // the sparnatural spec
    specProvider: ISparnaturalSpecification,
    // true if this branch is the very first of the query (not a child of another, not a sibling of the first one)
    isVeryFirst: boolean,
    // true if this branch is under (recursively) of another that is itself in an option
    isInOption: boolean,
    settings: any
  ) {
    this.#branch = branch;
    this.#fullQuery = fullQuery;
    this.#specProvider = specProvider;
    this.#isVeryFirst = isVeryFirst;
    this.#isInOption = isInOption;
    this.settings = settings;

    // create the object to convert widget values to SPARQL
    let endClassValue = this.#branch.line.oType;
    // this is because the query generation may be triggered while the end class is not there yet
    if (endClassValue != null) {
      this.#valueBuilder = new ValueBuilderFactory().buildValueBuilder(
        this.#specProvider
          .getProperty(this.#branch.line.p)
          .getPropertyType(endClassValue)
      );
      // pass everything needed to generate SPARQL
      this.#valueBuilder.init(
        this.#specProvider,
        { variable: this.#branch.line.s, type: this.#branch.line.sType },
        { variable: null, type: this.#branch.line.p },
        { variable: this.#branch.line.o, type: this.#branch.line.oType },
        BranchTranslator.isVarSelected(fullQuery, this.#branch.line.o),
        this.#branch.line.values
      );
    }
  }

  build() {
    this.#buildChildrenPatterns();
    this.#buildSubjectClassPtrn();
    this.#buildIntersectionPtrn();
    this.#buildObjectClassPtrn();
    this.#buildValuePtrn();

    this.#buildFinalResultPtrn();
  }

  //!
  //!
  //!
  //!
  //!
  //!
  //verifier cette partie la pour la generation des childrens
  /**
   * Converts all children branches, and gather their patterns at this level
   */
  #buildChildrenPatterns() {
    this.#branch.children.forEach((branch) => {
      const builder = new BranchTranslator(
        branch,
        this.#fullQuery,
        this.#specProvider,
        // children are never the very first
        false,
        // children branch will be in option if this one is optional or not exists
        this.#branch.optional || this.#branch.notExists,
        this.settings
      );
      builder.build();
      this.#whereChildPtrns.push(...builder.getResultPtrns());
      // gather default vars from children
      this.#defaultVars.push(...builder.getDefaultVars());
      // gather patterns to be executed after
      this.#executedAfterPtrns.push(...builder.getExecutedAfterPtrns());
    });
  }

  #buildValuePtrn() {
    if (this.#branch.line.values?.length > 0) {
      this.#valuePtrns = this.#valueBuilder.build();
    }
  }

  /**
   * Generates the triple of the type of subject ("s" and "sType" in the branch JSON structure)
   */
  #buildSubjectClassPtrn() {
    let typeTranslator: TypedVariableTranslator = new TypedVariableTranslator(
      this.#branch.line.s,
      this.#branch.line.sType,
      // Note : on subject position, the only variable that can be selected is the very first one
      // Otherwise it can be selected in the object position, but not inside a WHERE clause
      // Anyway if it not the very first, all the startClassPtrn is ignored when building the final query
      BranchTranslator.isVarSelected(this.#fullQuery, this.#branch.line.s) && this.#isVeryFirst,
      this.#valueBuilder?.isBlockingStart(),
      this.#specProvider,
      this.settings
    );
    typeTranslator.build();
    this.#startClassPtrn = typeTranslator.resultPtrns;
    // if there was any default label patterns generated, gather the variable names of the default label
    if (typeTranslator.defaultLblPatterns.length > 0) {
      this.#defaultVars.push(
        factory.variable(typeTranslator.defaultLabelVarName)
      );
    }
  }

  #buildObjectClassPtrn() {
    let typeTranslator: TypedVariableTranslator = new TypedVariableTranslator(
      this.#branch.line.o,
      this.#branch.line.oType,
      BranchTranslator.isVarSelected(this.#fullQuery, this.#branch.line.o),
      this.#valueBuilder?.isBlockingEnd(),
      this.#specProvider,
      this.settings
    );
    typeTranslator.build();

    this.#endClassPtrn = typeTranslator.resultPtrns;
    if (typeTranslator.defaultLblPatterns.length > 0) {
      this.#defaultVars.push(
        factory.variable(typeTranslator.defaultLabelVarName)
      );
    }
  }
  #buildIntersectionPtrn() {
    // Vérification des conditions de génération de l'intersection triple
    if (
      this.#branch.line.s &&
      this.#branch.line.o &&
      !this.#valueBuilder?.isBlockingObjectProp()
    ) {
      const specProperty = this.#specProvider.getProperty(this.#branch.line.p);

      if (
        specProperty.getBeginDateProperty() &&
        specProperty.getEndDateProperty()
      ) {
        // Génération des triples pour les dates de début, de fin et exactes, si disponibles
        if (specProperty.getBeginDateProperty()) {
          this.#intersectionPtrn.push(
            SparqlFactory.buildOptionalPattern([
              SparqlFactory.buildBgpPattern([
                SparqlFactory.buildIntersectionTriple(
                  factory.variable(this.#branch.line.s),
                  specProperty.getBeginDateProperty(),
                  factory.variable(`${this.#branch.line.o}_begin`)
                ),
              ]),
            ])
          );
        }

        if (specProperty.getEndDateProperty()) {
          this.#intersectionPtrn.push(
            SparqlFactory.buildOptionalPattern([
              SparqlFactory.buildBgpPattern([
                SparqlFactory.buildIntersectionTriple(
                  factory.variable(this.#branch.line.s),
                  specProperty.getEndDateProperty(),
                  factory.variable(`${this.#branch.line.o}_end`)
                ),
              ]),
            ])
          );
        }

        if (specProperty.getExactDateProperty()) {
          this.#intersectionPtrn.push(
            SparqlFactory.buildOptionalPattern([
              SparqlFactory.buildBgpPattern([
                SparqlFactory.buildIntersectionTriple(
                  factory.variable(this.#branch.line.s),
                  specProperty.getExactDateProperty(),
                  factory.variable(`${this.#branch.line.o}_exact`)
                ),
              ]),
            ])
          );
        }
      } else {
        // Génération du triple d'intersection normal si aucune propriété de date n'est spécifiée
        this.#intersectionPtrn.push(
          SparqlFactory.buildBgpPattern([
            SparqlFactory.buildIntersectionTriple(
              factory.variable(this.#branch.line.s),
              this.#branch.line.p,
              factory.variable(this.#branch.line.o)
            ),
          ])
        );
      }

      // Ajout du filtre de langue si la propriété est multilingue
      if (specProperty.isMultilingual()) {
        this.#intersectionPtrn.push(
          SparqlFactory.buildFilterLangEquals(
            factory.variable(this.#branch.line.o),
            factory.literal(this.settings.language)
          )
        );
      }
    }
  }

  //-----------------------------------------------------------
  //old version
  #buildIntersectionPtrn1() {
    // the intersection triple can very well be generated even if no rdf:type triple is generated for the end class.
    if (
      this.#branch.line.s &&
      this.#branch.line.o &&
      !this.#valueBuilder?.isBlockingObjectProp()
    ) {
      this.#intersectionPtrn.push(
        SparqlFactory.buildBgpPattern([
          SparqlFactory.buildIntersectionTriple(
            factory.variable(this.#branch.line.s),
            this.#branch.line.p,
            factory.variable(this.#branch.line.o)
          ),
        ])
      );

      // add language filter if property is set to be multilingual
      if (
        this.#specProvider.getProperty(this.#branch.line.p).isMultilingual()
      ) {
        this.#intersectionPtrn.push(
          SparqlFactory.buildFilterLangEquals(
            factory.variable(this.#branch.line.o),
            factory.literal(this.settings.language)
          )
        );
      }
    }
  }

  //-----------------------------------------------------------

  /**
   * Translates the line to SPARQL
   */
  #buildFinalResultPtrn() {
    // always store the startClassPattern in the final result pattern (no OPTIONAL, no NOT EXISTS, no SERVICE)
    // the subject type criteria is generated only for the first criteria,
    // not if it is inside a WHERE or an AND
    if (this.#isVeryFirst) this.#resultPtrns.push(...this.#startClassPtrn);

    // concat all the patterns together, except the start pattern which is handled differntly
    let exceptStartPtrn: Pattern[] = [];
    if (this.#intersectionPtrn) {
      exceptStartPtrn.push(...this.#intersectionPtrn);
    }

    if (
      this.#branch.line.o &&
      !this.#specProvider
        .getEntity(this.#branch.line.oType)
        .isLiteralEntity() &&
      !this.#specProvider.getProperty(this.#branch.line.p).omitClassCriteria()
    ) {
      exceptStartPtrn.push(...this.#endClassPtrn);
    }
    exceptStartPtrn.push(...this.#valuePtrns);
    exceptStartPtrn.push(...this.#whereChildPtrns);

    // this will wrap everything except start inside the OPTIONAL or NOT EXISTS
    this.#createOptionStatePtrn(exceptStartPtrn);
  }

  #createOptionStatePtrn(exceptStartPtrn: Pattern[]) {
    // create a SERVICE clause if needed
    const sparqlService = this.#specProvider
      .getProperty(this.#branch.line.p)
      ?.getServiceEndpoint();
    let servicePtrn = null;
    if (sparqlService) {
      const endpoint = factory.namedNode(sparqlService);
      // to be on the safe side : when rollback an endclass group, we may come here with only the start class group criteria
      // and nothing in this array
      if (exceptStartPtrn.length > 0) {
        servicePtrn = SparqlFactory.buildServicePattern(
          exceptStartPtrn,
          endpoint
        );
      }
    }

    let normalOrServicePatterns: Pattern[] = servicePtrn
      ? [servicePtrn]
      : exceptStartPtrn;

    // produce the generated patterns, maybe wrapped in OPTIONAL or NOT EXISTS
    let finalResultPtrns: Pattern[] = [];
    // if this branch is optional and is not inside an optional branch
    if (this.#branch.optional && !this.#isInOption) {
      finalResultPtrns.push(
        SparqlFactory.buildOptionalPattern(normalOrServicePatterns)
      );
    } else if (this.#branch.notExists && !this.#isInOption) {
      finalResultPtrns.push(
        SparqlFactory.buildNotExistsPattern(
          SparqlFactory.buildGroupPattern(normalOrServicePatterns)
        )
      );
    } else {
      // nothing special, just retain the patterns in the final result pattern
      finalResultPtrns.push(...normalOrServicePatterns);
    }

    // then decide where to store the generated patterns : either in "normal" patterns
    // or in patterns that shall be executed after the rest of the query
    if (
      servicePtrn &&
      this.#specProvider
        .getProperty(this.#branch.line.p)
        ?.isLogicallyExecutedAfter()
    ) {
      this.#executedAfterPtrns.push(...finalResultPtrns);
    } else {
      this.#resultPtrns.push(...finalResultPtrns);
    }
  }

  /**
   * @param query The query to test
   * @param varName The variable to test the selection for
   * @returns true if the varName is selected in the query
   */
  static isVarSelected(query: ISparJson, varName: string): boolean {
    return (
      query.variables.filter((v) => {
        // if it is an aggregated variable...
        if ((v as VariableExpression).expression) {
          let vExpression: VariableExpression = v as VariableExpression;
          if (vExpression.expression.expression.value == varName) {
            return true;
          }
        } else {
          if ((v as VariableTerm).value == varName) {
            return true;
          }
        }
        return false;
      }).length == 1
    );
  }

  getResultPtrns() {
    return this.#resultPtrns;
  }

  getDefaultVars() {
    return this.#defaultVars;
  }

  getExecutedAfterPtrns() {
    return this.#executedAfterPtrns;
  }
}

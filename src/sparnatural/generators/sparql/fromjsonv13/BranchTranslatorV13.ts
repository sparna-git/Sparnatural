import { DataFactory } from "rdf-data-factory";
import { Pattern, Variable } from "sparqljs";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "../SparqlFactory";
import ValueBuilderIfc, { ValueBuilderFactory } from "../ValueBuilder";
import TypedVariableTranslator from "../../sparql/fromjson/TypedVariableTranslator";

import {
  PredicateObjectPair,
  ObjectCriteria,
  SparnaturalQuery,
  TermTypedVariable,
} from "../../../SparnaturalQueryIfcV13";

import {
  LabelledCriteria,
  Criteria,
  VariableExpression,
  VariableTerm,
} from "../../../SparnaturalQueryIfc";

// adaptateurs v13 -> v1
import {
  translateFilters,
  translateObjectValues,
} from "../../../querypreloading/QueryAdapterFunc";

const factory = new DataFactory();

/**
 * Translates a v13 PredicateObjectPair (+ its ObjectCriteria) into SparqlJs patterns
 * while keeping the same internal logic as the legacy BranchTranslator.
 */
export default class BranchTranslatorV13 {
  // v13 input
  #pair: PredicateObjectPair;
  #rootSubject: TermTypedVariable;
  #object: ObjectCriteria;

  // full query (for isVarSelected)
  #fullQuery: SparnaturalQuery;

  #specProvider: ISparnaturalSpecification;
  #isVeryFirst: boolean;
  #isInOption: boolean;
  settings: any;

  // derived "legacy-like" fields
  #s: string;
  #sType: string;
  #p: string; // property IRI
  #o: string;
  #oType: string;

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

  constructor(
    //the pair to convert
    pair: PredicateObjectPair,
    // the root subject (shared for the whole bgpSameSubject)
    rootSubject: TermTypedVariable,
    // the full query (we need it to test if variables are selected)
    fullQuery: SparnaturalQuery,
    // the sparnatural spec
    specProvider: ISparnaturalSpecification,
    // true if this branch is the very first of the query (not a child of another, not a sibling of the first one)
    isVeryFirst: boolean,
    // true if this branch is under (recursively) of another that is itself in an option
    isInOption: boolean,
    settings: any,
  ) {
    this.#pair = pair;
    this.#rootSubject = rootSubject;
    this.#object = pair.object;

    this.#fullQuery = fullQuery;
    this.#specProvider = specProvider;
    this.#isVeryFirst = isVeryFirst;
    this.#isInOption = isInOption;
    this.settings = settings;

    // derive legacy-like vars
    this.#s = rootSubject.value;
    this.#sType = rootSubject.rdfType;

    this.#p = pair.predicate.value;

    this.#o = this.#object.variable.value;
    this.#oType = this.#object.variable.rdfType;

    // build criteria list from v13 values + filters
    const criterias: LabelledCriteria<Criteria>[] = this.#collectCriterias();

    // create the object to convert criteria values to SPARQL (same as legacy)
    const endClassValue = this.#oType;

    // this is because the query generation may be triggered while the end class is not there yet
    if (endClassValue != null) {
      this.#valueBuilder = new ValueBuilderFactory().buildValueBuilder(
        this.#specProvider.getProperty(this.#p).getPropertyType(endClassValue),
      );
      // pass everything needed to generate SPARQL
      this.#valueBuilder.init(
        this.#specProvider,
        { variable: this.#s, type: this.#sType },
        { variable: null, type: this.#p },
        { variable: this.#o, type: this.#oType },
        BranchTranslatorV13.isVarSelected(fullQuery, this.#o),
        criterias.map((v) => v.criteria),
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

  /**
   * Converts all children
   */

  #buildChildrenPatterns() {
    const children = this.#object.predicateObjectPairs;
    if (!children || children.length === 0) return;

    children.forEach((childPair) => {
      const builder = new BranchTranslatorV13(
        childPair,
        // subject of children becomes the current object variable
        // In v13, nested predicateObjectPairs are under ObjectCriteria, so the "same subject" at that level is the object variable.
        this.#object.variable,
        this.#fullQuery,
        this.#specProvider,
        false,
        // children are in option if parent is optional/notExists
        this.#pair.subType === "optional" || this.#pair.subType === "notExists",
        this.settings,
      );

      builder.build();
      this.#whereChildPtrns.push(...builder.getResultPtrns());
      // gather default vars from children
      this.#defaultVars.push(...builder.getDefaultVars());
      // gather patterns to be executed after
      this.#executedAfterPtrns.push(...builder.getExecutedAfterPtrns());
    });
  }

  /**
   * Values and Filter "adapter funct"
   */

  #collectCriterias(): LabelledCriteria<Criteria>[] {
    const out: LabelledCriteria<Criteria>[] = [];

    // VALUES / direct values
    out.push(...translateObjectValues(this.#o, this.#object));

    // FILTERS
    if (this.#object.filters && this.#object.filters.length > 0) {
      out.push(...translateFilters(this.#object.filters));
    }

    return out;
  }

  #buildValuePtrn() {
    let hasValues =
      (this.#object.values && this.#object.values.length > 0) ||
      (this.#object.filters && this.#object.filters.length > 0);

    if (hasValues) {
      this.#valuePtrns = this.#valueBuilder.build();
    }
  }

  /**
   * Subject class pattern (same as legacy)
   */

  #buildSubjectClassPtrn() {
    let typeTranslator: TypedVariableTranslator = new TypedVariableTranslator(
      this.#s,
      this.#sType,
      // same semantics as legacy: subject variable selectable only if very first
      BranchTranslatorV13.isVarSelected(this.#fullQuery, this.#s) &&
        this.#isVeryFirst,
      this.#valueBuilder?.isBlockingStart(),
      this.#specProvider,
      this.settings,
    );
    typeTranslator.build();
    this.#startClassPtrn = typeTranslator.resultPtrns;
    // if there was any default label patterns generated, gather the variable names of the default label
    if (typeTranslator.defaultLblPatterns.length > 0) {
      this.#defaultVars.push(
        factory.variable(typeTranslator.defaultLabelVarName),
      );
    }
  }

  #buildObjectClassPtrn() {
    let typeTranslator: TypedVariableTranslator = new TypedVariableTranslator(
      this.#o,
      this.#oType,
      BranchTranslatorV13.isVarSelected(this.#fullQuery, this.#o),
      this.#valueBuilder?.isBlockingEnd(),
      this.#specProvider,
      this.settings,
    );
    typeTranslator.build();

    this.#endClassPtrn = typeTranslator.resultPtrns;
    if (typeTranslator.defaultLblPatterns.length > 0) {
      this.#defaultVars.push(
        factory.variable(typeTranslator.defaultLabelVarName),
      );
    }
  }

  #buildIntersectionPtrn() {
    // Vérification des conditions de génération de l'intersection triple
    if (!this.#s || !this.#o || this.#valueBuilder?.isBlockingObjectProp())
      return;

    const specProperty = this.#specProvider.getProperty(this.#p);

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
                factory.variable(this.#s),
                specProperty.getBeginDateProperty(),
                factory.variable(`${this.#o}_begin`),
              ),
            ]),
          ]),
        );
      }

      if (specProperty.getEndDateProperty()) {
        this.#intersectionPtrn.push(
          SparqlFactory.buildOptionalPattern([
            SparqlFactory.buildBgpPattern([
              SparqlFactory.buildIntersectionTriple(
                factory.variable(this.#s),
                specProperty.getEndDateProperty(),
                factory.variable(`${this.#o}_end`),
              ),
            ]),
          ]),
        );
      }

      if (specProperty.getExactDateProperty()) {
        this.#intersectionPtrn.push(
          SparqlFactory.buildOptionalPattern([
            SparqlFactory.buildBgpPattern([
              SparqlFactory.buildIntersectionTriple(
                factory.variable(this.#s),
                specProperty.getExactDateProperty(),
                factory.variable(`${this.#o}_exact`),
              ),
            ]),
          ]),
        );
      }
    } else {
      // Génération du triple d'intersection normal si aucune propriété de date n'est spécifiée
      this.#intersectionPtrn.push(
        SparqlFactory.buildBgpPattern([
          SparqlFactory.buildIntersectionTriple(
            factory.variable(this.#s),
            this.#p,
            factory.variable(this.#o),
          ),
        ]),
      );
    }
    // Ajout du filtre de langue si la propriété est multilingue
    if (specProperty.isMultilingual()) {
      this.#intersectionPtrn.push(
        SparqlFactory.buildFilterLangEquals(
          factory.variable(this.#o),
          factory.literal(this.settings.language),
        ),
      );
    }
  }

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
    exceptStartPtrn.push(...this.#intersectionPtrn);

    if (
      this.#o &&
      !this.#specProvider.getEntity(this.#oType).isLiteralEntity() &&
      !this.#specProvider.getProperty(this.#p).omitClassCriteria()
    ) {
      exceptStartPtrn.push(...this.#endClassPtrn);
    }

    exceptStartPtrn.push(...this.#valuePtrns);
    exceptStartPtrn.push(...this.#whereChildPtrns);

    // this will wrap everything except start inside the OPTIONAL or NOT EXISTS
    this.#createOptionStatePtrn(exceptStartPtrn);
  }

  #createOptionStatePtrn(exceptStartPtrn: Pattern[]) {
    // create a SERVICE clause of needed
    const sparqlService = this.#specProvider
      .getProperty(this.#p)
      ?.getServiceEndpoint();

    let servicePtrn: Pattern | null = null;
    const endpoint = factory.namedNode(sparqlService);
    if (sparqlService && exceptStartPtrn.length > 0) {
      servicePtrn = SparqlFactory.buildServicePattern(
        exceptStartPtrn,
        endpoint,
      );
    }

    let normalOrServicePatterns: Pattern[] = servicePtrn
      ? [servicePtrn]
      : exceptStartPtrn;

    let isOptional = this.#pair.subType === "optional";
    let isNotExists = this.#pair.subType === "notExists";

    // produce the generated patterns, maybe wrapped in OPTIONAL or NOT EXISTS
    let finalResultPtrns: Pattern[] = [];
    // if this branch is optional and is not inside an optional branch
    if (isOptional && !this.#isInOption) {
      finalResultPtrns.push(
        SparqlFactory.buildOptionalPattern(normalOrServicePatterns),
      );
    } else if (isNotExists && !this.#isInOption) {
      finalResultPtrns.push(
        SparqlFactory.buildNotExistsPattern(
          SparqlFactory.buildGroupPattern(normalOrServicePatterns),
        ),
      );
    } else {
      // nothing special, just retain the patterns in the final result pattern
      finalResultPtrns.push(...normalOrServicePatterns);
    }

    // then decide where to store the generated patterns : either in "normal" patterns
    // or in patterns that shall be executed after the rest of the query
    if (
      servicePtrn &&
      this.#specProvider.getProperty(this.#p)?.isLogicallyExecutedAfter()
    ) {
      this.#executedAfterPtrns.push(...finalResultPtrns);
    } else {
      this.#resultPtrns.push(...finalResultPtrns);
    }
  }

  /**
   *
   * @param query The query to test
   * @param varName The variable to test the selection for
   * @returns true if the varName is selected in the query
   */

  static isVarSelected(query: SparnaturalQuery, varName: string): boolean {
    return (
      query.variables.filter((v) => {
        // PatternBind (aggregate)
        if (v.type === "pattern" && v.subType === "bind") {
          return v.expression.expression[0].value === varName;
        }
        // TermVariable
        return (
          v.type === "term" && v.subType === "variable" && v.value === varName
        );
      }).length === 1
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

import { DataFactory } from "rdf-data-factory";
import { Pattern, Variable } from "sparqljs";
import {
  PredicateObjectPair,
} from "../../../SparnaturalQueryIfc-v13";
import BranchTranslatorV13 from "./BranchTranslatorV13";
import { JsonV13SparqlTranslator } from "./JsonV13SparqlTranslator";

const factory = new DataFactory();

export default class QueryWhereTranslatorV13 {
  // variables set in constructor
  #translator: JsonV13SparqlTranslator;

  // patterns built in the build process
  #resultPtrns: Pattern[] = [];
  #executedAfterPtrns: Pattern[] = [];

  // default vars gathered from children
  #defaultLabelVars: Variable[] = [];
  #extraPropertiesVars: Variable[] = [];

  constructor(
    translator: JsonV13SparqlTranslator,
  ) {
    this.#translator = translator;
  }

  build() {
    const where = this.#translator?.jsonQuery?.where;
    const pairs: PredicateObjectPair[] | undefined =
      where?.predicateObjectPairs;

    if (
      this.#translator.jsonQuery &&
      where &&
      pairs &&
      this.#translator.specProvider &&
      Array.isArray(pairs)
    ) {
      pairs.forEach((pair, index) => {
        if (!pair) return;

        const branchBuilder = new BranchTranslatorV13(
          // the predicate-object pair to convert
          pair,
          // root subject (shared for the whole bgpSameSubject)
          where.subject,
          // indicates if it is the very first (same semantics as v1)
          index === 0,
          // first level is never "inside" optional/notExists
          false,
          this.#translator,
        );

        branchBuilder.build();

        this.#defaultLabelVars.push(...branchBuilder.getDefaultLabelVars());
        this.#extraPropertiesVars.push(...branchBuilder.getExtraPropertiesVars());
        this.#resultPtrns.push(...branchBuilder.getResultPtrns());
      });
    } else {
      console.error("Required variables are missing or invalid");
    }
  }

  getResultPtrns() {
    return this.#resultPtrns;
  }

  getDefaultVars() {
    return this.#defaultLabelVars;
  }

  getExtraPropertiesVars(): Variable[] {
    return this.#extraPropertiesVars;
  }

  getExecutedAfterPtrns() {
    return this.#executedAfterPtrns;
  }
}

import { DataFactory } from "rdf-data-factory";
import { Pattern, Variable } from "sparqljs";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import {
  SparnaturalQuery,
  PredicateObjectPair,
} from "../../../SparnaturalQueryIfcV13";
import BranchTranslatorV13 from "./BranchTranslatorV13";

const factory = new DataFactory();

export default class QueryWhereTranslatorV13 {
  // variables set in constructor
  #jsonQuery: SparnaturalQuery;
  #specProvider: ISparnaturalSpecification;

  // patterns built in the build process
  #resultPtrns: Pattern[] = [];
  #executedAfterPtrns: Pattern[] = [];

  // default vars gathered from children
  #defaultVars: Variable[] = [];

  settings: any;

  constructor(
    jsonQuery: SparnaturalQuery,
    specProvider: ISparnaturalSpecification,
    settings: any,
  ) {
    this.#jsonQuery = jsonQuery;
    this.#specProvider = specProvider;
    this.settings = settings;
  }

  build() {
    const where = this.#jsonQuery?.where;
    const pairs: PredicateObjectPair[] | undefined =
      where?.predicateObjectPairs;

    if (
      this.#jsonQuery &&
      where &&
      pairs &&
      this.#specProvider &&
      Array.isArray(pairs)
    ) {
      pairs.forEach((pair, index) => {
        if (!pair) return;

        const branchBuilder = new BranchTranslatorV13(
          // the predicate-object pair to convert
          pair,
          // root subject (shared for the whole bgpSameSubject)
          where.subject,
          // full query (needed for isVarSelected + selected variables)
          this.#jsonQuery,
          // spec provider
          this.#specProvider,
          // indicates if it is the very first (same semantics as v1)
          index === 0,
          // first level is never "inside" optional/notExists
          false,
          this.settings,
        );

        branchBuilder.build();

        this.#defaultVars.push(...branchBuilder.getDefaultVars());
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
    return this.#defaultVars;
  }

  getExecutedAfterPtrns() {
    return this.#executedAfterPtrns;
  }
}

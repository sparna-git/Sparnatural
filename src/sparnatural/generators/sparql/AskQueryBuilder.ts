import { Generator } from "sparqljs";
import { ISparnaturalSpecification } from "../../spec-providers/ISparnaturalSpecification";
import {
  PredicateObjectPair,
  SelectVariable,
  SparnaturalQuery,
} from "../../SparnaturalQueryIfc-v13";
import { JsonV13SparqlTranslator } from "./fromjsonv13/JsonV13SparqlTranslator";

// #809 : builds the ASK telling if a query can have at least one result. Like QueryPatternBuilder,
// it reuses the JSON query and the SELECT translator as they are, and only keeps the WHERE.
export class AskQueryBuilder {

  private specProvider: ISparnaturalSpecification;
  private settings: any;

  constructor(specProvider: ISparnaturalSpecification, settings: any) {
    this.specProvider = specProvider;
    this.settings = settings;
  }

  build(originalQuery: SparnaturalQuery): string {
    // work on a copy : the original is the query the user sees and submits
    const query: SparnaturalQuery = JSON.parse(JSON.stringify(originalQuery));

    // no selected variables : no label patterns, no ORDER BY nor LIMIT, none of them changes the answer
    query.variables = [];
    query.solutionModifiers = {};
    delete query.distinct;

    const selectQuery = new JsonV13SparqlTranslator(
      this.specProvider,
      this.settings
    ).generateQuery(query);

    return new Generator().stringify({
      type: "query",
      queryType: "ASK",
      where: selectQuery.where,
      prefixes: selectQuery.prefixes,
    });
  }

  // Copy of the query without the lines whose object variable is given, nor the selected
  // variables they bring : how the lines with a red light are left out of the query.
  static withoutLines(originalQuery: SparnaturalQuery, objectVariables: string[]): SparnaturalQuery {
    if (objectVariables.length === 0) return originalQuery;

    const query: SparnaturalQuery = JSON.parse(JSON.stringify(originalQuery));
    query.where.predicateObjectPairs = removePairs(query.where.predicateObjectPairs, objectVariables);
    query.variables = query.variables?.filter(
      (v) => !objectVariables.includes(variableName(v))
    );
    return query;
  }

}

function removePairs(pairs: PredicateObjectPair[], objectVariables: string[]): PredicateObjectPair[] {
  return pairs.filter((pair) => {
    if (objectVariables.includes(pair.object?.variable?.value)) return false;
    if (pair.object?.predicateObjectPairs) {
      pair.object.predicateObjectPairs = removePairs(pair.object.predicateObjectPairs, objectVariables);
    }
    return true;
  });
}

// the variable a selected column is about, the aggregated one for an aggregate
function variableName(v: SelectVariable): string {
  return v.type === "pattern" ? v.expression.expression[0].value : v.value;
}

import { Generator } from "sparqljs";
import { ISparnaturalSpecification } from "../../spec-providers/ISparnaturalSpecification";
import { SparnaturalQuery } from "../../SparnaturalQueryIfc-v13";
import { JsonV13SparqlTranslator } from "./fromjsonv13/JsonV13SparqlTranslator";
import { DataFactory } from "rdf-data-factory/lib/DataFactory";
import SparqlFactory from "./SparqlFactory";

const factory = new DataFactory();

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
    const selectQuery = this.#translate(originalQuery);
    return new Generator().stringify({
      type: "query",
      queryType: "ASK",
      where: selectQuery.where,
      prefixes: selectQuery.prefixes,
    });
  }

  buildCount(originalQuery: SparnaturalQuery, variable: string): string {
    const selectQuery = this.#translate(originalQuery);
    return new Generator().stringify({
      type: "query",
      queryType: "SELECT",
      variables: [
        SparqlFactory.buildAggregateFunctionExpression(
          "count",
          factory.variable(variable),
          factory.variable("count"),
        ),
      ],
      where: selectQuery.where,
      prefixes: selectQuery.prefixes,
    });
  }

  #translate(originalQuery: SparnaturalQuery) {
    const query: SparnaturalQuery = JSON.parse(JSON.stringify(originalQuery));
    // no selected variables, no label patterns, no order by, nor limit
    query.variables = [];
    query.solutionModifiers = {};
    delete query.distinct;
    return new JsonV13SparqlTranslator(
      this.specProvider,
      this.settings,
    ).generateQuery(query);
  }
}

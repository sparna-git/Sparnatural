import { Generator } from "sparqljs";
import { ISparnaturalSpecification } from "../../spec-providers/ISparnaturalSpecification";
import { SparnaturalQuery } from "../../SparnaturalQueryIfc-v13";
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

}

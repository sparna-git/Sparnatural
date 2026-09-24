import { Generator } from "sparqljs";
import { DataFactory } from "rdf-data-factory";
import { ISparnaturalSpecification } from "../../spec-providers/ISparnaturalSpecification";
import {
  PredicateObjectPair,
  SparnaturalQuery,
} from "../../SparnaturalQueryIfc-v13";
import { JsonV13SparqlTranslator } from "./fromjsonv13/JsonV13SparqlTranslator";

const factory = new DataFactory();

// Builds the graph pattern of the query being edited, injected in the $query placeholder
// of a datasource query so that a widget only proposes values leading to a result.
export class QueryPatternBuilder {

  private specProvider: ISparnaturalSpecification;
  private settings: any;

  constructor(specProvider: ISparnaturalSpecification, settings: any) {
    this.specProvider = specProvider;
    this.settings = settings;
  }

  // Drops the line being edited, which the template writes itself. The pattern keeps the
  // variable names of the query : it is the template that takes the name of the subject.
  // Null if nothing to inject.
  build(
    originalQuery: SparnaturalQuery,
    subjectVariable: string,
    objectVariable: string
  ): string {
    if (!originalQuery || !subjectVariable) return null;

    // work on a copy : the original is the query the user sees and submits
    const query: SparnaturalQuery = JSON.parse(JSON.stringify(originalQuery));

    const pairs = query.where?.predicateObjectPairs;
    if (!pairs || pairs.length === 0) return null;

    if (!this.#removeEditedLine(pairs, objectVariable, false)) return null;

    // nothing left to constrain the values with
    if (pairs.length === 0) return null;

    // no selected variables : this also switches off the default label patterns, whose
    // language filter would wrongly discard unlabelled resources
    query.variables = [];
    query.solutionModifiers = {};
    delete query.distinct;

    const selectQuery = new JsonV13SparqlTranslator(
      this.specProvider,
      this.settings
    ).generateQuery(query);

    if (!selectQuery.where || selectQuery.where.length === 0) return null;

    // sparqljs only stringifies whole queries : wrap the patterns in a minimal one and keep
    // what is between the braces. No prefixes means full IRIs, so nothing to declare.
    const text = new Generator().stringify({
      type: "query",
      queryType: "SELECT",
      variables: [factory.variable(subjectVariable)],
      where: selectQuery.where,
      prefixes: {},
    });

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;

    const pattern = text.substring(start + 1, end).trim();
    return pattern.length > 0 ? pattern : null;
  }

  // An absent line is not an error, it simply has no value yet. Returns false when the line
  // sits inside an OPTIONAL / NOT EXISTS, where the rest would be meaningless once injected.
  #removeEditedLine(
    pairs: PredicateObjectPair[],
    objectVariable: string,
    insideOption: boolean
  ): boolean {

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];

      if (pair.object?.variable?.value === objectVariable) {
        if (insideOption) return false;
        pairs.splice(i, 1);
        return true;
      }

      const children = pair.object?.predicateObjectPairs;
      if (children && children.length > 0) {
        if (!this.#removeEditedLine(
          children,
          objectVariable,
          insideOption ||
            pair.subType === "optional" ||
            pair.subType === "notExists"
        )) return false;
      }
    }

    return true;
  }

}

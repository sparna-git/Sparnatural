import { PreLoadQueries } from "../../sparnatural/settings/ISettings";
import { Branch, CriteriaLine, ISparJson } from "../generators/ISparJson";
import { WidgetValue } from "../components/widgets/AbstractWidget";

/*
    This Class takes an Array with Jsons in the form of ISparJson together with a queryname.
    It validates the queries and shows them in a Dropdownlist.
*/

export default class QueryParser{
  parsedQueries: { queryName: string; query: string }[];
  queries: PreLoadQueries;

  static parseQueries(queries: PreLoadQueries) {
    try {
      let queryJson: Array<{ queryName: string; query: string }> =
        queries.queries.map((q) => {
          q.query = JSON.parse(q.query);
          return q;
        });
      let validatedQueries = this.#validateQueries(queryJson);

      return validatedQueries;
    } catch (error) {
      console.error(error);
    }
  }

  static #validateQueries(queries: Array<{ queryName: string; query: string }>) {
    // filter out the queries which are not in the correct format
    queries = queries.filter((q) => {
      if (!("queryName" in q && this.#instanceOfISparJson(q.query))) {
        console.warn(
          `The provided query "${q.queryName}" doesn't hold the Sparnatural JSON structure`
        );
        return false;
      }
      return true;
    });
    return queries;
  }
  static #instanceOfISparJson(queryObj: any): queryObj is ISparJson {
    let hasKeys =
      "distinct" in queryObj &&
      "variables" in queryObj &&
      "lang" in queryObj &&
      "order" in queryObj;

    let branches = queryObj.branches as Array<Branch>;
    // iterate through top level andSiblings
    let every = branches.every((b) => {
      return this.#instanceOfBranch(b);
    });

    return hasKeys && every;
  }
  static #instanceOfBranch(branch: Branch): branch is Branch {
    let hasKeys =
      "line" in branch && "optional" in branch && "notExists" in branch;
    let isInstanceOf = this.#instanceOfLine(branch.line);
    let every = branch.children.every((b) => {
      return this.#instanceOfBranch(b);
    });
    return hasKeys && every && isInstanceOf;
  }
  static #instanceOfLine(line: CriteriaLine): line is CriteriaLine {
    let hasKeys =
      "s" in line &&
      "p" in line &&
      "o" in line &&
      "sType" in line &&
      "oType" in line;
    let every = line.values.every((v) => {
      return this.#isWidgetValue(v);
    });
    return hasKeys && every;
  }
  //some basic validation if the provided value is an IWidget['value']
  static #isWidgetValue(val: WidgetValue): val is WidgetValue {
    //every WidgetVal needs to have at least a label
    let hasKeys = "label" in val.value;
    return hasKeys;
  }
}

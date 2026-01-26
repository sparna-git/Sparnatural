import {
  SparnaturalQuery,
  TermVariable,
  PatternBind,
} from "../../../SparnaturalQueryIfcV13";
import { VariableExpression } from "../../../SparnaturalQueryIfc";
import { Pattern, VariableTerm as SparqlVariableTerm } from "sparqljs";
import { VariableExpression as SparqlVariableExpression } from "sparqljs";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import { Grouping, Ordering, SelectQuery, Variable } from "sparqljs";
import SparqlFactory from "../SparqlFactory";
import { DataFactory } from "rdf-data-factory";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";
import QueryWhereTranslatorV13 from "./QueryWhereTranslatorV13";

const factory = new DataFactory();

export class JsonV13SparqlTranslator {
  specProvider: ISparnaturalSpecification;
  prefixes: { [key: string]: string } = {};
  jsonQuery: SparnaturalQuery;
  settings: any;

  defaultLabelVars: Variable[] = [];

  constructor(
    // the Sparnatural configuration
    specProvider: ISparnaturalSpecification,
    // settings
    settings: any,
  ) {
    this.specProvider = specProvider;
    this.settings = settings;
  }

  /**
   *
   * @param jsonQuery the sparnaturalV13 JSON query
   * @returns a SPARQL query translated from the Sparnatural JSON query structure
   */

  generateQuery(jsonQuery: SparnaturalQuery): SelectQuery {
    this.jsonQuery = jsonQuery;

    const sparqlJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: jsonQuery.distinct,
      type: "query",
      variables: this.#varsToRDFJS(jsonQuery.variables),
      where: this.#createWhereClause(),
      prefixes: this.prefixes,
      order: this.#orderFromSolutionModifiers(jsonQuery),
      // sets a limit if provided, otherwise leave to undefined
      limit:
        jsonQuery.solutionModifiers?.limitOffset?.limit > 0
          ? jsonQuery.solutionModifiers.limitOffset.limit
          : undefined,
    };

    // if the RdfJsQuery contains empty 'where' array, then the generator crashes.
    // create query with no triples
    if (sparqlJsQuery.where?.length === 0) {
      sparqlJsQuery.where = [
        {
          type: "bgp",
          triples: [],
        },
      ];
    }

    if (this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach((v) =>
        this.#insertDefaultLabelVar(sparqlJsQuery, v),
      );
    }

    if (!sparqlJsQuery.order) delete sparqlJsQuery.order;
    if (!sparqlJsQuery.limit) delete sparqlJsQuery.limit;

    // set a GROUP BY based on aggregation expression in the variables
    // add this after defaultLabel var have been inserted, and re-read them from the query
    sparqlJsQuery.group = this.#addGroupBy(
      sparqlJsQuery.variables as Variable[],
    );

    return sparqlJsQuery;
  }

  /**
   * @param variables The list variables of the SELECT query
   * @returns GROUP BY clause if needed, of all non-aggregated variables, or undefined if not needed
   */
  #addGroupBy(variables: Variable[]): Grouping[] {
    if (this.#needsGrouping(variables)) {
      let g: Grouping[] = [];

      variables.forEach((v) => {
        if (!(v as SparqlVariableExpression).expression) {
          g.push({
            expression: v as SparqlVariableTerm,
          });
        }
      });

      return g;
    } else {
      // no aggregation, or only one column, grouping is undefined
      return undefined;
    }
  }

  #needsGrouping(variables: Variable[]): boolean {
    return variables.find((v) => (v as VariableExpression).expression) &&
      variables.length > 1
      ? true
      : false;
  }

  /**
   * Generates the WHERE clause of the SparqlJs query from the original JSON structure
   * @returns an array of SparqlJs Pattern representing the complete content of the WHERE clause
   */

  #createWhereClause(): Pattern[] {
    const whereBuilder = new QueryWhereTranslatorV13(
      this.jsonQuery,
      this.specProvider,
      this.settings,
    );
    whereBuilder.build();
    this.defaultLabelVars = whereBuilder.getDefaultVars();
    return whereBuilder.getResultPtrns();
  }

  // a voir encore
  /**
   * Converts SparnaturalQuery variables to SparqlJs Variable or Aggregate expressions
   * @param variables The list of variables from SparnaturalQuery
   * @returns The list of variables as SparqlJs Variable or Aggregate expressions
   */

  #varsToRDFJS(variables: Array<TermVariable | PatternBind>): Variable[] {
    const where = this.jsonQuery.where;
    const pairs = where?.predicateObjectPairs ?? [];

    const variablesArray: Variable[][] = variables.map((v) => {
      if (v.type === "pattern" && v.subType === "bind") {
        return [
          SparqlFactory.buildAggregateFunctionExpression(
            v.expression.aggregation,
            factory.variable(v.expression.expression[0].value),
            factory.variable(v.variable.value),
          ),
        ];
      }

      let varName = v.value;
      let specProperty: ISpecificationProperty | undefined;

      // chercher la propriété qui produit cette variable
      pairs.forEach((pair) => {
        if (pair.object?.variable?.value === varName) {
          specProperty = this.specProvider.getProperty(pair.predicate.value);
        }
      });

      console.log("specProperty for var", varName, specProperty);

      if (!specProperty) {
        return [factory.variable(varName)];
      }

      if (
        specProperty.getBeginDateProperty() ||
        specProperty.getEndDateProperty() ||
        specProperty.getExactDateProperty()
      ) {
        const result: Variable[] = [];

        if (specProperty.getBeginDateProperty()) {
          result.push(factory.variable(`${varName}_begin`));
        }
        if (specProperty.getEndDateProperty()) {
          result.push(factory.variable(`${varName}_end`));
        }
        if (specProperty.getExactDateProperty()) {
          result.push(factory.variable(`${varName}_exact`));
        }

        return result;
      }

      return [factory.variable(varName)];
    });

    const finalResult: Variable[] = [];
    variablesArray.forEach((arr) => finalResult.push(...arr));

    return finalResult;
  }

  /**
   * ordering from solution modifiers
   * @param query The SparnaturalQuery to extract the ordering from
   * @returns ORDER BY clause if needed, or undefined if not needed
   */

  #orderFromSolutionModifiers(query: SparnaturalQuery): Ordering[] | undefined {
    const order = query.solutionModifiers?.order;
    if (!order || order.orderDefs.length === 0) return undefined;

    return order.orderDefs.map((o) => ({
      expression: factory.variable(o.expression.value),
      descending: o.descending,
    }));
  }

  /**
   * Inserts the provided default label variable, having the name "xxx_label", after the variable named "xxx"
   * @param sparqlQuery The SparqlJs query
   * @param defaultLabelVar The default label variable, ending in xxx_label, to insert
   */

  #insertDefaultLabelVar(sparqlQuery: SelectQuery, defaultLabelVar: Variable) {
    // reconstruct the original var name by removing "_label" suffix
    var originalVar = (defaultLabelVar as SparqlVariableTerm).value.substring(
      0,
      (defaultLabelVar as SparqlVariableTerm).value.length - "_label".length,
    );
    //console.log("SpraqlQuery variables", sparqlQuery.variables);
    for (var i = 0; i < sparqlQuery.variables.length; i++) {
      // find variable with the original name
      if (
        (sparqlQuery.variables[i] as SparqlVariableTerm).value == originalVar
      ) {
        // insert the default label var after this one
        sparqlQuery.variables.splice(i + 1, 0, defaultLabelVar);
        // don't forget, otherwise infinite loop
        break;
      }
    }
  }
}

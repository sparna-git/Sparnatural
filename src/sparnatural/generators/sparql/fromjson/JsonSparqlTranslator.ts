import {
  SparnaturalQueryIfc,
  Order,
  VariableExpression,
  VariableTerm,
} from "../../../SparnaturalQueryIfc";
import { Pattern, VariableTerm as SparqlVariableTerm } from "sparqljs";
import { VariableExpression as SparqlVariableExpression } from "sparqljs";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import { Grouping, Ordering, SelectQuery, Variable } from "sparqljs";
import SparqlFactory from "../SparqlFactory";
import { DataFactory } from "rdf-data-factory";
import QueryWhereTranslator from "./QueryWhereTranslator";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";

const factory = new DataFactory();

/**
 * Generates a Sparql query in the SparqlJs structure from the JSON query format of Sparnatural
 */
export class JsonSparqlTranslator {
  typePredicate: string;
  specProvider: ISparnaturalSpecification;
  prefixes: { [key: string]: string } = {};
  jsonQuery: SparnaturalQueryIfc;
  settings: any;

  defaultLabelVars: Variable[] = [];

  constructor(
    // the Sparnatural configuration
    specProvider: ISparnaturalSpecification,
    // settings
    settings: any
  ) {
    this.specProvider = specProvider;
    this.settings = settings;
  }

  /**
   * @param jsonQuery the Sparnatural JSON query
   * @returns a SPARQL query translated from the Sparnatural JSON query structure
   */
  generateQuery(jsonQuery: SparnaturalQueryIfc): SelectQuery {
    this.jsonQuery = jsonQuery;

    const sparqlJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: jsonQuery.distinct,
      variables: this.#varsToRDFJS(jsonQuery.variables),
      type: "query",
      where: this.#createWhereClause(),
      prefixes: this.prefixes,
      order: this.#orderToRDFJS(this.jsonQuery.order, jsonQuery.variables[0]),
      // sets a limit if provided, otherwise leave to undefined
      limit:
        jsonQuery.limit && jsonQuery.limit > 0 ? jsonQuery.limit : undefined,
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

    // post processing for defaultlabel property
    if (this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach((defaultLabelVar) =>
        this.#insertDefaultLabelVar(sparqlJsQuery, defaultLabelVar)
      );
    }

    // don't set an order if there is no expression for it
    if (!sparqlJsQuery?.order || !sparqlJsQuery?.order[0]?.expression)
      delete sparqlJsQuery.order;

    // set a GROUP BY based on aggregation expression in the variables
    // add this after defaultLabel var have been inserted, and re-read them from the query
    sparqlJsQuery.group = this.#addGroupBy(
      sparqlJsQuery.variables as Variable[]
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
    let whereBuilder = new QueryWhereTranslator(
      this.jsonQuery,
      this.specProvider,
      this.settings
    );
    whereBuilder.build();
    this.defaultLabelVars = whereBuilder.getDefaultVars();
    return whereBuilder.getResultPtrns();
  }

  /**
   * Translates the variables from the JSON structure to variables in the SparqlJs structure
   * @param variables The variables in the original JSON query structure
   * @returns An array of Variable structure in the SparqlJs structure
   */

  #varsToRDFJS(
    variables: Array<VariableTerm | VariableExpression>
  ): Variable[] {
    let variablesArray: Variable[][] = variables.map((v) => {
      if ((v as VariableExpression).expression) {
        let vExpression: VariableExpression = v as VariableExpression;
        return [
          SparqlFactory.buildAggregateFunctionExpression(
            vExpression.expression.aggregation,
            factory.variable(vExpression.expression.expression.value),
            factory.variable(vExpression.variable.value)
          ),
        ];
      } else {
        let specProperty: ISpecificationProperty | undefined = undefined;

        // Parcourir les branches pour trouver la correspondance uniquement avec l'objet (o)
        (this.jsonQuery.branches as any[]).forEach((branch) => {
          if (branch.line.o === (v as VariableTerm).value) {
            //console.log("Matching branch found for object:", branch);
            specProperty = this.specProvider.getProperty(branch.line.p);
          }
        });

        console.log("specProperty", specProperty);

        if (!specProperty) {
          // Si aucune propriété n'est trouvée, retourne une variable simple
          return [factory.variable((v as VariableTerm).value)];
        }

        if (
          specProperty.getBeginDateProperty() &&
          specProperty.getEndDateProperty()
        ) {
          let result: Variable[] = [];
          if (specProperty.getBeginDateProperty()) {
            result.push(factory.variable((v as VariableTerm).value + "_begin"));
          }
          if (specProperty.getEndDateProperty()) {
            result.push(factory.variable((v as VariableTerm).value + "_end"));
          }
          if (specProperty.getExactDateProperty()) {
            result.push(factory.variable((v as VariableTerm).value + "_exact"));
          }
          return result;
        } else {
          return [factory.variable((v as VariableTerm).value)];
        }
      }
    });

    // Aplatissement du tableau de tableaux en un tableau simple
    let finalResult: Variable[] = [];
    variablesArray.forEach((varArray: Variable[]) => {
      finalResult.push(...varArray);
    });
    console.log("finalResult variables:", finalResult);
    return finalResult;
  }

  /**
   * Converts the order parameter in the original JSON structure to an Ordering object in SparqlJs
   * @param order the order information in the JSON structure
   * @param variable the variable to order on
   * @returns an Ordering structure in SparqlJs
   */
  #orderToRDFJS(
    order: Order,
    variable: VariableTerm | VariableExpression
  ): Ordering[] {
    if (order == Order.DESC || order == Order.ASC) {
      let varName = (variable as VariableExpression).expression
        ? (variable as VariableExpression).variable.value
        : (variable as VariableTerm).value;
      return [
        {
          expression: factory.variable(varName),
          descending: order == Order.DESC ? true : false,
        },
      ];
    } else {
      // no order
      return null;
    }
  }

  /**
   * Inserts the provided default label variable, having the name "xxx_label", after the variable named "xxx"
   * @param sparqlQuery The SparqlJs query
   * @param defaultLabelVar The default label variable, ending in xxx_label, to insert
   */

  #insertDefaultLabelVar(sparqlQuery: SelectQuery, defaultLabelVar: Variable) {
    // reconstruct the original var name by removing "_label" suffix
    var originalVar = (defaultLabelVar as VariableTerm).value.substring(
      0,
      (defaultLabelVar as VariableTerm).value.length - "_label".length
    );
    //console.log("SpraqlQuery variables", sparqlQuery.variables);
    for (var i = 0; i < sparqlQuery.variables.length; i++) {
      // find variable with the original name
      if ((sparqlQuery.variables[i] as VariableTerm).value == originalVar) {
        // insert the default label var after this one
        sparqlQuery.variables.splice(i + 1, 0, defaultLabelVar);
        // don't forget, otherwise infinite loop
        break;
      }
    }
  }
}

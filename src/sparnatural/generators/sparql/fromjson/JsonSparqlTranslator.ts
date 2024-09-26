import { ISparJson, Order, VariableExpression, VariableTerm } from "../../json/ISparJson";
import { Pattern, VariableTerm as SparqlVariableTerm } from "sparqljs";
import { VariableExpression as SparqlVariableExpression } from "sparqljs";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import {
  Grouping,
  Ordering,
  SelectQuery,
  Variable
} from "sparqljs";
import WhereBuilder from "../WhereBuilder";
import SparqlFactory from "../SparqlFactory";
import { DataFactory } from 'rdf-data-factory';
import QueryWhereTranslator from "./QueryWhereTranslator";

const factory = new DataFactory();

/**
 * Generates a Sparql query in the SparqlJs structure from the JSON query format of Sparnatural
 */
export default class JsonSparqlTranslator {
  typePredicate: string;
  specProvider: ISparnaturalSpecification;
  prefixes: { [key: string]: string } = {};
  jsonQuery: ISparJson;
  limit:number;

  defaultLabelVars:Variable[] = []
  
  constructor(
    // the Sparnatural configuration
    specProvider: ISparnaturalSpecification,
    // the prefixes to include in the query
    prefixes: { [key: string]: string } = {},
    // the limit parameter to include in the query
    limit: number
  ) {
    this.specProvider = specProvider;
    this.prefixes = prefixes;
    this.limit = limit;
  }

  /**
   * @param jsonQuery the Sparnatural JSON query
   * @returns a SPARQL query translated from the Sparnatural JSON query structure
   */
  generateQuery(    
    jsonQuery: ISparJson,
  ):SelectQuery 
  {
    this.jsonQuery = jsonQuery;

    const sparqlJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: jsonQuery.distinct,
      variables: this.#varsToRDFJS(jsonQuery.variables),
      type: "query",
      where: this.#createWhereClause(),
      prefixes: this.prefixes,
      order: this.#orderToRDFJS(
        this.jsonQuery.order,
        jsonQuery.variables[0]
      ),
      // sets a limit if provided, otherwise leave to undefined
      limit: (this.limit && (this.limit > 0))?this.limit:undefined
    };

    // if the RdfJsQuery contains empty 'where' array, then the generator crashes.
    // create query with no triples
    if(sparqlJsQuery.where?.length === 0 ){
      sparqlJsQuery.where = [{
        type: 'bgp',
        triples: []
      }]
    }
    
    // post processing for defaultlabel property
    if(this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach(defaultLabelVar => this.#insertDefaultLabelVar(sparqlJsQuery, defaultLabelVar));
    }
    
    // don't set an order if there is no expression for it
    if(!sparqlJsQuery?.order || !sparqlJsQuery?.order[0]?.expression) delete sparqlJsQuery.order
    
    // set a GROUP BY based on aggregation expression in the variables
    // add this after defaultLabel var have been inserted, and re-read them from the query
    sparqlJsQuery.group = this.#addGroupBy(sparqlJsQuery.variables as Variable[])
    
    return sparqlJsQuery;
  }

  /**
   * @param variables The list variables of the SELECT query
   * @returns GROUP BY clause if needed, of all non-aggregated variables, or undefined if not needed
   */
  #addGroupBy(variables: Variable[]): Grouping[] {
    if(this.#needsGrouping(variables)) {
      let g:Grouping[] = [];

      variables.forEach(v=> {
        if(!(v as SparqlVariableExpression).expression) {
          g.push({
            expression:(v as SparqlVariableTerm)
          })
        }
      })

      return g;
    } else {
      // no aggregation, or only one column, grouping is undefined
      return undefined;
    }
  }

  #needsGrouping(variables: Variable[]):boolean {
    return (
      variables.find(v=>(v as VariableExpression).expression)
      &&
      variables.length > 1
    )?true:false;
  }

  /**
   * Generates the WHERE clause of the SparqlJs query from the original JSON structure
   * @returns an array of SparqlJs Pattern representing the complete content of the WHERE clause
   */
  #createWhereClause():Pattern[]{
    let whereBuilder = new QueryWhereTranslator(this.jsonQuery, this.specProvider);
    whereBuilder.build();
    this.defaultLabelVars = whereBuilder.getDefaultVars();
    return whereBuilder.getResultPtrns();
    /*
    const builder = new WhereBuilder(
      this.sparnatural.BgWrapper.componentsList.rootGroupWrapper,
      this.specProvider,
      this.typePredicate,
      false,
      false
    )
    builder.build()
    this.defaultLabelVars = builder.getDefaultVars()
    
    if(builder.getExecutedAfterPtrns().length > 0) {
      // put all normal patterns in a subquery to garantee they are logically executed before
      // and their variables are bound in the rest of the query outside the subquery
      let subquery = SparqlFactory.buildSubQuery(builder.getResultPtrns());
      // and the patterns to be executed after in the normal where clause
      return [subquery, ...builder.getExecutedAfterPtrns()];
    } else {
      return builder.getResultPtrns()
    }
      */
    
  }

  /**
   * Translates the variables from the JSON structure to variables in the SparqlJs structure
   * @param variables The variables in the original JSON query structure
   * @returns An array of Variable structure in the SparqlJs structure
   */
  #varsToRDFJS(variables: Array<VariableTerm | VariableExpression>): Variable[] {
    return variables.map((v) => {
      // if it is an aggregated variable...
      if((v as VariableExpression).expression) {
        let vExpression:VariableExpression = v as VariableExpression;
        return SparqlFactory.buildAggregateFunctionExpression(
          vExpression.expression.aggregation,
          factory.variable(vExpression.expression.expression.value),
          factory.variable(vExpression.variable.value)
        )
      } else {
        return factory.variable((v as VariableTerm).value);
      }      
    });
  }

  /**
   * Converts the order parameter in the original JSON structure to an Ordering object in SparqlJs
   * @param order the order information in the JSON structure
   * @param variable the variable to order on
   * @returns an Ordering structure in SparqlJs
   */
  #orderToRDFJS(order: Order, variable: VariableTerm | VariableExpression): Ordering[] {
    if(order == Order.DESC || order == Order.ASC) {
      let varName = ((variable as VariableExpression).expression)?(variable as VariableExpression).variable.value:(variable as VariableTerm).value;
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
  
  #insertDefaultLabelVar(sparqlQuery: SelectQuery, defaultLabelVar:Variable) {
    // reconstruct the original var name by removing "_label" suffix
    var originalVar = (defaultLabelVar  as VariableTerm).value.substring(0,(defaultLabelVar  as VariableTerm).value.length-"_label".length);
    console.log('SpraqlQuery variables',sparqlQuery.variables);
    for(var i=0;i<sparqlQuery.variables.length;i++) {
      // find variable with the original name
      if((sparqlQuery.variables[i] as VariableTerm).value == originalVar) {
        // insert the default label var after this one
        sparqlQuery.variables.splice(i+1, 0, defaultLabelVar);
        // don't forget, otherwise infinite loop
        break;
      }
    }
  }
  
}
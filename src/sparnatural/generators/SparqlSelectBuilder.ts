import { Order } from "./ISparJson";
import ISparnaturalSpecification from "../spec-providers/ISparnaturalSpecification";
import {
  Grouping,
  Ordering,
  SelectQuery,
  Variable,
  VariableExpression,
  VariableTerm,
} from "sparqljs";
import SparnaturalComponent from "../components/SparnaturalComponent";
import WhereBuilder from "./helpers/WhereBuilder";
import SparqlFactory from "./SparqlFactory";
import { DataFactory } from 'rdf-data-factory';
import { DraggableComponentState } from "../components/variables-section/variableorder/DraggableComponent";

const factory = new DataFactory();

/*
  Reads out the UI and creates the and sparqljs pattern. 
  sparqljs pattern builds pattern structure on top of rdfjs datamodel. see:https://rdf.js.org/data-model-spec/
  It goes recursively through all the grpWrappers and reads out their values.
*/
export default class RdfJsGenerator {
  typePredicate: string;
  specProvider: ISparnaturalSpecification;
  prefixes: { [key: string]: string } = {};
  sparnatural: SparnaturalComponent;
  defaultLabelVars:Variable[] = []// see: #checkForDefaultLabel()
  constructor(
    sparnatural: SparnaturalComponent,
    specProvider: ISparnaturalSpecification,
    prefixes: { [key: string]: string } = {}
  ) {
    this.sparnatural = sparnatural;
    this.specProvider = specProvider;
    this.prefixes = prefixes;
  }

  generateQuery(
    variables: Array<DraggableComponentState>,
    order: Order,
    distinct: boolean,
    limit: number
  ):SelectQuery {
    const sparqlJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: distinct,
      variables: this.#varsToRDFJS(variables),
      type: "query",
      where: this.#createWhereClause(),
      prefixes: this.prefixes,
      order: this.#orderToRDFJS(
        order,
        factory.variable(variables[0].selectedVariable.variable)
      ),
      limit: (limit && (limit > 0))?limit:undefined
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
        if(!(v as VariableExpression).expression) {
          g.push({
            expression:(v as VariableTerm)
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

  #createWhereClause(){
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
    
  }

  #varsToRDFJS(variables: Array<DraggableComponentState>): Variable[] {
    return variables.map((v) => {
      if(v.aggregateFunction) {
        return SparqlFactory.buildAggregateFunctionExpression(
          v.aggregateFunction,
          factory.variable(v.originalVariable.variable),
          factory.variable(v.selectedVariable.variable)
        )
      } else {
        return factory.variable(v.selectedVariable.variable);
      }      
    });
  }

  // It will be ordered by the Provided variable
  #orderToRDFJS(order: Order, variable: VariableTerm): Ordering[] {
    if(order == Order.DESC || order == Order.ASC) {
      return [
        {
          expression: variable,
          descending: order == Order.DESC ? true : false,
        },
      ];
    } else {
      // no order
      return null;
    }
  }

  // inserts the default label var right after the variable of the same name
  #insertDefaultLabelVar(sparqlQuery: SelectQuery, defaultLabelVar:Variable) {
    var originalVar = (defaultLabelVar  as VariableTerm).value.substring(0,(defaultLabelVar  as VariableTerm).value.length-"_label".length);
    for(var i=0;i<sparqlQuery.variables.length;i++) {
      if((sparqlQuery.variables[i] as VariableTerm).value == originalVar) {
        sparqlQuery.variables.splice(i+1, 0, defaultLabelVar);
        // don't forget, otherwise infinite loop
        break;
      }
    }
  }
}
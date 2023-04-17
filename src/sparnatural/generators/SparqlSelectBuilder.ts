import { Order } from "./ISparJson";
import ISparnaturalSpecification from "../spec-providers/ISparnaturalSpecification";
import {
  Ordering,
  SelectQuery,
  Variable,
  VariableTerm,
  Wildcard,
} from "sparqljs";
import SparnaturalComponent from "../components/SparnaturalComponent";
import * as DataFactory from "@rdfjs/data-model" ;
import WhereBuilder from "./helpers/WhereBuilder";
import SparqlFactory from "./SparqlFactory";
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
    variables: Array<string>,
    order: Order,
    distinct: boolean,
    limit: number
  ):SelectQuery {
    const SparqlJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: distinct,
      variables: this.#varsToRDFJS(variables),
      type: "query",
      where: this.#createWhereClause(),
      prefixes: this.prefixes,
      order: this.#orderToRDFJS(
        order,
        this.#varsToRDFJS(variables)[0] as VariableTerm
      ),
      limit: (limit)?limit:undefined
    };

    // if the RdfJsQuery contains empty 'where' array, then the generator crashes.
    // create query with no triples
    if(SparqlJsQuery.where?.length === 0 ){
      SparqlJsQuery.where = [{
        type: 'bgp',
        triples: []
      }]
    }
    // if there are no variables defined just create the Wildcard e.g: *
    // note : this should not happen
    if(SparqlJsQuery?.variables?.length === 0) SparqlJsQuery.variables = [new Wildcard()];
    
    // post processing for defaultlabel property
    if(this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach(defaultLabelVar => this.#insertDefaultLabelVar(SparqlJsQuery, defaultLabelVar));
    }
    
    // don't set an order if there is no expression for it
    if(!SparqlJsQuery?.order || !SparqlJsQuery?.order[0]?.expression) delete SparqlJsQuery.order
    
    return SparqlJsQuery;
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

  #varsToRDFJS(variables: Array<string>): Variable[] {
    return variables.map((v) => {
      return DataFactory.variable(v.replace("?", ""));
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
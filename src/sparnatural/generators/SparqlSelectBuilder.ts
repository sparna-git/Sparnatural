import { Order } from "./ISparJson";
import ISpecProvider from "../spec-providers/ISpecProvider";
import {
  Ordering,
  SelectQuery,
  Variable,
  VariableTerm,
  Wildcard,
} from "sparqljs";
import Sparnatural from "../components/SparnaturalComponent";
import * as DataFactory from "@rdfjs/data-model" ;
import WhereBuilder from "./helpers/WhereBuilder";
/*
  Reads out the UI and creates the and sparqljs pattern. 
  sparqljs pattern builds pattern structure on top of rdfjs datamodel. see:https://rdf.js.org/data-model-spec/
  It goes recursively through all the grpWrappers and reads out their values.
*/
export default class RdfJsGenerator {
  typePredicate: string;
  specProvider: ISpecProvider;
  additionnalPrefixes: { [key: string]: string } = {};
  sparnatural: Sparnatural;
  defaultLabelVars:Variable[] = []// see: #checkForDefaultLabel()
  constructor(
    sparnatural: Sparnatural,
    typePredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    specProvider: ISpecProvider
  ) {
    this.sparnatural = sparnatural;
    this.typePredicate = typePredicate;
    this.specProvider = specProvider;
    this.additionnalPrefixes = {};
  }

  // add a new prefix to the generated query
  addPrefix(prefix: string | number, uri: any) {
    this.additionnalPrefixes[prefix] = uri;
  }

  setPrefixes(prefixes: any) {
    this.additionnalPrefixes = prefixes;
  }

  generateQuery(
    variables: Array<string>,
    distinct: boolean,
    order: Order
  ):SelectQuery {
    const RdfJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: distinct,
      variables: this.#varsToRDFJS(variables),
      type: "query",
      where: this.#createSelectQuery(),
      prefixes: {
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        xsd: "http://www.w3.org/2001/XMLSchema#",
      },
      order: this.#orderToRDFJS(
        order,
        this.#varsToRDFJS(variables)[0] as VariableTerm
      ),
    };

    for (var key in this.additionnalPrefixes) {
      RdfJsQuery.prefixes[key] = this.additionnalPrefixes[key];
    }

    // if the RdfJsQuery contains empty where array, then the generator crashes.
    // create query with no triples
    if(RdfJsQuery.where?.length === 0 ){
      RdfJsQuery.where = [{
        type: 'bgp',
        triples: []
      }]
    }
    // if there are no variables defined just create the Wildcard e.g: *
    if(RdfJsQuery?.variables?.length === 0) RdfJsQuery.variables = [new Wildcard()];
    // post processing for defaultlabel property
    if(this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach(defaultLabelVar => this.#insertDefaultLabelVar(RdfJsQuery, defaultLabelVar));
    }
    // don't set an order if there is no expression for it
    if(!RdfJsQuery?.order || !RdfJsQuery?.order[0]?.expression) delete RdfJsQuery.order
    
    return RdfJsQuery;
  }

  #createSelectQuery(){
    const builder = new WhereBuilder(this.sparnatural.BgWrapper.componentsList.rootGroupWrapper,this.specProvider,false,false)
    builder.build()
    this.defaultLabelVars = builder.getDefaultVars()
    return builder.getResultPtrns()
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
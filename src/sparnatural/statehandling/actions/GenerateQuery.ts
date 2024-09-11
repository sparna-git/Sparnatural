import { getSettings } from "../../../sparnatural/settings/defaultSettings";

import ActionStore from "../ActionStore";
import SparnaturalJsonGenerator from "../../generators/json/SparnaturalJsonGenerator";
import SparqlGenerator from "../../generators/sparql/SparqlGenerator";
import {
  Generator
} from "sparqljs";
import { SparnaturalElement } from "../../../SparnaturalElement";
import { ISparJson } from "../../generators/json/ISparJson";


export class QueryGenerator {
  actionStore:ActionStore

  constructor(actionStore:ActionStore) {
    this.actionStore = actionStore
  }

  generateQuery():QueryUpdatedPayload {
    // if we are quiet, don't do anything
    if(this.actionStore.quiet) {
      return;
    }
    // if the query editor is empty, don't do anything
    if(this.actionStore.sparnatural.isEmpty()) {
      return;
    }

    // triggered when Sparnatural is submitted : generates output SPARQL query
    let settings = getSettings();
    let qryGen = new SparnaturalJsonGenerator(this.actionStore.sparnatural);

    var jsonQuery = qryGen.generateQuery(
      this.actionStore.sparnatural.variableSection.listVariables(),
      this.actionStore.sparnatural.variableSection.getOrder(),
      getSettings().addDistinct    
    );

    if (jsonQuery != null) {
      if(getSettings().debug){
        console.log("*** Sparnatural JSON Query ***");
        console.dir(jsonQuery);
      }

      var writer = new SparqlGenerator(
        this.actionStore.sparnatural,
        this.actionStore.specProvider,
        settings.sparqlPrefixes
      );
      let selectQuery = writer.generateQuery(
        this.actionStore.sparnatural.variableSection.listVariables(),
        this.actionStore.sparnatural.variableSection.getOrder(),
        getSettings().addDistinct,      
        getSettings().limit
      );

      // debug rdfJsQuery
      if(getSettings().debug){
        // prints the SPARQL generated from the writing of the JSON data structure
        console.log("*** Sparnatural SPARQL Query ***");
        console.log(selectQuery);
      } 

      var generator = new Generator();
      var queryString = generator.stringify(selectQuery);
      
      // fire the event
      let payload:QueryUpdatedPayload = {
        queryString:queryString,
        queryJson:jsonQuery,
        querySparqlJs:selectQuery
      };
      this.fireQueryUpdatedEvent(payload);

      // re-enable submit button if it was disabled
      // note that the submitSection may not be present in case submitButton = false in the attributes
      this.actionStore.sparnatural.submitSection?.enableSubmit();

    }
  }

  fireQueryUpdatedEvent(payload: QueryUpdatedPayload) {
    // fire the event
    this.actionStore.sparnatural.html[0].dispatchEvent(new CustomEvent(SparnaturalElement.EVENT_QUERY_UPDATED, {
      bubbles: true,
      detail: payload
    }));
  }
}

export class QueryUpdatedPayload {
  queryString:string
  queryJson:ISparJson
  querySparqlJs:Object

}

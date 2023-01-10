import { getSettings } from "../../../sparnatural/settings/defaultSettings";

import ActionStore from "../ActionStore";
import SparnaturalJsonGenerator from "../../generators/SparnaturalJsonGenerator";
import RdfJsGenerator from "../../generators/SparqlSelectBuilder";
import {
  Generator
} from "sparqljs";
import { SparnaturalElement } from "../../../SparnaturalElement";

export default function generateQuery(actionStore: ActionStore) {
  // if we are quiet, don't do anything
  if(actionStore.quiet) {
    return;
  }
  // if the query editor is empty, don't do anything
  if(actionStore.sparnatural.isEmpty()) {
    return;
  }

  // triggered when Sparnatural is submitted : generates output SPARQL query
  let settings = getSettings();
  let qryGen = new SparnaturalJsonGenerator(actionStore.sparnatural);

  var jsonQuery = qryGen.generateQuery(
    actionStore.variables,
    actionStore.order,
    getSettings().addDistinct    
  );
  actionStore.sparnaturalJSON = jsonQuery
  if (jsonQuery != null) {
    if(getSettings().debug){
      console.log("*** Sparnatural JSON Data structure ***");
      console.dir(jsonQuery);
      console.log(JSON.stringify(jsonQuery, null, 4));
    }

    var writer = new RdfJsGenerator(
      actionStore.sparnatural,
      settings.typePredicate,
      actionStore.specProvider,
      settings.sparqlPrefixes
    );
    let selectQuery = writer.generateQuery(
      actionStore.variables,
      actionStore.order,
      getSettings().addDistinct,      
      getSettings().limit
    );
    actionStore.rdfjsSelect = selectQuery
    // debug rdfJsQuery
    if(getSettings().debug){
      // prints the SPARQL generated from the writing of the JSON data structure
      console.log("*** New SPARQL from JSON data structure ***");
      console.log(selectQuery);
    } 

    var generator = new Generator();
    var queryString = generator.stringify(selectQuery);
      actionStore.sparqlString = queryString
    // fire the event
    actionStore.sparnatural.html[0].dispatchEvent(new CustomEvent(SparnaturalElement.EVENT_QUERY_UPDATED, {
      bubbles: true,
      detail: {
        queryString:queryString,
        queryJson:jsonQuery,
        querySparqlJs:selectQuery
      }
    }));
  }
}

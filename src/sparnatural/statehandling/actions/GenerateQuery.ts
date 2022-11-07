import { getSettings } from "../../../sparnatural/settings/defaultSettings";

import ActionStore from "../ActionStore";
import SparnaturalJsonGenerator from "../../generators/SparnaturalJsonGenerator";
import RdfJsGenerator from "../../generators/SparqlSelectBuilder";
import {
  Generator
} from "sparqljs";

export default function generateQuery(actionStore: ActionStore) {
  // triggered when Sparnatural is submitted : generates output SPARQL query
  let settings = getSettings();
  let qryGen = new SparnaturalJsonGenerator(actionStore.sparnatural);

  var jsonQuery = qryGen.generateQuery(
    actionStore.variables,
    actionStore.distinct,
    actionStore.order
  );
  actionStore.sparnaturalJSON = jsonQuery
  if (jsonQuery != null) {
    if(getSettings().debugJson){
      console.log("*** Sparnatural JSON Data structure ***");
      console.dir(jsonQuery);
      console.log(JSON.stringify(jsonQuery, null, 4));
    }

    var writer = new RdfJsGenerator(
      actionStore.sparnatural,
      settings.typePredicate,
      actionStore.specProvider
    );
    writer.setPrefixes(settings.sparqlPrefixes);
    let selectQuery = writer.generateQuery(
      actionStore.variables,
      actionStore.distinct,
      actionStore.order
    );
    actionStore.rdfjsSelect = selectQuery
    // debug rdfJsQuery
    if(getSettings().debugJson){
      // prints the SPARQL generated from the writing of the JSON data structure
      console.log("*** New SPARQL from JSON data structure ***");
      console.log(selectQuery);
    } 

    var generator = new Generator();
    var queryString = generator.stringify(selectQuery);
      actionStore.sparqlString = queryString
    // fire callback
    settings.onQueryUpdated(queryString, jsonQuery, actionStore.specProvider);
  }
}

import { getSettings } from "../../../configs/client-configs/settings";

import ActionStore from "../ActionStore";
import SparnaturalJsonGenerator from "../../sparql/SparnaturalJsonGenerator";
import RdfJsGenerator from "../../sparql/RdfJsQuery";
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
    actionStore.order,
    actionStore.language
  );
  if (jsonQuery != null) {
    console.log("*** Sparnatural JSON Data structure ***");
    console.dir(jsonQuery);
    console.log(JSON.stringify(jsonQuery, null, 4));

    // prints the SPARQL generated from the writing of the JSON data structure
    console.log("*** New SPARQL from JSON data structure ***");
    var writer = new RdfJsGenerator(
      actionStore.sparnatural,
      settings.typePredicate,
      actionStore.specProvider
    );
    writer.setPrefixes(settings.sparqlPrefixes);
    let rdfJsQuery = writer.generateQuery(
      actionStore.variables,
      actionStore.distinct,
      actionStore.order,
      actionStore.language
    );

    // debug rdfJsQuery
    console.log(rdfJsQuery);

    var generator = new Generator();
    var queryString = generator.stringify(rdfJsQuery);

    // fire callback
    settings.onQueryUpdated(queryString, jsonQuery, actionStore.specProvider);

    //TODO enable disable geying out the submitbtn
    //this.SubmitSection.enableSubmit();
  }
}

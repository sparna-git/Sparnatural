
import { getSettings } from "../../../configs/client-configs/settings";

import ActionStore from "../ActionStore";
import {QuerySPARQLWriter} from '../../sparql/Query'
import SparnaturalJsonGenerator from "../../sparql/SparnaturalJsonGenerator";

export default function generateQuery(actionStore: ActionStore) {
  // triggered when Sparnatural is submitted : generates output SPARQL query
  let settings = getSettings();
  let qryGen = new SparnaturalJsonGenerator(actionStore.sparnatural)

  var jsonQuery = qryGen.generateQuery(actionStore.variables,actionStore.distinct,actionStore.order,actionStore.language);
  if (jsonQuery != null) {
    console.log("*** New JSON Data structure ***");
    console.dir(jsonQuery)
    let jsonstring = JSON.stringify(jsonQuery, null, 4)
    console.log(JSON.stringify(jsonQuery, null, 4));
    
    // prints the SPARQL generated from the writing of the JSON data structure
    console.log("*** New SPARQL from JSON data structure ***");
    var writer = new QuerySPARQLWriter(
      settings.typePredicate,
      actionStore.specProvider
    );
    writer.setPrefixes(settings.sparqlPrefixes);
    console.log(writer.toSPARQL(jsonQuery));

    // fire callback
    settings.onQueryUpdated(
      writer.toSPARQL(jsonQuery),
      jsonQuery,
      actionStore.specProvider
    );

    //TODO enable disable geying out the submitbtn
    //this.SubmitSection.enableSubmit();
    
  }
}


import { getSettings } from "../../../configs/client-configs/settings";
import NewJSONQueryGenerator from "../../sparql/NewQueryGenerator";
import { QuerySPARQLWriter } from "../../sparql/Query";
import ActionStore from "../ActionStore";

export default function generateQuery(actionStore: ActionStore) {
  // triggered when Sparnatural is submitted : generates output SPARQL query
  let settings = getSettings();
  // prints the JSON query data structure on the console
  let qryGen = new NewJSONQueryGenerator(actionStore.sparnatural)

  var jsonQuery = qryGen.generateQuery(actionStore.variables,actionStore.distinct,actionStore.order,actionStore.language);
  if (jsonQuery != null) {
    console.log("*** New JSON Data structure ***");
    console.dir(jsonQuery)
    console.log(JSON.stringify(jsonQuery, null, 4));
    /*
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
    */
  }
}

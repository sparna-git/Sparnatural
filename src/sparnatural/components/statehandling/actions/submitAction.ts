import { getSettings } from "../../../../configs/client-configs/settings";
import { QuerySPARQLWriter } from "../../../sparql/Query";
import JSONQueryGenerator from "../../../sparql/QueryGenerators";
import ActionStore from "../ActionStore";


export default function submit(actionStore: ActionStore) {
    // triggered when Sparnatural is submitted : generates output SPARQL query
        let settings = getSettings()
        // prints the JSON query data structure on the console
        var jsonGenerator = new JSONQueryGenerator();
        //var jsonQuery = jsonGenerator.generateQuery(event.data.formObject);
        var jsonQuery = null
        if (jsonQuery != null) {
            console.log("*** New JSON Data structure ***");
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
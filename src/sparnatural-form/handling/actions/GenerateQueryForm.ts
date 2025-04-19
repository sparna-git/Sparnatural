import ActionStoreForm from "../ActionStore";
import { Generator } from "sparqljs";
import { ISparJson } from "../../../sparnatural/ISparJson";
import JsonSparqlTranslator from "../../../sparnatural/generators/sparql/fromjson/JsonSparqlTranslator";
import CleanQuery from "../../components/CleanQuery";

export class QueryGeneratorForm {
  actionStoreForm: ActionStoreForm;

  constructor(actionStoreForm: ActionStoreForm) {
    this.actionStoreForm = actionStoreForm;
  }

  generateQuery(resultType: "onscreen" | "export"): QueryUpdatedPayload {
    // If in quiet mode, do nothing
    if (this.actionStoreForm.quiet) {
      return;
    }

    // If the form is empty, do nothing
    if (this.actionStoreForm.sparnaturalForm.isEmpty()) {
      return;
    }

    // Step 1: Handle optional branches to get the clean query result
    const sparnaturalForm = this.actionStoreForm.sparnaturalForm;
    sparnaturalForm.HandleOptional();

    // Step 2: Retrieve the last cleaned query
    let queryToUse: ISparJson = sparnaturalForm.cleanQueryResult;

    // Step 3: Further clean the query using CleanQuery for final processing
    const cleanQueryProcessor = new CleanQuery(
      queryToUse,
      sparnaturalForm.formConfig
    );
    const finalCleanQuery = cleanQueryProcessor.cleanQueryToUse(
      resultType
    );

    //console.log("Final Clean Query for SPARQL generation:", finalCleanQuery);

    // Step 4: Translate the final clean query into SPARQL
    const settings = sparnaturalForm.settings;
    const sparqlTranslator = new JsonSparqlTranslator(
      this.actionStoreForm.specProvider,
      settings
    );

    const sparqlJsQuery = sparqlTranslator.generateQuery(finalCleanQuery);
    const generator = new Generator();
    const queryStringFromJson = generator.stringify(sparqlJsQuery);

    // Step 5: Create a payload with the generated SPARQL query
    const queryPayload: QueryUpdatedPayload = {
      queryString: queryStringFromJson,
      queryJson: finalCleanQuery,
    };

    // Step 6: Dispatch the event to update the editor and notify components
    this.fireQueryUpdatedEvent(queryPayload);
    console.log("result Type :", resultType);
    // Re-enable the submit button if it was disabled
    sparnaturalForm.SubmitSection.enableSubmit();

    return queryPayload; // Optionally return the payload for further use
  }

  fireQueryUpdatedEvent(payload: QueryUpdatedPayload) {
    // Dispatch an event to notify other components
    this.actionStoreForm.sparnaturalForm.html[0].dispatchEvent(
      new CustomEvent("queryUpdated", {
        bubbles: true,
        detail: payload,
      })
    );
  }
}

export class QueryUpdatedPayload {
  queryString: string;
  queryJson: ISparJson;
}

import { getSettings } from "../../settings/defaultsSettings";
import ActionStoreForm from "../ActionStoreForm";
import { Generator } from "sparqljs";
import { ISparJson } from "../../../sparnatural/generators/json/ISparJson";
import JsonSparqlTranslator from "../../../sparnatural/generators/sparql/fromjson/JsonSparqlTranslator";

export class QueryGeneratorForm {
  actionStoreForm: ActionStoreForm;

  constructor(actionStoreForm: ActionStoreForm) {
    this.actionStoreForm = actionStoreForm;
  }

  generateQuery(): QueryUpdatedPayload {
    // if we are quiet, don't do anything
    if (this.actionStoreForm.quiet) {
      return;
    }
    // if the query editor is empty, don't do anything
    if (this.actionStoreForm.sparnaturalForm.isEmpty()) {
      return;
    }

    // Utiliser JsonSparqlTranslator pour convertir la requête JSON nettoyée en SPARQL
    const jsonQuery = this.actionStoreForm.sparnaturalForm.jsonQuery;

    console.log("Query generated here", jsonQuery);
    let settings = getSettings();
    console.log("settingsFORM", settings);
    const sparqlTranslator = new JsonSparqlTranslator(
      this.actionStoreForm.specProvider,
      settings
    );
    console.log("sparqlTranslator", sparqlTranslator);
    console.log("actionStoreForm", this.actionStoreForm);
    console.log("sparqlPrefixesForm", settings.sparqlPrefixes);

    // Générer la requête SPARQL depuis JSON
    console.log("json", jsonQuery);

    const sparqlJsQuery = sparqlTranslator.generateQuery(jsonQuery);
    console.log("Query generated 0", sparqlJsQuery);

    const generator = new Generator();
    const queryStringFromJson = generator.stringify(sparqlJsQuery);

    console.log("Query generated 0.5", queryStringFromJson);

    // Créer un payload avec la requête générée
    const queryPayload: QueryUpdatedPayload = {
      queryString: queryStringFromJson,
      queryJson: jsonQuery,
      querySparqlJs: sparqlJsQuery,
      queryStringFromJson: queryStringFromJson,
    };
    console.log("Query generated 1", queryStringFromJson);

    // Déclencher l'événement pour notifier que la requête a été mise à jour
    this.fireQueryUpdatedEvent(queryPayload);
    console.log("Query generated 2", queryPayload);
    return queryPayload;
  }

  fireQueryUpdatedEvent(payload: QueryUpdatedPayload) {
    // Déclencher l'événement pour notifier les autres composants
    this.actionStoreForm.sparnaturalForm.html[0].dispatchEvent(
      new CustomEvent("queryUpdated", {
        bubbles: true,
        detail: payload,
      })
    );
    console.log("Query updated event fired", payload);
  }
}

export class QueryUpdatedPayload {
  queryString: string;
  queryJson: ISparJson;
  querySparqlJs: Object;
  queryStringFromJson: string;
}

import { getSettings } from "../../settings/defaultsSettings";
import ActionStoreForm from "../ActionStore";
import { Generator } from "sparqljs";
import { ISparJson } from "../../../sparnatural/generators/json/ISparJson";
import JsonSparqlTranslator from "../../../sparnatural/generators/sparql/fromjson/JsonSparqlTranslator";

export class QueryGeneratorForm {
  actionStoreForm: ActionStoreForm;

  constructor(actionStoreForm: ActionStoreForm) {
    this.actionStoreForm = actionStoreForm;
  }

  generateQuery(): QueryUpdatedPayload {
    // Si on est en mode "quiet", ne rien faire
    if (this.actionStoreForm.quiet) {
      return;
    }

    // Si le formulaire est vide, ne rien faire
    if (this.actionStoreForm.sparnaturalForm.isEmpty()) {
      return;
    }

    // Récupérer la clean query si elle est disponible, sinon utiliser la jsonQuery
    const sparnaturalForm = this.actionStoreForm.sparnaturalForm;
    let queryToUse: ISparJson;

    // Nettoyer la requête pour obtenir une version à jour
    sparnaturalForm.cleanQuery();

    // Utiliser la cleanQuery si elle existe, sinon jsonQuery
    queryToUse = this.actionStoreForm.sparnaturalForm.cleanQueryResult;

    console.log("Query utilisée pour la génération :", queryToUse);

    // Utiliser JsonSparqlTranslator pour convertir la requête en SPARQL
    const settings = getSettings();
    const sparqlTranslator = new JsonSparqlTranslator(
      this.actionStoreForm.specProvider,
      settings
    );

    const sparqlJsQuery = sparqlTranslator.generateQuery(queryToUse);
    const generator = new Generator();
    const queryStringFromJson = generator.stringify(sparqlJsQuery);

    // Créer un payload avec la requête générée
    const queryPayload: QueryUpdatedPayload = {
      queryString: queryStringFromJson,
      queryJson: queryToUse,
    };

    // Déclencher l'événement pour notifier que la requête a été mise à jour
    this.fireQueryUpdatedEvent(queryPayload);

    // re-enable submit button if it was disabled
    this.actionStoreForm.sparnaturalForm.SubmitSection.enableSubmit();
  }

  fireQueryUpdatedEvent(payload: QueryUpdatedPayload) {
    // Déclencher l'événement pour notifier les autres composants
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

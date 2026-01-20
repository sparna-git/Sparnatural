import { getSettings } from "../../../sparnatural/settings/defaultSettings";

import ActionStore from "../ActionStore";
import { SparnaturalJsonGenerator } from "../../generators/json/SparnaturalJsonGenerator";
import { SparnaturalJsonGeneratorV13 } from "../../generators/json/SparnaturalJson-v13Generator";
import { Generator } from "sparqljs";
import { SparnaturalElement } from "../../../SparnaturalElement";
import { SparnaturalQueryIfc } from "../../SparnaturalQueryIfc";
import { SparnaturalQuery } from "../../SparnaturalQueryIfc-v13";
import { JsonSparqlTranslator } from "../../generators/sparql/fromjson/JsonSparqlTranslator";
import { JsonV13SparqlTranslator } from "../../generators/sparql/fromjsonv13/JsonV13SparqlTranslator";

export class QueryGenerator {
  actionStore: ActionStore;

  constructor(actionStore: ActionStore) {
    this.actionStore = actionStore;
  }

  generateQuery(): QueryUpdatedPayload {
    // if we are quiet, don't do anything
    if (this.actionStore.quiet) {
      return;
    }
    // if the query editor is empty, don't do anything
    if (this.actionStore.sparnatural.isEmpty()) {
      return;
    }

    // triggered when Sparnatural is submitted : generates output SPARQL query
    let settings = getSettings();
    let qryGen = new SparnaturalJsonGenerator(this.actionStore.sparnatural);

    var jsonQuery = qryGen.generateQuery(
      this.actionStore.sparnatural.variableSection.listVariables(),
      this.actionStore.sparnatural.variableSection.getOrder(),
      settings.addDistinct,
      settings.limit
    );

    // --------------------------------------------------------------
    // Generate v13 query

    let qryGenV13 = new SparnaturalJsonGeneratorV13(
      this.actionStore.sparnatural
    );

    var jsonQueryV13 = qryGenV13.generateQuery(
      this.actionStore.sparnatural.variableSection.listVariables(),
      this.actionStore.sparnatural.variableSection.getOrder(),
      settings.addDistinct,
      settings.limit
    );

    //console.log("Generated JSON v13 Query:", jsonQueryV13);

    // --------------------------------------------------------------

    if (settings.debug) {
      console.log("*** Sparnatural JSON Query ***");
      console.dir(jsonQuery);
    }

    var sparqlFromJsonGenerator = new JsonSparqlTranslator(
      this.actionStore.specProvider,
      settings
    );

    let selectQueryFromJson = sparqlFromJsonGenerator.generateQuery(jsonQuery);

    var generator = new Generator();
    var queryString = generator.stringify(selectQueryFromJson);

    if (settings.debug) {
      console.log("*** Sparnatural SPARQL Query from JSON ***");
      console.dir(queryString);
    }

    // --------------------------------------------------------------
    // Translate the v13 JSON to SPARQL

    var sparqlFromJsonV13Generator = new JsonV13SparqlTranslator(
      this.actionStore.specProvider,
      settings
    );

    let selectQueryFromJsonV13 =
      sparqlFromJsonV13Generator.generateQuery(jsonQueryV13);

    var generatorV13 = new Generator();
    var queryStringV13 = generatorV13.stringify(selectQueryFromJsonV13);

    //console.log("Generated SPARQL v13 Query:", queryStringV13);

    // --------------------------------------------------------------

    // fire the event
    let payload: QueryUpdatedPayload = {
      queryString: queryString,
      queryStringV13: queryStringV13,
      queryJson: jsonQuery,
      newQueryJson: jsonQueryV13,
      querySparqlJs: selectQueryFromJson,
    };
    this.fireQueryUpdatedEvent(payload);

    // re-enable submit button if it was disabled
    // note that the submitSection may not be present in case submitButton = false in the attributes
    this.actionStore.sparnatural.submitSection?.enableSubmit();
  }

  fireQueryUpdatedEvent(payload: QueryUpdatedPayload) {
    // fire the event
    this.actionStore.sparnatural.html[0].dispatchEvent(
      new CustomEvent(SparnaturalElement.EVENT_QUERY_UPDATED, {
        bubbles: true,
        detail: payload,
      })
    );
  }
}

export class QueryUpdatedPayload {
  queryString: string;
  queryStringV13: string;
  queryJson: SparnaturalQueryIfc;
  newQueryJson: SparnaturalQuery;
  querySparqlJs: Object;
}

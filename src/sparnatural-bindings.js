/**
 * Binds Sparnatural with its YasR plugins, by notifying them of
 * the configuration and of the query being executed.
 *
 * - On sparnatural `init` event : calls notifyConfiguration(specProvider) on each Yasr plugin
 * - On sparnatural `queryUpdated` event : calls notifyQuery(queryJson) on each Yasr plugin
 **/
bindSparnaturalWithYasrPlugins = function (sparnatural, yasr) {
  sparnatural.addEventListener("init", (event) => {
    // notify the specification to yasr plugins
    for (const plugin in yasr.plugins) {
      if (yasr.plugins[plugin].notifyConfiguration) {
        yasr.plugins[plugin].notifyConfiguration(
          sparnatural.sparnatural.specProvider
        );
      }
    }
  });

  sparnatural.addEventListener("queryUpdated", (event) => {
    // notify the query to yasr plugins
    for (const plugin in yasr.plugins) {
      if (yasr.plugins[plugin].notifyQuery) {
        yasr.plugins[plugin].notifyQuery(event.detail.queryJson);
      }
    }
  });
};

/**
 * Binds Sparnatural with the SparnaturalHistoryComponent.
 *
 * - On sparnatural `init` event : injects the specProvider into sparnatural-history
 * - On sparnatural `queryUpdated` event : dispatches custom queryUpdated event for history
 * - On sparnatural `submit` event : dispatches custom submit event to trigger query saving
 */
bindSparnaturalWithHistory = function (sparnatural) {
  let lastquery = null;

  sparnatural.addEventListener("init", () => {
    const specProvider = sparnatural?.sparnatural?.specProvider;
    const historyElement = document.querySelector("sparnatural-history");

    if (
      historyElement?.sparnaturalHistory &&
      typeof historyElement.sparnaturalHistory.setSpecProvider === "function"
    ) {
      if (specProvider) {
        historyElement.sparnaturalHistory.setSpecProvider(specProvider);
        console.log("SpecProvider injected into sparnatural-history");
      } else {
        console.log(
          "SpecProvider not available, history will use fallback labels"
        );
      }
    } else {
      console.warn("sparnatural-history not ready or missing setSpecProvider");
    }

    // 🔁 Écouteur pour charger une requête depuis l'historique
    historyElement?.addEventListener("loadQuery", (event) => {
      const query = event.detail.query;
      sparnatural.loadQuery(query);
    });
  });

  sparnatural.addEventListener("queryUpdated", (event) => {
    lastquery = event.detail.queryJson;
  });

  sparnatural.addEventListener("submit", () => {
    // use saveQuery method from history component
    if (historyElement && typeof historyElement.saveQuery === "function") {
      historyElement.saveQuery(lastquery);
    } else {
      console.warn("Impossible d'appeler saveQuery sur sparnatural-history.");
    }
  });
};

/**
 * Binds Sparnatural with a Yasqe query editor, by setting the generated SPARQL value
 * in the query editor. Yasqe is responsible for executing the query and passing results to yasr.
 *
 * - On sparnatural `queryUpdated` event : expands the SPARQL query and calls yasqe.setValue(finalQueryString)
 * - On sparnatural `submit` event : disables Sparnatural play button and calls yasqe.query() that triggers the actual query
 * - On sparnatural `reset` event : calls yasqe.setValue("") with an empty string to clean the SPARQL query
 * - On yasqe `queryResponse` event : calls sparnatural.enablePlayButton() to re-enable the play button, and calls yasr.setResponse()
 * to display the query results
 **/
bindSparnaturalWithYasqe = function (sparnatural, yasqe, yasr) {
  sparnatural.addEventListener("queryUpdated", (event) => {
    queryString = sparnatural.expandSparql(event.detail.queryString);
    yasqe.setValue(queryString);
    if (document.getElementById("query-json") != null) {
      // save query in JSON
      document.getElementById("query-json").value = JSON.stringify(
        event.detail.queryJson
      );
    }
  });

  sparnatural.addEventListener("submit", (event) => {
    // enable loader on button
    sparnatural.disablePlayBtn();
    // trigger the query from YasQE
    yasqe.query();
  });

  sparnatural.addEventListener("reset", (event) => {
    yasqe.setValue("");
  });

  // link yasqe and yasr
  yasqe.on("queryResponse", function (_yasqe, response, duration) {
    yasr.setResponse(response, duration);
    sparnatural.enablePlayBtn();
  });
};

/**
 * Binds Sparnatural with a query executed by Sparnatural itself, using yasqe as a read-only query editor.
 *
 *
 * - On sparnatural `queryUpdated` event : expands the SPARQL query and calls yasqe.setValue(finalQueryString)
 * - On sparnatural `submit` event : disables Sparnatural play button and calls sparnatural.executeSparql() with query retrieved from yasqe.
 * The submit uses a callback that will update yasr
 * - On sparnatural `reset` event : calls yasqe.setValue("") with an empty string to clean the SPARQL query
 **/
bindSparnaturalWithItself = function (sparnatural, yasqe, yasr) {
  sparnatural.addEventListener("queryUpdated", (event) => {
    queryString = sparnatural.expandSparql(event.detail.queryString);
    yasqe.setValue(queryString);
    if (document.getElementById("query-json") != null) {
      // save query in JSON
      document.getElementById("query-json").value = JSON.stringify(
        event.detail.queryJson
      );
    }
  });

  sparnatural.addEventListener("submit", (event) => {
    // enable loader on button
    sparnatural.disablePlayBtn();

    let finalResult = sparnatural.executeSparql(
      yasqe.getValue(),
      (finalResult) => {
        // send final result to YasR
        yasr.setResponse(finalResult);
        // re-enable submit button
        sparnatural.enablePlayBtn();
      },
      (error) => {
        console.error("Got an error when executing SPARQL in Sparnatural");
        console.dir(error);
      }
    );
  });

  sparnatural.addEventListener("reset", (event) => {
    yasqe.setValue("");
  });
};

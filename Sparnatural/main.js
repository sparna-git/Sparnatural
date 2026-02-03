document.addEventListener("DOMContentLoaded", () => {
  // =============================================================================
  // 1. DOM REFERENCES
  // =============================================================================
  const sparnatural = document.querySelector("spar-natural");
  const historyComponent = document.querySelector("sparnatural-history");
  //const sparnaturalTextQuery = document.querySelector("sparnatural-text-query");
  const displayEndpoint = document.querySelector("#displayEndpoint");
  const selectExamples = document.getElementById("select-examples");

  if (!sparnatural) {
    console.error("spar-natural not found");
    return;
  }

  // =============================================================================
  // 2. STATE & CONFIGURATION
  // =============================================================================
  let sampleQueries = [];
  let lastQueryJson = null;
  const lang = new URLSearchParams(window.location.search).get("lang") || "en";

  // Set language on components
  if (lang === "en") {
    console.log(true);
    sparnatural.setAttribute("lang", "en");
    historyComponent?.setAttribute("lang", "en");
    //sparnaturalTextQuery?.setAttribute("lang", "en");
  }

  if (lang === "fr") {
    sparnatural.setAttribute("lang", "fr");
    historyComponent?.setAttribute("lang", "fr");
    //sparnaturalTextQuery?.setAttribute("lang", "fr");
  }

  // Display endpoint link
  if (displayEndpoint) {
    displayEndpoint.href = sparnatural.getAttribute("endpoint");
    displayEndpoint.textContent = sparnatural.getAttribute("endpoint");
  }

  // =============================================================================
  // 3. YASQE SETUP
  // =============================================================================
  const yasqe = new Yasqe(document.getElementById("yasqe"), {
    requestConfig: {
      endpoint: sparnatural.getAttribute("endpoint"),
      method: "GET",
    },
    copyEndpointOnNewTab: false,
  });

  // =============================================================================
  // 4. YASR SETUP
  // =============================================================================
  Yasr.registerPlugin("TableX", SparnaturalYasguiPlugins.TableX);
  Yasr.registerPlugin("Grid", SparnaturalYasguiPlugins.GridPlugin);
  Yasr.registerPlugin("Map", SparnaturalYasguiPlugins.MapPlugin);
  Yasr.registerPlugin("StatsPlugin", SparnaturalYasguiPlugins.StatsPlugin);
  delete Yasr.plugins["table"];

  const yasr = new Yasr(document.getElementById("yasr"), {
    pluginOrder: ["TableX", "Grid", "Map", "StatsPlugin", "response"],
    defaultPlugin: "TableX",
  });

  // Link YASQE response to YASR
  yasqe.on("queryResponse", (_, response, duration) => {
    yasr.setResponse(response, duration);
    sparnatural.enablePlayBtn();
  });

  // =============================================================================
  // 5. SPARNATURAL EVENT HANDLERS
  // =============================================================================

  // --- Init ---
  sparnatural.addEventListener("init", () => {
    // Configure YASR plugins
    for (const plugin in yasr.plugins) {
      yasr.plugins[plugin]?.notifyConfiguration?.(
        sparnatural.sparnatural.specProvider,
      );
    }

    // Configure history & text query components
    historyComponent?.notifyConfiguration(sparnatural.sparnatural.specProvider);
    //sparnaturalTextQuery?.notifyConfiguration(
    //  sparnatural.sparnatural.specProvider,
    //);

    // Load query from URL if present
    loadQueryFromUrl();
  });

  // --- Query Updated ---
  sparnatural.addEventListener("queryUpdated", (event) => {
    yasqe.setValue(sparnatural.expandSparql(event.detail.queryString));
    lastQueryJson = event.detail.queryJson;

    // Notify YASR plugins
    for (const plugin in yasr.plugins) {
      yasr.plugins[plugin]?.notifyQuery?.(event.detail.queryJson);
    }

    // Save query JSON
    document.getElementById("query-json").value = JSON.stringify(
      event.detail.queryJson,
    );
  });

  // --- Submit ---
  sparnatural.addEventListener("submit", () => {
    sparnatural.disablePlayBtn();
    yasqe.query();
    if (lastQueryJson) {
      historyComponent?.saveQuery(lastQueryJson);
    }
  });

  // =============================================================================
  // 6. UI ACTIONS
  // =============================================================================

  // --- Toggle SPARQL ---
  document.getElementById("sparql-toggle")?.addEventListener("click", (e) => {
    e.preventDefault();
    const yasqeEl = document.getElementById("yasqe");
    yasqeEl.style.display = yasqeEl.style.display === "none" ? "block" : "none";
    yasqe.refresh();
  });

  // --- Share ---
  document.getElementById("share")?.addEventListener("click", (e) => {
    e.preventDefault();
    const compressCodec = JsonUrl("lzma");

    compressCodec
      .compress(document.getElementById("query-json").value)
      .then((result) => {
        const url = window.location.pathname + "?query=" + result;
        const link = document.getElementById("share-link");
        link.href = url;
        link.textContent = "Requête partagée";
        new bootstrap.Modal(document.getElementById("shareModal")).show();
      });
  });

  // --- Export ---
  document.getElementById("export")?.addEventListener("click", (e) => {
    e.preventDefault();
    const jsonString = JSON.stringify(
      JSON.parse(document.getElementById("query-json").value),
      null,
      2,
    );
    document.getElementById("export-json").value = jsonString;
    new bootstrap.Modal(document.getElementById("exportModal")).show();
  });

  // --- Import ---
  document.getElementById("import")?.addEventListener("click", (e) => {
    e.preventDefault();
    new bootstrap.Modal(document.getElementById("importModal")).show();
  });

  document.getElementById("importButton")?.addEventListener("click", () => {
    const json = JSON.parse(document.getElementById("import-json").value);
    sparnatural.loadQuery(json);
    bootstrap.Modal.getInstance(document.getElementById("importModal"))?.hide();
  });

  // =============================================================================
  // 7. HISTORY & TEXT QUERY HANDLERS
  // =============================================================================

  // --- History load ---
  historyComponent?.addEventListener("loadQuery", (event) => {
    sparnatural.loadQuery(event.detail.query);
  });

  // --- History button ---
  document.getElementById("myCustomButton")?.addEventListener("click", () => {
    historyComponent?.openHistoryModal();
  });

  // --- Text query load ---
  /*
  sparnaturalTextQuery?.addEventListener("loadQuery", (event) => {
    const query = event.detail.query;
    console.log("Query to load:", query);
    sparnatural.loadQuery(query);

    // Auto-submit if no URI_NOT_FOUND
    if (!hasNotFound(query)) {
      setTimeout(() => sparnatural.dispatchEvent(new Event("submit")), 300);
    } else {
      console.log("Query contains URI_NOT_FOUND — loaded but not submitted.");
    }
  });*/

  // =============================================================================
  // 8. SAMPLE QUERIES
  // =============================================================================
  if (selectExamples) {
    queries.forEach((q, index) => {
      const label =
        lang === "fr" ? q.label_fr || q.label_en : q.label_en || q.label_fr;

      const option = document.createElement("option");
      option.value = index;
      option.textContent = label;

      selectExamples.appendChild(option);
      sampleQueries.push(q);
    });

    selectExamples.addEventListener("change", (e) => {
      const index = e.target.value;
      if (index === "none" || !sampleQueries[index]) return;
      sparnatural.loadQuery(sampleQueries[index].query);
    });
  }

  // =============================================================================
  // 9. HELPER FUNCTIONS
  // =============================================================================

  /**
   * Load query from URL parameter (?query=...)
   */
  function loadQueryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("query")) return;

    const compressedJson = urlParams.get("query");
    const compressCodec = JsonUrl("lzma");

    compressCodec.decompress(compressedJson).then((json) => {
      const queryJson = JSON.parse(json);

      sparnatural.loadQuery(queryJson);
      sparnatural.disablePlayBtn();

      yasqe.setValue(
        sparnatural.expandSparql(
          sparnatural.sparnatural.queryBuilder.buildQuery(queryJson),
        ),
      );

      sparnatural.executeSparql(
        yasqe.getValue(),
        (finalResult) => {
          yasr.setResponse(finalResult);
          sparnatural.enablePlayBtn();
        },
        (error) => {
          console.error("Error executing SPARQL from shared URL", error);
          sparnatural.enablePlayBtn();
        },
      );
    });
  }

  /**
   * Check if query contains URI_NOT_FOUND values
  
  function hasNotFound(node) {
    if (!node) return false;

    // Check line values
    if (
      node.line?.values?.some(
        (v) =>
          v.rdfTerm?.value ===
          "https://services.sparnatural.eu/api/v1/URI_NOT_FOUND",
      )
    ) {
      return true;
    }

    // Recurse on branches
    if (node.branches?.some(hasNotFound)) return true;

    // Recurse on children
    if (node.children?.some(hasNotFound)) return true;

    return false;
  }*/
});

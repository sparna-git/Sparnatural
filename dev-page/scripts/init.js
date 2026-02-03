/*
  This file shows how to integrate SparNatural into your website. 
*/

const sparnatural = document.querySelector("spar-natural");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
console.log("urlParams", urlParams);
const lang = urlParams.get("lang");
console.log("Configuration ", sparnatural.configuration);

// Declare yasr and yasqe at the top level so they can be used in event handlers
let yasr;
let yasqe;

sparnatural.addEventListener("init", (event) => {
  console.log("init sparnatural...");
  sparnatural.configuration = {
    headers: { "User-Agent": "This is Sparnatural calling" },
    autocomplete: {
      maxItems: 40,
    },
  };
  console.log("Configuration ", sparnatural.configuration);
  // Notify all plugins of configuration updates if they support it
  // Only if yasr is already initialized
  if (yasr && yasr.plugins) {
    for (const plugin in yasr.plugins) {
      if (yasr.plugins[plugin].notifyConfiguration) {
        console.log("notifying configuration for plugin " + plugin);
        yasr.plugins[plugin].notifyConfiguration(
          sparnatural.sparnatural.specProvider,
        );
        console.log("sparnatural", sparnatural.sparnatural.specProvider);
      }
    }
  }
});

sparnatural.addEventListener("queryUpdated", (event) => {
  var queryString = sparnatural.expandSparql(event.detail.queryString);
  console.log("Expanded query string Sparnatural:", queryString);
  yasqe.setValue(queryString);

  // store JSON in hidden field
  document.getElementById("query-json").value = JSON.stringify(
    event.detail.queryString,
  );

  // notify the query to yasr plugins
  for (const plugin in yasr.plugins) {
    if (yasr.plugins[plugin].notifyQuery) {
      yasr.plugins[plugin].notifyQuery(event.detail.queryString);
    }
  }
});

sparnatural.addEventListener("queryUpdated", (event) => {
  var queryStringOld = sparnatural.expandSparql(event.detail.queryStringOld);
  var queryString = sparnatural.expandSparql(event.detail.queryString);
  // Ajouter une ligne au tableau
  const tableBody = document.getElementById("sparql-comparison-table");
  const row = document.createElement("tr");
  const oldCell = document.createElement("td");
  oldCell.textContent = queryStringOld;
  row.appendChild(oldCell);
  const newCell = document.createElement("td");
  newCell.textContent = queryString;
  row.appendChild(newCell);
  const statusCell = document.createElement("td");
  statusCell.textContent = queryStringOld === queryString ? "OK" : "Pas OK";
  statusCell.classList.add(
    queryStringOld === queryString ? "table-success" : "table-danger",
  );
  row.appendChild(statusCell);
  tableBody.appendChild(row);
  // Mettre à jour le champ caché

  document.getElementById("query-json").value = JSON.stringify(
    event.detail.OldQueryJson,
  );

  document.getElementById("new-query-json").value = JSON.stringify(
    event.detail.queryJson,
  );

  // Notifier les plugins Yasr
  // notify the query to yasr plugins
  for (const plugin in yasr.plugins) {
    if (yasr.plugins[plugin].notifyQuery) {
      yasr.plugins[plugin].notifyQuery(event.detail.queryJson);
    }
  }
});

sparnatural.addEventListener("submit", (event) => {
  sparnatural.disablePlayBtn();
  // trigger the query from YasQE
  yasqe.query();
});

console.log("init yasr & yasqe...");
yasqe = new Yasqe(document.getElementById("yasqe"), {
  requestConfig: { endpoint: $("#endpoint").text() },
  copyEndpointOnNewTab: false,
});

Yasr.registerPlugin("TableX", SparnaturalYasguiPlugins.TableX);
Yasr.registerPlugin("Map", SparnaturalYasguiPlugins.MapPlugin);
Yasr.registerPlugin("GridPlugin", SparnaturalYasguiPlugins.GridPlugin);

// exemple pour passer un paramètre de config à un plugin
Yasr.plugins.TableX.defaults.openIriInNewWindow = true;

delete Yasr.plugins["table"];
yasr = new Yasr(document.getElementById("yasr"), {
  pluginOrder: ["TableX", "Response", "Map", "GridPlugin", "StatsPlugin"],
  defaultPlugin: "TableX",
  //this way, the URLs in the results are prettified using the defined prefixes in the query
  getUsedPrefixes: yasqe.getPrefixesFromQuery,
  drawOutputSelector: false,
  drawDownloadIcon: false,
  // avoid persistency side-effects
  persistency: { prefix: false, results: { key: false } },
});

// Link yasqe and yasr
yasqe.on("queryResponse", function (_yasqe, response, duration) {
  yasr.setResponse(response, duration);
  sparnatural.enablePlayBtn();
});

document.getElementById("switch-language").onclick = function () {
  document.querySelector("spar-natural").setAttribute("lang", "en");
  sparnatural.display();
};

document.getElementById("export").onclick = function () {
  var jsonString = JSON.stringify(
    JSON.parse(document.getElementById("query-json").value),
    null,
    2,
  );
  $("#export-json").val(jsonString);
  $("#exportModal").modal("show");
};

document.getElementById("newExport").onclick = function () {
  var jsonString = JSON.stringify(
    JSON.parse(document.getElementById("new-query-json").value),
    null,
    2,
  );
  $("#export-json").val(jsonString);
  $("#exportModal").modal("show");
};

document.getElementById("load").onclick = function () {
  $("#loadModal").modal("show");
};

document.getElementById("loadJson").onclick = function () {
  sparnatural.loadQuery(JSON.parse(document.getElementById("load-json").value));
  $("#loadModal").modal("hide");
};

document.getElementById("clear").onclick = function () {
  sparnatural.clear();
};

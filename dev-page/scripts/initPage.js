const sparnaturalForm = document.querySelector("sparnatural-form");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
console.log("urlParams", urlParams);
const lang = urlParams.get("lang");

console.log("init sparnaturalForm...");

sparnaturalForm.addEventListener("init", (event) => {
  sparnaturalForm.configuration = {
    headers: { "User-Agent": "This is SparnaturalForm calling" },
    autocomplete: {
      maxItems: 40,
    },
  };
});

sparnaturalForm.addEventListener("queryUpdated", (event) => {
  const queryStringFromJson = sparnaturalForm.expandSparql(
    event.detail.queryStringFromJson
  );
  console.log("queryStringFromJson", event.detail);

  // Mettre à jour YASQE avec la nouvelle requête SPARQL
  yasqe.setValue(queryStringFromJson);

  // Vérifier si l'élément avec l'ID "query-json" existe
  const queryJsonElement = document.getElementById("query-json");
  if (!queryJsonElement) {
    console.error("L'élément avec l'ID \"query-json\" est introuvable.");
    return;
  }

  // Stocker le JSON dans un champ caché
  queryJsonElement.value = JSON.stringify(event.detail.queryStringFromJson);

  // Notifier YASR pour les résultats
  yasr.setResponse(queryStringFromJson);
});

sparnaturalForm.addEventListener("submit", () => {
  sparnaturalForm.disablePlayBtn();
  // Trigger the query from YASQE
  yasqe.query();
});

console.log("init yasr & yasqe...");
const yasqe = new Yasqe(document.getElementById("yasqe"), {
  requestConfig: { endpoint: $("#endpoint").text() },
  copyEndpointOnNewTab: false,
});

Yasr.registerPlugin("TableX", SparnaturalYasguiPlugins.TableX);
Yasr.registerPlugin("Map", SparnaturalYasguiPlugins.MapPlugin);
delete Yasr.plugins["table"];
const yasr = new Yasr(document.getElementById("yasr"), {
  pluginOrder: ["TableX", "Response", "Map"],
  defaultPlugin: "TableX",
  // Prettify URLs using prefixes from the query
  getUsedPrefixes: yasqe.getPrefixesFromQuery,
  drawOutputSelector: false,
  drawDownloadIcon: false,
  persistency: { prefix: false, results: { key: false } },
});

// Link yasqe and yasr
yasqe.on("queryResponse", function (_yasqe, response, duration) {
  yasr.setResponse(response, duration);
  sparnaturalForm.enablePlayBtn();
});

document.getElementById("switch-language").onclick = function () {
  document.querySelector("sparnatural-form").setAttribute("lang", "en");
  sparnaturalForm.display();
};

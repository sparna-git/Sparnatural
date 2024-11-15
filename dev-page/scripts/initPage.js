// Select the Sparnatural form component
const sparnaturalForm = document.querySelector("sparnatural-form");

// Get language from URL parameters if specified
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
console.log("urlParams", urlParams);
const lang = urlParams.get("lang");

sparnaturalForm.addEventListener("init", (event) => {
  console.log("init sparnatural...");
  sparnaturalForm.configuration = {
    headers: { "User-Agent": "This is Sparnatural calling" },
    autocomplete: {
      maxItems: 40,
    },
  };
  console.log("Configuration ", sparnaturalForm.configuration);
  // Notify all plugins of configuration updates if they support it
  for (const plugin in yasr.plugins) {
    if (yasr.plugins[plugin].notifyConfiguration) {
      console.log("notifying configuration for plugin " + plugin);
      yasr.plugins[plugin].notifyConfiguration(
        sparnaturalForm.sparnaturalForm.specProvider
      );
      console.log("sparnatural", sparnaturalForm.sparnaturalForm.specProvider);
    }
  }
});

// Listen for updates to the query and pass to YASQE
sparnaturalForm.addEventListener("queryUpdated", (event) => {
  const queryStringFromJson = sparnaturalForm.expandSparql(
    event.detail.queryStringFromJson
  );
  console.log("queryStringFromJson", event.detail);

  // Update YASQE with the new SPARQL query
  yasqe.setValue(queryStringFromJson);
  console.log("yasr plugins", yasr.plugins);

  for (const plugin in yasr.plugins) {
    if (yasr.plugins[plugin].notifyQuery) {
      yasr.plugins[plugin].notifyQuery(event.detail.queryJson);
      console.log("notifying query for plugin " + plugin);
      console.log(true);
    }
  }
});

// Listen for form submission and trigger YASQE query
sparnaturalForm.addEventListener("submit", () => {
  sparnaturalForm.disablePlayBtn();
  yasqe.query();
});

console.log("init yasr & yasqe...");

// Initialize YASQE
const yasqe = new Yasqe(document.getElementById("yasqe"), {
  requestConfig: { endpoint: $("#endpoint").text() },
  copyEndpointOnNewTab: false,
});

Yasr.registerPlugin("TableX", SparnaturalYasguiPlugins.TableX);
Yasr.registerPlugin("GridPlugin", SparnaturalYasguiPlugins.GridPlugin);
Yasr.registerPlugin("Response", SparnaturalYasguiPlugins.Response);

// exemple pour passer un paramètre de config à un plugin
Yasr.plugins.TableX.defaults.openIriInNewWindow = true;

delete Yasr.plugins["table"];
delete Yasr.plugins["map"];
const yasr = new Yasr(document.getElementById("yasr"), {
  pluginOrder: ["TableX", "Response", "GridPlugin"],
  defaultPlugin: "TableX",
  //this way, the URLs in the results are prettified using the defined prefixes in the query
  getUsedPrefixes: yasqe.getPrefixesFromQuery,
  drawOutputSelector: false,
  drawDownloadIcon: false,
  // avoid persistency side-effects
  persistency: { prefix: false, results: { key: false } },
});

// Link YASQE and YASR so YASR displays query responses
yasqe.on("queryResponse", function (_yasqe, response, duration) {
  yasr.setResponse(response, duration);
  sparnaturalForm.enablePlayBtn();
});

// Function to toggle language in Sparnatural form
document.getElementById("switch-language").onclick = function () {
  const sparnaturalForm = document.querySelector("sparnatural-form");

  // Change language dynamically
  const currentLang = sparnaturalForm.getAttribute("lang");
  const newLang = currentLang === "fr" ? "en" : "fr";
  sparnaturalForm.setAttribute("lang", newLang);

  // Force form to re-render with new language
  sparnaturalForm.display();
};

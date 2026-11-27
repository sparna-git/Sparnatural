// The optional integration owns query execution and result rendering.
const sparnatural = document.querySelector("spar-natural");
const endpoint = document.getElementById("displayEndpoint");
endpoint.href = sparnatural.getAttribute("endpoint");
endpoint.textContent = endpoint.href;
const integration = SparnaturalLDForge.createSparnaturalLDForge(
  sparnatural, document.getElementById("ldforge"), { queryVisible: false, resultsContainer: document.getElementById("ldforge-results") },
);
document.getElementById("sparql-toggle").onclick = function () {
  integration.setQueryVisible(!integration.isQueryVisible());
  this.setAttribute("aria-expanded", String(integration.isQueryVisible()));
};
window.addEventListener("pagehide", event => {
  if (!event.persisted) integration.destroy();
});

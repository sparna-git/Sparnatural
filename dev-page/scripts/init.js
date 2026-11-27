/* The query builder remains independent of the optional LDForge integration. */
const sparnatural = document.querySelector("spar-natural");
const integration = SparnaturalLDForge.createSparnaturalLDForge(
  sparnatural, document.getElementById("ldforge"),
  { resultsContainer: document.getElementById("ldforge-results") },
);

sparnatural.addEventListener("queryUpdated", (event) => {
  document.getElementById("query-json").value = JSON.stringify(event.detail.queryJson);
  document.getElementById("old-query-json").value = JSON.stringify(event.detail.queryJson);
});

document.getElementById("switch-language").onclick = function () {
  sparnatural.setAttribute("lang", "en");
  sparnatural.display();
};
for (const [id, field] of [["export", "query-json"], ["oldExport", "old-query-json"]]) {
  document.getElementById(id).onclick = function () {
    document.getElementById("export-json").value = JSON.stringify(
      JSON.parse(document.getElementById(field).value), null, 2,
    );
    new bootstrap.Modal(document.getElementById("exportModal")).show();
  };
}
document.getElementById("load").onclick = function () {
  new bootstrap.Modal(document.getElementById("loadModal")).show();
};
document.getElementById("loadJson").onclick = function () {
  sparnatural.loadQuery(JSON.parse(document.getElementById("load-json").value));
  bootstrap.Modal.getInstance(document.getElementById("loadModal"))?.hide();
};
document.getElementById("clear").onclick = () => sparnatural.clear();
window.addEventListener("pagehide", event => {
  if (!event.persisted) integration.destroy();
});

const sparnaturalForm = document.querySelector("sparnatural-form");
const integration = SparnaturalLDForge.createSparnaturalLDForge(
  sparnaturalForm, document.getElementById("ldforge"),
  { resultsContainer: document.getElementById("ldforge-results") },
);
document.getElementById("switch-language").onclick = function () {
  const currentLang = sparnaturalForm.getAttribute("lang");
  sparnaturalForm.setAttribute("lang", currentLang === "fr" ? "en" : "fr");
  sparnaturalForm.display();
};
window.addEventListener("pagehide", event => {
  if (!event.persisted) integration.destroy();
});

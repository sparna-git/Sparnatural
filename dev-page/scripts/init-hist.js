const sparnaturalHistory = document.querySelector("sparnatural-history");

if (sparnaturalHistory) {
  console.log("sparnatural-history element found");

  // Écouter l'événement d'initialisation
  sparnaturalHistory.addEventListener("init", (event) => {
    console.log("sparnatural-history initialized");
  });

  // Écouter les mises à jour de requête pour mettre à jour l'historique
  sparnatural.addEventListener("queryUpdated", (event) => {
    console.log("Query updated, adding to history...");
    const queryJson = event.detail.queryJson;
    console.log("Tarek:", queryJson);
  });
} else {
  console.error("sparnatural-history element not found in DOM");
}

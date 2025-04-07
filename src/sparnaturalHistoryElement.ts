import SparnaturalHistoryComponent from "./sparnatural-history/component/sparnaturalHistoryComponent";
import { SparnaturalElement } from "./SparnaturalElement";
import LocalDataStorage from "./sparnatural-history/storage/LocalDataStorage";
import { ISparJson } from "./sparnatural/generators/json/ISparJson";
import QueryLoader from "./sparnatural/querypreloading/QueryLoader";
import SparnaturalComponent from "./sparnatural/components/SparnaturalComponent";
import { SparnaturalHistoryAttributes } from "./SparnaturalHistoryAttributes";
import { mergeSettings } from "./sparnatural-history/settings/defaultSettings";

export class SparnaturalHistoryElement extends HTMLElement {
  static HTML_ELEMENT_NAME = "sparnatural-history";
  static EVENT_INIT = "initHist";
  static EVENT_QUERY_UPDATED = "queryUpdated";

  // just to avoid name clash with "attributes"
  _attributes: SparnaturalHistoryAttributes;

  private lastQueryJson: ISparJson = null;

  sparnaturalHistory: SparnaturalHistoryComponent;
  sparnatural: SparnaturalComponent;

  constructor() {
    super();
    console.log("SparnaturalHistoryElement constructed");
  }

  connectedCallback() {
    console.log("SparnaturalHistoryElement connected to the DOM");
    this.display();

    // Ajouter l’écoute automatique des événements
    this.listenQueryUpdated();
    this.listenSubmit();
  }

  display() {
    console.log("Displaying SparnaturalHistoryComponent...");
    this.sparnaturalHistory = new SparnaturalHistoryComponent();
    $(this).empty();
    $(this).append(this.sparnaturalHistory.html);
    this._attributes = new SparnaturalHistoryAttributes(this);
    mergeSettings(this._attributes);
    this.sparnaturalHistory.render();
  }

  // Méthode pour écouter `queryUpdated`
  listenQueryUpdated() {
    document.addEventListener(
      SparnaturalHistoryElement.EVENT_QUERY_UPDATED,
      (event: Event) => {
        const customEvent = event as CustomEvent;
        this.lastQueryJson = customEvent.detail.queryJson;
      }
    );
  }

  // Méthode pour écouter `submit`
  listenSubmit() {
    document.addEventListener(SparnaturalElement.EVENT_SUBMIT, () => {
      if (this.lastQueryJson) {
        LocalDataStorage.getInstance().saveQuery(this.lastQueryJson);
      }
    });
  }

  loadQuery(query: ISparJson) {
    if (!this.sparnatural) {
      console.error(
        "Erreur: SparnaturalComponent n'est pas encore initialisé !"
      );
      // Vérifier si un élément <spar-natural> est présent dans le DOM
      const sparnaturalElement = document.querySelector("spar-natural") as any;
      if (sparnaturalElement && sparnaturalElement.sparnatural) {
        this.sparnatural = sparnaturalElement.sparnatural;
      } else {
        console.error("Impossible de récupérer SparnaturalComponent !");
        return;
      }
    }
    QueryLoader.setSparnatural(this.sparnatural);
    QueryLoader.loadQuery(query);
  }
}

customElements.get(SparnaturalHistoryElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(
    SparnaturalHistoryElement.HTML_ELEMENT_NAME,
    SparnaturalHistoryElement
  );

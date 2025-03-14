import SparnaturalHistoryComponent from "./sparnatural-history/component/sparnaturalHistoryComponent";
import { SparnaturalElement } from "./SparnaturalElement";
import LocalDataStorage from "./sparnatural-history/storage/LocalDataStorage";

export class SparnaturalHistoryElement extends HTMLElement {
  static HTML_ELEMENT_NAME = "sparnatural-history";
  static EVENT_INIT = "initHist";
  static EVENT_QUERY_UPDATED = "queryUpdated";

  private lastQueryJson: any = null;

  sparnaturalHistory: SparnaturalHistoryComponent;

  constructor() {
    super();
    console.log("SparnaturalHistoryElement constructed");
  }

  connectedCallback() {
    console.log("SparnaturalHistoryElement connected to the DOM");
    this.display();
  }

  display() {
    console.log("Displaying SparnaturalHistoryComponent...");
    this.sparnaturalHistory = new SparnaturalHistoryComponent();
    $(this).empty();
    $(this).append(this.sparnaturalHistory.html);
    this.sparnaturalHistory.render();
  }

  // ✅ Méthode pour écouter `queryUpdated`
  listenQueryUpdated() {
    document.addEventListener(
      SparnaturalHistoryElement.EVENT_QUERY_UPDATED,
      (event: Event) => {
        const customEvent = event as CustomEvent;
        this.lastQueryJson = customEvent.detail.queryJson;
      }
    );
  }

  // ✅ Méthode pour écouter `submit`
  listenSubmit() {
    document.addEventListener(SparnaturalElement.EVENT_SUBMIT, () => {
      if (this.lastQueryJson) {
        LocalDataStorage.getInstance().saveQuery(this.lastQueryJson);
      }
    });
  }
}

customElements.get(SparnaturalHistoryElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(
    SparnaturalHistoryElement.HTML_ELEMENT_NAME,
    SparnaturalHistoryElement
  );

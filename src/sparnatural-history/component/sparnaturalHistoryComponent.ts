import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import HistorySection from "./HistorySection";
import "datatables.net";
import { SparnaturalHistoryElement } from "../../sparnaturalHistoryElement";
import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n";
import { getSettings } from "../settings/defaultSettings";

class SparnaturalHistoryComponent extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  historySection: HistorySection;

  constructor() {
    super("SparnaturalHistory", null, null);
    console.log("SparnaturalHistoryComponent constructed");
  }

  render(): this {
    this.#initLang();
    console.log("🔍 Rendering SparnaturalHistoryComponent...");

    document.addEventListener("specProviderReady", (event) => {
      console.log("specProviderReady event received");
      const customEvent = event as CustomEvent;
      this.specProvider = customEvent.detail.specProvider;
      console.log("specProvider set:", this.specProvider);
      this.historySection = new HistorySection(
        this,
        this.specProvider
      ).render();

      // 📌 Déplacer .historySection après .variablesSelection une fois le rendu terminé
      setTimeout(() => {
        const historySection = document.querySelector(".historySection");
        const variablesSelection = document.querySelector(
          ".variablesSelection"
        );

        if (historySection && variablesSelection) {
          variablesSelection.parentNode.insertBefore(
            historySection,
            variablesSelection.nextSibling
          );
          console.log("✅ .historySection déplacé après .variablesSelection");
        } else {
          console.log(
            "⚠️ Impossible de déplacer .historySection : élément manquant"
          );
        }
      }, 0);

      this.html[0].dispatchEvent(
        new CustomEvent(SparnaturalHistoryElement.EVENT_INIT, {
          bubbles: true,
          detail: { sparnaturalHistory: this },
        })
      );
    });

    return this;
  }
  #initLang() {
    if (getSettings().language === "fr") {
      SparnaturalHistoryI18n.init("fr");
    } else {
      SparnaturalHistoryI18n.init("en");
    }
  }
}
export default SparnaturalHistoryComponent;

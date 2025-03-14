import "datatables.net";
import $, { get } from "jquery";
import LocalDataStorage from "../storage/LocalDataStorage";
import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import { Branch, ISparJson } from "../../sparnatural/generators/json/ISparJson";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import { SparnaturalElement } from "../../SparnaturalElement";
import QueryLoader from "../../sparnatural/querypreloading/QueryLoader";
import ConfirmationModal from "./ConfirmationModal";
import { Query } from "sparqljs";
import { QueryHistory } from "./QueryHistory";
import { SparnaturalHistoryElement } from "../../sparnaturalHistoryElement";

//sparnatural-history

class HistorySection extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  private confirmationModal: ConfirmationModal;

  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification
  ) {
    super("historySection", ParentComponent, null);
    this.specProvider = specProvider;
    this.confirmationModal = new ConfirmationModal();

    const historyElement = document.querySelector(
      "sparnatural-history"
    ) as SparnaturalHistoryElement;
    if (!historyElement) return;

    historyElement.listenQueryUpdated();
    historyElement.listenSubmit();
  }

  render(): this {
    super.render();
    let historyBtn = $('<button class="history-btn">📜 Historique</button>');
    historyBtn.on("click", () => this.showHistory());
    this.html.append(historyBtn);
    return this;
  }

  private async confirmAction(message: string): Promise<boolean> {
    const confirmed = await this.confirmationModal.show(message);
    if (!confirmed) {
      console.log("❌ Action annulée par l'utilisateur.");
    }
    return confirmed; // Return the confirmation status
  }

  showHistory() {
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();

    const options = {
      year: "numeric" as "numeric",
      month: "short" as "short",
      day: "numeric" as "numeric",
      hour: "2-digit" as "2-digit",
      minute: "2-digit" as "2-digit",
      second: "2-digit" as "2-digit",
      hour12: false,
    };

    if (!Array.isArray(history)) {
      console.error("❌ Erreur: L'historique n'est pas un tableau !");
      return;
    }

    // ✅ Supprimer proprement la modale et DataTables AVANT de recréer
    $(".history-overlay, #historyModal").remove();
    $("#queryHistoryTable_wrapper").remove();

    // ✅ Ajout de l'overlay
    $("body").append('<div class="history-overlay"></div>');
    $("body").addClass("history-modal-open");

    // ✅ Création propre de la table
    let modalHtml = `
      <div id="historyModal" class="history-modal">
        <div class="table-container">
          <table id="queryHistoryTable" class="display">
            <thead></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="history-actions">
          <button id="resetHistory" title="Vider l'historique"><i class="fas fa-eraser"></i></button>
        </div>
      </div>`;

    $("body").append(modalHtml);

    // ✅ Détruire DataTables s'il était déjà activé
    if ($.fn.DataTable.isDataTable("#queryHistoryTable")) {
      $("#queryHistoryTable").DataTable().destroy();
    }

    // ✅ Vider le tbody avant d'ajouter des lignes
    $("#queryHistoryTable tbody").empty();

    // ✅ Initialisation propre de DataTables avec les nouvelles colonnes
    $("#queryHistoryTable").DataTable({
      pageLength: 4,
      lengthMenu: [
        [4, 10, 25, 50, -1],
        [4, 10, 25, 50, "All"],
      ],
      scrollCollapse: true,
      destroy: true,
      autoWidth: false,
      data: history
        .map((entry) => {
          let parsedQuery;
          try {
            parsedQuery =
              typeof entry.queryJson === "string"
                ? JSON.parse(entry.queryJson)
                : entry.queryJson;
          } catch (error) {
            console.error(
              `❌ Impossible de parser la requête JSON de l'entrée ${entry.id}:`,
              error
            );
            return null;
          }

          const entityStype =
            parsedQuery?.branches?.[0]?.line?.sType || "Inconnu";
          // 🔹 Extraire l'entité principale (sujet de la requête)
          const entity = this.getEntityLabel(entityStype);

          return [
            `<button class="favorite-query" data-id="${entry.id}">
              <i class="favorite-icon ${
                entry.isFavorite ? "fas" : "far"
              } fa-star"></i>
            </button>`,
            entity, // 🔹 Ajout de l'entité principale
            this.formatQuerySummary(parsedQuery, this.specProvider),
            `<button class="load-query btn-orange" data-id="${entry.id}">Load query</button>
             <button class="delete-query btn-red" data-id="${entry.id}"><i class="fas fa-trash"></i></button>`,
            new Date(entry.date).toLocaleString("en-US", options),
          ];
        })
        .filter((row) => row !== null),
      columns: [
        { title: "Favori" },
        { title: "Entité" }, // ✅ Ajout de la colonne Entité (sujet de la requête)
        { title: "Résumé" },
        { title: "Actions", orderable: false },
        { title: "Date" },
      ],

      drawCallback: () => {
        $(".delete-query")
          .off("click")
          .on("click", async (event) => {
            const id = $(event.currentTarget).data("id");
            const confirmed = await this.confirmAction(
              "Voulez-vous vraiment supprimer cette requête ?"
            );
            if (confirmed) {
              storage.deleteQuery(id);
              this.showHistory();
            }
          });

        $(".load-query")
          .off("click")
          .on("click", (event) => this.loadQuery(event));

        $(".favorite-query")
          .off("click")
          .on("click", (event) => this.makeFavorite(event));

        this.initializeFavorites();
      },
    });

    $("#resetHistory").on("click", async () => {
      const confirmed = await this.confirmAction(
        "Voulez-vous vraiment vider l'historique ?"
      );
      if (confirmed) {
        this.clearHistory();
      }
    });

    $("#closeHistory, .history-overlay").on("click", () => {
      $("#historyModal, .history-overlay").remove();
      $("body").removeClass("history-modal-open");
    });

    this.initializeFavorites();
  }

  private loadQuery(event: JQuery.ClickEvent) {
    const id = $(event.currentTarget).data("id"); // Retrieve the query ID
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();

    const selectedEntry = history.find((q: QueryHistory) => q.id === id);
    if (!selectedEntry) {
      console.error("❌ Query not found in history.");
      return;
    }

    let parsedQuery;
    try {
      parsedQuery =
        typeof selectedEntry.queryJson === "string"
          ? JSON.parse(selectedEntry.queryJson)
          : selectedEntry.queryJson;
    } catch (error) {
      console.error("❌ Failed to parse query JSON:", error);
      return;
    }

    console.log("🔄 Loading query:", parsedQuery);
    QueryLoader.loadQuery(parsedQuery);

    // ✅ Forcer le repositionnement après chargement
    setTimeout(() => {
      const historySection = document.querySelector(".historySection");
      const variablesSelection = document.querySelector(".variablesSelection");

      if (historySection && variablesSelection) {
        variablesSelection.parentNode.insertBefore(
          historySection,
          variablesSelection.nextSibling
        );
        console.log(
          "✅ .historySection déplacé après .variablesSelection après chargement !"
        );
      } else {
        console.log(
          "⚠️ Impossible de déplacer .historySection après chargement"
        );
      }
    }, 0); // Attendre la fin du cycle de rendu
  }

  private makeFavorite(event: JQuery.ClickEvent) {
    const id = $(event.currentTarget).data("id");
    const storage = LocalDataStorage.getInstance();
    let history = storage.getHistory();

    let query = history.find((q: QueryHistory) => q.id === id);
    if (!query) return;

    query.isFavorite = !query.isFavorite;

    storage.set("queryHistory", history);

    // ✅ Met à jour l'icône immédiatement
    this.initializeFavorites();
  }

  private initializeFavorites() {
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();

    $(".favorite-query").each(function () {
      const id = $(this).data("id");
      const query = history.find((q: QueryHistory) => q.id === id);
      const icon = $(this).find("i");

      if (query && query.isFavorite) {
        icon
          .removeClass("far fa-star")
          .addClass("fas fa-star")
          .css("color", "#ffcc00");
      } else {
        icon
          .removeClass("fas fa-star")
          .addClass("far fa-star")
          .css("color", "#b5b5b5");
      }
    });
  }
  private formatQuerySummary(
    queryJson: ISparJson,
    specProvider: ISparnaturalSpecification
  ): string {
    let summary = `<div class="query-summary">`;

    const processBranch = (branch: Branch, depth = 0): string => {
      let result = "";
      let indentation = "&nbsp;".repeat(depth * 4);

      const startLabel = branch.line.sType
        ? specProvider.getEntity(branch.line.sType)?.getLabel() ||
          branch.line.sType
        : "Unknown Subject";

      const propLabel = branch.line.p
        ? specProvider.getProperty(branch.line.p)?.getLabel() || branch.line.p
        : "Unknown Predicate";

      const endLabel = branch.line.oType
        ? specProvider.getEntity(branch.line.oType)?.getLabel() ||
          branch.line.oType
        : "Unknown Object";

      let line = `${indentation}<strong>${startLabel}</strong> → ${propLabel} → <strong>${endLabel}</strong>`;

      if (branch.line.values.length > 0) {
        line += ` = ${branch.line.values.join(", ")}`; // Simplifié, à ajuster selon les widgets
      }

      result += line;

      if (branch.children && branch.children.length > 0) {
        result += `<br>${indentation}<strong>WHERE</strong> `;
        branch.children.forEach((child, index) => {
          if (index > 0) result += `<br>${indentation}<strong>AND</strong> `;
          result += processBranch(child, depth + 1);
        });
      }

      return result;
    };

    queryJson.branches.forEach((branch, index) => {
      if (index > 0) summary += `<br><strong>AND</strong> `;
      summary += processBranch(branch);
    });

    summary += `</div>`;
    return summary;
  }

  // get l entity du predicat en utilisant getLabel dans ISpecificationEntry
  private getEntityLabel(entityURI: string): string {
    // Récupérer le type de l'objet avec la méthode getProperty
    const object = this.specProvider.getEntity(entityURI);
    if (object) {
      return object.getLabel() || entityURI;
    } else {
      return entityURI;
    }
  }

  // Méthode pour retourner le label du prédicat en prenant le prédicat comme paramètre
  private getLabelpre(predicateURI: string): string {
    // Récupérer le label du predicat avec la méthode getProperty et ensuite getLabel
    const objectType = this.specProvider.getProperty(predicateURI);
    if (objectType) {
      return objectType.getLabel() || predicateURI;
    } else {
      return predicateURI;
    }
  }
  private clearHistory() {
    console.log("🗑️ Vider l'historique...");

    // Récupération de l'instance du stockage local
    const storage = LocalDataStorage.getInstance();

    // Suppression complète de l'historique
    storage.clearHistory();

    // Rafraîchir l'affichage de l'historique
    this.showHistory();

    console.log("✅ Historique vidé !");
  }
}

export default HistorySection;

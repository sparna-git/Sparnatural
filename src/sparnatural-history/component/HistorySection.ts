import "datatables.net";
import $, { get } from "jquery";
import LocalDataStorage from "../storage/LocalDataStorage";
import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import { Branch, ISparJson } from "../../sparnatural/generators/json/ISparJson";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import ConfirmationModal from "./ConfirmationModal";
import { VariableExpression, VariableTerm } from "sparqljs";
import { QueryHistory } from "./QueryHistory";
import { SparnaturalHistoryElement } from "../../sparnaturalHistoryElement";
import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n"; //
import { getSettings } from "../settings/defaultSettings";
import DateFilterModal from "./DateFilter";

class HistorySection extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  private confirmationModal: ConfirmationModal;
  private dateFilterModal: DateFilterModal;

  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification,
    dateFilterModal?: DateFilterModal
  ) {
    super("historySection", ParentComponent, null);
    this.specProvider = specProvider;
    this.confirmationModal = new ConfirmationModal();
    this.dateFilterModal = dateFilterModal || new DateFilterModal();

    const historyElement = document.querySelector(
      "sparnatural-history"
    ) as SparnaturalHistoryElement;
    if (!historyElement) return;

    historyElement.listenQueryUpdated();
    historyElement.listenSubmit();
    console.log("HistorySection constructed...");
  }

  render(): this {
    super.render();
    let historyBtn = $(
      `<button class="history-btn"><i class="fas fa-history"></i>${SparnaturalHistoryI18n.labels["historyButton"]}</button>`
    );
    historyBtn.on("click", () => this.showHistory());
    console.log("HistorySection render...");
    this.html.append(historyBtn);
    return this;
  }

  private async confirmAction(message: string): Promise<boolean> {
    const confirmed = await this.confirmationModal.show(message);
    if (!confirmed) {
      console.log("Action annulée par l'utilisateur.");
    }
    return confirmed; // Return the confirmation status
  }

  showHistory() {
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();

    if (!Array.isArray(history)) {
      console.error("Erreur: L'historique n'est pas un tableau !");
      return;
    }

    // Supprimer uniquement les éléments m odaux précédents
    $(".history-overlay, #historyModal, #queryHistoryTable_wrapper").remove();

    // Ajout de l'overlay et conteneur modal
    $("body").append('<div class="history-overlay"></div>');
    $("body").addClass("history-modal-open");

    let modalHtml = `
      <div id="historyModal" class="history-modal">
        <div class="table-container">
            
          <table id="queryHistoryTable" class="display">
            <tbody></tbody>
          </table>
        </div>
        <div class="history-actions">
          <button id="resetHistory">
            <strong>${SparnaturalHistoryI18n.labels["clearHistory"]}</strong>
            <i class="fas fa-eraser"></i>
          </button>
           <button id="closeHistory" class="btn-red">
            <strong>${SparnaturalHistoryI18n.labels["close"]}</strong>
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>`;
    $("body").append(modalHtml);

    // Tri personnalisé pour les favoris
    $.fn.dataTable.ext.type.order["custom-fav-pre"] = function (data: any) {
      return $(data).find("i").hasClass("fas") ? 1 : 0;
    };
    // Ajoute un filtre personnalisé DataTables pour la plage de dates
    $.fn.dataTable.ext.search.push(function (
      settings: any,
      data: any[],
      dataIndex: any
    ) {
      const min = $("#minDate").val() as string;
      const max = $("#maxDate").val() as string;
      const isoDateStr = data[4]; // colonne ISO invisible
      const date = new Date(isoDateStr);

      if ((!min || new Date(min) <= date) && (!max || new Date(max) >= date)) {
        return true;
      }
      return false;
    });

    $("#queryHistoryTable").empty(); // 🔥 Vide complètement le tableau

    //($.fn.DataTable.ext.pager as any).numbers_length = 4;

    $("#queryHistoryTable").DataTable({
      // add a function to destroy the thead element created at dt-scroll-body exactly in the table with id "queryHistoryTable"

      destroy: true,
      pageLength: 4,
      lengthMenu: [
        [4, 10, 25, 50, -1],
        [4, 10, 25, 50, "All"],
      ],
      scrollY: "400px",
      scrollCollapse: true,
      autoWidth: false,
      ordering: true,
      order: [],
      info: true,
      pagingType: "simple_numbers",

      language: {
        search: SparnaturalHistoryI18n.labels.search,
        lengthMenu: SparnaturalHistoryI18n.labels.entriesPerPage,
        info: SparnaturalHistoryI18n.labels.showingEntries,
        infoEmpty: SparnaturalHistoryI18n.labels.infoEmpty,
        infoFiltered: SparnaturalHistoryI18n.labels.infoFiltered,
        zeroRecords: SparnaturalHistoryI18n.labels.zeroRecords,
        emptyTable: SparnaturalHistoryI18n.labels.noData,
        paginate: {
          next: ">",
          previous: "<",
        },
      },

      columnDefs: [
        { targets: 0, orderable: true, type: "custom-fav" },
        { orderable: false, targets: [2, 4] },
      ],

      data: history
        .map((entry) => {
          let parsedQuery;
          try {
            parsedQuery =
              typeof entry.queryJson === "string"
                ? JSON.parse(entry.queryJson)
                : entry.queryJson;
          } catch (error) {
            return null;
          }

          const entityStype = this.getEntityType(parsedQuery);
          const entity = this.getEntityLabel(entityStype);

          const dateHist = new Date(entry.date);
          const dateDisplay = dateHist.toLocaleString(
            getSettings().language === "fr" ? "fr-FR" : "en-US"
          );
          const dateISO = dateHist.toISOString();

          return [
            `<button class="favorite-query" data-id="${entry.id}">
              <i class="favorite-icon ${
                entry.isFavorite ? "fas" : "far"
              } fa-star"></i>
            </button>`,
            entity,
            this.formatQuerySummary(parsedQuery, this.specProvider),
            dateDisplay, // visible column
            dateISO, // hidden column for filtering
            `<div class="actions-btn">
              <button class="load-query btn-orange" data-id="${entry.id}">
                <strong>${SparnaturalHistoryI18n.labels["loadQuery"]}</strong>
              </button>
              <button class="save-query btn-green" data-id="${entry.id}" title="${SparnaturalHistoryI18n.labels["copyQuery"]}">
                <i class="fas fa-copy"></i>
              </button>
              <button class="delete-query btn-red" data-id="${entry.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>`,
          ];
        })
        .filter((row) => row !== null),

      columns: [
        { title: SparnaturalHistoryI18n.labels["favorite"], searchable: false },
        { title: SparnaturalHistoryI18n.labels["entity"], searchable: false },
        { title: SparnaturalHistoryI18n.labels["summary"] },
        { title: SparnaturalHistoryI18n.labels["date"], searchable: false },
        { visible: false }, // colonne date ISO pour le filtre
        {
          title: SparnaturalHistoryI18n.labels["actions"],
          searchable: false,
          orderable: false,
        },
      ],

      // add a function to destroy the thead element created at dt-scroll-body exactly in the table with id "queryHistoryTable"

      drawCallback: () => {
        this.enableQuerySummaryScrollEffect();

        $(".delete-query")
          .off("click")
          .on("click", async (event) => {
            const id = $(event.currentTarget).data("id");
            const confirmed = await this.confirmAction(
              SparnaturalHistoryI18n.labels["confirmDelRequest"]
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
        // copy the query to the clipboard
        // copy the query to the clipboard
        $(".save-query")
          .off("click")
          .on("click", (event) => {
            const id = $(event.currentTarget).data("id");
            const query = history.find((q: QueryHistory) => q.id === id);
            if (!query) return;

            const queryString = JSON.stringify(query.queryJson, null, 2);

            navigator.clipboard
              .writeText(queryString)
              .then(() => {
                this.showToast(SparnaturalHistoryI18n.labels["MessageExport"]);
              })
              .catch((err) => {
                console.error("Erreur lors de la copie :", err);
                this.showToast("Échec de la copie", 4000);
              });
          });

        this.initializeFavorites();
      },
    });
    const layoutRow = $("#queryHistoryTable_wrapper .dt-layout-row").first(); // première ligne

    const dateIconCell = $(`
  <div class="dt-layout-cell" style="flex: 0 0 auto; display: flex; align-items: center; gap: 10px;">
    <div style="width: 10px;"></div> <!-- petit espace -->
    <button id="openDateFilter" class="btn-yellow">
      <i class="fas fa-calendar-alt"></i>
    </button>
  </div>
`);

    layoutRow.append(dateIconCell);

    $("#openDateFilter").on("click", () => this.dateFilterModal.open());

    $("#resetHistory").on("click", async () => {
      const confirmed = await this.confirmAction(
        SparnaturalHistoryI18n.labels["confirmClearHistory"]
      );
      if (confirmed) {
        this.clearHistory();
      }
    });

    $("#closeHistory, .history-overlay").on("click", () => {
      $("#historyModal, .history-overlay").remove();
      $("body").removeClass("history-modal-open");
    });

    // Rafraîchir le filtre quand on change les dates
    $("#minDate, #maxDate").on("change", () => {
      $("#queryHistoryTable").DataTable().draw();
    });

    this.initializeFavorites();

    // Supprime le thead dupliqué dans la table interne scrollable (zone .dt-scroll-body)
    $("#queryHistoryTable").find(".dt-scroll-body thead").remove();
  }

  private showToast(message: string, duration = 3000) {
    const toast = $(`
      <div class="custom-toast">
        <span class="toast-message">${message}</span>
      </div>
    `);

    $("body").append(toast);

    // Animate appearance
    toast.fadeIn(200);

    // Disappear after a delay
    setTimeout(() => {
      toast.fadeOut(400, () => toast.remove());
    }, duration);
  }

  private loadQuery(event: JQuery.ClickEvent) {
    const id = $(event.currentTarget).data("id"); // Récupérer l'ID de la requête
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();

    const selectedEntry = history.find((q: QueryHistory) => q.id === id);
    if (!selectedEntry) {
      console.error("Query not found in history.");
      return;
    }

    let parsedQuery;
    try {
      parsedQuery =
        typeof selectedEntry.queryJson === "string"
          ? JSON.parse(selectedEntry.queryJson)
          : selectedEntry.queryJson;
    } catch (error) {
      console.error("Failed to parse query JSON:", error);
      return;
    }

    console.log("Loading query:", parsedQuery);

    // Récupérer `sparnatural-history` et charger la requête
    const historyElement = document.querySelector(
      "sparnatural-history"
    ) as SparnaturalHistoryElement;

    if (historyElement) {
      historyElement.loadQuery(parsedQuery);

      // Fermer la fenêtre de l'historique après chargement
      $("#historyModal, .history-overlay").remove();
      $("body").removeClass("history-modal-open");
    } else {
      console.error("SparnaturalHistoryElement non trouvé !");
    }
  }

  private makeFavorite(event: JQuery.ClickEvent) {
    const id = $(event.currentTarget).data("id");
    const storage = LocalDataStorage.getInstance();
    let history = storage.getHistory();

    let query = history.find((q: QueryHistory) => q.id === id);
    if (!query) return;

    query.isFavorite = !query.isFavorite;

    storage.set("queryHistory", history);

    // Met à jour l'icône immédiatement
    this.initializeFavorites();

    this.enableQuerySummaryScrollEffect();
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

  private enableQuerySummaryScrollEffect() {
    document.querySelectorAll(".query-summary").forEach((element) => {
      const div = element as HTMLElement;

      // Vérifie si le contenu dépasse la hauteur définie
      if (div.scrollHeight > div.clientHeight) {
        div.classList.add("has-scroll"); // Ajoute l’ombre si scroll nécessaire
      } else {
        div.classList.remove("has-scroll"); // Supprime si pas besoin de scroll
      }

      div.addEventListener("scroll", function () {
        if (this.scrollTop > 0) {
          this.classList.add("scrolled"); // Cache l’ombre quand l'utilisateur scrolle
        } else {
          this.classList.remove("scrolled"); // Remet l’ombre si retour en haut
        }
      });
    });
  }

  private formatQuerySummary(
    queryJson: ISparJson,
    specProvider: ISparnaturalSpecification
  ): string {
    let summary = `<div class="query-summary">`;

    setTimeout(() => {
      document.querySelectorAll(".query-summary").forEach((element) => {
        const div = element as HTMLDivElement;
        if (div.scrollHeight > div.clientHeight) {
          div.classList.add("scrollable"); // Ajoute la classe uniquement si le contenu dépasse
        }
      });
    }, 100);

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
  private clearHistory() {
    // Récupération de l'instance du stockage local
    const storage = LocalDataStorage.getInstance();

    // Suppression complète de l'historique
    storage.clearHistory();

    // Rafraîchir l'affichage de l'historique
    this.showHistory();

    console.log("Historique vidé !");
  }

  private getFirstVariableValue(
    variable: VariableTerm | VariableExpression
  ): string | null {
    if ("value" in variable) {
      return variable.value; // Cas d'un VariableTerm
    } else if ("expression" in variable && "value" in variable.expression) {
      return variable.expression.value; // Cas d'un VariableExpression
    }
    return null;
  }

  private getEntityType(queryJson: ISparJson): string {
    if (
      !queryJson ||
      !Array.isArray(queryJson.variables) ||
      queryJson.variables.length === 0
    ) {
      return "Inconnu"; // Cas où il n'y a ni variables ni branches
    }

    // 🔍 Étape 1: Récupérer la première variable sélectionnée
    const firstVariable = this.getFirstVariableValue(
      queryJson.variables[0] as VariableTerm | VariableExpression
    );

    if (!firstVariable) {
      return "Inconnu"; // Si aucune variable valide n'est trouvée
    }

    // 🔍 Étape 2: Rechercher dans les branches la première correspondance entre `s` et `firstVariable`
    const matchingBranch = queryJson.branches.find(
      (branch) => branch.line.s === firstVariable
    );

    // 🔍 Étape 3: Vérifier aussi dans les enfants des branches si la correspondance est plus profonde
    const deepMatchingBranch = queryJson.branches
      .flatMap((branch) => branch.children) // Récupérer tous les enfants de niveau 1
      .find((child) => child.line.s === firstVariable); // Vérifier si `s` correspond à la première variable

    // 🔍 Étape 4: Prioriser le `sType` correspondant à la variable sélectionnée
    if (matchingBranch?.line.sType) return matchingBranch.line.sType;
    if (deepMatchingBranch?.line.sType) return deepMatchingBranch.line.sType;

    // 🔍 Étape 5: Si aucune correspondance, prendre la première branche existante comme dernier recours
    return queryJson.branches[0]?.line.sType || "Inconnu";
  }
}
export default HistorySection;

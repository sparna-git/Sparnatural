import "datatables.net";
import $ from "jquery";
import LocalDataStorage from "../storage/LocalDataStorage";
import HTMLComponent from "../../sparnatural/components/HtmlComponent";
import { Branch, ISparJson } from "../../sparnatural/generators/json/ISparJson";
import ISparnaturalSpecification from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import ConfirmationModal from "./ConfirmationModal";
import { VariableExpression, VariableTerm } from "sparqljs";
import { QueryHistory } from "./QueryHistory";
import { SparnaturalHistoryElement } from "../../SparnaturalHistoryElement";
import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n"; //
import { getSettings } from "../settings/defaultSettings";
import DateFilterModal from "./DateFilter";

class HistorySection extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  private confirmationModal: ConfirmationModal;
  private dateFilterModal: DateFilterModal;

  // Constructor for the HistorySection class
  // It initializes the section with a parent component and optional specProvider and dateFilterModal
  constructor(ParentComponent: HTMLComponent) {
    super("historySection", ParentComponent, null);
    const historyElement = document.querySelector(
      "sparnatural-history"
    ) as SparnaturalHistoryElement;
    if (!historyElement) return;
    console.log("HistorySection constructed...");
  }

  public setSpecProvider(specProvider: ISparnaturalSpecification) {
    this.specProvider = specProvider;
  }

  // Override the render method to add the history button
  // and the history modal
  render(): this {
    super.render();
    let historyBtn = $(
      `<button class="history-btn"><span>${SparnaturalHistoryI18n.labels["historyButton"]} </span><i class="fas fa-history"></i></button>`
    );
    historyBtn.on("click", () => this.showHistory());
    console.log("HistorySection render...");
    // append the history button to the parent component
    this.html.append(historyBtn);
    // Crée les modales ici, une fois que this.html est bien dans le DOM
    this.confirmationModal = new ConfirmationModal(this.html);
    this.dateFilterModal = new DateFilterModal(this.html);
    return this;
  }

  private async confirmAction(message: string): Promise<boolean> {
    const confirmed = await this.confirmationModal.show(message);
    if (!confirmed) {
      console.log("Action annulée par l'utilisateur.");
    }
    return confirmed; // Return the confirmation status
  }

  // show the history modal
  // and populate it with the history data
  showHistory() {
    const storage = LocalDataStorage.getInstance();
    const history = storage.getHistory();

    if (!Array.isArray(history)) {
      console.error("Erreur: L'historique n'est pas un tableau !");
      return;
    }

    // Supprimer uniquement les éléments modaux précédents
    this.html
      .find(".history-overlay, #historyModal, #queryHistoryTable_wrapper")
      .remove();

    // Ajout de l'overlay et conteneur modal
    this.html.append('<div class="history-overlay"></div>');
    this.html.addClass("history-modal-open");

    // Créer le modal HTML
    // et le conteneur de la table
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
    this.html.append(modalHtml);

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

      // parameters for the DataTable
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
          // returner une ligne de tableau avec les données formatées
          return [
            `<button class="favorite-query" data-id="${entry.id}">
              <i class="favorite-icon ${
                entry.isFavorite ? "fas" : "far"
              } fa-star"></i>
            </button>`,
            entity,
            this.formatQuerySummary(
              parsedQuery,
              this.specProvider || undefined
            ),
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

      // columns definition for the DataTable
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

        this.html
          .find(".delete-query")
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

        this.html
          .find(".load-query")
          .off("click")
          .on("click", (event) => this.loadQuery(event));

        this.html
          .find(".favorite-query")
          .off("click")
          .on("click", (event) => this.makeFavorite(event));

        this.html
          .find(".save-query")
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
        console.log("HTML :", this.html);
        this.initializeFavorites();
      },
    });
    const layoutRow = this.html
      .find("#queryHistoryTable_wrapper .dt-layout-row")
      .first(); // ✅ scope local

    const dateIconCell = $(`
  <div class="dt-layout-cell" style="flex: 0 0 auto; display: flex; align-items: center; gap: 10px;">
    <div style="width: 10px;"></div> <!-- petit espace -->
    <button id="openDateFilter" class="btn-yellow">
      <i class="fas fa-calendar-alt"></i>
    </button>
  </div>
`);

    layoutRow.append(dateIconCell);

    // Scoper les sélecteurs à this.html
    this.html
      .find("#openDateFilter")
      .on("click", () => this.dateFilterModal.open());

    this.html.find("#resetHistory").on("click", async () => {
      const confirmed = await this.confirmAction(
        SparnaturalHistoryI18n.labels["confirmClearHistory"]
      );
      if (confirmed) {
        this.clearHistory();
      }
    });

    this.html.find("#closeHistory, .history-overlay").on("click", () => {
      this.html.find("#historyModal, .history-overlay").remove();
      this.html.removeClass("history-modal-open");
    });

    this.html.find("#minDate, #maxDate").on("change", () => {
      this.html.find("#queryHistoryTable").DataTable().draw();
    });

    this.initializeFavorites();

    this.html.find("#queryHistoryTable .dt-scroll-body thead").remove();
  }

  private showToast(message: string, duration = 3000) {
    const toast = $(`
      <div class="custom-toast">
        <span class="toast-message">${message}</span>
      </div>
    `);
    console.log("HTML:", this.html);
    this.html.append(toast);

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
      historyElement.triggerLoadQueryEvent(parsedQuery);

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
  private extractLastSegment = (uri: string): string =>
    uri ? uri.substring(uri.lastIndexOf("/") + 1) : "Inconnu";

  private formatQuerySummary(
    queryJson: ISparJson,
    specProvider?: ISparnaturalSpecification
  ): string {
    let summary = `<div class="query-summary">`;

    setTimeout(() => {
      document.querySelectorAll(".query-summary").forEach((element) => {
        const div = element as HTMLDivElement;
        if (div.scrollHeight > div.clientHeight) {
          div.classList.add("scrollable");
        }
      });
    }, 100);

    const extractLastSegment = (uri: string): string =>
      uri ? uri.substring(uri.lastIndexOf("/") + 1) : "Inconnu";

    const processBranch = (branch: Branch, depth = 0): string => {
      let result = "";
      const indentation = "&nbsp;".repeat(depth * 4);

      const startLabel =
        branch.line.sType &&
        (specProvider?.getEntity(branch.line.sType)?.getLabel() ||
          extractLastSegment(branch.line.sType));
      const propLabel =
        branch.line.p &&
        (specProvider?.getProperty(branch.line.p)?.getLabel() ||
          extractLastSegment(branch.line.p));

      const endLabel =
        branch.line.oType &&
        (specProvider?.getEntity(branch.line.oType)?.getLabel() ||
          extractLastSegment(branch.line.oType));

      let line = `${indentation}<strong>${startLabel}</strong> → ${propLabel} → <strong>${endLabel}</strong>`;

      if (branch.line.values.length > 0) {
        line += ` = ${branch.line.values.join(", ")}`;
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
    //verifier si la specProvider est définie
    if (!this.specProvider) {
      console.error("specProvider is not defined.");
      return this?.extractLastSegment(entityURI); // Retourne le dernier segment de l'URI
    }
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

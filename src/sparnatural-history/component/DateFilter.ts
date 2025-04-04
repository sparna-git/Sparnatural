import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n";

class DateFilterModal {
  private modalElement: JQuery<HTMLElement>;

  constructor() {
    this.modalElement = $(`
      <div id="dateFilterModal" class="modal">
        <div class="modal-content">
          <h3>${
            SparnaturalHistoryI18n.labels["dateFilterTitle"] ||
            "Filtrer par date"
          }</h3>
          <div style="margin: 10px 0;">
            <label for="minDate">${
              SparnaturalHistoryI18n.labels["from"]
            }</label>
            <input type="date" id="minDate" />
            <label for="maxDate">${SparnaturalHistoryI18n.labels["to"]}</label>
            <input type="date" id="maxDate" />
          </div>
          <div class="modal-buttons">
            <button id="applyDateFilter" class="btn-clear">
              ${SparnaturalHistoryI18n.labels["clear"] || "Clear"}
            </button>
            <button id="cancelDateFilter" class="btn-delete">
              ${SparnaturalHistoryI18n.labels["cancel"] || "Annuler"}
            </button>
          </div>
        </div>
      </div>
    `);

    if ($("#dateFilterModal").length === 0) {
      $("body").append(this.modalElement);
    }

    // ✅ Bouton "Clear"
    $("#applyDateFilter").on("click", () => {
      $("#minDate").val("");
      $("#maxDate").val("");
      $("#queryHistoryTable").DataTable().draw();
    });

    // ✅ Bouton "Annuler"
    $("#cancelDateFilter").on("click", () => {
      this.modalElement.hide();
    });
  }

  public open(): void {
    this.modalElement.show();
  }
}

export default DateFilterModal;

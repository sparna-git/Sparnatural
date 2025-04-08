import { SparnaturalHistoryI18n } from "../settings/SparnaturalHistoryI18n";

class ConfirmationModal {
  private modalElement: JQuery<HTMLElement>;
  private resolveAction: (confirmed: boolean) => void;

  constructor(private container: JQuery<HTMLElement>) {
    this.modalElement = $(`
      <div class="modal confirmation-modal">
        <div class="modal-content">
          <p class="modal-message">${SparnaturalHistoryI18n.labels.confirmMessage}</p>
          <div class="modal-buttons">
            <button class="confirm-yes">${SparnaturalHistoryI18n.labels.yes}</button>
            <button class="confirm-no">${SparnaturalHistoryI18n.labels.no}</button>
          </div>
        </div>
      </div>
    `);

    // Ajoute dans le conteneur uniquement si pas déjà présent
    if (this.container.find(".confirmation-modal").length === 0) {
      this.container.append(this.modalElement);
    }

    this.modalElement
      .find(".confirm-yes")
      .on("click", () => this.handleConfirmation(true));
    this.modalElement
      .find(".confirm-no")
      .on("click", () => this.handleConfirmation(false));
  }

  public show(message?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveAction = resolve;
      this.modalElement
        .find(".modal-message")
        .text(message || SparnaturalHistoryI18n.labels.confirmMessage);
      this.modalElement.show();
    });
  }

  private handleConfirmation(confirmed: boolean) {
    this.modalElement.hide();
    if (this.resolveAction) {
      this.resolveAction(confirmed);
    }
  }
}

export default ConfirmationModal;

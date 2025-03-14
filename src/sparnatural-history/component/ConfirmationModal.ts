class ConfirmationModal {
  private modalElement: JQuery<HTMLElement>;
  private resolveAction: (confirmed: boolean) => void;

  constructor() {
    this.modalElement = $(`
        <div id="confirmationModal" class="modal">
          <div class="modal-content">
            <p id="modalMessage">Êtes-vous sûr de vouloir effectuer cette action ?</p>
            <div class="modal-buttons">
              <button id="confirmYes">Oui</button>
              <button id="confirmNo">Non</button>
            </div>
          </div>
        </div>
      `);

    // Ajoutez la modal au body uniquement si elle n'existe pas déjà
    if ($("#confirmationModal").length === 0) {
      $("body").append(this.modalElement);
    }

    // Ajoutez les gestionnaires d'événements pour les boutons
    $("#confirmYes").on("click", () => this.handleConfirmation(true));
    $("#confirmNo").on("click", () => this.handleConfirmation(false));
  }

  public show(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveAction = resolve;
      $("#modalMessage").text(message);
      this.modalElement.show(); // Affiche la modal
    });
  }

  private handleConfirmation(confirmed: boolean) {
    this.modalElement.hide(); // Cache la modal après la réponse
    if (this.resolveAction) {
      this.resolveAction(confirmed);
    }
  }
}

export default ConfirmationModal;

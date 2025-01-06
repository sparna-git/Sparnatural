import { I18n } from "../../../sparnatural/settings/I18n";

class SearchBtn {
  callbackSearch: () => void;
  callbackExport: () => void;
  buttonGroupElement: JQuery<HTMLElement>;
  private spinner: HTMLElement; // Stocker le spinner

  constructor(callbackSearch: () => void, callbackExport: () => void) {
    this.callbackSearch = callbackSearch;
    this.callbackExport = callbackExport;
    // Créer le bouton avec jQuery et ajouter le texte "Search"
    this.buttonGroupElement = $(
      `<div class="gui-split-button">
       <button id="Search" >${I18n.labels["Search"] || "Search"}
       <span class="spinner" style="display: none;"></span>
       </button>
       <span class="gui-popup-button" aria-haspopup="true" aria-expanded="false" title="Export">
       <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
       
       <ul class="gui-popup">
         <li>
           <button id="Export">${I18n.labels["Export"] || "Export"}</button>
         </li>
       </ul>
       </span>
       </div>`
    );
    // Créer l'élément du spinner (mais ne pas l'ajouter immédiatement)
    this.spinner = document.createElement("div");
    this.spinner.className = "spinner";
    this.spinner.style.display = "inline-block";
    this.spinner.style.marginLeft = "10px"; // Optionnel : espacement entre le texte et le spinner

    // Ajouter les gestionnaires d'événements
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Bouton "Search"
    this.buttonGroupElement.find("#Search").on("click", () => {
      if (!this.isDisabled()) {
        this.callbackSearch();
      }
    });

    // Bouton "Export"
    this.buttonGroupElement.find("#Export").on("click", () => {
      this.callbackExport();
    });

    // Gestion de l'ouverture et fermeture du menu déroulant
    this.buttonGroupElement
      .find(".gui-popup-button")
      .on("click", (e: JQuery.ClickEvent) => {
        e.stopPropagation(); // Empêcher la propagation du clic
        this.togglePopup();
      });

    // Fermer le menu si clic en dehors
    $(document).on("click", (e: JQuery.ClickEvent) => {
      if (!this.buttonGroupElement[0].contains(e.target as Node)) {
        this.closePopup();
      }
    });
  }

  private togglePopup() {
    const popup = this.buttonGroupElement.find(".gui-popup");
    const isHidden = popup.hasClass("hidden");
    popup.toggleClass("hidden", !isHidden);
  }

  private closePopup() {
    this.buttonGroupElement.find(".gui-popup").addClass("hidden");
  }

  // Méthode pour désactiver le bouton et ajouter le spinner
  disable() {
    this.buttonGroupElement.find("#Search").prop("disabled", true);
    // Ajouter le spinner si ce n'est pas déjà fait
    if (!this.buttonGroupElement[0].contains(this.spinner)) {
      this.buttonGroupElement.find(".spinner").css("display", "inline-block");
    }
  }

  // Méthode pour activer le bouton et retirer le spinner
  enable() {
    this.buttonGroupElement.find("#Search").prop("disabled", false);
    // Supprimer le spinner si présent
    if (this.buttonGroupElement[0].contains(this.spinner)) {
      this.buttonGroupElement[0].removeChild(this.spinner);
    }
  }

  // Méthode pour supprimer l'état de chargement sans activer le bouton
  removeLoading() {
    // Supprimer le spinner si présent
    this.buttonGroupElement.find(".spinner").css("display", "none");
  }

  // Méthode pour vérifier si le bouton est désactivé
  isDisabled(): boolean {
    return this.buttonGroupElement.find("#Search").prop("disabled") as boolean;
  }

  // Méthode pour ajouter le bouton dans un conteneur
  render(container: JQuery<HTMLElement>) {
    container.append(this.buttonGroupElement);
  }
}

export default SearchBtn;

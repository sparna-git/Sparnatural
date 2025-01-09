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
    if (!callbackExport) {
      this.buttonGroupElement = $(
        `<div class="gui-split-button">
         <button id="Search" >${I18n.labels["Search"] || "Search"}
         <span class="spinner" style="display: none;"></span>
         </button>
         </div>`
      );
    } else {
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
           <button id="Export">${
             I18n.labels["Export"] || "Export"
           }<span class="spinner" style="display: none;"></span></button>
         </li>
       </ul>
       </span>
       </div>`
      );
    }
    // Créer l'élément du spinner (mais ne pas l'ajouter immédiatement)
    this.spinner = document.createElement("div");
    this.spinner.className = "spinner";
    this.spinner.style.display = "inline-block";
    this.spinner.style.marginLeft = "10px"; // Optionnel : espacement entre le texte et le spinner

    // Ajouter les gestionnaires d'événements
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Search button click
    this.buttonGroupElement.find("#Search").on("click", () => {
      if (!this.isDisabled()) {
        this.callbackSearch();
        this.disable(); // Disable both buttons when Search is clicked
      }
    });

    // Export button click
    this.buttonGroupElement.find("#Export").on("click", () => {
      if (!this.isDisabled()) {
        this.callbackExport();
        this.disable(); // Disable both buttons when Export is clicked
      }
    });

    // Gestion de l'ouverture et fermeture du menu déroulant
    this.buttonGroupElement
      .find(".gui-popup-button")
      .on("click", (e: JQuery.ClickEvent) => {
        e.stopPropagation(); // Empêcher la propagation du clic
        if (!this.isDisabled()) {
          this.togglePopup();
        }
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

  disable() {
    // Disable both Search and Export buttons
    this.buttonGroupElement.find("#Search").prop("disabled", true);
    this.buttonGroupElement.find(".gui-popup-button").addClass("disabled");

    // Show the spinner
    this.buttonGroupElement.find(".spinner").css("display", "inline-block");
  }

  enable() {
    // Re-enable both Search and Export buttons
    this.buttonGroupElement.find("#Search").prop("disabled", false);
    this.buttonGroupElement.find(".gui-popup-button").removeClass("disabled");

    // Hide the spinner
    this.buttonGroupElement.find(".spinner").css("display", "none");
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

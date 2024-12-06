import { I18n } from "../../../sparnatural/settings/I18n";

class SearchBtn {
  callback: () => void;
  buttonElement: JQuery<HTMLElement>;
  private spinner: HTMLElement; // Stocker le spinner

  constructor(callback: () => void) {
    this.callback = callback;
    // Créer le bouton avec jQuery et ajouter le texte "Search"
    this.buttonElement = $(
      `<button id="Search" >${I18n.labels["Search"]}</button>`
    );

    // Créer l'élément du spinner (mais ne pas l'ajouter immédiatement)
    this.spinner = document.createElement("div");
    this.spinner.className = "spinner";
    this.spinner.style.display = "inline-block";
    this.spinner.style.marginLeft = "10px"; // Optionnel : espacement entre le texte et le spinner

    // Ajouter un écouteur d'événement "click" pour appeler le callback si le bouton n'est pas désactivé
    this.buttonElement.on("click", (e: JQuery.ClickEvent) => {
      if (!this.isDisabled()) {
        this.callback();
      }
    });
  }

  // Méthode pour désactiver le bouton et ajouter le spinner
  disable() {
    this.buttonElement.prop("disabled", true);
    // Ajouter le spinner si ce n'est pas déjà fait
    if (!this.buttonElement[0].contains(this.spinner)) {
      this.buttonElement[0].appendChild(this.spinner);
    }
  }

  // Méthode pour activer le bouton et retirer le spinner
  enable() {
    this.buttonElement.prop("disabled", false);
    // Supprimer le spinner si présent
    if (this.buttonElement[0].contains(this.spinner)) {
      this.buttonElement[0].removeChild(this.spinner);
    }
  }

  // Méthode pour supprimer l'état de chargement sans activer le bouton
  removeLoading() {
    // Supprimer le spinner si présent
    if (this.buttonElement[0].contains(this.spinner)) {
      this.buttonElement[0].removeChild(this.spinner);
    }
  }

  // Méthode pour vérifier si le bouton est désactivé
  isDisabled(): boolean {
    return this.buttonElement.prop("disabled") as boolean;
  }

  // Méthode pour ajouter le bouton dans un conteneur
  render(container: JQuery<HTMLElement>) {
    container.append(this.buttonElement);
  }
}

export default SearchBtn;

import { I18n } from "../../../sparnatural/settings/I18n";

class SearchBtn {
  callback: () => void;
  buttonElement: JQuery<HTMLElement>;

  constructor(callback: () => void) {
    this.callback = callback;
    // Créer le bouton avec jQuery et ajouter le texte "Search"
    this.buttonElement = $(
      `<button id="Search" title="${I18n.labels["Search"]}">${I18n.labels["Search"]}</button>`
    );

    // Ajouter un écouteur d'événement "click" pour appeler le callback si le bouton n'est pas désactivé
    this.buttonElement.on("click", (e: JQuery.ClickEvent) => {
      if (!this.isDisabled()) {
        this.callback();
      }
    });
  }

  // Méthode pour désactiver le bouton
  disable() {
    this.buttonElement.prop("disabled", true).addClass("loadingEnabled");
  }

  // Méthode pour activer le bouton
  enable() {
    this.buttonElement.prop("disabled", false).removeClass("loadingEnabled");
  }

  // Méthode pour supprimer l'état de chargement sans activer le bouton
  removeLoading() {
    this.buttonElement.removeClass("loadingEnabled");
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

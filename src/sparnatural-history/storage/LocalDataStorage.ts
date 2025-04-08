class LocalDataStorage {
  // Instance stores a reference to the Singleton
  private static instance: any;

  privateArray = new Array();

  constructor() {}

  get(name: any) {
    if (this.storageAvailable()) {
      const value = localStorage.getItem(name);
      return value ? JSON.parse(value) : null; // Assurer que les objets JSON sont bien récupérés
    } else {
      return this.privateArray[name] || null;
    }
  }

  set(name: any, value: any) {
    if (this.storageAvailable()) {
      localStorage.setItem(name, JSON.stringify(value)); // Assurez-vous que les données sont stockées sous forme de JSON
    } else {
      this.privateArray[name] = value;
    }
  }

  // Get the Singleton instance if one exists
  // or create one if it doesn't
  static getInstance() {
    if (!LocalDataStorage.instance) {
      LocalDataStorage.instance = new LocalDataStorage();
    }

    return LocalDataStorage.instance;
  }

  saveQuery(queryJson: any): void {
    if (!queryJson) {
      console.error("Impossible de sauvegarder une requête vide !");
      return;
    }

    let history = this.getHistory();
    console.log("Avant ajout :", history);

    // Vérifier si la requête existe déjà
    let existingQuery = history.find(
      (q) => JSON.stringify(q.queryJson) === JSON.stringify(queryJson)
    );

    if (!existingQuery) {
      history.push({
        id: crypto.randomUUID(),
        queryJson,
        date: new Date().toISOString(),
        isFavorite: false, // Ajoute `isFavorite: false` par défaut
      });
    }

    this.set("queryHistory", history);
    console.log("Après ajout :", this.getHistory());
  }

  getHistory(): any[] {
    let history = localStorage.getItem("queryHistory");
    return history ? JSON.parse(history) : []; // Toujours un tableau
  }

  deleteQuery(id: string): void {
    let history = this.getHistory().filter((entry) => entry.id !== id);
    this.set("queryHistory", history);
  }

  clearHistory(): void {
    let history = this.getHistory().filter((entry) => entry.isFavorite);
    this.set("queryHistory", history);
  }

  private storageAvailable(): boolean {
    try {
      let storage = window.localStorage;
      let x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default LocalDataStorage;
// à la fin de LocalDataStorage.ts
(window as any).LocalDataStorage = LocalDataStorage;

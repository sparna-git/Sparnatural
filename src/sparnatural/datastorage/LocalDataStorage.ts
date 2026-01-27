/**
 * A cache, either based on localStorage if available, either on a private array.
 */
class LocalDataStorage {
  // Instance stores a reference to the Singleton
  private static instance: any;

  private privateArray = new Array();

  private constructor() {}

  // Private methods and variables
  get(name: any) {
    if (this.storageAvailable()) {
      if (!localStorage.getItem(name)) {
        return null;
      } else {
        return localStorage.getItem(name);
      }
    } else {
      if (this.privateArray[name]) {
        return this.privateArray[name];
      } else {
        return null;
      }
    }
  }

  /**
   * Either stores in localStorage or in private array if localStorage is not available
   * @param name key to store
   * @param value value to store
   */
  set(name: any, value: any) {
    this.privateArray[name] = value;
    if (this.storageAvailable()) {
      localStorage.setItem(name, value);
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

  // Singleton
  storageAvailable() {
    try {
      var storage = window.localStorage,
        x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0
      );
    }
  }
}

export default LocalDataStorage;

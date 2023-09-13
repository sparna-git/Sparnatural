import LocalDataStorage from "./LocalDataStorage";

class LocalCacheData {
  constructor() {}

  fetch(uri: any, parameters: any, ttl: any):Promise<Response> {
    var datastorage = new LocalDataStorage().getInstance();
    //var lastLoading = localStorage[uri] ;
    var now = Date.now();

    if (!datastorage.get(uri)) {
      datastorage.set(uri, now);
    }
    var lastLoading = datastorage.get(uri);

    if (lastLoading < now - ttl) {
      // ttl exceeded, reload
      datastorage.set(uri, now);
      parameters.cache = "reload";
      return fetch(uri, parameters);
    } else {
      parameters.cache = "force-cache";
      return fetch(uri, parameters);
    }
  }
}

export default LocalCacheData;

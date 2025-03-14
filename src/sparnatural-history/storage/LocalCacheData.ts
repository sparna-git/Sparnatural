import LocalDataStorage from "./LocalDataStorage";

class LocalCacheData {
  constructor() {}

  fetch(uri: string, parameters: any, ttl: number): Promise<Response> {
    // console.log("LocalCacheData : "+uri+" / ttl "+ttl)
    var datastorage = LocalDataStorage.getInstance();
    //var lastLoading = localStorage[uri] ;
    var now = Date.now();

    if (!datastorage.get(uri)) {
      datastorage.set(uri, now);
    }
    var lastLoading = datastorage.get(uri);

    if (lastLoading < now - ttl) {
      // ttl exceeded, reload
      datastorage.set(uri, now);
      /**
       * See https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
       * The browser fetches the resource from the remote server without first looking in the cache,
       * but then will update the cache with the downloaded resource.
       */
      parameters.cache = "reload";
      return fetch(uri, parameters);
    } else {
      /**
       * See https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
       * The browser looks for a matching request in its HTTP cache.
       *   - If there is a match, fresh or stale, it will be returned from the cache.
       *   - If there is no match, the browser will make a normal request, and will update the cache with the downloaded resource.
       */
      parameters.cache = "force-cache";
      return fetch(uri, parameters);
    }
  }
}

export default LocalCacheData;

import LocalDataStorage from "./LocalDataStorage"
class LocalCacheData {

    constructor() {

    }

    fetch(uri, init, ttl) {
        var datastorage = new LocalDataStorage().getInstance();
        //var lastLoading = localStorage[uri] ;
        var now = Date.now();

        if(!datastorage.get(uri)) {
            datastorage.set(uri, now) ;
        }
        var lastLoading = datastorage.get(uri) ; 

        if (lastLoading < now - ttl) {
            // ttl exceeded, reload
            datastorage.set(uri, now) ;
            init.cache = 'reload' ;
            return fetch(uri, init) ;
        } else {
            console.log("force-cache");
            init.cache = 'force-cache' ;
            return fetch(uri, init) ;
        }
    }
}

export default LocalCacheData
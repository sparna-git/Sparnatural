class LocalCacheData {

    constructor() {

    }

    fetch(uri, init, ttl) {
        if (this.storageAvailable('localStorage')) {

            var lastLoading = localStorage[uri] ;
            var now = Date.now();

            if(!localStorage.getItem(uri)) {
                localStorage.setItem(uri, now) ;
            }
            lastLoading = localStorage.getItem(uri) ; 

            if (lastLoading < now - ttl) {
                localStorage.setItem(uri, now) ;
                init.cache = 'reload' ;
                return fetch(uri, init) ;
            } else {
                init.cache = 'force-cache' ;
                return fetch(uri, init) ;
            }
        } else {
            return fetch(uri, init) ;
        }
    }


    storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }
}

module.exports = {
	LocalCacheData: LocalCacheData
}
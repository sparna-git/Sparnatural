var LocalDataStorage = (function () {

    // Instance stores a reference to the Singleton
    var instance;
  
    function init() {
  
      // Singleton
      function storageAvailable(type) {
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

      
  
      // Private methods and variables
        function get(name){
            if (storageAvailable('localStorage')) {
                if(!localStorage.getItem(name)) {
                    return null ;
                } else  {
                    return localStorage.getItem(name)
                }
        
            } else {
                if (typeof privateArray[name] !== 'undefined') {
                    return privateArray[name] ;
                } else {
                    return null ;
                }
            }
        }

        function set(name, value){
            privateArray[name] = value ;
            if (storageAvailable('localStorage')) {
                localStorage.setItem(name, value) ;
            } else {
                privateArray[name] = value ;
            }
        }
  
      var privateArray = new Array() ;
  
      return {
  
        // Public methods and variables
        get: function (name) {
            return get(name);
        },
        set: function (name, value) {
            return set(name, value);
        },
      };
  
    };
  
    return {
  
      // Get the Singleton instance if one exists
      // or create one if it doesn't
      getInstance: function () {
  
        if ( !instance ) {
          instance = init();
        }
  
        return instance;
      }
  
    };
  
  })();


module.exports = {
	LocalDataStorage: LocalDataStorage
}
class ClassVariableName {
    constructor() {
        this.variablesNames = { counts : [] ,ids : [] } ;
	}
    getName(id) {

        if (id in this.variablesNames['ids']) {
            return this.variablesNames['ids'][id] ;
        } else {
            return false; 
        }

    }
    setName(id,ClassName) {
        ClassName = this.localName(ClassName) ;
        if ("?this" in this.variablesNames['counts']) {
            if (ClassName in this.variablesNames['counts']) {
                this.variablesNames['counts'][ClassName]++ ;
            } else {
                this.variablesNames['counts'][ClassName] = 1 ;
            }
            this.variablesNames['ids'][id] = ClassName+'-'+this.variablesNames['counts'][ClassName] ;
        } else {
            this.variablesNames['counts']["?this"] = 1 ;
            this.variablesNames['ids'][id] = "?this"
        }
    }
    localName(uri) {
		if (uri.indexOf("#") > -1) {
			return uri.split("#")[1] ;
		} else {
			var components = uri.split("/") ;
			return components[components.length - 1] ;
		}
	}
}


module.exports = {
	ClassVariableName: ClassVariableName
}


class JSONQueryPreloader {


    constructor(json, form) {
        this.data = json;
        this.preloaded = false;

        this.form = form;

        this.init() ;

    }

    init() {
        $(this.form._this).on('formInitialized', function(event) {
            console.log(event) ;
            this.testValue = '++++++++++++++++' ;
        })
    }


    getLine(index) {
		for (var i = 0; i < this.json.branches.length; i++) {
			result =  this.getRecursiveLine(this.json.branches[i], index) ;
			if (result !== null){
				return result ;
			}
		}
		return null ;
	}
	getRecursiveLine(json, index) {
		if(json.line.index == index) {
			return json ;
		} else {
			for (var i = 0; i < json.children.length; i++) {
				result = this.getRecursiveLine(json.children[i], index) ;
				if (result !== null){
					return result ;
				}
			}
		}
		return null ;
	}
}

module.exports = {
	JSONQueryPreloader: JSONQueryPreloader
}
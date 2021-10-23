class ClassVariableName {
    constructor(form) {
        this.form = form ;
        this.variablesNames = { counts : [] ,ids : [] } ;
	}
    /**
     * Get variable name of inputTypeComponent by this id (html attribute).
     *
     * @param {string} id - HTML attribute id of input
     **/
    getName(id) {
        if (id in this.variablesNames['ids']) {
            return this.variablesNames['ids'][id] ;
        } else {
            return ""; 
        }
    }
    /**
     * Get parts of text and number in variable name (use "_" for split any parts of name).
     *
     * @param {string} name - variable name to cut on two parts (text and nuber)
     **/
    parseName(name) {
        let ClassNameArray = name.split("_");
        var string = '' ;
        var number = 0 ;
        //if name have any parts
        if (ClassNameArray.length > 1) {
            string = '' ;
            for (var j = 0; j < ClassNameArray.length - 1; j++) {
                if (j != 0 ) {
                    //need to use "-" to separate multiple words
                    string = string+'-'+ClassNameArray[j] ;
                } else {
                    string = ClassNameArray[j] ;
                }
            }
            // number is the last part of the name
            number = ClassNameArray[ClassNameArray.length - 1] ;
        } else { // dont have number
            if (ClassNameArray.length == 1) {
                string = ClassNameArray[0] ;
            } else {
                //name is empty
                return false ;
            }
        }
        return {text: string, number:number} ;
    }
    /**
     * Set variable name with index. Retrive if name is already used and add 1 to index
     * Need that variable name is unique
     * For optimisation, don't use the DOM for find all variables names used in search (very slow) but an array checked by this method
     * An array of names counts is used to find new index
     * The variblesName array is used to save all name assiciated to ClassGroup
     *
     * @param {object} ClassGroup - ClassGroup object
     **/
    setName(ClassGroup) {
        ClassName = this.localName(ClassGroup.value_selected) ;
        //Si une valeur pour le nom est préchargée
        if (ClassGroup.variableNamePreload !== null ) {
            ParsedName = this.parseName(ClassGroup.variableNamePreload) ;
            // Si on peut réutiliser un variableName de type xxxxx_y ou xxxxx
            if (ParsedName !== false) {
                //if name is used by another ClassGroup
                if (ParsedName.text in this.variablesNames['counts']) {
                    // if preloaded name index is bigger than name used, set the count as new max
                    if (this.variablesNames['counts'][ParsedName.text] < ParsedName.number) {
                        this.variablesNames['counts'][ParsedName.text] = ParsedName.number ;
                    }
                    
                } else { //name not used, set count to 1
                    this.variablesNames['counts'][ParsedName.text] = 1 ;
                }
                // save the variable name associated to ClassGroup
                this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = ClassGroup.variableNamePreload ;

                //On stop ici, variablesNames est complété dans tous les cas
                return true ;
            } else { // parsed name is empty, not good, variableNamePreload can be empty
                /*if (ClassGroup.variableNamePreload in this.variablesNames['counts']) {
                    this.variablesNames['counts'][ClassGroup.variableNamePreload]++ ;
                } else {
                    this.variablesNames['counts'][ClassGroup.variableNamePreload] = 1 ;
                }
                this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = ClassGroup.variableNamePreload+'-'+this.variablesNames['counts'][ClassGroup.variableNamePreload] 
                */
               //the next step of this method can retrive a name ;
            }
            
        }
        //if the classGroup is StartClassGroup, find parent variable name
        if (ClassGroup.constructor.name == "StartClassGroup") {
            dependantDe = this.findDependantCriteria(ClassGroup.inputTypeComponent.rowIndex) ;

            //First level criteria, then is "this"
            if (dependantDe == null) {
                this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = "this" ;
            } else {
                //If not first level criteria, variable name is same as endClass of parent criteria
                if (dependantDe.type == 'parent'){
                    this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = this.getName(dependantDe.element.EndClassGroup.inputTypeComponent.id) ;
                } else { // if this is sibling on first level, variable nae is this					
                    this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = "this"
                }
            }
        } else { // if the classGroup is EndClassGroup, use class name selected in classGroup
            if (ClassName in this.variablesNames['counts']) { // if exist in count add 1 to count or set 1
                this.variablesNames['counts'][ClassName]++ ;
            } else {
                this.variablesNames['counts'][ClassName] = 1 ;
            }
            this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = ClassName+'-'+this.variablesNames['counts'][ClassName] ;
        }
    }
    /**
     * Clear the variables names array. Used when load a new query or Reset sparnatural
     *
     * @param {string} name - variable name to cut on two parts (text and nuber)
     **/
    clearAll() {
        this.variablesNames = { counts : [] ,ids : [] } ;
    }
    /**
     * Get the Class Name in property uri.
     *
     * @param {string} uri - uri of property
     **/
    localName(uri) {
		if (uri.indexOf("#") > -1) {
			return uri.split("#")[1] ;
		} else {
			var components = uri.split("/") ;
			return components[components.length - 1] ;
		}
	}
    /**
     * Find parent of criteria component.
     *
     * @param {int} id - index of criteria component
     **/
    findDependantCriteria(id) {
		var dependant = null ;
		var dep_id = null ;
		var element = $(this.form.sparnatural).find('li[data-index="'+id+'"]') ;
		
		if ($(element).parents('li').length > 0) {			
			dep_id = $($(element).parents('li')[0]).attr('data-index') ;
			dependant = {type : 'parent'}  ;			
		} else {
			if ($(element).prev().length > 0) {
				dep_id = $(element).prev().attr('data-index') ;
				dependant = {type : 'sibling'}  ;				
			}
		}

		$(this.form.components).each(function(index) {			
			if (this.index == dep_id) {
				dependant.element = this.CriteriaGroup ;
			}
		}) ;

		return dependant ;
	}
}


module.exports = {
	ClassVariableName: ClassVariableName
}
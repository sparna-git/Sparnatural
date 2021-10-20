class ClassVariableName {
    constructor(form) {
        this.form = form ;
        this.variablesNames = { counts : [] ,ids : [] } ;
	}
    getName(id) {
        if (id in this.variablesNames['ids']) {
            return this.variablesNames['ids'][id] ;
        } else {
            return false; 
        }
    }
    parseName(name) {
        let ClassNameArray = name.split("_");
        string = '' ;
        number = 0 ;
        if (ClassNameArray.length > 1) {
            string = '' ;
            for (var j = 0; j < ClassNameArray.length - 1; j++) {
                if (j != 0 ) {
                    string = string+'-'+ClassNameArray[j] ;
                } else {
                    string = ClassNameArray[j] ;
                }
            }
            number = ClassNameArray[ClassNameArray.length - 1] ;
        } else {
            if (ClassNameArray.length == 1) {
                string = ClassNameArray[0] ;
            } else {
                return false ;
            }
        }
        return {text: string, number:number} ;
    }
    setName(ClassGroup) {
        ClassName = this.localName(ClassGroup.value_selected) ;
        //Si une valeur pour le nom est préchargé
        if (ClassGroup.variableNamePreload !== null ) {
            ParsedName = this.parseName(ClassGroup.variableNamePreload) ;
            // Si on peut réutiliser un variableName de type xxxxx_y ou xxxxx
            if (ParsedName !== false) {
                if (ParsedName.text in this.variablesNames['counts']) {
                    if (this.variablesNames['counts'][ParsedName.text] < ParsedName.number) {
                        this.variablesNames['counts'][ParsedName.text] = ParsedName.number ;
                    }
                    
                } else {
                    this.variablesNames['counts'][ClassName] = 1 ;
                }
                this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = ClassGroup.variableNamePreload ;
            } else {
                if (ClassGroup.variableNamePreload in this.variablesNames['counts']) {
                    this.variablesNames['counts'][ClassGroup.variableNamePreload]++ ;
                } else {
                    this.variablesNames['counts'][ClassGroup.variableNamePreload] = 1 ;
                }
                this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = ClassGroup.variableNamePreload+'-'+this.variablesNames['counts'][ClassGroup.variableNamePreload] ;
            }
            //On stop ici, variablesNames est complété dans tous les cas
            return true ;
        }
        
        if (ClassGroup.constructor.name == "StartClassGroup") {
            dependantDe = this.findDependantCriteria(ClassGroup.inputTypeComponent.rowIndex) ;

            //Critère de premier niveau toujour égale à "this"
            if (dependantDe == null) {
                this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = "this" ;
            } else {
                //Si il s'agit d'un critère de second niveau ou plus le nom de variable est celui du endClass parent
                if (dependantDe.type == 'parent'){
                    this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = this.getName(dependantDe.element.EndClassGroup.inputTypeComponent.id) ;
                } else { // Sinon c'est un frère, au premier niveau, le nom de variable est this					
                    this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = "this"
                }
            }
        } else {
            if (ClassName in this.variablesNames['counts']) {
                this.variablesNames['counts'][ClassName]++ ;
            } else {
                this.variablesNames['counts'][ClassName] = 1 ;
            }
            this.variablesNames['ids'][ClassGroup.inputTypeComponent.id] = ClassName+'-'+this.variablesNames['counts'][ClassName] ;
        }
    }
    clearAll() {
        this.variablesNames = { counts : [] ,ids : [] } ;
    }
    localName(uri) {
		if (uri.indexOf("#") > -1) {
			return uri.split("#")[1] ;
		} else {
			var components = uri.split("/") ;
			return components[components.length - 1] ;
		}
	}
    findDependantCriteria(id) {
		var dependant = null ;
		var dep_id = null ;
		var element = this.form._this.find('li[data-index="'+id+'"]') ;
		
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
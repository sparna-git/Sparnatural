var SparqlGenerator = require('sparqljs').Generator;

class DefaultQueryGenerator {

	constructor(addDistinct, typePredicate, addObjectsTypeCriteria) {
		this.WIDGETS_REQUIRING_VALUES = ['SearchProperty', 'TimePeriodProperty', 'TimeDatePickerProperty', 'TimeDateDayPickerProperty'] ;

		this.addDistinct = addDistinct;
		this.typePredicate = typePredicate;
		this.addObjectsTypeCriteria = addObjectsTypeCriteria;
	}

	/**
	 * Generates the query and notifies the callback
	 **/
	generateQuery(formObject, callback) {
		var jsonQuery = this.newQueryJson() ;

		var ArrayLiIndex = [] ;		
		$(formObject._this).find('ul.componentsListe li.groupe').each(function(i) {			
			var data_id = $(this).attr('data-index') ;
			ArrayLiIndex[data_id] = ArrayLiIndex.length ;
		}) ;

		if(this.hasEnoughCriteria(formObject)) {
			for (var i = 0; i < formObject.components.length; i++) {
				jsonQuery = this.processQueryComponent(
					jsonQuery,
					formObject,
					ArrayLiIndex,
					formObject.components[i],
					i
				);
			} ;

			var generator = new SparqlGenerator();
			var generatedQuery = generator.stringify(jsonQuery);
			// send generated query to callback function
			callback(generatedQuery, jsonQuery) ;		
		}
	}

	hasEnoughCriteria(formObject) {
		for (var i = 0; i < formObject.components.length; i++) {			
			// if there is no value selected and the widget required one
			// do not process this component			
			if(
				($.inArray(formObject.components[i].CriteriaGroup.EndClassWidgetGroup.widgetType, this.WIDGETS_REQUIRING_VALUES) > -1)
				&&
				(formObject.components[i].CriteriaGroup.EndClassWidgetGroup.value_selected.length === 0)
			) {
				continue;
			} else {
				// we will have at least one component with a criteria
				return true;
			}			
		} ;	

		// not enough criteria found.
		return false;	
	}

	processQueryComponent(jsonQuery, formObject, ArrayLiIndex, component, index) {
		var WIDGET_LIST_PROPERTY 			= 'ListProperty';
		var WIDGET_TIME_PERIOD_PROPERTY 	= 'TimePeriodProperty';
		var WIDGET_TIME_DATE_PICKER_PROPERTY = 'TimeDatePickerProperty';
		var WIDGET_TIME_DATE_DAYPICKER_PROPERTY = 'TimeDateDayPickerProperty';
		var WIDGET_AUTOCOMPLETE_PROPERTY 	= 'AutocompleteProperty';
		var WIDGET_SEARCH_PROPERTY 			= 'SearchProperty';
		
		var VALUE_SELECTION_WIDGETS = [
			WIDGET_LIST_PROPERTY,
			WIDGET_AUTOCOMPLETE_PROPERTY
		];


		var start = component.CriteriaGroup.StartClassGroup.value_selected ;
		var obj = component.CriteriaGroup.ObjectPropertyGroup.value_selected ;
		var end = component.CriteriaGroup.EndClassGroup.value_selected ; 
		
		var dependantDe = this.GetDependantCriteria(formObject, index) ;
		// get index of subject and object variables
		var subjectVariableIndex;
		var objectVarIndex;
		if ((dependantDe != null) && (dependantDe.type == 'parent')){
			subjectVariableIndex = ArrayLiIndex[dependantDe.element.id] + 1;				
			objectVarIndex = ArrayLiIndex[index] + 1;					
			addStartClass = false ;					
		} else {						
			subjectVariableIndex = 0 ;
			objectVarIndex = ArrayLiIndex[index] + 1 ;
		}

		// name start and end variables
		if (subjectVariableIndex == 0) {
			subjectVariable = "?this";
		} else {
			subjectVariable = '?'+this.localName(start)+''+subjectVariableIndex ;
		}
		console.log(end) ;
		var objectVariable = '?'+this.localName(end)+''+objectVarIndex ;

		// whether to add class criteria for subject or not
		var addStartClass = true ;
		if ((dependantDe != null) && (dependantDe.type == 'parent')){				
			addStartClass = false ;					
		} 
		if ((dependantDe != null) && (dependantDe.type == 'sibling')){
			addStartClass = false ;
		}
		
		// list of triples to be inserted in the query
		var newTriples = this.initTriple() ;
		if (addStartClass) {
			newTriples = this.addTriple(newTriples, subjectVariable, this.typePredicate, start) ;
		}
		
		var _WidgetType = component.CriteriaGroup.EndClassWidgetGroup.widgetType ;
		
		if ( VALUE_SELECTION_WIDGETS.indexOf(_WidgetType) !== -1 ) {						
			if (component.CriteriaGroup.EndClassWidgetGroup.value_selected.length == 1) {
				// if we are in a value selection widget and we have a single value selected
				// then insert the value directly as the object of the triple						
				newTriples = this.addTriple(newTriples, subjectVariable, obj, component.CriteriaGroup.EndClassWidgetGroup.value_selected[0]) ;
			} else {
				// otherwise use a variable name as the object of the triple
				newTriples = this.addTriple(newTriples, subjectVariable, obj, objectVariable) ;
			}

			// if no value is selected add a type criteria for the object
			if (
					component.CriteriaGroup.EndClassWidgetGroup.value_selected.length == 0
					&&
					this.addObjectsTypeCriteria
			) {
				newTriples = this.addTriple(newTriples, objectVariable, this.typePredicate, component.CriteriaGroup.EndClassGroup.value_selected) ;
			}
		} else {
			newTriples = this.addTriple(newTriples, subjectVariable, obj, objectVariable) ;
		}
		
		jsonQuery = this.addInWhere(jsonQuery, newTriples) ;
		
		
		if(component.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 0 ) {
			
			switch (_WidgetType) {					
			  case WIDGET_LIST_PROPERTY:
				if (component.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 1) {
					// add values clause if we have more than 1 values
					var jsonValue = this.initValues() ;
					jsonValue = this.addVariable(jsonValue, objectVariable, component.CriteriaGroup.EndClassWidgetGroup.value_selected)
					jsonQuery = this.addInWhere(jsonQuery, jsonValue) ;
				}
				break;
			  case WIDGET_AUTOCOMPLETE_PROPERTY:
				if (component.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 1) {
					// add values clause if we have more than 1 values
					var jsonValue = this.initValues() ;
					jsonValue = this.addVariable(jsonValue, objectVariable, component.CriteriaGroup.EndClassWidgetGroup.value_selected)
					jsonQuery = this.addInWhere(jsonQuery, jsonValue) ;
				}
				break;
				case WIDGET_TIME_PERIOD_PROPERTY:							
				  $.each(component.CriteriaGroup.EndClassWidgetGroup.value_selected, function( index, value ) {
					  jsonFilter = this.initFilterTime(value.start, value.stop, objectVariable) ;
					  jsonQuery = this.addInWhere(jsonQuery, jsonFilter) ;
				  });
				  break;
				case WIDGET_TIME_DATE_PICKER_PROPERTY:
				case WIDGET_TIME_DATE_DAY_PICKER_PROPERTY:						
				  $.each(component.CriteriaGroup.EndClassWidgetGroup.value_selected, function( index, value ) {
					  jsonFilter = this.initFilterTime(value.start, value.stop, objectVariable) ;
					  jsonQuery = this.addInWhere(jsonQuery, jsonFilter) ;
				  });
				  break;
			  case WIDGET_SEARCH_PROPERTY:
				var Texte = $('#ecgrw-search-'+ i +'-input-value').val() ;
				jsonFilter = this.initFilterSearch(Texte, objectVariable) ;
				jsonQuery = this.addInWhere(jsonQuery, jsonFilter) ;
				break;
			  default:						
			}						
		}	

		return jsonQuery;		
	}

	GetDependantCriteria(thisForm_, id) {
		var dependant = null ;
		var dep_id = null ;
		var element = thisForm_._this.find('li[data-index="'+id+'"]') ;
		
		if ($(element).parents('li').length > 0) {			
			dep_id = $($(element).parents('li')[0]).attr('data-index') ;
			dependant = {type : 'parent'}  ;			
		} else {
			if ($(element).prev().length > 0) {
				dep_id = $(element).prev().attr('data-index') ;
				dependant = {type : 'sibling'}  ;				
			}
		}

		$(thisForm_.components).each(function(index) {			
			if (this.index == dep_id) {
				dependant.element = this.CriteriaGroup ;
			}
		}) ;

		return dependant ;
	}

	newQueryJson() {
		return {
			"queryType": "SELECT"+((this.addDistinct)?' DISTINCT':'')+"",
			"variables": [
				"?this"
			],
			"where": [],
			"type": "query",
			"prefixes": {
				"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
				"xsd": "http://www.w3.org/2001/XMLSchema#"
			}
		}
	}
	
	initTriple() {			
		return {
				"type": "bgp",
				"triples": []
		} ;
	}

	initValues() {			
		return {
				"type": "values",
				"values": []
		} ;
	}

	initFilterTime(StartYear, EndYear, index) {
		return {
			"type": "filter",
			"expression": {
				"type": "operation",
				"operator": "&&",
				"args": [
					{
						"type": "operation",
						"operator": ">",
						"args": [
							""+index+"",
							"\""+StartYear+"-01-01\"^^http://www.w3.org/2001/XMLSchema#date"
						]
					},
					{
						"type": "operation",
						"operator": "<=",
						"args": [
							""+index+"",
							"\""+EndYear+"-12-31\"^^http://www.w3.org/2001/XMLSchema#date"
						]
					}
				]
			}
		} ;
	}

	initFilterSearch(Texte, index) {			
		return {
			"type": "filter",
			"expression": {
				"type": "operation",
				"operator": "regex",
				"args": [
					
					""+index+"",
					"\""+Texte+"\"",
					"\"i\""
				]
			}
		} ;
	}

	addTriple(jsonTriples, subjet, predicate, object) {
		
		var triple = {
			"subject": subjet,
			"predicate": predicate,
			"object": object,
		} ;
					
		jsonTriples.triples.push(triple) ;
		
		return jsonTriples ;
	}
	
	addInWhere(jsonQuery, JsonToWhere) {
		jsonQuery.where.push(JsonToWhere) ;		
		return jsonQuery ;
	}

	addVariable(jsonValues, name, valueUrl) {			
		$.each(valueUrl, function( index, value ) {
		  var newValue = {
			//[name]: value
		  }
		  newValue[name] = value ;
		  jsonValues.values.push(newValue) ;			  
		});
		
		return jsonValues ;	
	}

	addVariableDate(json, name, valueUrl) {			
		var newValue = {
			//[name]: valueUrl
		};
		newValue[name] = valueUrl ;
		json.where[1].values.push(newValue) ;		
		
		return json ;	
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
	DefaultQueryGenerator: DefaultQueryGenerator
}
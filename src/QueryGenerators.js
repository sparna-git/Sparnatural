var SparqlGenerator = require('sparqljs').Generator;
// var SparqlParser = require('sparqljs').Parser;

var Config = require('./SparnaturalConfig.js');

class DefaultQueryGenerator {

	constructor(addDistinct, typePredicate, noTypeCriteriaForObjects, specProvider) {
		this.WIDGETS_REQUIRING_VALUES = [
			Config.SEARCH_PROPERTY,
			Config.TIME_PERIOD_PROPERTY,
			Config.TIME_DATE_PICKER_PROPERTY,
			Config.TIME_DATE_PICKER_PROPERTY
		] ;

		this.addDistinct = addDistinct;
		this.typePredicate = typePredicate;
		this.noTypeCriteriaForObjects = noTypeCriteriaForObjects;
		this.specProvider = specProvider;
		this.additionnalPrefixes = {};
	}

	// add a new prefix to the generated query
	addPrefix(prefix, uri) {
		this.additionnalPrefixes[prefix] = uri;
	}

	setPrefixes(prefixes) {
		this.additionnalPrefixes = prefixes;
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
		var VALUE_SELECTION_WIDGETS = [
			Config.LIST_PROPERTY,
			Config.AUTOCOMPLETE_PROPERTY,
			Config.NON_SELECTABLE_PROPERTY // Pas de valeur selectionné mais sera forcement utilisé pour une Class
		];

		var SPARQL_GRAPHDB_SEARCH_PROPERTY = 'sparql:GraphDBSearchProperty';


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
		if (end != null) {
			var objectVariable = '?'+this.localName(end)+''+objectVarIndex ;
		} else {
			var objectVariable = null ;
		}
		

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
					(
						this.noTypeCriteriaForObjects == false
						||
						(
							Array.isArray(this.noTypeCriteriaForObjects)
							&&
							this.noTypeCriteriaForObjects.indexOf(component.CriteriaGroup.EndClassGroup.value_selected) == -1
						)
					)
			) {
				newTriples = this.addTriple(newTriples, objectVariable, this.typePredicate, component.CriteriaGroup.EndClassGroup.value_selected) ;
			}
		} else {
			if (
				objectVariable !== null
				&&
				// don't add the triple if we are on a fulltext search since this will be part of the
				// search clause
				this.specProvider.getSparqlPropertyTypes(obj).indexOf(SPARQL_GRAPHDB_SEARCH_PROPERTY) == -1
			) {
				newTriples = this.addTriple(newTriples, subjectVariable, obj, objectVariable) ;
			}
			
		}
		
		jsonQuery = this.addInWhere(jsonQuery, newTriples) ;
		
		
		if(component.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 0 ) {
			var __this = this ;
			switch (_WidgetType) {					
			  case Config.LIST_PROPERTY:
				if (component.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 1) {
					// add values clause if we have more than 1 values
					var jsonValue = this.initValues() ;
					jsonValue = this.addVariable(jsonValue, objectVariable, component.CriteriaGroup.EndClassWidgetGroup.value_selected)
					jsonQuery = this.addInWhere(jsonQuery, jsonValue) ;
				}
				break;
			  case Config.AUTOCOMPLETE_PROPERTY:
				if (component.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 1) {
					// add values clause if we have more than 1 values
					var jsonValue = this.initValues() ;
					jsonValue = this.addVariable(jsonValue, objectVariable, component.CriteriaGroup.EndClassWidgetGroup.value_selected)
					jsonQuery = this.addInWhere(jsonQuery, jsonValue) ;
				}
				break;
				case Config.TIME_PERIOD_PROPERTY:
				  $.each(component.CriteriaGroup.EndClassWidgetGroup.value_selected, function( index, value ) {
					  jsonFilter = __this.initFilterTime(value.start, value.stop, objectVariable) ;
					  jsonQuery = __this.addInWhere(jsonQuery, jsonFilter) ;
				  });
				  break;
				case Config.TIME_DATE_PICKER_PROPERTY:
				case Config.TIME_DATE_DAY_PICKER_PROPERTY:						
				  $.each(component.CriteriaGroup.EndClassWidgetGroup.value_selected, function( index, value ) {
					  jsonFilter = __this.initFilterTime(value.start, value.stop, objectVariable) ;
					  jsonQuery = __this.addInWhere(jsonQuery, jsonFilter) ;
				  });
				  break;
			  	case Config.SEARCH_PROPERTY:
				  var Texte = component.CriteriaGroup.EndClassWidgetGroup.value_selected[0] ;
				  if(this.specProvider.getSparqlPropertyTypes(obj).indexOf(SPARQL_GRAPHDB_SEARCH_PROPERTY) != -1) {
				  	jsonQuery = this.updateGraphDbPrefixes(jsonQuery);
				  	newTriples = this.addTriple(newTriples, "?search", this.typePredicate, "http://www.ontotext.com/connectors/lucene/instance#pleinTexte") ;
				  	newTriples = this.addLiteralTriple(newTriples, "?search", "http://www.ontotext.com/connectors/lucene#query", "text:"+Texte) ;
				  	newTriples = this.addTriple(newTriples, "?search", "http://www.ontotext.com/connectors/lucene#entities", subjectVariable) ;
				  } else {				  	
					jsonFilter = this.initFilterSearch(Texte, objectVariable) ;
					jsonQuery = this.addInWhere(jsonQuery, jsonFilter) ;
				  }

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
		var jsonQuery = {
			"queryType": "SELECT"+((this.addDistinct)?' DISTINCT':'')+"",
			"variables": [
				"?this"
			],
			"where": [],
			"type": "query",
			"prefixes": {
				"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
				"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
				"xsd": "http://www.w3.org/2001/XMLSchema#"
			}
		};

		// add additionnal prefixes
		for (key in this.additionnalPrefixes) {
	        jsonQuery.prefixes[key] = this.additionnalPrefixes[key];
    	}

		return jsonQuery;
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
		var filters = new Array ;
		var filter = {
			"type": "filter",
			"expression": {
				"type": 'operation',
				"operator": "&&",
				"args": []
			}
		} ;
		
		if (StartYear != null) {
			filters.push( {
				"type": "operation",
				"operator": ">=",
				"args": [
					""+index+"",
					"\""+StartYear+"\"^^http://www.w3.org/2001/XMLSchema#date"
				]
			}) ;
		}
		if (EndYear != null) {
			filters.push( {
				"type": "operation",
				"operator": "<=",
				"args": [
					""+index+"",
					"\""+EndYear+"\"^^http://www.w3.org/2001/XMLSchema#date"
				]
			}) ;
		}
		if (filters.length == 2 ) {
			filter["expression"]["args"] = filters ;
		} else {
			filter["expression"] = filters[0] ;
		}
		return filter ;
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

	addLiteralTriple(jsonTriples, subjet, predicate, object) {
		
		var triple = {
			"subject": subjet,
			"predicate": predicate,
			// encapsulates the object in quotes so that it is interpreted as a literal
			"object": "\""+object+"\""
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
		  var newValue = {  } ;
		  newValue[name] = value ;
		  jsonValues.values.push(newValue) ;			  
		});
		
		return jsonValues ;	
	}

	addVariableDate(json, name, valueUrl) {			
		var newValue = { };
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

	updateGraphDbPrefixes(jsonQuery) {
		jsonQuery.prefixes.inst = "http://www.ontotext.com/connectors/lucene/instance#";
		jsonQuery.prefixes.lucene = "http://www.ontotext.com/connectors/lucene#";
		return jsonQuery ;
	}

}

module.exports = {
	DefaultQueryGenerator: DefaultQueryGenerator
}
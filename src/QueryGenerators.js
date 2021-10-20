var SparqlGenerator = require('sparqljs').Generator;
// var SparqlParser = require('sparqljs').Parser;

var Config = require('./SparnaturalConfig.js');

Query = require("./Query.js").Query ;
QueryBranch = require("./Query.js").QueryBranch ;
QueryLine = require("./Query.js").QueryLine ;
URIValue = require("./Query.js").URIValue ;
LiteralValue = require("./Query.js").LiteralValue ;
DateTimeValue = require("./Query.js").DateTimeValue ;
SearchValue = require("./Query.js").SearchValue ;

class JSONQueryGenerator {

	constructor() {

	}

	getLine(json, index) {
		for (var i = 0; i < json.branches.length; i++) {
			result =  this.getRecursiveLine(json.branches[i], index) ;
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

	/**
	 * Generates a JSON query
	 **/
	generateQuery(formObject) {
		if(this.hasEnoughCriteria(formObject)) {
			var query = new Query();

			for (var i = 0; i < formObject.components.length; i++) {
				var component = formObject.components[i];
				var dependantDe = this.findDependantCriteria(formObject, i) ;
				if ((dependantDe == null) || (dependantDe.type == 'sibling') || (dependantDe.nextType == 'hasSibling')) {
					var branch = this.generateBranch(formObject, component, i, dependantDe);
					query.branches.push(branch);
				}				
			} ;	

			console.log(query) ;
			
			return query;	
		} else {
			return null;
		}		
	}

	generateBranch(formObject, component, i, dependantDe) {
		var branch = new QueryBranch();
					

		var domainClass = component.CriteriaGroup.StartClassGroup.value_selected ;
		var property = component.CriteriaGroup.ObjectPropertyGroup.value_selected ;
		var rangeClass = component.CriteriaGroup.EndClassGroup.value_selected ; 
		
		// not sure what this does
		/*var ArrayLiIndex = [] ;		
		$(formObject._this).find('ul.componentsListe li.groupe').each(function(i) {			
			var data_id = $(this).attr('data-index') ;
			ArrayLiIndex[data_id] = ArrayLiIndex.length ;
		}) ;*/

		// get index of subject and object variables
		/*var subjectVariableIndex;
		var objectVarIndex;
		if ((dependantDe != null) && (dependantDe.type == 'parent')){
			subjectVariableIndex = ArrayLiIndex[dependantDe.element.id] + 1;				
			objectVarIndex = ArrayLiIndex[i] + 1;					
			addStartClass = false ;					
		} else {						
			subjectVariableIndex = 0 ;
			objectVarIndex = ArrayLiIndex[i] + 1 ;
		}*/
		
		// name start and end variables
		// dashes should be replaced
		var subjectVariable = formObject._variablesNames.getName(component.CriteriaGroup.StartClassGroup.inputTypeComponent.id).replace("-", "_") ;
		/*if (subjectVariableIndex == 0) {
			subjectVariable = "?this";
		} else {
			subjectVariable = '?'+this.localName(domainClass).replace("-", "_")+''+subjectVariableIndex ;
		}*/
		if (rangeClass != null) {
			var objectVariable = formObject._variablesNames.getName(component.CriteriaGroup.EndClassGroup.inputTypeComponent.id).replace("-", "_") ;
		} else {
			var objectVariable = null ;
		}

		if ((dependantDe != null) && (typeof dependantDe.nextType !== 'undefined')) {
			LinedependantType = dependantDe.nextType ;
		} else {
			LinedependantType = null ;
		}

		var line = new QueryLine(
			subjectVariable,
			domainClass,
			property,
			rangeClass,
			objectVariable,
			i,
			LinedependantType
		);

		var values = component.CriteriaGroup.EndClassWidgetGroup.selectedValues;
		/*if(values.length > 0 ) {
			line.values = values ;
		}*/
		// Set the values based on widget type
		var _WidgetType = component.CriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetType ;
		if(component.CriteriaGroup.EndClassWidgetGroup.selectedValues.length > 0 ) {			
			switch (_WidgetType) {					
			  case Config.LIST_PROPERTY:
			  case Config.AUTOCOMPLETE_PROPERTY:
			  	for (var key in component.CriteriaGroup.EndClassWidgetGroup.selectedValues) {				  	
				  	var selectedValue = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key];
				  	line.values.push(new URIValue(
				  		selectedValue.uri,
				  		selectedValue.label
				  	));
				}
			  	break;
			  case Config.LITERAL_LIST_PROPERTY:
				for (var key in component.CriteriaGroup.EndClassWidgetGroup.selectedValues) {
					// TODO : we use the same key 'uri' but this is a literal
				  	var selectedValue = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key].uri;
				  	line.values.push(new LiteralValue(
				  		selectedValue.uri,
				  		selectedValue.label
				  	));
				}
				break;
			  case Config.TIME_PROPERTY_PERIOD:
			  case Config.TIME_PROPERTY_YEAR:
			  case Config.TIME_PROPERTY_DATE:
			  	for (var key in component.CriteriaGroup.EndClassWidgetGroup.selectedValues) {
					var selectedValue = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key];
					line.values.push(new DateTimeValue(selectedValue.start, selectedValue.stop, selectedValue.label));
				}
				break;
			  case Config.SEARCH_PROPERTY:				  
			  case Config.GRAPHDB_SEARCH_PROPERTY:
				  var value = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0].search;
				  line.values.push(new SearchValue(value, value));
				  break;
			  default:
			  	console.log('Unknown widget type when generating SPARQL : '+_WidgetType);						
			}						
		}

		// hook the line to the branch
		branch.line = line;

		// now find "children" branches
		for (var j = 0; j < formObject.components.length; j++) {
			var parentOfJ = this.findDependantCriteria(formObject, j) ;
			// not sure I should compare on id - is it equal to the index of the component ?
			if ((parentOfJ != null) && (parentOfJ.type == 'parent') && (parentOfJ.element.id == i)) {
				branch.children.push(
					// recursive call
					this.generateBranch(formObject, formObject.components[j], j, parentOfJ)
				);
			}
		}

		return branch;
	}

	hasEnoughCriteria(formObject) {
		for (var i = 0; i < formObject.components.length; i++) {			
			// if there is no value selected and the widget required one
			// do not process this component			
			if(
				($.inArray(formObject.components[i].CriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetType, this.WIDGETS_REQUIRING_VALUES) > -1)
				&&
				(formObject.components[i].CriteriaGroup.EndClassWidgetGroup.selectedValues.length === 0)
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

	findDependantCriteria(thisForm_, id) {
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

		if ($(element).next().length > 0) {
			if (dependant != null) {
				dependant.nextType = 'hasSibling'  ;
			} else {
				dependant = {nextType : 'hasSibling'}  ;
			}	
		}

		$(thisForm_.components).each(function(index) {			
			if (this.index == dep_id) {
				dependant.element = this.CriteriaGroup ;
			}
		}) ;

		return dependant ;
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










class DefaultQueryGenerator {

	constructor(addDistinct, typePredicate, specProvider) {
		this.WIDGETS_REQUIRING_VALUES = [
			Config.SEARCH_PROPERTY,
			Config.TIME_PROPERTY_PERIOD,
			Config.TIME_PROPERTY_YEAR,
			Config.TIME_PROPERTY_DATE
		] ;

		this.addDistinct = addDistinct;
		this.typePredicate = typePredicate;
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
	generateQuery(formObject) {
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
			
			return { "generatedQuery" : generatedQuery, "jsonQuery" : jsonQuery } ;		
		} else {
			return null;
		}
	}

	hasEnoughCriteria(formObject) {
		for (var i = 0; i < formObject.components.length; i++) {			
			// if there is no value selected and the widget required one
			// do not process this component			
			if(
				($.inArray(formObject.components[i].CriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetType, this.WIDGETS_REQUIRING_VALUES) > -1)
				&&
				(formObject.components[i].CriteriaGroup.EndClassWidgetGroup.selectedValues.length === 0)
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
			Config.LITERAL_LIST_PROPERTY,
			Config.LIST_PROPERTY,
			Config.AUTOCOMPLETE_PROPERTY,
			Config.NON_SELECTABLE_PROPERTY // Pas de valeur selectionné mais sera forcement utilisé pour une Class
		];

		var SPARQL_GRAPHDB_SEARCH_PROPERTY = 'sparql:GraphDBSearchProperty';


		var domainClass = component.CriteriaGroup.StartClassGroup.value_selected ;
		var property = component.CriteriaGroup.ObjectPropertyGroup.value_selected ;
		var rangeClass = component.CriteriaGroup.EndClassGroup.value_selected ; 
		
		var dependantDe = this.GetDependantCriteria(formObject, index) ;
		// get index of subject and object variables
		/*var subjectVariableIndex;
		var objectVarIndex;
		if ((dependantDe != null) && (dependantDe.type == 'parent')){
			subjectVariableIndex = ArrayLiIndex[dependantDe.element.id] + 1;				
			objectVarIndex = ArrayLiIndex[index] + 1;					
			addStartClass = false ;					
		} else {						
			subjectVariableIndex = 0 ;
			objectVarIndex = ArrayLiIndex[index] + 1 ;
		}*/



		// name start and end variables
		// dashes should be replaced
		/*if (subjectVariableIndex == 0) {
			subjectVariable = "?this";
		} else {
			subjectVariable = '?'+this.localName(domainClass).replace("-", "_")+''+subjectVariableIndex ;
		}
		if (rangeClass != null) {
			var objectVariable = '?'+this.localName(rangeClass).replace("-", "_")+''+objectVarIndex ;
		} else {
			var objectVariable = null ;
		}*/

		var subjectVariable = '?'+formObject._variablesNames.getName(component.CriteriaGroup.StartClassGroup.inputTypeComponent.id).replace("-", "_") ;

		if (rangeClass != null) {
			var objectVariable = '?'+formObject._variablesNames.getName(component.CriteriaGroup.EndClassGroup.inputTypeComponent.id).replace("-", "_") ;
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
		var newBasicGraphPattern = this.initBasicGraphPattern() ;
		if (addStartClass) {
			newBasicGraphPattern.triples.push(this.buildTriple(subjectVariable, this.typePredicate, domainClass)) ;
		}
		
		var _WidgetType = component.CriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetType ;
		if ( VALUE_SELECTION_WIDGETS.indexOf(_WidgetType) !== -1 ) {
			if (component.CriteriaGroup.EndClassWidgetGroup.selectedValues.length == 1) {
				// if we are in a value selection widget and we have a single value selected
				// then insert the value directly as the object of the triple						
				newBasicGraphPattern.triples.push(this.buildTriple(
					subjectVariable,
					property,
					component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0].uri,
					// insert as a literal if the widget was a literal list
					(_WidgetType == Config.LITERAL_LIST_PROPERTY)
				)) ;
			} else {
				// otherwise use a variable name as the object of the triple
				newBasicGraphPattern.triples.push(this.buildTriple(subjectVariable, property, objectVariable)) ;
			}

			// if no value is selected add a type criteria for the object
			if (
					component.CriteriaGroup.EndClassWidgetGroup.selectedValues.length == 0
					&&
					(
						!this.specProvider.isRemoteClass(component.CriteriaGroup.EndClassGroup.value_selected)
						&&
						!this.specProvider.isLiteralClass(component.CriteriaGroup.EndClassGroup.value_selected)
					)
			) {
				newBasicGraphPattern.triples.push(this.buildTriple(objectVariable, this.typePredicate, component.CriteriaGroup.EndClassGroup.value_selected)) ;
			}
		} else {
			if (
				objectVariable !== null
				&&
				// don't add the triple if we are on a fulltext search since this will be part of the
				// search clause
				// this.specProvider.getObjectPropertyType(property).indexOf(SPARQL_GRAPHDB_SEARCH_PROPERTY) == -1
				_WidgetType != Config.GRAPHDB_SEARCH_PROPERTY
			) {
				newBasicGraphPattern.triples.push(this.buildTriple(subjectVariable, property, objectVariable)) ;
			}
			
		}
		
		jsonQuery.where.push(newBasicGraphPattern) ;
		
		
		if(component.CriteriaGroup.EndClassWidgetGroup.selectedValues.length > 0 ) {
			var __this = this ;
			switch (_WidgetType) {					
			  case Config.LIST_PROPERTY:
				if (component.CriteriaGroup.EndClassWidgetGroup.selectedValues.length > 1) {
					// add values clause if we have more than 1 values
					var jsonValues = this.initValues() ;
					jsonValues = this.addVariable(jsonValues, objectVariable, component.CriteriaGroup.EndClassWidgetGroup.selectedValues)
					jsonQuery.where.push(jsonValues) ;
				}
				break;
			  case Config.LITERAL_LIST_PROPERTY:
				if (component.CriteriaGroup.EndClassWidgetGroup.selectedValues.length > 1) {
					// add values clause if we have more than 1 values
					var jsonValues = this.initValues() ;
					jsonValues = this.addVariable(jsonValues, objectVariable, component.CriteriaGroup.EndClassWidgetGroup.selectedValues)
					jsonQuery.where.push(jsonValues) ;
				}
				break;
			  case Config.AUTOCOMPLETE_PROPERTY:
				if (component.CriteriaGroup.EndClassWidgetGroup.selectedValues.length > 1) {
					// add values clause if we have more than 1 values
					var jsonValues = this.initValues() ;
					jsonValues = this.addVariable(jsonValues, objectVariable, component.CriteriaGroup.EndClassWidgetGroup.selectedValues)
					jsonQuery.where.push(jsonValues) ;
				}
				break;
			  case Config.TIME_PROPERTY_PERIOD:
			  case Config.TIME_PROPERTY_YEAR:
			  case Config.TIME_PROPERTY_DATE:
				  for (var key in component.CriteriaGroup.EndClassWidgetGroup.selectedValues) {
				  	var value = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key];
				  	jsonQuery.where.push(
					  	this.initFilterTime(value.start, value.stop, objectVariable)
					) ;
				  }
				  break;
			  case Config.SEARCH_PROPERTY:
				  var searchKey = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0].search ;			  	
				  jsonFilter = this.initFilterSearch(searchKey, objectVariable) ;
				  jsonQuery.where.push(jsonFilter) ;
				  break;
			  case Config.GRAPHDB_SEARCH_PROPERTY:
				  var searchKey = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0].search ;
				  jsonQuery = this.updateGraphDbPrefixes(jsonQuery);
				  var connectorName = this.localName(rangeClass);
				  var fieldName = this.localName(property);
				  var searchVariable = subjectVariable+"Search";
				  newBasicGraphPattern.triples.push(this.buildTriple(searchVariable, this.typePredicate, "http://www.ontotext.com/connectors/lucene/instance#"+connectorName)) ;
				  // add literal triple
				  newBasicGraphPattern.triples.push(this.buildTriple(searchVariable, "http://www.ontotext.com/connectors/lucene#query", fieldName+":"+searchKey, true)) ;
				  newBasicGraphPattern.triples.push(this.buildTriple(searchVariable, "http://www.ontotext.com/connectors/lucene#entities", subjectVariable)) ;
				  break;
			  default:
			  	console.log('Unknown widget type when generating SPARQL : '+_WidgetType);						
			}						
		}	

		// console.log(jsonQuery);
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
	
	initBasicGraphPattern() {			
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

	initFilterTime(StartTime, EndTime, variable) {
		
		var filters = new Array ;
		if (StartTime != null) {
			filters.push( {
				"type": "operation",
				"operator": ">=",
				"args": [
					{
						"type": "functioncall",
						"function": "http://www.w3.org/2001/XMLSchema#dateTime",
						"args" : [
							""+variable+""
						]
					},
					"\""+StartTime+"\"^^http://www.w3.org/2001/XMLSchema#dateTime"
				]
			}) ;
		}
		if (EndTime != null) {
			filters.push( {
				"type": "operation",
				"operator": "<=",
				"args": [
					{
						"type": "functioncall",
						"function": "http://www.w3.org/2001/XMLSchema#dateTime",
						"args" : [
							""+variable+""
						]
					},
					"\""+EndTime+"\"^^http://www.w3.org/2001/XMLSchema#dateTime"
				]
			}) ;
		}

		if (filters.length == 2 ) {
			return {
				"type": "filter",
				"expression": {
					"type": 'operation',
					"operator": "&&",
					"args": filters
				}
			} ;
		} else {
			return {
				"type": "filter",
				"expression": filters[0]
			} ;
		}
	}

	initFilterSearch(texte, variable) {			
		return {
			"type": "filter",
			"expression": {
				"type": "operation",
				"operator": "regex",
				"args": [					
					""+variable+"",
					"\""+texte+"\"",
					"\"i\""
				]
			}
		} ;
	}

	buildTriple(subjet, predicate, object, literalObject=false) {
		
		// encapsulates the object in quotes so that it is interpreted as a literal
		var objectValue = (literalObject)?"\""+object+"\"":object;
		var triple = {
			"subject": subjet,
			"predicate": predicate,
			"object": objectValue,
		} ;
					
		return triple;
	}

	addVariable(jsonValues, name, allValues) {			
		$.each(allValues, function( index, value ) {
		  var newValue = {  } ;
		  newValue[name] = value.uri ;
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
	DefaultQueryGenerator: DefaultQueryGenerator,
	JSONQueryGenerator: JSONQueryGenerator
}
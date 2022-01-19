var SparqlGenerator = require('sparqljs').Generator;
// var SparqlParser = require('sparqljs').Parser;

var Config = require('./SparnaturalConfig.js');

Query = require("./Query.js").Query ;
QueryBranch = require("./Query.js").QueryBranch ;
QueryLine = require("./Query.js").QueryLine ;
URIValue = require("./Query.js").URIValue ;
LiteralValue = require("./Query.js").LiteralValue ;
DateTimeValue = require("./Query.js").DateTimeValue ;
RegexValue = require("./Query.js").RegexValue ;
ExactStringValue = require("./Query.js").ExactStringValue ;
BooleanValue = require("./Query.js").BooleanValue ;

class JSONQueryGenerator {

	constructor() {

	}

	/**
	 * Generates a JSON query
	 **/
	generateQuery(formObject) {
		if(this.hasEnoughCriteria(formObject)) {
			var query = new Query(formObject.queryOptions);

			for (var i = 0; i < formObject.sparnatural.components.length; i++) {
				var component = formObject.sparnatural.components[i];
				var dependantDe = this.findDependantCriteria(formObject, i) ;
				// at first level of the query, we have either no dependant criteria for the first lin
				// of type = sibling
				// at other level, the type is always "parent"
				if ((dependantDe == null) || (dependantDe.type == 'sibling')) {
					var branch = this.generateBranch(formObject, component, i, dependantDe);
					query.branches.push(branch);
				}			
			} ;	

			// console.log(query) ;
			
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


		branch.optional = component.CriteriaGroup.OptionsGroup.valuesSelected['optional'];
		branch.notExists = component.CriteriaGroup.OptionsGroup.valuesSelected['notExists'];
		
		// name start and end variables
		// dashes should be replaced
		var subjectVariable = component.CriteriaGroup.StartClassGroup.getVarName() ;
		if(i == 0) {
			subjectVariable = "?this";
		}

		var objectVariable = null ;
		if (rangeClass != null) {
			objectVariable = component.CriteriaGroup.EndClassGroup.getVarName() ;
		} 

		var line = new QueryLine(
			subjectVariable,
			domainClass,
			property,
			rangeClass,
			objectVariable
		);

		var values = component.CriteriaGroup.EndClassWidgetGroup.selectedValues;
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
				  	var selectedValue = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[key];
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
				  line.values.push(new RegexValue(value, value));
				  break;
			  case Config.STRING_EQUALS_PROPERTY:
			  	  var value = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0].search;
				  line.values.push(new ExactStringValue(value, value));
				  break;
			  case Config.BOOLEAN_PROPERTY:
			  	  var selectedValue = component.CriteriaGroup.EndClassWidgetGroup.selectedValues[0];
			  	  line.values.push(new BooleanValue(selectedValue.boolean, selectedValue.label));
			  	  break;
			  default:
			  	console.log('Unknown widget type when generating SPARQL : '+_WidgetType);						
			}						
		}

		// hook the line to the branch
		branch.line = line;

		// now find "children" branches
		for (var j = 0; j < formObject.sparnatural.components.length; j++) {
			var parentOfJ = this.findDependantCriteria(formObject, j) ;
			// not sure I should compare on id - is it equal to the index of the component ?
			if ((parentOfJ != null) && (parentOfJ.type == 'parent') && (parentOfJ.element.id == i)) {
				branch.children.push(
					// recursive call
					this.generateBranch(formObject, formObject.sparnatural.components[j], j, parentOfJ)
				);
			}
		}

		return branch;
	}

	hasEnoughCriteria(formObject) {
		for (var i = 0; i < formObject.sparnatural.components.length; i++) {			
			// if there is no value selected and the widget required one
			// do not process this component			
			if(
				($.inArray(formObject.sparnatural.components[i].CriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetType, this.WIDGETS_REQUIRING_VALUES) > -1)
				&&
				(formObject.sparnatural.components[i].CriteriaGroup.EndClassWidgetGroup.selectedValues.length === 0)
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
		var element = $(thisForm_.sparnatural).find('li[data-index="'+id+'"]') ;
		
		if ($(element).parents('li').length > 0) {			
			dep_id = $($(element).parents('li')[0]).attr('data-index') ;
			dependant = {type : 'parent'}  ;			
		} else {
			if ($(element).prev().length > 0) {
				dep_id = $(element).prev().attr('data-index') ;
				dependant = {type : 'sibling'}  ;				
			}
			
		}

		$(thisForm_.sparnatural.components).each(function(index) {			
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


module.exports = {
	JSONQueryGenerator: JSONQueryGenerator
}
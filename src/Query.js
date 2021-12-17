var SparqlGenerator = require('sparqljs').Generator;


/**
 * A complete Sparnatural Query, that can be serialized to SPARQL, and can be reloaded in Sparnatural
 **/
export class Query {

	constructor(options) {
		console.log(options) ;
		this.distinct = options.distinct;
		this.variables = options.displayVariableList;
		this.order = null ;
		
		if (options.orderSort !== null) {
			this.order = {
				expression : "?this",
				sort : options.orderSort
			} ;
		}
		
		
		// array of QueryBranch
		this.branches = [];
	}

}

/**
 * A "branch" in the query, that is a line with its children where clauses
 **/
export class QueryBranch {

	constructor() {
		this.line = new QueryLine();
		// array of QueryBranch
		this.children = [];
		this.optional = false;
		this.notExists = false;
	}
}

/**
 * A single line in the query, with subject/predicate/object and selected values
 **/
export class QueryLine {

	constructor(
		subjectVariable,
		subjectType,
		property,
		objectType,
		objectVariable,
		i,
		dependantType
	) {
		this.s = subjectVariable;
		this.p = property;
		this.o = objectVariable;
		this.sType = subjectType;
		this.oType = objectType;
		this.values = [];
		this.index = i;
		// does it has siblings after him ?
		this.dNextType = dependantType;
	}
}

/**
 * A value selected in a query line; can be a single URI, a date/range, etc. depending on the widget
 **/
export class AbstractValue {

	constructor(label) {
		// not used to serialize SPARQL, just for info
		this.label = label;
	}

	static valueToWidgetValue(v) {
	    if(v.uri) {
	    	return {
				key: v.uri ,
				label: v.label,
				uri: v.uri
			};
	    } else if(v.fromDate || v.toDate) {
			return {
				key: v.fromDate+' '+v.toDate,
				label: v.label,
				start: v.fromDate,
				stop: v.toDate
			}
	    } else if(v.literal) {
	    	return {
				key: v.literal,
				label: v.label
			}
	    } else if(v.regex) {
	    	return {
				key: v.regex,
				label: v.label,
				search: v.regex
			}
	    } else if(v.string) {
	    	return {
				key: v.string,
				label: v.label,
				search: v.string
			}
	    }
	}

}

/**
 * A single URI value
 **/
export class URIValue extends AbstractValue {
	constructor(uri, label=null) {
		super(label);
		this.uri=uri;
	}
}

/**
 * A literal value
 **/
export class LiteralValue extends AbstractValue {
	constructor(literal, label=null) {
		super(label);
		this.literal=literal;
	}
}

export class DateTimeValue extends AbstractValue {
	constructor(fromDate, toDate, label=null) {
		super(label);
		this.fromDate = fromDate;
		this.toDate = toDate;
	}
}

export class RegexValue extends AbstractValue {
	constructor(regex, label=null) {
		super(label);
		this.regex = regex;
	}
}

export class ExactStringValue extends AbstractValue {
	constructor(string, label=null) {
		super(label);
		this.string = string;
	}
}

/**
 * Writes a Query data structure in SPARQL
 **/
export class QuerySPARQLWriter {

	constructor(
		distinct=true,
		typePredicate="http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
		specProvider
	) {
		this.distinct = distinct;
		this.typePredicate = typePredicate;
		this.specProvider = specProvider;
		this.additionnalPrefixes = {};

		// var SparqlParser = require('sparqljs').Parser;
		// var parser = new SparqlParser();
		// var query = parser.parse("SELECT ?x WHERE { ?x a <http://ex.fr/Museum> FILTER(LCASE(?label) = LCASE(\"Key\")) } ORDER BY DESC(?x)");
		// console.log(query);
	}

	// add a new prefix to the generated query
	addPrefix(prefix, uri) {
		this.additionnalPrefixes[prefix] = uri;
	}

	setPrefixes(prefixes) {
		this.additionnalPrefixes = prefixes;
	}

	toSPARQL(query) {
		var sparqlQuery = {
			"type": "query",
			"queryType": "SELECT"+((this.distinct)?' DISTINCT':'')+"",
			"variables": query.variables,
			"where": [],			
			"prefixes": {
				"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
				"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
				"xsd": "http://www.w3.org/2001/XMLSchema#"
			}
		};

		// add additionnal prefixes
		for (var key in this.additionnalPrefixes) {
	        sparqlQuery.prefixes[key] = this.additionnalPrefixes[key];
    	}

		for (var i = 0; i < query.branches.length; i++) {
			this._QueryBranchToSPARQL(
				sparqlQuery,
				sparqlQuery.where,
				query.branches[i],
				// only the first one will have a type criteria
				i == 0
			) ;
		}

		// add order clause, if any
		if(query.order) {
			sparqlQuery.order = this._initOrder(query.order.expression, (query.order.sort)?query.order.sort:null);
		}

		console.log(sparqlQuery);

		var stringWriter = new QueryExplainStringWriter(this.specProvider);
		console.log(stringWriter.toExplainString(query));

		var generator = new SparqlGenerator();
		var generatedQuery = generator.stringify(sparqlQuery);		

		return generatedQuery;
	}

	_QueryBranchToSPARQL(sparqlQuery, parent, queryBranch, firstTopLevelBranch) {		
		// write the line
		var parentInSparqlQuery = parent;
		if(queryBranch.optional) {
			var optional = this._initOptional() ;
			parent.push(optional);
			parentInSparqlQuery = optional.patterns;
		} else if(queryBranch.notExists) {
			var filterNotExists = this._initFilterNotExists() ;
			parent.push(filterNotExists);
			parentInSparqlQuery = filterNotExists.expression.args[0].patterns;
		}
		this._QueryLineToSPARQL(parentInSparqlQuery, sparqlQuery, queryBranch.line, firstTopLevelBranch);

		// iterate on children
		for (var i = 0; i < queryBranch.children.length; i++) {
			// recursive call on children
			this._QueryBranchToSPARQL(
				sparqlQuery,
				parentInSparqlQuery,
				queryBranch.children[i],
				false
			)
		}
	}

	_QueryLineToSPARQL(parentInSparqlQuery, completeSparqlQuery, queryLine, includeSubjectType=false) {
		var bgp = this._initBasicGraphPattern() ;

		// only for the very first criteria
		if (includeSubjectType) {
			var typeBgp = this._initBasicGraphPattern() ;
			typeBgp.triples.push(this._buildTriple(
				queryLine.s,
				this.typePredicate,
				queryLine.sType
			)) ;
			// this criteria is _always_ inserted in the global where,
			// ant not in the parent OPTIONAL or FILTER NOT EXISTS
			completeSparqlQuery.where.push(typeBgp);
		}

		if(queryLine.p && queryLine.o) {
			if(queryLine.values.length == 0) {
				if(
					!this.specProvider.isRemoteClass(queryLine.oType)
					&&
					!this.specProvider.isLiteralClass(queryLine.oType)
				) {
					bgp.triples.push(this._buildTriple(
						queryLine.s,
						queryLine.p,
						queryLine.o
					)) ;
					bgp.triples.push(this._buildTriple(
						queryLine.o,
						this.typePredicate,
						queryLine.oType
					)) ;
				}
			} else if(
				queryLine.values.length == 1
				&&
				( queryLine.values[0].uri || queryLine.values[0].literal )
			) {
				// if we are in a value selection widget and we have a single value selected
				// then insert the value directly as the object of the triple						
				bgp.triples.push(this._buildTriple(
					queryLine.s,
					queryLine.p,
					// either a URI or a literal in case of LiteralList widget
					(queryLine.values[0].uri)?queryLine.values[0].uri:queryLine.values[0].literal,
					// insert as a literal if the value is a literal value
					queryLine.values[0] instanceof LiteralValue
				)) ;
			} else {
				// push in the bgp only s/p/o, values are inserted after
				bgp.triples.push(this._buildTriple(
					queryLine.s,
					queryLine.p,
					queryLine.o
				)) ;
			}
		}
		parentInSparqlQuery.push(bgp);

		// this can only be the case for value selection widgets
		if(queryLine.values.length > 1) {			
			var jsonValues = this._initValues() ;
			queryLine.values.forEach(function(v) {
				var newValue = {  } ;
				// either a URI or a literal in case of LiteralList widget
		 		newValue[queryLine.o] = (v.uri)?v.uri:"\""+v.literal+"\"" ;
		  		jsonValues.values.push(newValue) ;
			});
			parentInSparqlQuery.push(jsonValues) ;
		}

		// if we have a date criteria
		if(queryLine.values.length == 1 && (queryLine.values[0].fromDate || queryLine.values[0].toDate)) {
			parentInSparqlQuery.push(
				this._initFilterTime(queryLine.values[0].fromDate, queryLine.values[0].toDate, queryLine.o)
			) ;
		}	

		// if we have a regex criteria
		if(queryLine.values.length == 1 && queryLine.values[0].regex) {
			parentInSparqlQuery.push(
				this._initFilterRegex(queryLine.values[0].regex, queryLine.o)
			) ;
		}

		// if we have a string criteria
		if(queryLine.values.length == 1 && queryLine.values[0].string) {
			parentInSparqlQuery.push(
				this._initFilterStringEquals(queryLine.values[0].string, queryLine.o)
			) ;
		}
	}


	_buildTriple(subjet, predicate, object, literalObject=false) {
		
		// encapsulates the object in quotes so that it is interpreted as a literal
		var objectValue = (literalObject)?"\""+object+"\"":object;
		var triple = {
			"subject": subjet,
			"predicate": predicate,
			"object": objectValue,
		} ;
					
		return triple;
	}

	_initBasicGraphPattern() {			
		return {
				"type": "bgp",
				"triples": []
		} ;
	}

	_initValues() {			
		return {
				"type": "values",
				"values": []
		} ;
	}

	_initOptional() {			
		return {
				"type": "optional",
				"patterns": []
		} ;
	}

	_initFilterNotExists() {
		return {
				"type": "filter",
				"expression": {
					"type" : "operation",
					"operator": "notexists",
					"args" : [
						{
							"type" : "group",
							"patterns" : []
						}
					]
				}
		} ;
	}

	_initFilterTime(StartTime, EndTime, variable) {
		
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

	_initFilterRegex(texte, variable) {			
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

	_initFilterStringEquals(texte, variable) {			
		return {
			"type": "filter",
			"expression": {
				"type": "operation",
				"operator": "=",
				"args": [					
					{
						"type": "operation",
						"operator": "lcase",
						"args" : [
							""+variable+""
						]
					},
					{
						"type": "operation",
						"operator": "lcase",
						"args" : [
							"\""+texte+"\""
						]
					}
				]
			}
		} ;
	}

	_initOrder(variable, order) {
		console.log(order) ;
		var singleOrderClause = {
			"expression" : variable
		};
		if(order == 'desc') {
			singleOrderClause.descending = true;
		}
		if(order == 'asc') {
			singleOrderClause.ascending = true;
		}

		return [singleOrderClause];
	}

	_updateGraphDbPrefixes(jsonQuery) {
		jsonQuery.prefixes.inst = "http://www.ontotext.com/connectors/lucene/instance#";
		jsonQuery.prefixes.lucene = "http://www.ontotext.com/connectors/lucene#";
		return jsonQuery ;
	}
}

export class QueryExplainStringWriter {
	constructor(
		specProvider
	) {
		this.specProvider = specProvider;
	}

	toExplainString(query) {
		var explainString = "";
		for (var i = 0; i < query.branches.length; i++) {
			if(i != 0) {
				explainString += "and" + "\n";
			}
			explainString += this._QueryBranchToExplainString(query.branches[i], 0);
		}
		return explainString;
	}

	_QueryBranchToExplainString(queryBranch, indent) {
		var result = "";
		// write the line
		result += this._QueryLineToExplainString(queryBranch.line, indent);

		// iterate on children
		var newIndent = indent+2;
		for (var i = 0; i < queryBranch.children.length; i++) {
			if(i == 0) {
				result += " ".repeat(newIndent) + "where" + "\n";
			} else {
				result += " ".repeat(newIndent) + "and" + "\n";
			}
			// recursive call on children
			result += this._QueryBranchToExplainString(
				queryBranch.children[i],
				newIndent
			)
		}
		return result;
	}

	_QueryLineToExplainString(queryLine, indent) {
		var result = " ".repeat(indent);
		result += this.specProvider.getLabel(queryLine.sType);
		if(queryLine.p && queryLine.o) {
			result += " "+this.specProvider.getLabel(queryLine.p);
			result += " "+this.specProvider.getLabel(queryLine.oType);
			if(queryLine.values.length > 0) {
				result += " : ";
			}
			queryLine.values.forEach(function(v) {
				result += v.label+", ";
			});
		}
		result += "\n";
		return result;
	}
}
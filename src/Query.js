var SparqlGenerator = require('sparqljs').Generator;

/**
 * A complete Sparnatural Query, that can be serialized to SPARQL, and can be reloaded in Sparnatural
 **/
export class Query {

	constructor(distinct=true) {
		this.distinct = distinct;
		this.variables = ["?this"];
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
		// array of CriteriaBranch
		this.children = [];
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

}

/**
 * A single URI value
 **/
export class URIValue extends AbstractValue {
	constructor(uri, label=null) {
		super(label);
		this.uri=uri;
	}

	toWidgetValue() {
		return {
			key: this.uri ,
			label: this.label,
			uri: this.uri
		}
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

	toWidgetValue() {
		return {
			key: this.literal,
			label: this.label
		}
	}
}

export class DateTimeValue extends AbstractValue {
	constructor(fromDate, toDate, label=null) {
		super(label);
		this.fromDate = fromDate;
		this.toDate = toDate;
	}

	toWidgetValue() {
		return {
			key: this.fromDate+' '+this.toDate,
			label: this.label,
			start: this.fromDate,
			stop: this.toDate
		}
	}
}

export class SearchValue extends AbstractValue {
	constructor(key, label=null) {
		super(label);
		this.key = key;
	}

	valueKey() {
		return this.key;
	}

	toWidgetValue() {
		return {
			key: this.key,
			label: this.label,
			search: this.key
		}
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
		for (key in this.additionnalPrefixes) {
	        sparqlQuery.prefixes[key] = this.additionnalPrefixes[key];
    	}

		for (var i = 0; i < query.branches.length; i++) {
			this._QueryBranchToSPARQL(
				sparqlQuery,
				query.branches[i],
				// only the first one will have a type criteria
				i == 0
			) ;
		}

		console.log(sparqlQuery);

		var stringWriter = new QueryExplainStringWriter(this.specProvider);
		console.log(stringWriter.toExplainString(query));

		var generator = new SparqlGenerator();
		var generatedQuery = generator.stringify(sparqlQuery);		

		return generatedQuery;
	}

	_QueryBranchToSPARQL(sparqlQuery, queryBranch, firstTopLevelBranch) {		
		// write the line
		this._QueryLineToSPARQL(sparqlQuery, queryBranch.line, firstTopLevelBranch);

		// iterate on children
		for (var i = 0; i < queryBranch.children.length; i++) {
			// recursive call on children
			this._QueryBranchToSPARQL(
				sparqlQuery,
				queryBranch.children[i],
				false
			)
		}
	}

	_QueryLineToSPARQL(sparqlQuery, queryLine, includeSubjectType=false) {
		var bgp = this._initBasicGraphPattern() ;

		// only for the very first criteria
		if (includeSubjectType) {
			bgp.triples.push(this._buildTriple(
				queryLine.s,
				this.typePredicate,
				queryLine.sType
			)) ;
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
				queryLine.values[0].uri
			) {
				// if we are in a value selection widget and we have a single value selected
				// then insert the value directly as the object of the triple						
				bgp.triples.push(this._buildTriple(
					queryLine.s,
					queryLine.p,
					queryLine.values[0].uri,
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
		sparqlQuery.where.push(bgp);

		// this can only be the case for value selection widgets
		if(queryLine.values.length > 1) {			
			var jsonValues = this._initValues() ;
			queryLine.values.forEach(function(v) {
				var newValue = {  } ;
		 		newValue[name] = v.uri ;
		  		jsonValues.values.push(newValue) ;
			});
			sparqlQuery.where.push(jsonValues) ;
		}

		// if we have a date criteria
		if(queryLine.values.length == 1 && (queryLine.values[0].fromDate || queryLine.values[0].toDate)) {
			sparqlQuery.where.push(
				this._initFilterTime(queryLine.values[0].fromDate, queryLine.values[0].toDate, queryLine.o)
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
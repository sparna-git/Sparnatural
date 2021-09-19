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
		objectVariable
	) {
		this.subjectVariable = subjectVariable;
		this.subjectType = subjectType;
		this.property = property;
		this.objectType = objectType;
		this.objectVariable = objectVariable;
		this.values = [];
	}
}

/**
 * A value selected in a query line; can be a single URI, a date/range, etc. depending on the widget
 **/
export class AbstractValue {

	constructor(displayLabel) {
		// not used to serialize SPARQL, just for info
		this.displayLabel = displayLabel;
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
	constructor(literal) {
		super();
		this.literal=literal;
	}
}

export class DateTimeValue extends AbstractValue {
	constructor(fromDate, toDate) {
		this.fromDate = fromDate;
		this.toDate = toDate;
	}
}

export class SearchValue extends AbstractValue {
	constructor(key) {
		this.key = key;
	}
}

/**
 * Writes a Query data structure in SPARQL
 **/
export class QuerySPARQLWriter {

	constructor(distinct=true, typePredicate="http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
		this.distinct = distinct;
		this.typePredicate = typePredicate;
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
			var basicGraphPatterns = this._QueryBranchToSPARQL(
				query.branches[i],
				// only the first one will have a type criteria
				i == 0
			) ;
			for (var k = 0; k < basicGraphPatterns.length; k++) {
				sparqlQuery.where.push(basicGraphPatterns[k]);
			}
		}

		console.log(sparqlQuery);

		var generator = new SparqlGenerator();
		var generatedQuery = generator.stringify(sparqlQuery);		

		return generatedQuery;
	}

	_QueryBranchToSPARQL(queryBranch, firstTopLevelBranch) {
		var basicGraphPatterns = [];

		var newBasicGraphPattern = this._initBasicGraphPattern() ;
		// write the line
		this._QueryLineToSPARQL(queryBranch.line, newBasicGraphPattern, firstTopLevelBranch);
		basicGraphPatterns.push(newBasicGraphPattern);

		// iterate on children
		for (var i = 0; i < queryBranch.children.length; i++) {
			// recursive call on children
			basicGraphPatterns.concat(this._QueryBranchToSPARQL(
				queryBranch.children[i],
				false
			)) ;
		}

		return basicGraphPatterns;
	}

	_QueryLineToSPARQL(queryLine, bgp, includeSubjectType=false) {
		// only for the very first criteria
		if (includeSubjectType) {
			bgp.triples.push(this._buildTriple(
				queryLine.subjectVariable,
				this.typePredicate,
				queryLine.subjectType
			)) ;
		}

		if(queryLine.values.length == 0) {
			// TODO
		} else if(queryLine.values.length == 1) {
			// if we are in a value selection widget and we have a single value selected
			// then insert the value directly as the object of the triple						
			bgp.triples.push(this._buildTriple(
				queryLine.subjectVariable,
				queryLine.property,
				queryLine.values[0].uri,
				// insert as a literal if the value is a literal value
				queryLine.values[0] instanceof LiteralValue
			)) ;
		} else {
			// TODO
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


}
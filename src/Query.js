var SparqlGenerator = require('sparqljs').Generator;


/**
 * A complete Sparnatural Query, that can be serialized to SPARQL, and can be reloaded in Sparnatural
 **/
export class Query {

	constructor(options) {
		this.distinct = options.distinct;
		this.variables = options.displayVariableList;		
		this.defaultLang = options.defaultLang;

		this.order = null ;
		if (options.orderSort !== null) {
			this.order = {
				expression : this.variables[0],
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
	    } else if(v.luceneQueryValue) {
	    	return {
				key: v.luceneQueryValue,
				label: v.label,
				search: v.luceneQueryValue
			}
	    } else if(v.string) {
	    	return {
				key: v.string,
				label: v.label,
				search: v.string
			}
	    } else if(v.boolean) {
	    	return {
				key: v.boolean,
				label: v.label,
				boolean: v.boolean
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

export class LuceneQueryValue extends AbstractValue {
	constructor(luceneQueryValue, label=null) {
		super(label);
		this.luceneQueryValue = luceneQueryValue;
	}
}

export class ExactStringValue extends AbstractValue {
	constructor(string, label=null) {
		super(label);
		this.string = string;
	}
}

export class BooleanValue extends AbstractValue {
	constructor(boolean, label=null) {
		super(label);
		this.boolean = boolean;
	}
}

/**
 * Writes a Query data structure in SPARQL
 **/
export class QuerySPARQLWriter {

	constructor(
		typePredicate="http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
		specProvider
	) {
		this.typePredicate = typePredicate;
		this.specProvider = specProvider;
		this.additionnalPrefixes = {};

		var SparqlParser = require('sparqljs').Parser;
		var parser = new SparqlParser();
		// var query = parser.parse("SELECT ?x WHERE { ?x a <http://ex.fr/Museum> FILTER(LCASE(?label) = LCASE(\"Key\")) } ORDER BY DESC(?x)");
		// var query = parser.parse("SELECT ?x WHERE { ?x <http://ex.fr/test> true }");
		var query = parser.parse("PREFIX ex: <http://exemple.fr/> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>  SELECT ?this WHERE { { ?this ex:date ?date . FILTER('1575-01-01'^^xsd:date < ?date && ?date < '1580-12-31'^^xsd:date) } UNION { ?this ex:beginDate ?beginDate .  FILTER(?beginDate < '1580-12-31'^^xsd:date) ?this ex:endDate ?endDate . FILTER(?endDate > '1575-01-01'^^xsd:date) } }");

		console.log(query);
	}

	// add a new prefix to the generated query
	addPrefix(prefix, uri) {
		this.additionnalPrefixes[prefix] = uri;
	}

	setPrefixes(prefixes) {
		this.additionnalPrefixes = prefixes;
	}

	toSPARQL(q) {

		// deep clone the query, because we will modify it prior to execution
		var query = JSON.parse(JSON.stringify(q))
		// preprocess the query, in particular add extra criterias for labels
		this._preProcessQueryForLabelProperty(query);

		var sparqlQuery = {
			"type": "query",
			"queryType": "SELECT"+((query.distinct)?' DISTINCT':'')+"",
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

    	// now transform to SPARQL
		for (var i = 0; i < query.branches.length; i++) {
			this._QueryBranchToSPARQL(
				sparqlQuery,
				sparqlQuery.where,
				query.branches[i],
				// only the first one will have a type criteria
				i == 0,
				query
			) ;
		}

		// add order clause, if any
		if(query.order) {
			sparqlQuery.order = this._initOrder(query.order.expression, (query.order.sort)?query.order.sort:null);
		}

		var stringWriter = new QueryExplainStringWriter(this.specProvider);
		console.log(stringWriter.toExplainString(query));

		var generator = new SparqlGenerator();
		var generatedQuery = generator.stringify(sparqlQuery);		

		return generatedQuery;
	}

	_preProcessQueryForLabelProperty(jsonQuery) {
		for(var i = 0;i < jsonQuery.branches.length;i++) {
			var branch = jsonQuery.branches[i];
			jsonQuery.branches[i] = this._preprocessBranchForLabelProperty_rec(branch, i == 0, jsonQuery);
		}
		return jsonQuery;
	}

	_preprocessBranchForLabelProperty_rec(branch, firstTopLevelBranch, jsonQuery) {
		for(var i = 0;i < branch.children.length;i++) {
			var child = branch.children[i];
			branch.children[i] = this._preprocessBranchForLabelProperty_rec(child, false, jsonQuery);
		}

		if(
			jsonQuery.variables.includes(branch.line.s)
			&&
			this.specProvider.getDefaultLabelProperty(branch.line.sType) != null
			&&
			firstTopLevelBranch
		) {
			var labelProperty = this.specProvider.getDefaultLabelProperty(branch.line.sType);

			if(branch.parent == null) {
				// add criteria to fetch the label
				var newBranch = new QueryBranch();
				newBranch.line = new QueryLine(
					branch.line.s,
					branch.line.sType,
					labelProperty,
					this.specProvider.readRange(labelProperty)[0],
					branch.line.s+"_label"
				);
				// set it optional if declared
				newBranch.optional = this.specProvider.isEnablingOptional(labelProperty);
				jsonQuery.branches.push(newBranch);
				// and select the new variable, right after the original one
				jsonQuery.variables.splice(jsonQuery.variables.indexOf(branch.line.s)+1, 0, branch.line.s+"_label");
			}
		}


		if(
			jsonQuery.variables.includes(branch.line.o)
			&&
			this.specProvider.getDefaultLabelProperty(branch.line.oType) != null
		) {
			var labelProperty = this.specProvider.getDefaultLabelProperty(branch.line.oType);

			// add criteria to fetch the label
			var newBranch = new QueryBranch();
			newBranch.line = new QueryLine(
				branch.line.o,
				branch.line.oType,
				labelProperty,
				this.specProvider.readRange(labelProperty)[0],
				branch.line.o+"_label"
			);
			// set it optional if declared
			newBranch.optional = this.specProvider.isEnablingOptional(labelProperty);
			branch.children.push(newBranch);
			// and select the new variable, right after the original one
			jsonQuery.variables.splice(jsonQuery.variables.indexOf(branch.line.o)+1, 0, branch.line.o+"_label");
		}

		

		return branch;
	}

	_QueryBranchToSPARQL(sparqlQuery, parent, queryBranch, firstTopLevelBranch, query) {		
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
		this._QueryLineToSPARQL(parentInSparqlQuery, sparqlQuery, queryBranch.line, firstTopLevelBranch, query);

		// iterate on children
		for (var i = 0; i < queryBranch.children.length; i++) {
			// recursive call on children
			this._QueryBranchToSPARQL(
				sparqlQuery,
				parentInSparqlQuery,
				queryBranch.children[i],
				false,
				query
			)
		}
	}

	_QueryLineToSPARQL(parentInSparqlQuery, completeSparqlQuery, queryLine, includeSubjectType=false, query) {
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

		// insert BGP righ now so that lang filter comes after in generated SPARQL
		parentInSparqlQuery.push(bgp);

		if(queryLine.p && queryLine.o) {

			var beginDateProp = this.specProvider.getBeginDateProperty(queryLine.p);
			var endDateProp = this.specProvider.getEndDateProperty(queryLine.p);
			if(
				beginDateProp !== null
				&&
				endDateProp !== null
			) {
				// if we are on a date criteria
				if(queryLine.values.length == 1 && (queryLine.values[0].fromDate || queryLine.values[0].toDate)) {
					var exactDateProp = this.specProvider.getExactDateProperty(queryLine.p);
					var bitsOfQuery = this._initDateRangeOrExactDateCriteria(
						// beginDateProp,
						beginDateProp,
						// endDateProp,
						endDateProp,
						// exactDateProp,
						exactDateProp,
						// subjectVariable,
						queryLine.s,
						// objectVariable,
						queryLine.o,
						// startDate,
						queryLine.values[0].fromDate,
						// endDate
						queryLine.values[0].toDate
					);
					bitsOfQuery.forEach(element => parentInSparqlQuery.push(element));
				}
			} else {
				if(queryLine.values.length == 0) {

					// no value, insert ?s ?p ?o line
					bgp.triples.push(this._buildTriple(
						queryLine.s,
						queryLine.p,
						queryLine.o
					)) ;				

					// if the property can be multilingual, insert a FILTER(langMatches(lang(?x), "fr"))
					if(
						this.specProvider.isMultilingual(queryLine.p)
					) {
						parentInSparqlQuery.push(
							this._initFilterLang(query.defaultLang,queryLine.o)
						) ;
					}

					// if the class of the value does no correspond to a literal, insert a criteria
					// on its rdf:type, if it is not remote
					if(
						!this.specProvider.isLiteralClass(queryLine.oType)
						&&
						!this.specProvider.isRemoteClass(queryLine.oType)
					) {
						bgp.triples.push(this._buildTriple(
							queryLine.o,
							this.typePredicate,
							queryLine.oType
						)) ;
					}
				
				} else if(
					// there is a single value
					queryLine.values.length == 1
					&&
					// and it is a URI or a Literal
					( queryLine.values[0].uri || queryLine.values[0].literal )
					&&
					// and we don't need the value to be selected
					(!query.variables.includes(queryLine.o))
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
				} else if(
					queryLine.values.length == 1
					&&
					queryLine.values[0].boolean
					&&
					(!query.variables.includes(queryLine.o))
				) {		
					// build direct boolean value				
					bgp.triples.push(this._buildTriple(
						queryLine.s,
						queryLine.p,
						"\""+queryLine.values[0].boolean+"\"^^http://www.w3.org/2001/XMLSchema#boolean",
						false
					)) ;
				} else {

					// more than one value for an URI, or a search criteria
					// push in the bgp only s/p/o, values are inserted after
					bgp.triples.push(this._buildTriple(
						queryLine.s,
						queryLine.p,
						queryLine.o
					)) ;

					// if the property can be multilingual, insert a FILTER(langMatches(lang(?x), "fr"))
					if(
						this.specProvider.isMultilingual(queryLine.p)
					) {
						parentInSparqlQuery.push(
							this._initFilterLang(query.defaultLang,queryLine.o)
						) ;
					}
				}		

				// this can only be the case for value selection widgets
				if(
					// we use a VALUES if there is more than one value
					queryLine.values.length > 1
					||
					// or if there is only one, but we need the variable to be selected
					// only
					(
						queryLine.values.length == 1
						&&
						(queryLine.values[0].uri || queryLine.values[0].literal)
						&&
						query.variables.includes(queryLine.o)
					)			
				) {			
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

					// TODO : language filter
				}

				// if we have a lucene query criteria
				if(queryLine.values.length == 1 && queryLine.values[0].luceneQueryValue) {
					this._updateGraphDbPrefixes(completeSparqlQuery);
					// name of index must correspond to the local name of the range class
					var connectorName = this._localName(queryLine.oType);
					// field name in index corresponds to the local name of the property
					var fieldName = this._localName(queryLine.p);
					var searchVariable = queryLine.s+"Search";

					var newBasicGraphPattern = this._initBasicGraphPattern() ;
					newBasicGraphPattern.triples.push(this._buildTriple(searchVariable, this.typePredicate, "http://www.ontotext.com/connectors/lucene/instance#"+connectorName)) ;
					// add literal triple
					newBasicGraphPattern.triples.push(this._buildTriple(searchVariable, "http://www.ontotext.com/connectors/lucene#query", fieldName+":"+queryLine.values[0].luceneQueryValue, true)) ;
					newBasicGraphPattern.triples.push(this._buildTriple(searchVariable, "http://www.ontotext.com/connectors/lucene#entities", queryLine.s)) ;
					parentInSparqlQuery.push(newBasicGraphPattern);  
				}

				// if we have an exact string criteria
				if(queryLine.values.length == 1 && queryLine.values[0].string) {
					parentInSparqlQuery.push(
						this._initFilterStringEquals(queryLine.values[0].string, queryLine.o)
					) ;

					// TODO : language filter
				}
			} // end case of begin date / start date
		} // end if p & o
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

	_initGroup() {			
		return {
				"type": "group",
				"patterns": []
		} ;
	}

	_initUnion() {			
		return {
				"type": "union",
				"patterns": []
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

	_initFilterTime(startTime, endTime, variable) {
		
		var filters = new Array ;
		if (startTime != null) {
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
					"\""+startTime+"\"^^http://www.w3.org/2001/XMLSchema#dateTime"
				]
			}) ;
		}
		if (endTime != null) {
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
					"\""+endTime+"\"^^http://www.w3.org/2001/XMLSchema#dateTime"
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

	_initFilterLang(lang, variable) {			
		return {
			"type": "filter",
			"expression": {
				"type": "operation",
				"operator": "langMatches",
				"args": [					
					{
						"type": "operation",
						"operator": "lang",
						"args" : [
							""+variable+""
						]
					},
					"\""+lang+"\""
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


	_initDateRangeOrExactDateCriteria(
		beginDateProp,
		endDateProp,
		exactDateProp,
		subjectVariable,
		objectVariable,
		startDate,
		endDate
	) {
		if(exactDateProp != null) {
			var result = this._initUnion();

			// first alternative of the union to test exact date
			var firstAlternative = this._initGroup();
			var bgp = this._initBasicGraphPattern();
			var exactDateVarName = objectVariable+"_exact";
			bgp.triples.push(this._buildTriple(subjectVariable, exactDateProp, exactDateVarName));
			firstAlternative.patterns.push(bgp);
			// exact date is within provided date range
			firstAlternative.patterns.push(this._initFilterTime(startDate, endDate, exactDateVarName));

			// second alternative to test date range
			var secondAlternative = this._initGroup();
			secondAlternative.patterns.push(
				this._initDateRangeCriteria(
					beginDateProp,
					endDateProp,
					subjectVariable,
					objectVariable,
					startDate,
					endDate
				)
			);

			result.patterns.push(firstAlternative);
			result.patterns.push(secondAlternative);
			// return as an array
			return [result];
		} else {
			return this._initDateRangeCriteria(
				beginDateProp,
				endDateProp,
				subjectVariable,
				objectVariable,
				startDate,
				endDate
			);
		}
	}

	// builds a date range criteria to test the overlap between a date range of the resource
	// and the provided date range.
	// The provided date range may have only start date or end date provided
	_initDateRangeCriteria(
		beginDateProp,
		endDateProp,
		subjectVariable,
		objectVariable,
		startDate,
		endDate
	) {
		var result = [];

		// we have provided both begin and end date criteria
		if(startDate != null && endDate != null) {				
			var bgp = this._initBasicGraphPattern();
			var beginDateVarName = objectVariable+"_begin";
			var endDateVarName = objectVariable+"_end";

			bgp.triples.push(this._buildTriple(subjectVariable, beginDateProp, beginDateVarName));
			bgp.triples.push(this._buildTriple(subjectVariable, endDateProp, endDateVarName));
			result.push(bgp);

			// begin date is before given end date
			result.push(this._initFilterTime(null, endDate, beginDateVarName));
			// end date is after given start date
			result.push(this._initFilterTime(startDate, null, endDateVarName));
		// we have provided only a start date
		} else if(startDate != null && endDate === null) {
			var bgp = this._initBasicGraphPattern();
			var endDateVarName = objectVariable+"_end";
			bgp.triples.push(this._buildTriple(subjectVariable, endDateProp, endDateVarName));
			result.push(bgp);
			// end date is after given start date
			result.push(this._initFilterTime(startDate, null, endDateVarName));
		// we have provided only a end date
		} else if(startDate === null && endDate != null) {
			var bgp = this._initBasicGraphPattern();
			var beginDateVarName = objectVariable+"_begin";
			bgp.triples.push(this._buildTriple(subjectVariable, beginDateProp, beginDateVarName));
			result.push(bgp);
			// begin date is before given end date
			result.push(this._initFilterTime(null, endDate, beginDateVarName));
		}

		return result;
	}


	_initOrder(variable, order) {
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

	_localName(uri) {
		if (uri.indexOf("#") > -1) {
			return uri.split("#")[1] ;
		} else {
			var components = uri.split("/") ;
			return components[components.length - 1] ;
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
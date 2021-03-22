class AbstractSparqlAutocompleteAndListHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath) {
		this.sparqlEndpointUrl = sparqlEndpointUrl;
		this.sparqlPostprocessor = sparqlPostprocessor;
		this.language = language;
		this.searchPath = (searchPath != null)?searchPath:"rdfs:label";
		this.listOrder = "alphabetical";
	}

	/**
	 * Post-processes the SPARQL query and builds the full URL for autocomplete search
	 **/
	autocompleteUrl(domain, property, range, key) {			
		var sparql = this._buildAutocompleteSparql(domain, property, range, key);
		sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);

		var url = this.sparqlEndpointUrl+"?query="+encodeURIComponent(sparql)+"&format=json";
		return url;
	}

	/**
	 * Post-processes the SPARQL query and builds the full URL for list content
	 **/
	listUrl(domain, property, range) {
		var sparql = this._buildListSparql(domain, property, range);

		sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);

		var url = this.sparqlEndpointUrl+"?query="+encodeURIComponent(sparql)+"&format=json";
		return url;
	}

	listLocation(domain, property, range, data) {
		return data.results.bindings;
	}

	elementLabel(element) {
		return element.label.value;
	}

	/* TODO : rename to elementValue */
	elementUri(element) {
		if(element.uri) {
			return element.uri.value;
		} else if(element.value) {
			return element.value.value;
		}
	}

	enableMatch(domain, property, range) {
		return false;
	}
}

/**
 * Handles a list widget based on a provided SPARQL template in which
 * $domain, $property and $range will be replaced by actual values.
 **/
class SparqlTemplateListHandler extends AbstractSparqlAutocompleteAndListHandler {

	constructor(
		sparqlEndpointUrl,
		sparqlPostprocessor,
		language,
		labelPath,
		sparqlTemplate
	) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language, null);
		this.sparqlTemplate = sparqlTemplate;
		this.labelPath = labelPath;
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {
		return null;
	}

	/**
	 * Constructs the SPARQL query to use for list widget search.
	 **/
	_buildListSparql(domain, property, range) {
		var sparql = this.sparqlTemplate;

		var reDomain = new RegExp("\\$domain","g");
		var reProperty = new RegExp("\\$property","g");
		var reRange = new RegExp("\\$range","g");
		var reLang = new RegExp("\\$lang","g");
		
		sparql = this.sparqlTemplate
			.replace(reDomain, "<"+ domain +">")
			.replace(reProperty, "<"+ property +">")
			.replace(reRange, "<"+ range +">")
			.replace(reLang, "'"+ this.language +"'");

		if(this.labelPath != null) {
			var reLabelPath = new RegExp("\\$labelPath","g");
			sparql = sparql.replace(reLabelPath, this.labelPath );
		}

		console.log(sparql);

		return sparql;
	}
}



/**
 * Handles a list widget based on a provided SPARQL template in which
 * $domain, $property and $range will be replaced by actual values.
 **/
class SparqlTemplateAutocompleteHandler extends AbstractSparqlAutocompleteAndListHandler {

	constructor(
		sparqlEndpointUrl,
		sparqlPostprocessor,
		language,
		labelPath,
		sparqlTemplate
	) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language, null);
		this.sparqlTemplate = sparqlTemplate;
		this.labelPath = labelPath;
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {
		
		var sparql = this.sparqlTemplate;

		var reDomain = new RegExp("\\$domain","g");
		var reProperty = new RegExp("\\$property","g");
		var reRange = new RegExp("\\$range","g");
		var reLang = new RegExp("\\$lang","g");
		var reKey = new RegExp("\\$key","g");
		
		sparql = this.sparqlTemplate
			.replace(reDomain, "<"+ domain +">")
			.replace(reProperty, "<"+ property +">")
			.replace(reRange, "<"+ range +">")
			.replace(reLang, "'"+ this.language +"'")
			.replace(reKey, "" + key + "");

		if(this.labelPath != null) {
			var reLabelPath = new RegExp("\\$labelPath","g");
			sparql = sparql.replace(reLabelPath, this.labelPath );
		}

		console.log(sparql);

		return sparql;
	}

	/**
	 * Constructs the SPARQL query to use for list widget search.
	 **/
	_buildListSparql(domain, property, range) {
		return null;
	}
}





class SimpleSparqlAutocompleteAndListHandler extends AbstractSparqlAutocompleteAndListHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath);
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {
			
		var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri ?label
 WHERE {
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri ${this.searchPath} ?label 
	${ (this.language != null) ? `FILTER(lang(?label) = "${this.language}")` : "" }
	FILTER(STRSTARTS(LCASE(STR(?label)), LCASE("${key}"))) 
} 
ORDER BY ?label
			`;

		return sparql;
	}

	/**
	 * Constructs the SPARQL query to use for list widget search.
	 **/
	_buildListSparql(domain, property, range) {
		var sparql;

		switch (this.listOrder) {					
		  case 'count':
			sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri ?count (CONCAT(STR(?labelString), ' (', STR(?count), ')') AS ?label)
 WHERE {
	{
		SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
		WHERE {
			?domain a <${domain}> .
			?domain <${property}> ?uri .
			?uri a <${range}> .
		}
		GROUP BY ?uri
	}
	?uri ${this.searchPath} ?labelString .
	${ (this.language != null) ? `FILTER(lang(?labelString) = "${this.language}")` : "" }
}
ORDER BY DESC(?count)
	`;
			break;
		  case 'alphabeticalWithCount':
			sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri ?count (CONCAT(STR(?labelString), ' (', STR(?count), ')') AS ?label)
 WHERE {
	{
		SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
		WHERE {
			?domain a <${domain}> .
			?domain <${property}> ?uri .
			?uri a <${range}> .
		}
		GROUP BY ?uri
	}
	?uri ${this.searchPath} ?labelString .
	${ (this.language != null) ? `FILTER(lang(?labelString) = "${this.language}")` : "" }
}
ORDER BY ?label
	`;
			break;
		  case 'alphabetical':
		  default:	
			sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri ?label
WHERE {
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri ${this.searchPath} ?label .
	${ (this.language != null) ? `FILTER(lang(?label) = "${this.language}")` : "" }
}
ORDER BY ?label
	`;					
		}

		return sparql;
	}
}


class UriOnlyListHandler extends SimpleSparqlAutocompleteAndListHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor) {
		super(sparqlEndpointUrl, sparqlPostprocessor, null, null);
	}


	/**
	 * Constructs the SPARQL query to use for list widget search.
	 **/
	_buildListSparql(domain, property, range) {
		var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri ?count (CONCAT(STR(?uri), ' (', STR(?count), ')') AS ?label)
 WHERE {
	{
		SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
		WHERE {
			?domain a <${domain}> .
			?domain <${property}> ?uri .
			# Note how the range criteria is not used in this query
		}
		GROUP BY ?uri
	}
}
ORDER BY DESC(?count)
	`;

		return sparql;
	}
}



class SparqlBifContainsAutocompleteAndListHandler extends SimpleSparqlAutocompleteAndListHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath);
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {
			
		var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri ?label
 WHERE {
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri ${this.searchPath} ?label .
	${ (this.language != null) ? `FILTER(lang(?label) = "${this.language}")` : "" }
	# Note the single quote to handle space character
	?label bif:contains "'${key}'" . 
} 
ORDER BY ?label
			`;

		return sparql;
	}

}

/**
 * Simple handler for GraphDB Lucene connectors : http://graphdb.ontotext.com/documentation/standard/lucene-graphdb-connector.html
 * Takes as input the name of the connector, the field to search on, and the property to read to display
 * TODO : the property to display should come from the snippet
 **/
class GraphDbLuceneConnectorSparqlAutocompleteAndListHandler extends AbstractSparqlAutocompleteAndListHandler {

	/**
	 * The search path, in this case, is used only to read the label,
	 * not to search
	 **/
	constructor(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath, connectorName, fieldName) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath);
		this.connectorName = connectorName;
		this.fieldName = fieldName;
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {
			
		var sparql = `
PREFIX : <http://www.ontotext.com/connectors/lucene#>
PREFIX inst: <http://www.ontotext.com/connectors/lucene/instance#>
SELECT DISTINCT ?uri ?label
 WHERE {
 	?search a inst:${this.connectorName} ;
		:query "${this.fieldName}:${key}" ;
		:entities ?uri .
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri ${this.searchPath} ?label 
	${ (this.language != null) ? `FILTER(lang(?label) = "${this.language}")` : "" }
} 
ORDER BY ?label
			`;

		return sparql;
	}

}



class WikidataAutocompleteAndListHandler extends SimpleSparqlAutocompleteAndListHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language);
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {

/*

SELECT ?uri ?uriLabel
WHERE {
{
SELECT ?uri ?uriLabel WHERE {
  {
  SELECT DISTINCT ?uri WHERE {  
    ?domain wdt:P31 wd:Q34770 .
    ?domain wdt:P17 ?uri .
  }
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
}
}
  
  FILTER(STRSTARTS(lcase(?uriLabel), "f"))  
}
ORDER BY ?uriLabel

*/
		var sparql = `
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT DISTINCT ?uri ?uriLabel WHERE {
  SERVICE wikibase:mwapi {
      bd:serviceParam wikibase:api "EntitySearch" .
      bd:serviceParam wikibase:endpoint "www.wikidata.org" .
      bd:serviceParam mwapi:search "${key}" .
      ${ (this.language != null) ? `bd:serviceParam mwapi:language "${this.language}" .` : "" }
      ?this wikibase:apiOutputItem mwapi:item .
  }
  ?domain wdt:P31 <${domain}> .
  ?domain <${property}> ?uri .
   # ?uri wdt:P31 <${range}> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.language}". }
}
ORDER BY ?uriLabel
		`;
		return sparql;
	}

	_buildListSparql(domain, property, range) {

/*
SELECT ?uri ?uriLabel WHERE {
  {
  SELECT DISTINCT ?uri WHERE {  
    ?domain wdt:P31 wd:Q34770 .
    ?domain wdt:P17 ?uri .
  }
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
}
ORDER BY ?uriLabel
*/
		var sparql = `
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT DISTINCT ?uri ?uriLabel WHERE {
  ?domain wdt:P31 <${domain}> .
  ?domain <${property}> ?uri .
   # ?uri wdt:P31 <${range}> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.language}". }
}
ORDER BY ?uriLabel
		`;
		return sparql;
	}


	elementLabel(element) {
		return element.uriLabel.value;
	}
}


class RangeBasedAutocompleteAndListHandler {

	constructor(defaultHandler, handlerByKeyMap) {
		this.defaultHandler = defaultHandler;
		this.handlerByKeyMap = handlerByKeyMap;
	}

	_findHandler(domain, property, range) {
		if(this.handlerByKeyMap[range] != null) {
			return this.handlerByKeyMap[range];
		} else {
			return this.defaultHandler;
		}
	}

	autocompleteUrl(domain, property, range, key) {			
		return this._findHandler(domain, property, range).autocompleteUrl(domain, property, range, key);
	}

	listUrl(domain, property, range) {
		return this._findHandler(domain, property, range).listUrl(domain, property, range);
	}

	listLocation(domain, property, range, data) {
		return this._findHandler(domain, property, range).listLocation(domain, property, range, data);
	}

	elementLabel(element) {
		// TODO : forces that every handler must have the same result structure than the default one
		return this.defaultHandler.elementLabel(element);
	}

	elementUri(element) {
		// TODO : forces that every handler must have the same result structure than the default one
		return this.defaultHandler.elementUri(element);
	}

	enableMatch(domain, property, range) {
		return this._findHandler(domain, property, range).enableMatch(domain, property, range);
	}

}


class PropertyBasedAutocompleteAndListHandler extends RangeBasedAutocompleteAndListHandler {

	constructor(defaultHandler, handlerByKeyMap) {
		super(defaultHandler, handlerByKeyMap);
	}

	_findHandler(domain, property, range) {
		if(this.handlerByKeyMap[property] != null) {
			return this.handlerByKeyMap[property];
		} else {
			return this.defaultHandler;
		}
	}
}


module.exports = {
	SparqlBifContainsAutocompleteAndListHandler: SparqlBifContainsAutocompleteAndListHandler,
	SimpleSparqlAutocompleteAndListHandler: SimpleSparqlAutocompleteAndListHandler,
	UriOnlyListHandler: UriOnlyListHandler,
	RangeBasedAutocompleteAndListHandler: RangeBasedAutocompleteAndListHandler,
	PropertyBasedAutocompleteAndListHandler: PropertyBasedAutocompleteAndListHandler,
	WikidataAutocompleteAndListHandler: WikidataAutocompleteAndListHandler,
	GraphDbLuceneConnectorSparqlAutocompleteAndListHandler: GraphDbLuceneConnectorSparqlAutocompleteAndListHandler,
	SparqlTemplateListHandler: SparqlTemplateListHandler,
	SparqlTemplateAutocompleteHandler: SparqlTemplateAutocompleteHandler
}
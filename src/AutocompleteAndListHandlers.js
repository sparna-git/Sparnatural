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

	elementUri(element) {
		return element.uri.value;
	}

	enableMatch(domain, property, range) {
		return false;
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
SELECT ?uri ?count (CONCAT(?labelString, ' (', STR(?count), ')') AS ?label)
 WHERE {
	{
		SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
		WHERE {
			?domain a <${domain}> .
			?domain <${property}> ?uri .
			?uri a <${range}> .
		}
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
SELECT ?uri ?count (CONCAT(?labelString, ' (', STR(?count), ')') AS ?label)
 WHERE {
	{
		SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
		WHERE {
			?domain a <${domain}> .
			?domain <${property}> ?uri .
			?uri a <${range}> .
		}
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
		}
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
	WikidataAutocompleteAndListHandler: WikidataAutocompleteAndListHandler
}
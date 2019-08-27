class AbstractSparqlAutocompleteAndListHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language) {
		this.sparqlEndpointUrl = sparqlEndpointUrl;
		this.sparqlPostprocessor = sparqlPostprocessor;
		this.language = language;
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

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language);
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {
			
		var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?uri ?label
WHERE {
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri rdfs:label ?label 
	FILTER(lang(?label) = "${this.language}")
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

		var sparql = `
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
	?uri rdfs:label ?labelString .
	FILTER(lang(?labelString) = "${this.language}")
}
ORDER BY DESC(?count)
	`;

		return sparql;
	}
}


class SparqlBifContainsAutocompleteAndListHandler extends SimpleSparqlAutocompleteAndListHandler {

	constructor(sparqlEndpointUrl, sparqlPostprocessor, language) {
		super(sparqlEndpointUrl, sparqlPostprocessor, language);
	}

	/**
	 * Constructs the SPARQL query to use for autocomplete widget search.
	 **/
	_buildAutocompleteSparql(domain, property, range, key) {
			
		var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?uri ?label
WHERE {
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri rdfs:label ?label 
	FILTER(lang(?label) = "${this.language}")
	FILTER(bif:contains(?label, "${key}")) 
} 
ORDER BY ?label
			`;

		return sparql;
	}

}

module.exports = {
	SparqlBifContainsAutocompleteAndListHandler: SparqlBifContainsAutocompleteAndListHandler,
	SimpleSparqlAutocompleteAndListHandler: SimpleSparqlAutocompleteAndListHandler	
}
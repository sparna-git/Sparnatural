var SparqlBifContainsAutocompleteAndListHandler = function(sparqlEndpointUrl, sparqlPostprocessor) {
	this.sparqlEndpointUrl = sparqlEndpointUrl;
	this.sparqlPostprocessor = sparqlPostprocessor;
	this.language = "fr"

	this.autocompleteUrl = function(domain, property, range, key) {
		
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

		sparql = sparqlPostprocessor.semanticPostProcess(sparql);

		var url = this.sparqlEndpointUrl+"?query="+encodeURIComponent(sparql)+"&format=json";
		return url;
	},

	this.listUrl = function(domain, property, range) {

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

		sparql = sparqlPostprocessor.semanticPostProcess(sparql);

		var url = this.sparqlEndpointUrl+"?query="+encodeURIComponent(sparql)+"&format=json";
		return url;
	},

	this.listLocation = function(domain, property, range, data) {
		return data.results.bindings;
	},

	this.elementLabel = function(element) {
		return element.label.value;
	},

	this.elementUri = function(element) {
		return element.uri.value;
	},

	this.enableMatch = function(domain, property, range) {
		return false;
	}
}

module.exports = {
	SparqlBifContainsAutocompleteAndListHandler: SparqlBifContainsAutocompleteAndListHandler	
}
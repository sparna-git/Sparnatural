class AbstractSparqlStatisticsHandler {
  constructor(sparqlEndpointUrl, sparqlPostprocessor) {
    this.sparqlEndpointUrl = sparqlEndpointUrl;
    this.sparqlPostprocessor = sparqlPostprocessor;
  }

  /**
   * Count instances of a class
   **/
  countClassUrl(aClass) {
    var sparql = this._buildClassCountSparql(aClass);
    sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);
    console.log(sparql);
    var separator = this.sparqlEndpointUrl.indexOf("?") > 0 ? "&" : "?";
    var url =
      this.sparqlEndpointUrl +
      separator +
      "query=" +
      encodeURIComponent(sparql) +
      "&format=json";
    return url;
  }

  /**
   * Count instances of a property
   **/
  countPropertyUrl(domain, property, range) {
    var sparql = this._buildPropertyCountSparql(domain, property, range);

    sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);

    var separator = this.sparqlEndpointUrl.indexOf("?") > 0 ? "&" : "?";
    var url =
      this.sparqlEndpointUrl +
      separator +
      "query=" +
      encodeURIComponent(sparql) +
      "&format=json";
    return url;
  }

  /**
   * Count instances of a property without a range
   **/
  countPropertyWithoutRangeUrl(domain, property) {
    var sparql = this._buildPropertyWithoutRangeCountSparql(domain, property);

    sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);

    var separator = this.sparqlEndpointUrl.indexOf("?") > 0 ? "&" : "?";
    var url =
      this.sparqlEndpointUrl +
      separator +
      "query=" +
      encodeURIComponent(sparql) +
      "&format=json";
    return url;
  }

  elementCount(data) {
    return data.results.bindings[0].count.value;
  }
}

class SimpleStatisticsHandler extends AbstractSparqlStatisticsHandler {
  constructor(sparqlEndpointUrl, sparqlPostprocessor) {
    super(sparqlEndpointUrl, sparqlPostprocessor);
  }

  /**
   *
   **/
  _buildClassCountSparql(aClass) {
    var sparql = `
SELECT (COUNT(?instance) AS ?count) WHERE {
	?instance a <${aClass}> .
}`;

    return sparql;
  }

  /**
   *
   **/
  _buildPropertyCountSparql(domain, property, range) {
    var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT (COUNT(?s) AS ?count) WHERE {
	?s a <${domain}> . ?s <${property}> ?o . ?o a <${range}>
}`;

    return sparql;
  }

  /**
   *
   **/
  _buildPropertyWithoutRangeCountSparql(domain, property) {
    var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT (COUNT(?s) AS ?count) WHERE {
	?s a <${domain}> . ?s <${property}> ?o .
}`;

    return sparql;
  }
}

module.exports = {
  SimpleStatisticsHandler: SimpleStatisticsHandler,
};

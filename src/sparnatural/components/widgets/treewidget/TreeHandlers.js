class SparqlTreeHandler {
  constructor(
    sparqlEndpointUrl,
    sparqlPostprocessor,
    language,
    rootsSparqlQuery,
    childrenSparqlQuery
  ) {
    this.sparqlEndpointUrl = sparqlEndpointUrl;
    this.sparqlPostprocessor = sparqlPostprocessor;
    this.language = language;
    this.rootsSparqlQuery = rootsSparqlQuery;
    this.childrenSparqlQuery = childrenSparqlQuery;
  }

  /**
   * Post-processes the SPARQL query and builds the full URL for root of tree
   **/
  treeRootUrl(domain, property, range) {
    var sparql = this._buildTreeRootSparql(domain, property, range);
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
   * Post-processes the SPARQL query and builds the full URL for root of tree
   **/
  treeChildrenUrl(domain, property, range, node) {
    var sparql = this._buildTreeChildrenSparql(domain, property, range, node);
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
   * Constructs the SPARQL query to use for autocomplete widget search.
   **/
  _buildTreeRootSparql(domain, property, range) {
    return this._buildSparql(
      this.rootsSparqlQuery,
      domain,
      property,
      range,
      null
    );
  }

  /**
   * Constructs the SPARQL query to use for autocomplete widget search.
   **/
  _buildTreeChildrenSparql(domain, property, range, node) {
    return this._buildSparql(
      this.childrenSparqlQuery,
      domain,
      property,
      range,
      node
    );
  }

  _buildSparql(theSparqlQuery, domain, property, range, node) {
    var reDomain = new RegExp("\\$domain", "g");
    var reProperty = new RegExp("\\$property", "g");
    var reRange = new RegExp("\\$range", "g");
    var reLang = new RegExp("\\$lang", "g");

    var sparql = theSparqlQuery
      .replace(reDomain, "<" + domain + ">")
      .replace(reProperty, "<" + property + ">")
      .replace(reRange, "<" + range + ">")
      .replace(reLang, "'" + this.language + "'");

    if (node != null) {
      var reNode = new RegExp("\\$node", "g");
      sparql = sparql.replace(reNode, "<" + node + ">");
    }

    return sparql;
  }

  nodeListLocation(domain, property, range, data) {
    return data.results.bindings;
  }

  nodeLabel(item) {
    return item.label.value;
  }

  nodeUri(item) {
    return item.uri.value;
  }

  nodeHasChildren(item) {
    if (!item.hasChildren) {
      return true;
    } else {
      return item.hasChildren.value != "false" && item.hasChildren.value != "0";
    }
  }

  nodeDisabled(item) {
    return item.count && item.count.value == 0;
  }
}

module.exports = {
  SparqlTreeHandler: SparqlTreeHandler,
};

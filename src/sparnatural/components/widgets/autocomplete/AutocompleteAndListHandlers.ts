export abstract class Handler {
  sparqlEndpointUrl: any;
  sparqlPostprocessor: any;
  language: any;
  searchPath: any;
  listOrder: string;

  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    searchPath: any
  ) {
    this.sparqlEndpointUrl = sparqlEndpointUrl;
    this.sparqlPostprocessor = sparqlPostprocessor;
    this.language = language;
    this.searchPath = searchPath != null ? searchPath : "rdfs:label";
    this.listOrder = "alphabetical";
  }
  /**
   * Post-processes the SPARQL query and builds the full URL for list content
   **/
  buildURL(sparql: string): string {
    sparql = this.sparqlPostprocessor.semanticPostProcess(sparql);
    //remove linebreaks
    sparql = sparql.replace(/(\r\n|\n|\r)/gm, "");
    //remove all backslashes
    sparql = sparql.replace(/\\/g, "");
    var separator = this.sparqlEndpointUrl.indexOf("?") > 0 ? "&" : "?";

    var url =
      this.sparqlEndpointUrl +
      separator +
      "query=" +
      encodeURIComponent(sparql) +
      "&format=json";
    return url;
  }
  listLocation(
    domain: any,
    property: any,
    range: any,
    data: { results: { bindings: any } }
  ) {
    return data.results.bindings;
  }

  elementLabel(element: { label: { value: any } }) {
    return element.label.value;
  }

  /* TODO : rename to elementValue */
  elementUri(element: { uri: { value: any }; value: { value: any } }) {
    if (element.uri) {
      return element.uri.value;
    } else if (element.value) {
      return element.value.value;
    }
  }

  enableMatch(domain: any, property: any, range: any) {
    return false;
  }
}

abstract class AbstractSparqlListHandler extends Handler {
  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    searchPath: any
  ) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, language);
  }

  abstract listUrl(domain: string, property: string, range: string): string;
}

abstract class AbstractSparqlAutocompleteHandler extends Handler {
  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    searchPath: any
  ) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, language);
  }

  abstract autocompleteUrl(
    domain: string,
    property: string,
    range: string,
    key: string
  ): string;
}

/**
 * Handles a list widget based on a provided SPARQL query in which
 * $domain, $property and $range will be replaced by actual values.
 **/
export class SparqlTemplateListHandler extends AbstractSparqlListHandler {
  queryString: any;
  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    queryString: string
  ) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, null);
    this.queryString = queryString;
  }
  /**
   * Constructs the SPARQL query to use for list widget search.
   **/
  listUrl(domain: string, property: string, range: string): string {
    var reDomain = new RegExp("\\$domain", "g");
    var reProperty = new RegExp("\\$property", "g");
    var reRange = new RegExp("\\$range", "g");
    var reLang = new RegExp("\\$lang", "g");
    var sparql = this.queryString
      .replace(reDomain, "<" + domain + ">")
      .replace(reProperty, "<" + property + ">")
      .replace(reRange, "<" + range + ">")
      .replace(reLang, "'" + this.language + "'");
    sparql = sparql.replace("\\", "");
    return this.buildURL(sparql);
  }
}

/**
 * Handles a list widget based on a provided SPARQL query in which
 * $domain, $property and $range will be replaced by actual values.
 **/
export class SparqlTemplateAutocompleteHandler extends AbstractSparqlAutocompleteHandler {
  queryString: any;
  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    queryString: any
  ) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, null);
    this.queryString = queryString;
  }
  /**
   * Constructs the SPARQL query to use for autocomplete widget search.
   **/
  autocompleteUrl(
    domain: string,
    property: string,
    range: string,
    key: string
  ): string {
    var reDomain = new RegExp("\\$domain", "g");
    var reProperty = new RegExp("\\$property", "g");
    var reRange = new RegExp("\\$range", "g");
    var reLang = new RegExp("\\$lang", "g");
    var reKey = new RegExp("\\$key", "g");

    var sparql = this.queryString
      .replace(reDomain, "<" + domain + ">")
      .replace(reProperty, "<" + property + ">")
      .replace(reRange, "<" + range + ">")
      .replace(reLang, "'" + this.language + "'")
      .replace(reKey, "" + key + "");
    return this.buildURL(sparql);
  }
}

export class SimpleSparqlAutocompleteAndListHandler extends Handler {
  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    searchPath: any
  ) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath);
  }

  /**
   * Constructs the SPARQL query to use for autocomplete widget search.
   **/
  _buildAutocompleteSparql(domain: any, property: any, range: any, key: any) {
    var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri ?label
 WHERE {
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri ${this.searchPath} ?label 
	${this.language != null ? `FILTER(lang(?label) = "${this.language}")` : ""}
	FILTER(STRSTARTS(LCASE(STR(?label)), LCASE("${key}"))) 
} 
ORDER BY ?label
			`;

    return this.buildURL(sparql);
  }

  /**
   * Constructs the SPARQL query to use for list widget search.
   **/
  _buildListSparql(domain: any, property: any, range: any) {
    var sparql;

    switch (this.listOrder) {
      case "count":
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
	${
    this.language != null
      ? `FILTER(lang(?labelString) = "${this.language}")`
      : ""
  }
}
ORDER BY DESC(?count)
	`;
        break;
      case "alphabeticalWithCount":
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
	${
    this.language != null
      ? `FILTER(lang(?labelString) = "${this.language}")`
      : ""
  }
}
ORDER BY ?label
	`;
        break;
      case "alphabetical":
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
	${this.language != null ? `FILTER(lang(?label) = "${this.language}")` : ""}
}
ORDER BY ?label
	`;
    }

    return this.buildURL(sparql);
  }
}

export class UriOnlyListHandler extends Handler {
  constructor(sparqlEndpointUrl: any, sparqlPostprocessor: any) {
    super(sparqlEndpointUrl, sparqlPostprocessor, null, null);
  }

  /**
   * Constructs the SPARQL query to use for list widget search.
   **/
  _buildListSparql(domain: any, property: any, range: any) {
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

    return this.buildURL(sparql);
  }
}

export class SparqlBifContainsAutocompleteAndListHandler extends Handler {
  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    searchPath: any
  ) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath);
  }

  /**
   * Constructs the SPARQL query to use for autocomplete widget search.
   **/
  _buildAutocompleteSparql(domain: any, property: any, range: any, key: any) {
    var sparql = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri ?label
 WHERE {
	?domain a <${domain}> .
	?domain <${property}> ?uri .
	?uri a <${range}> .
	?uri ${this.searchPath} ?label .
	${this.language != null ? `FILTER(lang(?label) = "${this.language}")` : ""}
	# Note the single quote to handle space character
	?label bif:contains "'${key}'" . 
} 
ORDER BY ?label
			`;

    return this.buildURL(sparql);
  }
}

/**
 * Simple handler for GraphDB Lucene connectors : http://graphdb.ontotext.com/documentation/standard/lucene-graphdb-connector.html
 * Takes as input the name of the connector, the field to search on, and the property to read to display
 * TODO : the property to display should come from the snippet
 **/
export class GraphDbLuceneConnectorSparqlAutocompleteAndListHandler extends Handler {
  connectorName: any;
  fieldName: any;
  /**
   * The search path, in this case, is used only to read the label,
   * not to search
   **/
  constructor(
    sparqlEndpointUrl: any,
    sparqlPostprocessor: any,
    language: any,
    searchPath: any,
    connectorName: any,
    fieldName: any
  ) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, searchPath);
    this.connectorName = connectorName;
    this.fieldName = fieldName;
  }

  /**
   * Constructs the SPARQL query to use for autocomplete widget search.
   **/
  _buildAutocompleteSparql(domain: any, property: any, range: any, key: any) {
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
	${this.language != null ? `FILTER(lang(?label) = "${this.language}")` : ""}
} 
ORDER BY ?label
			`;

    return this.buildURL(sparql);
  }
}

export class WikidataAutocompleteAndListHandler extends Handler {
  constructor(sparqlEndpointUrl: any, sparqlPostprocessor: any, language: any) {
    super(sparqlEndpointUrl, sparqlPostprocessor, language, null);
  }

  /**
   * Constructs the SPARQL query to use for autocomplete widget search.
   **/
  _buildAutocompleteSparql(domain: any, property: any, range: any, key: any) {
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
      ${
        this.language != null
          ? `bd:serviceParam mwapi:language "${this.language}" .`
          : ""
      }
      ?this wikibase:apiOutputItem mwapi:item .
  }
  ?domain wdt:P31 <${domain}> .
  ?domain <${property}> ?uri .
   # ?uri wdt:P31 <${range}> .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${
    this.language
  }". }
}
ORDER BY ?uriLabel
		`;
    return sparql;
  }

  _buildListSparql(domain: any, property: any, range: any) {
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
}

export class RangeBasedAutocompleteAndListHandler {
  defaultHandler: any;
  handlerByKeyMap: any;
  constructor(defaultHandler: any, handlerByKeyMap: any) {
    this.defaultHandler = defaultHandler;
    this.handlerByKeyMap = handlerByKeyMap;
  }

  _findHandler(domain: any, property: any, range: string | number) {
    if (this.handlerByKeyMap[range] != null) {
      return this.handlerByKeyMap[range];
    } else {
      return this.defaultHandler;
    }
  }

  autocompleteUrl(domain: any, property: any, range: any, key: any) {
    return this._findHandler(domain, property, range).autocompleteUrl(
      domain,
      property,
      range,
      key
    );
  }

  listUrl(domain: any, property: any, range: any) {
    return this._findHandler(domain, property, range).listUrl(
      domain,
      property,
      range
    );
  }

  listLocation(domain: any, property: any, range: any, data: any) {
    return this._findHandler(domain, property, range).listLocation(
      domain,
      property,
      range,
      data
    );
  }

  elementLabel(element: any) {
    // TODO : forces that every handler must have the same result structure than the default one
    return this.defaultHandler.elementLabel(element);
  }

  elementUri(element: any) {
    // TODO : forces that every handler must have the same result structure than the default one
    return this.defaultHandler.elementUri(element);
  }

  enableMatch(domain: any, property: any, range: any) {
    return this._findHandler(domain, property, range).enableMatch(
      domain,
      property,
      range
    );
  }
}

export class PropertyBasedAutocompleteAndListHandler extends RangeBasedAutocompleteAndListHandler {
  constructor(defaultHandler: any, handlerByKeyMap: any) {
    super(defaultHandler, handlerByKeyMap);
  }

  _findHandler(domain: any, property: string | number, range: any) {
    if (this.handlerByKeyMap[property] != null) {
      return this.handlerByKeyMap[property];
    } else {
      return this.defaultHandler;
    }
  }
}

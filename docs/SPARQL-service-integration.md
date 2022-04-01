_[Home](index.html) > SPARQL service integration_

# SPARQL service integration

**/!\ This page is deprecated**

As Sparnatural generates SPARQL queries to be executed against a SPARQL service, it seems natural to be able to use this same SPARQL service as a data source for autocomplete and list components. 

Have a look at the [DBPedia integration demo](blob/master/sparnatural-demo-dbpedia/index.html#L92) for an example on how to do this.

Here are more detailled explanations


## Provide the necessary callbacks for autocomplete and list

As described in the [Configuration reference](Configuration), you must provide the necessary objects to implement the `autocomplete` and `list` widgets. The idea is of course to generate SPARQL calls for this, and parse the results as JSON.


```javascript
$('#ui-search').Sparnatural({
// ...  
autocomplete : {
  url: function(domain, property, range, key) {
    // this is defined below
    return sparqlAutocompleteUrl(domain, property, range, key);
  },
  listLocation: function(domain, property, range, data) {
    // the list of results in SPARQL result format is under results.bindings
    return data.results.bindings;
  },
  elementLabel: function(element) {
    // "rangeLabel" is the variable name in the SPARQL query for autocomplete
    return element.rangeLabel.value;
  },
  elementUri: function(element) {
    // "range" is the variable name in the SPARQL query for autocomplete
    return element.range.value;
  },
  enableMatch: function(domain, property, range) {
    // we don't care about this
    return false;
  },
},
list : {
  url: function(domain, property, range) {
    // this is defined below
    return sparqlListUrl(domain, property, range);
  },
  listLocation: function(domain, property, range, data) {
    // the list of results in SPARQL result format is under results.bindings
    return data.results.bindings;
  },
  elementLabel: function(element) {
    // "rangeLabel" is the variable name in the SPARQL query for list
    return element.rangeLabel.value;
  },
  elementUri: function(element) {
    // "range" is the variable name in the SPARQL query for list
    return element.range.value;
  }
},
//...
});
```


## Build the SPARQL queries

Now you need to write the functions `sparqlListUrl` and `sparqlAutocompleteUrl` to generate a SPARQL URL call :

```javascript
sparqlListUrl = function(domain, property, range) {
  // The SPARQL query service URL
  var QUERY_SERVICE = "http://fr.dbpedia.org/sparql"
  // build our listing query
  var sparql = "SELECT DISTINCT ?range ?rangeLabel WHERE {\n  ?domain a <"+domain+"> . ?domain <"+property+"> ?range . ?range a <"+range+"> \n . ?range rdfs:label ?rangeLabel FILTER(lang(?rangeLabel) = \"fr\") } ORDER BY ?rangeLabel";

  // construct the final SPARQL URL, requesting for JSON results
  var url = QUERY_SERVICE+"?query="+encodeURIComponent(sparql)+"&format=json";
  return url;
}

sparqlAutocompleteUrl = function(domain, property, range, key) {
  // The SPARQL query service URL
  var QUERY_SERVICE = "http://fr.dbpedia.org/sparql"
  // build the search query
  var sparql = "SELECT DISTINCT ?range ?rangeLabel WHERE {\n  ?domain a <"+domain+"> . ?domain <"+property+"> ?range . ?range a <"+range+"> \n . ?range rdfs:label ?rangeLabel FILTER(lang(?rangeLabel) = \"fr\") FILTER(bif:contains(?rangeLabel, \""+key+"\")) } ORDER BY ?rangeLabel";

  // construct the final SPARQL URL, requesting for JSON results
  var url = QUERY_SERVICE+"?query="+encodeURIComponent(sparql)+"&format=json";
  return url;
}
```
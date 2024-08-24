_[Home](index.html) > Javascript integration_


# Javascript integration and parameters reference


## Constructor

Sparnatural is inserted as custom HTML element named `spar-natural` (note the dash), with specific attributes. It looks like so:

```html
  <spar-natural 
    src="sparnatural-config.ttl"
    endpoint="https://dbpedia.org/sparql"
    lang="en"
    defaultLang="en"
    limit="1000"
    debug="true"
  />
```

## HTML attributes reference

| Attribute | Description | Default | Mandatory/Optional |
| --------- | ----------- | ------- | ------------------ |
| `src` | Provides the configuration that specifies the classes and properties to be displayed, and how they are mapped to SPARQL. This can be either the URL of a SHACL or OWL file, in Turtle or RDF/XML. Example : `sparnatural-config.ttl`. Another option is to provide a serialized JSON obj as a string. For example: `JSON.stringify(configAsJsonObj)`. It is possible to pass **multiple** URLs be separating them with a whitespace, e.g. `sparnatural-config.ttl statistics.ttl`  | `undefined` | Mandatory
| `endpoint` | The URL of a SPARQL endpoint that will be used as the default service for the datasource queries provided in the configuration. If not specified, each datasource should indicate explicitely a SPARQL endpoint. Note that this URL can use the `default-graph-uri` parameter to restrict the query to a specified named graph, as per [SPARQL protocol specification](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#dataset), e.g. `http://ex.com/sparql?default-graph-uri=http%3A%2F%2Fencoded-named-graph-uri`. This can also contain **multiple** endpoint URLs in combination with the `catalog` attribute (see "[querying multiple endpoints](Querying-multiple-endpoints.md)") | `undefined` | Mandatory except for advanced use-cases. |
| `catalog` (*unstable*) | The catalog of endpoints, if you pass multiple endpoints. This is advanced configuration. (see "[querying multiple endpoints](Querying-multiple-endpoints.md)") | none | Optional|
| `defaultLang` | Dataset default language. A language in which the dataset always provides labels/titles that can be used as default if a label in the user language is not present. | `en` | Recommended|
| `debug` | If set to `true`, Sparnatural will log JSON and SPARQL queries on the console, as they are generated. | `false` | Optional |
| `distinct` | Whether the `DISTINCT` keyword should be inserted to the generated SPARQL query. | `true` | Optional|
| `lang` | User language preference. The language code to use to display labels of classes and properties from the configuration file, and to query for values in lists and search fields. | `en` | Recommended|
| `limit` |A number that will be used to add a `LIMIT` keyword in the generated SPARQL queries. If set to an empty string or a negative number, no `LIMIT` keyword is inserted. | `-1` | Optional
| `maxDepth` | Maximum depth of the constructed query (number of inner 'Where' clauses). | `4` | Optional
| `localCacheDataTtl` (*beta*) | The time that the dropdown lists will be stored in cache on the client, if the server has allowed it in its response headers, that is if `Cache-Control: no-cache` header is returned in the response, no cache will happen, whatever the value of this field. The server can return `Cache-Control: public` for lists to be properly cached. | `1000 * 60 * 60 * 24` | Optional|
| `maxOr` | Maximum number of different values that can be selected for a given property criteria. For example how many country can be chosen on the list widget| `3` | Optional
| `prefixes` (*unstable*) | A set of prefixes in the form `foaf: http://xmlns.com/foaf/0.1/ skos:http://www.w3.org/2004/02/skos/core#` to be added to the output SPARQL query. This is applied in the `expand` method. | `none`
| `queryLang` | The language used as a parameters to datasources, to e.g. populate dropdown lists with labels of this language. | same value as `lang` | Recommended|
| `submitButton` | Whether Sparnatural should display a submit button to allow the user to execute the query. A click on the submit button will trigger a `submit` event. In case it is not provided, it is the page responsibility to either execute the query automatically at each update in the `queryUpdated` event or provide its own way to submit the query. | `true` | Optional
| `typePredicate` | The type predicate to use to generate the type criteria. Defaults to rdf:type, but could be changed to e.g. `<http://www.wikidata.org/prop/direct/P31>+` for Wikidata integration, or `<http://www.w3.org/2000/01/rdf-schema#subClassOf>+` to query OWL-style models.|`rdf:type` | Optional |


## Sparnatural events

Then the HTML page needs to listen to specific events triggered by Sparnatural, notably `queryUpdated` and `submit` :

```javascript
const sparnatural = document.querySelector("spar-natural");
 
// triggered as soon there is a modification in the query
sparnatural.addEventListener("queryUpdated", (event) => {
  // do something with the query
});

// triggered when submit button is called
sparnatural.addEventListener("submit", (event) => {
    // so something
});

// triggered when reset button is clicked
sparnatural.addEventListener("reset", (event) => {
  // do something
});

```

See below for the complete reference of the available events.

A typical integration in a web page looks like this :

```javascript

const sparnatural = document.querySelector("spar-natural");

sparnatural.addEventListener("queryUpdated", (event) => {
  // expand query to replace identifiers with content of sparqlScript annotation
  console.log(event.detail.queryString);
  console.log(event.detail.queryJson);
  console.log(event.detail.querySparqlJs);
  queryString = sparnatural.expandSparql(event.detail.queryString);
  // set query on YasQE
  yasqe.setValue(queryString);

  // save JSON query
  document.getElementById('query-json').value = JSON.stringify(event.detail.queryJson);
});

sparnatural.addEventListener("submit", (event) => {
  // enable loader on button
  sparnatural.disablePlayBtn() ; 
  // trigger the query from YasQE
  yasqe.query();
});

sparnatural.addEventListener("reset", (event) => {
  yasqe.setValue("");
});
```

### "queryUpdated" event

The `queryUpdated` event is triggered everytime the query is modified. The event detail contains :
  - The SPARQL string in `queryString`
  - The JSON Sparnatural structure in `queryJson`
  - The (SPARQL.js format)[https://github.com/RubenVerborgh/SPARQL.js/] structure in `querySparqlJs`

```javascript
sparnatural.addEventListener("queryUpdated", (event) => {
  console.log(event.detail.queryString);
  console.log(event.detail.queryJson);
  console.log(event.detail.querySparqlJs);
});
```

### "submit" event

The `submit` event is triggered when the submit button is clicked. 

In typical integrations, the state of the submit button can be updated upon submit. The submit button can be "not loading and active", "loading" or "disabled". The functions to update the state of the button are:
  - `sparnatural.disablePlayBtn()`
  - `sparnatural.enablePlayBtn()`

`disablePlayBtn()` should be called on `submit` event and `enablePlayBtn()` when the query has returned. In a typical integration with YasGUI this looks like this:

```javascript

const sparnatural = document.querySelector("spar-natural");

sparnatural.addEventListener("queryUpdated", (event) => {
  queryString = sparnatural.expandSparql(event.detail.queryString);
  yasqe.setValue(queryString);
});

sparnatural.addEventListener("submit", (event) => {
  // disable the button and show a spinning loader
  sparnatural.disablePlayBtn() ; 
  // trigger the query from YasQE
  yasqe.query();
});

const yasqe = new Yasqe(document.getElementById("yasqe"));
const yasr = new Yasr(document.getElementById("yasr"));

yasqe.on("queryResponse", function(_yasqe, response, duration) {
  // print the responses in YASR
  yasr.setResponse(response, duration);
  // re-enable play button in Sparnatural
  sparnatural.enablePlayBtn() ;
}); 
```

### "reset" event

The `submit` event is triggered when the reset button is clicked. It can be used to empty or reset other part of the page, typically YasQE. A typical integration is the following:

```javascript
sparnatural.addEventListener("reset", (event) => {
  yasqe.setValue("");
});
```

### "init" event

The `init` event is triggered when Sparnatural has finished reading its configuration. Listen to this event to pass additionnal JSON customization with `sparnatural.customization = { ... }` (see below).


```javascript
sparnatural.addEventListener("init", (event) => {
  console.log("Sparnatural is initialized");
  // sparnatural.customization = { ... }
});
```

## Sparnatural element API

The table below summarizes the various functions that can be called on the Sparnatural element.

| Function | Description | Parameters |
| -------- | ----------- | ---------- |
| `sparnatural.enablePlayBtn()` | Removes the loading from the play button once a query has finished executing.  | none |
| `sparnatural.disablePlayBtn()` | Disables the play button once a query has started its execution.| none |
| `sparnatural.loadQuery(query)` | Loads a query structure in Sparnatural. | Query structure as documented in [the query JSON format](Query-JSON-format)
| `sparnatural.expandSparql(sparqlString)` | Expands a SPARQL query string according to the configuration, in particular the `sparqlString` annotations, as documented in the [OWL-based configuration](OWL-based-configuration) A SPARQL query string | string |
| `sparnatural.clear()` | Clears the Sparnatural editor, as if the reset button was clicked.| none |
| `sparnatural.executeSparql(query:string, callback: (data: any) => void, errorCallback?:(error: any) => void)` | Executes the provided SPARQL query, using configured endpoint or multiple endpoints from the catalog, and using the configured headers. | 1/ The SPARQL query string 2/ the callback when execution succeeds 3/ the callback on error |


## Sparnatural bindings

Starting from 9.1, releases of Sparnatural include a [`sparnatural-bindings.js`](https://github.com/sparna-git/Sparnatural/blob/master/src/sparnatural-bindings.js) Javascript file that can be used to facilitate the integration of the events and functions of Sparnatural in typical integration scenarios.

In particular for a scenario when Sparnatural is integrated with YasQE as a read-only query viewer and YasR, and where Sparnatural is responsible for executing the query, you can call the following functions:

```javascript
// binds Sparnatural with the YasR plugins
bindSparnaturalWithYasrPlugins(sparnatural, yasr);
// binds Sparnatural with itself for the query execution and integration with yasqe and yasr
bindSparnaturalWithItself(sparnatural, yasqe, yasr);
```

## Sparnatural behavior customization

The behavior of Sparnatural can be further adjusted with the `customization` object : `sparnatural.customization = { ... }`. That call must be done within the `init` event listener, after Sparnatural has finished reading its initial specification file.

```javascript
sparnatural.addEventListener("init", (event) => {
  console.log("Sparnatural is initialized");
  sparnatural.customization = { ... }
});
```

In particular this object allows to pass in functions to provide data to the different widgets. See the reference documentation below.


### Sparnatural customization object reference

The customization object structure is outlined below. All items are optionnal.


```typescript
{
  autocomplete: {
    dataProvider : {
      getAutocompleteSuggestions: function(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
      )
    },
    // the maximum number of items to be proposed in the autocomplion list
    maxItems: number
  },
  list: {
    dataProvider : {
      getListContent: function(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(values:{literal:string}[]) => void
      ):void
    }
  },
  tree: {
    dataProvider : {
      getRoots: function(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
      ):void,

      getChildren: function(
        node:string,
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
      ):void
    }
  },
  map: {
    // initial zoom level of the map, when opened
    // see https://leafletjs.com/reference.html#map-setview
    // typically, from 0 to ~ 12
    zoom : number,
    // initial center of the map, when opened
    // see https://leafletjs.com/reference.html#map-setview
    center : {
      lat:number,
      long:number
    }
  },
  headers: {
    "header name": "value"
  }
}
```

Note that the `RDFTerm` data structure referenced above is the following:

```typescript
export class RDFTerm {
  type: string;
  value: string;
  "xml:lang"?: string;
  datatype?:string 
}
```

### example of specifying a custom data provider function

```javascript
sparnatural.addEventListener("init", (event) => {  
  sparnatural.customization = {
    autocomplete: {
      dataProvider: {
        getAutocompleteSuggestions: function(
        domain,
        predicate,
        range,
        key,
        lang,
        defaultLang,
        typePredicate,
        callback,
        errorCallback
      ) {
        // build the list of autocomplete items to show
        console.log("domain,predicate,range : "+domain+" "+predicate+" "+range);
        let items = [
          {
            term: {
              type:"IRI",
              value:"http://exemple.fr/1"
            },
            label: key+" : suggestion 1" 
          },
          {
            term: {
              type:"IRI",
              value:"http://exemple.fr/2"
            },
            label: key+" : suggestion 2" 
          }
        ];
        // call the callback function with the list of items
        callback(items);
      }
      }
    }
  };
});
```

### HTTP headers configuration

To set the headers of requests made by Sparnatural, use the customization objet above, with the `headers` key. See this example:

```javascript
sparnatural.addEventListener("init", (event) => {
  sparnatural.customization = {
    headers: { 
      "User-Agent" : "This is Sparnatural calling"
    }
  }
});
```

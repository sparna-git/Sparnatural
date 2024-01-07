_[Home](index.html) > Querying multiple endpoints_

# Support for the query of multiple endpoints

## Use-case

Sometimes you don't need to showcase a single knowledge graph, but rather **multiple** knowledge graphs. Sparnatural can act as a facade to query multiple SPARQL endpoints transparently for the user. Note that this imply that all SPARQL endpoints must share the same graph structure, as the same SPARQL query will be used to query them all.


## How it works

1. You need to create a JSON file giving the list of different endpoints that can be queried, with a few information about them (in particular their display labels). This JSON file is the **endpoints catalog file**.
2. Sparnatural is configured with the URL of the different SPARQL services to query, and the JSON catalog file.
3. When populating dropdown lists, or when querying for autocompletion values, Sparnatural will query **all** endpoints with which it is configured, and aggregate the results. In particular lists widgets will use an `optgroup` separator to separate the results of the different endpoints.
4. It is the responsibility of the calling page to also execute the final query provided by Sparnatural against all the endpoints, and aggregate the results.


## Configuring Sparnatural

To configure Sparnatural to query multiple endpoints, you need to:

1. Provide a space-separated list of endpoints URL in the `endpoint` attribute of the `spar-natural` element. The URLs given here must correspond to the `endpointURL` of the catalog entries (see below)
2. Provide the URL of the catalog file to be loaded in the `catalog` attribute of the `spar-natural` HTML element. The catalog may contain more entries than the ones actually passed in the `endpoint` attribute.
3. Deal yourself with the execution of the final query against the list of selected endpoints (see below)

Here is an example:

```html
<!-- Note how 2 SPARQL endpoints URL are provided, along with the URL of the catalog file -->
<spar-natural 
            src="..."
            endpoint="https://sage-ails.ails.ece.ntua.gr/api/content/rijksmuseum-poc/sparql https://sage-ails.ails.ece.ntua.gr/api/content/gooi-en-vecht-poc/sparql"
            catalog="datasets.jsonld"
            lang="en"
            defaultLang="en"
            distinct="true"
            limit="1000"
            debug="true"
></spar-natural>
```

## JSON Catalog file

### Catalog file example

Here is an example JSON catalog file :

```
{
  "type": "Catalog",
  "service": [
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/rijksmuseum",
      "type": "DataService",
      "title": {
        "en" : "Rijksmuseum Collection"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/rijksmuseum-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    },
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/gooi-en-vecht",
      "type": "DataService",
      "title": {
        "en" : "Gooi en Vecht Historisch"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/gooi-en-vecht-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    },
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/gelderland",
      "type": "DataService",
      "title": {
        "en" : "Collectie Gelderland"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/gelderland-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    }
  ]
}
```


### Catalog file reference

The JSON catalog file is basically a DCAT description of the DataServices encoded in JSON-LD. DataServices are described with a few metadata. The root of the catalog file is the Catalog object.

#### Catalog entity

The `Catalog` object is the root entity of the file. It contains a `service` property that will contain all the `DataService`s entities:

```
  "type": "Catalog",
  "service": [
    {
      ...
    },
    {
      ...
    }
  ]
}
```

#### DataService entity

A `DataService` describes one endpoint to be queried. It contains:
  - an `id`, which is the internal identifier of this entry in the catalog
  - an `endpointURL`, which is the URL of the SPARQL endpoint to which Sparnatural will send its queries
  - its `title`s in different languages, which will be used when displaying this entry in the interface
  - other optional metadata, such as a `description`, not used by Sparnatural but that can be useful to other parts of your application

```
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/gelderland",
      "type": "DataService",
      "title": {
        "en" : "Collectie Gelderland"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/gelderland-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    }
```

## Executing the final SPARQL query against all endpoints

Sparnatural can deal with the population of dropdown lists and autocomplete fields against multiple endpoints. You also need to execute the final query returned by Sparnatural against all endpoints. This is using the [sparql.js library](http://www.thefigtrees.net/lee/sw/sparql.js) from [http://thefigtrees.net](http://thefigtrees.net). Pretty old stuff, but still works. The execution of the query could very well be done by hand by simply constructing the URL.

```javascript
      var endpoints;

      let executeSparql = function(sparql, callback) {

        // build an array of Promises for the execution of the query against each endpoint
        const promises = [];
        for (const e of endpoints) {
          console.log("querying endpoint "+e);

          var sparqler = new SPARQL.Service(e);
          var query = sparqler.createQuery();
          
          promises[promises.length] = new Promise((resolve, reject) => {
            // this is where we stored the query emitted by Sparnatural
            query.query(document.getElementById('query-sparql').value,
              {
                failure: function() { 
                  console.log("Failed : "+e);
                  reject("Failed : "+e);
                },
                success: function(json) { 
                  console.log("Got answer from "+e);
                  // return a structure with "endpoint" key and "sparqlJson" containing the result
                  resolve({ endpoint: e, sparqlJson: json });
                }
              }
            );
          });
        }

        // now synchronize all the promises from all endpoints
        // to build a final aggregated result set
        let finalResult = {};
        Promise.all(promises).then((values) => {
          // copy the same head as first result, with extra "endpoint" + "endpoint_label" columns
          // so that the final result set will contain an extra column at the end showing from
          // which endpoint that result set cam from
          finalResult.head = values[0].sparqlJson.head;
          finalResult.head.vars.push("endpoint");
          finalResult.head.vars.push("endpoint_label");

          // prepare the "results" section
          finalResult.results = {
            // same distinct as first result
            distinct: values[0].sparqlJson.results.distinct,
            // never ordered
            ordered: false,
            // prepare bindings section
            bindings: []
          };
          // then for each SPARQL results of structure {endpoint : xx, sparqlJson: {...}}
          for (const v of values) {
            
            // add extra "endpoint" + "endpoint_label" columns with the endpoint at the end of each binding
            finalResult.results.bindings.push(
              // remap each binding to add the endpoint column at the end
              // then unpack the array
              ...v.sparqlJson.results.bindings.map(b => {
                b.endpoint = {type: "uri", value:v.endpoint};
                b.endpoint_label = {type: "literal", value:datasetsJson.service.find(s => s.endpointURL == v.endpoint).title[lang]};
                return b;
              })
            );
          }

          // call the callback with the final aggregated SPARQL result
          callback(finalResult);
        });
      }

      // then when the query is submitted from Sparnatural
      sparnatural.addEventListener("submit", (event) => {
        // enable loader on button
        sparnatural.disablePlayBtn() ;

        // trigger query execution to the different endpoints
        let finalResult = executeSparql(
          document.getElementById('query-sparql').value,
          // and when we receive the final result...
          (finalResult) => {
            // send final result to YasR
            yasr.setResponse(finalResult);
            // re-enable submit button
            sparnatural.enablePlayBtn();
          }
        );
      });

      // Configure yasQE to hide its query execution button
      const yasqe = new Yasqe(document.getElementById("yasqe"), {
        // ...
        // don't show query button
        showQueryButton: false,
      });
```
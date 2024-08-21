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


## Sparnatural behavior

When configured with more than one endpoint, Sparnatural will behave this way:

### In lists, values are presented in a different section for each endpoint

![multiple endpoints in list](/assets/images/multiple-endpoints-list.png)

### In autocomplete, endpoint is visible by hovering the result

![multiple endpoints in autocomplete](/assets/images/multiple-endpoints-autocomplete.png)



## Executing the final SPARQL query against all endpoints

Sparnatural can deal with the population of dropdown lists and autocomplete fields against multiple endpoints. You also need to execute the final query returned by Sparnatural against all endpoints. In order to do this you can call the `executeSparql()` method on Sparnatural, which will take care of:
1. sending the SPARQL query to all endpoints in the catalog
2. merging the results, adding an extra column for the source
3. returning the merged result


The full integration looks like this:

```javascript
    sparnatural.addEventListener("queryUpdated", (event) => {
      queryString = sparnatural.expandSparql(event.detail.queryString);
      yasqe.setValue(queryString);
    });

    sparnatural.addEventListener("submit", (event) => {
      // enable loader on button
      sparnatural.disablePlayBtn() ;

      let finalResult = sparnatural.executeSparql(
        yasqe.getValue(),
        (finalResult) => {
          // send final result to YasR
          yasr.setResponse(finalResult);
          // re-enable submit button
          sparnatural.enablePlayBtn();
        },
        (error) => {
          console.error("Got an error when executing SPARQL in Sparnatural");
          console.dir(error);
        }
      );
    });

    sparnatural.addEventListener("reset", (event) => {
      yasqe.setValue("");
    });
```
_[Home](index.html) > Query JSON format_

# Sparnatural Query JSON format


## How it works : onQueryUpdated / loadQuery

Sparnatural emits the [`queryUpdated` event](http://docs.sparnatural.eu/Javascript-integration.html#queryupdated-event) each time the query is modified. This event contains 3 files : the generated SPARQL query string, the SPARQL query in JSON in the sparqljs syntax, and a custom JSON data structure that encodes the query. This custom JSON data structure is specific to Sparnatural, and enables it to **load previously generated query**, using the method [**`sparnatural.loadQuery(jsonQuery)`**](http://docs.sparnatural.eu/Javascript-integration.html#sparnatural-element-api).

This allows to implement 2 important features to showcase your knowledge graph :

1. The ability to prepare **sample queries that can be loaded** in a single click to initialize Sparnatural with your query
2. The ability to **encode the query in a URL parameter** and load directly Sparnatural with the query received. This enable the users to share direct links to their preferred queries, and your knowledge graph goes viral ;-)

This is illustrated in the following code snippet :


```javascript
$( document ).ready(function($) {          

        const sparnatural = document.querySelector("spar-natural");
        
        sparnatural.addEventListener("queryUpdated", (event) => {
                // here we get the SPARQL query string and the JSON data structure
                // if integrating with YasQE we set the value :
                queryString = sparnatural.expandSparql(event.detail.queryString);
                yasqe.setValue(queryString);

                // and we could save the JSON query for later, e.g. to pass it as a parameter in a URL
                document.getElementById('query-json').value = JSON.stringify(event.detail.queryJson);
        });


        // if we have received a JSON data structure as a URL parameter "?query="
        // then uncompress it, and pass it to the loadQuery() function of Sparnatural
      var UrlString = window.location.search;
      var urlParams = new URLSearchParams(UrlString);
      if (urlParams.has("query") === true) {
        var compressedJson = urlParams.get("query") ;
        var compressCodec = JsonUrl('lzma');
        compressCodec.decompress(compressedJson).then(json => {
          sparnatural.loadQuery(JSON.parse(json)) ;
        });
      }
});


// if we have a dropdown to select example query from...
document.getElementById('select-examples').onchange = function() {
        var key = $('#select-examples option:selected').val();
        sparnatural.loadQuery(sampleQueries[key]) ;
}

```

## Typescript definition

The definition of the query structure is defined in [SparnaturalQueryIfc](https://github.com/sparna-git/Sparnatural/blob/master/src/sparnatural/SparnaturalQueryIfc.ts).

## JSON query example

The following query in Sparnatural (_All Artworks displayed in French or Italian museums, and created in the 19th century, with their creation date_) :

![Sparnatural query example](/assets/images/screenshot-JSON-data-structure.png)

Is encoded in the following JSON data structure :

```json
{
  "distinct": true,
  "variables": [
    {
      "termType": "Variable",
      "value": "Artwork_1"
    },
    {
      "termType": "Variable",
      "value": "Date_6"
    }
  ],
  "order": null,
  "branches": [
    {
      "line": {
        "s": "Artwork_1",
        "p": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork_displayedAt",
        "o": "Museum_2",
        "sType": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork",
        "oType": "https://data.mydomain.com/ontologies/sparnatural-config/Museum",
        "criterias": []
      },
      "children": [
        {
          "line": {
            "s": "Museum_2",
            "p": "https://data.mydomain.com/ontologies/sparnatural-config/Museum_country",
            "o": "Country_4",
            "sType": "https://data.mydomain.com/ontologies/sparnatural-config/Museum",
            "oType": "https://data.mydomain.com/ontologies/sparnatural-config/Country",
            "criterias": [
              {
                "label": "Italy",
                "criteria": {
                  "rdfTerm": {
                    "type": "uri",
                    "value": "http://dbpedia.org/resource/Italy"
                  }
                }
              },
              {
                "label": "France",
                "criteria": {
                  "rdfTerm": {
                    "type": "uri",
                    "value": "http://dbpedia.org/resource/France"
                  }
                }
              }
            ]
          }
        }
      ]
    },
    {
      "line": {
        "s": "Artwork_1",
        "p": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork_creationYear",
        "o": "Date_6",
        "sType": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork",
        "oType": "https://data.mydomain.com/ontologies/sparnatural-config/Date",
        "criterias": [
          {
            "label": "between 1801 and 1900",
            "criteria": {
              "min": 1801,
              "max": 1900
            }
          }
        ]
      }
    }
  ]
}
```

## JSON data structure reference

Basically, the JSON data structure encodes a bit more information than the generated SPARQL query, to make our life easier when parsing the data structure to initialize Sparnatural with it. It adds:
  - The *labels* of the values
  - The *types* of all subjects and objects
  - The *tree-like structure* that Sparnatural uses, which would be hard to guess by looking at the SPARQL string

The data structure is composed of a top "Query" structure, that contains "branches". Each "branch" contains a "query line", corresponding to one line of the Sparnatural interface, and the "children" of this line, that are the lines under it in the Sparnatural interface.

### Query structure

```json
{
  "distinct": true,
  "variables": [
   {
      "termType": "Variable",
      "value": "this"
    },
    {
      "termType": "Variable",
      "value": "that"
    }
  ],
  "order": null,
  "branches": [
    ...
  ]
}
```

- `distinct` : whether the `DISTINCT` SPARQL keyword should be added
- `variables` : ordered list of variables selected in the `WHERE` clause. `termType` is always `Variable`, and `value` is the variable name (without "?")
- `order` : e.g. `"asc"` or `"desc"` depending on sort direction. Or `null` if no sort. The sort is always on the first column.
- `branches` : ordered list of query branches, each containing a "tree" of criteria under it

### Query branch structure

```json
{
      "line": {
        ...
      },
      "children": [
        ...
      ],
      "optional": true,
      "notExists": false,
    },
```

- `line` : one single query line / criteria
- `children` : the children of that line / criteria, the ones that are below it in the Sparnatural query builder. This may not be present at all, or can be an empty array.
- `optional` : whether the line and all its children are optional (use a SPARQL "OPTIONAL")
- `notExists` : whether the line and all its children are negative (use a SPARQL "FILTER NOT EXISTS")

### Query line structure

```json
{
  "line": {
    "s": "Museum_2",
    "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#country",
    "o": "Country_4",
    "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Museum",
    "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Country",
    "criterias": [
        ...
    ]
  },
  "children": []
}
```

- `s` : variable of the subject
- `p` : URI of the predicate
- `o` : variable of the object
- `sType` : URI of the selected type of the subject
- `oType` : URI of the selected type of the object
- `criterias` : arrays of criterias selected for the object, if any (typically URI of selected values from a dropdown list)

### Labelled Criterias

```json
{
  "line": {
    ...
    "criterias": [
        {
          "label": "Italy",
          "criteria": {
            ...
          }
        },
        {
          "label": "France",
          "criteria": {
            ...
          }
        }
    ]
  }
}
```

A criteria is composed of 2 parts:

- `label` : The display label of the criteria
- `criteria` : The actual criteria to use, depending on the value selection widget (e.g. either a URI, a date range, etc.)


### Criteria values

The structure of the criterias depends on the value selection widget. This can be :

- A URI selection widget (dropdown list, autocomplete, tree widget):

If the value is a URI:

```json
  {
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://fr.dbpedia.org/resource/Italie"
        }
      }
  }
```


If the value is a Literal (with a language):

```json
  {
      "criteria": {
        "rdfTerm": {
          "type": "literal",
          "value": "foo",
          "xml:lang": "en"
        }
      }
  }
```

If the value is a Literal (with a datatype):

```json
  {
      "label": "xxx",
      "criteria": {
        "rdfTerm": {
          "type": "literal",
          "value": "1",
          "datatype": "http://www.w3.org/2001/XMLSchema#integer"
        }
      }
  }
```

- A time/date selection widget:

```json
  {
    "label": "xxx",
    "criteria": {
      "start": "1800-01-01T00:00:00",
      "stop": "1901-12-31T23:59:59"
    }
  }
```

- A boolean widget:

```json
  {
    "label": "xxx",
    "criteria": {
      "boolean": true
    }
  }
```

- A regex search widget:

```json
  {
    "label": "xxx",
    "criteria": {
      "search": "..."
    }
  }
```

- A number widget:

```json
  {
    "label": "xxx",
    "criteria": {
      "min": 10000,
      "max": 100000
    }
  }
```

- A map widget:

```json
  {
    "label": "xxx",
    "criteria": {
      "coordType": "Rectangle",
      "coordinates": [
        { "lat": "1", "long":"1" }
        { "lat": "2", "long":"2" }
        { "lat": "3", "long":"3" }
        { "lat": "4", "long":"4" }
      ]
    }
  }
```

### Aggregated variables

If the query has aggregated variables (such as `COUNT(?x)`), the variable query structure changes to the following:

```json
{
  "distinct": true,
  "variables": [
    {
      "expression": {
        "type": "aggregate",
        "aggregation": "count",
        "distinct": false,
        "expression": {
          "termType": "Variable",
          "value": "Artwork_1"
        }
      },
      "variable": {
        "termType": "Variable",
        "value": "Artwork_1_count"
      }
    }
  ],
}
```
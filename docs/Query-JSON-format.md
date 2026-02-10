_[Home](index.html) > Query JSON format_

# Sparnatural Query JSON format

## How it works : onQueryUpdated / loadQuery

Sparnatural emits the [`queryUpdated` event](http://docs.sparnatural.eu/Javascript-integration.html#queryupdated-event) each time the query is modified. This event contains 3 files : the generated SPARQL query string, the SPARQL query in JSON in the sparqljs syntax, and a custom JSON data structure that encodes the query. This custom JSON data structure is specific to Sparnatural, and enables it to **load previously generated query**, using the method [**`sparnatural.loadQuery(jsonQuery)`**](http://docs.sparnatural.eu/Javascript-integration.html#sparnatural-element-api).

This allows to implement 2 important features to showcase your knowledge graph :

1. The ability to prepare **sample queries that can be loaded** in a single click to initialize Sparnatural with your query
2. The ability to **encode the query in a URL parameter** and load directly Sparnatural with the query received. This enable the users to share direct links to their preferred queries, and your knowledge graph goes viral ;-)

This is illustrated in the following code snippet :

```javascript
$(document).ready(function ($) {
  const sparnatural = document.querySelector("spar-natural");

  sparnatural.addEventListener("queryUpdated", (event) => {
    // here we get the SPARQL query string and the JSON data structure
    // if integrating with YasQE we set the value :
    queryString = sparnatural.expandSparql(event.detail.queryString);
    yasqe.setValue(queryString);

    // and we could save the JSON query for later, e.g. to pass it as a parameter in a URL
    document.getElementById("query-json").value = JSON.stringify(
      event.detail.queryJson,
    );
  });

  // if we have received a JSON data structure as a URL parameter "?query="
  // then uncompress it, and pass it to the loadQuery() function of Sparnatural
  var UrlString = window.location.search;
  var urlParams = new URLSearchParams(UrlString);
  if (urlParams.has("query") === true) {
    var compressedJson = urlParams.get("query");
    var compressCodec = JsonUrl("lzma");
    compressCodec.decompress(compressedJson).then((json) => {
      sparnatural.loadQuery(JSON.parse(json));
    });
  }
});

// if we have a dropdown to select example query from...
document.getElementById("select-examples").onchange = function () {
  var key = $("#select-examples option:selected").val();
  sparnatural.loadQuery(sampleQueries[key]);
};
```

## Typescript definition

The definition of the query structure is defined in [SparnaturalQueryIfc-v13](https://github.com/sparna-git/Sparnatural/blob/master/src/sparnatural/SparnaturalQueryIfc-v13.ts).

## JSON query example

The following query in Sparnatural (_All Artworks displayed in French or Italian museums, and created in the 19th century, with their creation date_) :

![Sparnatural query example](/assets/images/screenshot-JSON-data-structure.png)

Is encoded in the following JSON data structure :

```json
{
  "type": "query",
  "subType": "SELECT",
  "variables": [
    {
      "type": "term",
      "subType": "variable",
      "value": "Artwork_1"
    },
    {
      "type": "term",
      "subType": "variable",
      "value": "Date_6"
    }
  ],
  "distinct": true,
  "solutionModifiers": {
    "limitOffset": {
      "type": "solutionModifier",
      "subType": "limitOffset",
      "limit": 1000
    }
  },
  "where": {
    "type": "pattern",
    "subType": "bgpSameSubject",
    "subject": {
      "type": "term",
      "subType": "variable",
      "value": "Artwork_1",
      "rdfType": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork"
    },
    "predicateObjectPairs": [
      {
        "type": "predicateObjectPair",
        "predicate": {
          "type": "term",
          "subType": "namedNode",
          "value": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork_displayedAt"
        },
        "object": {
          "type": "objectCriteria",
          "variable": {
            "type": "term",
            "subType": "variable",
            "value": "Museum_2",
            "rdfType": "https://data.mydomain.com/ontologies/sparnatural-config/Museum"
          },
          "filters": [],
          "predicateObjectPairs": [
            {
              "type": "predicateObjectPair",
              "predicate": {
                "type": "term",
                "subType": "namedNode",
                "value": "https://data.mydomain.com/ontologies/sparnatural-config/Museum_country"
              },
              "object": {
                "type": "objectCriteria",
                "variable": {
                  "type": "term",
                  "subType": "variable",
                  "value": "Country_4",
                  "rdfType": "https://data.mydomain.com/ontologies/sparnatural-config/Country"
                },
                "filters": [],
                "values": [
                  {
                    "type": "term",
                    "subType": "namedNode",
                    "value": "http://dbpedia.org/resource/France",
                    "label": "France"
                  },
                  {
                    "type": "term",
                    "subType": "namedNode",
                    "value": "http://dbpedia.org/resource/Italy",
                    "label": "Italy"
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "type": "predicateObjectPair",
        "predicate": {
          "type": "term",
          "subType": "namedNode",
          "value": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork_creationYear"
        },
        "object": {
          "type": "objectCriteria",
          "variable": {
            "type": "term",
            "subType": "variable",
            "value": "Date_6",
            "rdfType": "https://data.mydomain.com/ontologies/sparnatural-config/Date"
          },
          "filters": [
            {
              "type": "labelledFilter",
              "label": "between 1800 and 1901",
              "filter": {
                "type": "numberFilter",
                "min": 1800,
                "max": 1901
              }
            }
          ]
        }
      }
    ]
  }
}
```

## JSON data structure reference

Basically, the JSON data structure encodes a bit more information than the generated SPARQL query, to make our life easier when parsing the data structure to initialize Sparnatural with it. It adds:

- The _labels_ of the selected values
- The _types_ of all subjects and objects
- The _tree-like structure_ that Sparnatural uses, based on predicate-object pairs

The data structure follows a consistent typing pattern where each node has a `type` and `subType` property. The main structure is a `query` of subType `SELECT`, containing a `where` clause that holds the query criteria as a BGP (Basic Graph Pattern) with a same subject structure.

### Query structure

```json
{
  "type": "query",
  "subType": "SELECT",
  "distinct": true,
  "variables": [
    {
      "type": "term",
      "subType": "variable",
      "value": "this"
    },
    {
      "type": "term",
      "subType": "variable",
      "value": "that"
    }
  ],
  "solutionModifiers": {
    "order": { ... },
    "limitOffset": { ... }
  },
  "where": {
    ...
  },
  "metadata": {
    "id": "query-123",
    "date": "2026-02-10T08:29:01.039Z",
    "isFavorite": false,
    "description": { "en": "Description...", "fr": "Description..." }
  }
}
```

- `type` : Always `"query"`
- `subType` : Always `"SELECT"` for now
- `distinct` : Whether the `DISTINCT` SPARQL keyword should be added
- `variables` : Ordered list of variables selected in the `SELECT` clause. Each variable has `type: "term"`, `subType: "variable"`, and `value` is the variable name (without "?")
- `solutionModifiers` : Contains ordering and limit/offset settings
- `where` : The main query pattern (a BGP with same subject structure)
- `metadata` : Optional metadata about the query (id, labels, descriptions in multiple languages)

### Solution Modifiers

```json
{
  "solutionModifiers": {
    "order": {
      "type": "solutionModifier",
      "subType": "order",
      "orderDefs": [
        {
          "descending": false,
          "expression": {
            "type": "term",
            "subType": "variable",
            "value": "Artwork_1"
          }
        }
      ]
    },
    "limitOffset": {
      "type": "solutionModifier",
      "subType": "limitOffset",
      "limit": 1000
    }
  }
}
```

- `order` : Defines the sort order. `descending: true` for DESC, `false` for ASC. The `expression` is the variable to sort on.
- `limitOffset` : Defines the `LIMIT` clause value.

### Where clause (BGP Same Subject)

```json
{
  "where": {
    "type": "pattern",
    "subType": "bgpSameSubject",
    "subject": {
      "type": "term",
      "subType": "variable",
      "value": "Artwork_1",
      "rdfType": "https://data.mydomain.com/ontologies/sparnatural-config/Artwork"
    },
    "predicateObjectPairs": [
      ...
    ]
  }
}
```

- `type` : Always `"pattern"`
- `subType` : Always `"bgpSameSubject"` - a BGP where all triples share the same subject
- `subject` : A typed variable representing the main subject of the query
- `predicateObjectPairs` : Ordered list of predicate-object pairs for this subject

### Predicate-Object Pair structure

```json
{
  "type": "predicateObjectPair",
  "subType": "optional",
  "predicate": {
    "type": "term",
    "subType": "namedNode",
    "value": "https://data.mydomain.com/ontologies/sparnatural-config/Museum_country"
  },
  "object": {
    ...
  }
}
```

- `type` : Always `"predicateObjectPair"`
- `subType` : Optional. Can be `"optional"` (generates SPARQL `OPTIONAL`) or `"notExists"` (generates `FILTER NOT EXISTS`). If absent, the pair is mandatory.
- `predicate` : The property URI as a named node term
- `object` : An `ObjectCriteria` structure containing the object variable and its criteria

### Object Criteria structure

```json
{
  "object": {
    "type": "objectCriteria",
    "variable": {
      "type": "term",
      "subType": "variable",
      "value": "Country_4",
      "rdfType": "https://data.mydomain.com/ontologies/sparnatural-config/Country"
    },
    "values": [
      ...
    ],
    "filters": [
      ...
    ],
    "predicateObjectPairs": [
      ...
    ]
  }
}
```

- `type` : Always `"objectCriteria"`
- `variable` : A typed variable for the object, with its RDF type

An `objectCriteria` holds the criteria selected by the user for a given object. Depending on the widget type configured for the property, the criteria are stored in one of three mutually exclusive arrays:

- `values` : Array of selected values (URIs or literals) — populated by widgets that let the user **pick specific values**: List, Autocomplete, Boolean, Tree
- `filters` : Array of labelled filters — populated by widgets that let the user **define a range or condition**: Date, Number, Search, Map
- `predicateObjectPairs` : Nested predicate-object pairs — populated when the user **adds a child criterion** (i.e. no value widget is shown, the property links to a deeper level in the query tree)

### Values (URI / Literal selection)

Values are used when selecting specific URIs or literals (from List, Autocomplete, or Tree widgets):

**URI value (named node):**

```json
{
  "values": [
    {
      "type": "term",
      "subType": "namedNode",
      "value": "http://dbpedia.org/resource/France",
      "label": "France"
    }
  ]
}
```

**Literal value (with language):**

```json
{
  "values": [
    {
      "type": "term",
      "subType": "literal",
      "value": "foo",
      "langOrIri": "en",
      "label": "foo"
    }
  ]
}
```

**Literal value (with datatype):**

```json
{
  "values": [
    {
      "type": "term",
      "subType": "literal",
      "value": "true",
      "langOrIri": {
        "type": "term",
        "subType": "namedNode",
        "value": "http://www.w3.org/2001/XMLSchema#boolean"
      },
      "label": "True"
    }
  ]
}
```

### Labelled Filters

Filters are used for widgets that generate SPARQL FILTER clauses (date, number, search, map):

```json
{
  "filters": [
    {
      "type": "labelledFilter",
      "label": "between 1800 and 1901",
      "filter": {
        ...
      }
    }
  ]
}
```

- `type` : Always `"labelledFilter"`
- `label` : Human-readable label for the filter
- `filter` : The actual filter definition (see filter types below)

### Filter types

**Date filter:**

```json
{
  "filter": {
    "type": "dateFilter",
    "start": "1800-01-01T00:00:00.000Z",
    "stop": "1901-12-31T23:59:59.059Z"
  }
}
```

**Number filter:**

```json
{
  "filter": {
    "type": "numberFilter",
    "min": 10000,
    "max": 100000
  }
}
```

**Search filter (regex/fulltext):**

```json
{
  "filter": {
    "type": "searchFilter",
    "search": "Leonardo"
  }
}
```

**Map filter:**

```json
{
  "filter": {
    "type": "mapFilter",
    "coordType": "Rectangle",
    "coordinates": [
      [
        { "lat": 1, "lng": 1 },
        { "lat": 2, "lng": 2 },
        { "lat": 3, "lng": 3 },
        { "lat": 4, "lng": 4 }
      ]
    ]
  }
}
```

### Aggregated variables

If the query has aggregated variables (such as `COUNT(?x)`), the variable structure uses a `PatternBind`:

```json
{
  "variables": [
    {
      "type": "pattern",
      "subType": "bind",
      "expression": {
        "type": "expression",
        "subType": "aggregate",
        "aggregation": "count",
        "distinct": false,
        "expression": [
          {
            "type": "term",
            "subType": "variable",
            "value": "Artwork_1"
          }
        ]
      },
      "variable": {
        "type": "term",
        "subType": "variable",
        "value": "Artwork_1_count"
      }
    }
  ]
}
```

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

## JSON Schema

The following JSON Schema formally describes the Sparnatural query v13 format. All types are declared in the `$defs` section. Each type includes `title`, `description`, and `examples` annotations to make the schema self-documenting. This schema can be used for validation, code generation, or integration with tools that consume JSON Schema (e.g. OpenAI function calling).

> The TypeScript source of truth is [`SparnaturalQueryIfc-v13.ts`](https://github.com/sparna-git/Sparnatural/blob/master/src/sparnatural/SparnaturalQueryIfc-v13.ts).

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://sparnatural.eu/schemas/sparnatural-query-v13.json",
  "title": "Sparnatural Query v13",
  "description": "JSON Schema for the Sparnatural query format v13. Describes the custom JSON data structure emitted by Sparnatural in the queryUpdated event and reloadable via sparnatural.loadQuery(). Encodes a SPARQL SELECT query with additional metadata (labels, types, tree structure) that Sparnatural needs to reconstruct its visual query builder state.",
  "$ref": "#/$defs/SparnaturalQuery",

  "$defs": {
    "SparnaturalQuery": {
      "type": "object",
      "title": "SparnaturalQuery",
      "description": "The root query object representing a SPARQL SELECT query with Sparnatural-specific extensions for labels, types, and tree structure.",
      "required": [
        "type",
        "subType",
        "variables",
        "solutionModifiers",
        "where"
      ],
      "properties": {
        "type": {
          "const": "query",
          "description": "Node type identifier. Always 'query'."
        },
        "subType": {
          "const": "SELECT",
          "description": "Query form. Currently only 'SELECT' is supported."
        },
        "variables": {
          "type": "array",
          "description": "Ordered list of variables or aggregated expressions selected in the SELECT clause.",
          "items": {
            "oneOf": [
              { "$ref": "#/$defs/TermVariable" },
              { "$ref": "#/$defs/PatternBind" }
            ]
          },
          "examples": [
            [
              { "type": "term", "subType": "variable", "value": "Artwork_1" },
              { "type": "term", "subType": "variable", "value": "Date_6" }
            ]
          ]
        },
        "distinct": {
          "type": "boolean",
          "const": true,
          "description": "When present and true, the DISTINCT keyword is added to the SELECT clause."
        },
        "solutionModifiers": {
          "$ref": "#/$defs/SolutionModifiers",
          "description": "Solution modifiers for ordering and limiting results."
        },
        "where": {
          "$ref": "#/$defs/PatternBgpSameSubject",
          "description": "The main WHERE clause, structured as a BGP with a single shared subject."
        },
        "metadata": {
          "$ref": "#/$defs/QueryMetadata",
          "description": "Optional metadata about the query (id, date, descriptions, favorites)."
        }
      },
      "additionalProperties": false
    },

    "QueryMetadata": {
      "type": "object",
      "title": "QueryMetadata",
      "description": "Optional metadata associated with a saved query, including identifiers, timestamps, and multilingual labels and descriptions.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the query, typically a UUID.",
          "examples": ["aa09eb53-e850-4a13-8159-9c73950bdbe6"]
        },
        "date": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp of when the query was saved.",
          "examples": ["2026-02-10T08:31:41.233Z"]
        },
        "isFavorite": {
          "type": "boolean",
          "description": "Whether the query is marked as a favorite.",
          "default": false
        },
        "lang": {
          "type": "string",
          "description": "BCP47 language code of the UI when the query was generated.",
          "examples": ["en", "fr"]
        },
        "label": {
          "type": "object",
          "description": "Short labels for the query, keyed by language code.",
          "additionalProperties": { "type": "string" },
          "examples": [
            {
              "en": "Artworks in French museums",
              "fr": "Œuvres dans les musées français"
            }
          ]
        },
        "description": {
          "type": "object",
          "description": "Longer descriptions for the query, keyed by language code.",
          "additionalProperties": { "type": "string" },
          "examples": [
            {
              "en": "Find all artworks displayed in museums located in France",
              "fr": ""
            }
          ]
        }
      },
      "additionalProperties": true
    },

    "PatternBgpSameSubject": {
      "type": "object",
      "title": "PatternBgpSameSubject",
      "description": "A Basic Graph Pattern where all triple patterns share the same subject. This is the main structural element of the WHERE clause in Sparnatural queries.",
      "required": ["type", "subType", "subject", "predicateObjectPairs"],
      "properties": {
        "type": {
          "const": "pattern",
          "description": "Node type identifier. Always 'pattern'."
        },
        "subType": {
          "const": "bgpSameSubject",
          "description": "Pattern subtype. Always 'bgpSameSubject'."
        },
        "subject": {
          "$ref": "#/$defs/TermTypedVariable",
          "description": "The shared subject variable of all triple patterns in this BGP, with its RDF type."
        },
        "predicateObjectPairs": {
          "type": "array",
          "description": "Ordered list of predicate-object pairs attached to this subject.",
          "items": { "$ref": "#/$defs/PredicateObjectPair" }
        }
      },
      "additionalProperties": false
    },

    "PatternBind": {
      "type": "object",
      "title": "PatternBind",
      "description": "A BIND pattern that binds the result of an aggregate expression to a variable. Used in the variables array when a column is an aggregation (e.g. COUNT, SUM, GROUP_CONCAT).",
      "required": ["type", "subType", "expression", "variable"],
      "properties": {
        "type": {
          "const": "pattern",
          "description": "Node type identifier. Always 'pattern'."
        },
        "subType": {
          "const": "bind",
          "description": "Pattern subtype. Always 'bind'."
        },
        "expression": {
          "$ref": "#/$defs/ExpressionAggregate",
          "description": "The aggregate expression (e.g. COUNT, SUM, GROUP_CONCAT)."
        },
        "variable": {
          "$ref": "#/$defs/TermVariable",
          "description": "The variable to which the aggregate result is bound."
        }
      },
      "additionalProperties": false,
      "examples": [
        {
          "type": "pattern",
          "subType": "bind",
          "expression": {
            "type": "expression",
            "subType": "aggregate",
            "aggregation": "count",
            "distinct": false,
            "expression": [
              { "type": "term", "subType": "variable", "value": "Artwork_1" }
            ]
          },
          "variable": {
            "type": "term",
            "subType": "variable",
            "value": "Artwork_1_count"
          }
        }
      ]
    },

    "PredicateObjectPair": {
      "type": "object",
      "title": "PredicateObjectPair",
      "description": "A predicate-object pair in a BGP. Represents a single criterion line in the Sparnatural visual query builder. Can optionally be marked as optional or notExists.",
      "required": ["type", "predicate", "object"],
      "properties": {
        "type": {
          "const": "predicateObjectPair",
          "description": "Node type identifier. Always 'predicateObjectPair'."
        },
        "subType": {
          "type": "string",
          "enum": ["optional", "notExists"],
          "description": "Optional modifier. 'optional' generates SPARQL OPTIONAL { }. 'notExists' generates FILTER NOT EXISTS { }. If absent, the pair is mandatory."
        },
        "predicate": {
          "$ref": "#/$defs/TermIri",
          "description": "The property IRI used as predicate in the triple pattern."
        },
        "object": {
          "$ref": "#/$defs/ObjectCriteria",
          "description": "The object criteria containing the target variable and any selected values, filters, or nested pairs."
        }
      },
      "additionalProperties": false,
      "examples": [
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
            "values": [
              {
                "type": "term",
                "subType": "namedNode",
                "value": "http://dbpedia.org/resource/France",
                "label": "France"
              }
            ],
            "filters": []
          }
        }
      ]
    },

    "ObjectCriteria": {
      "type": "object",
      "title": "ObjectCriteria",
      "description": "Holds the criteria selected by the user for a given object in a predicate-object pair. Depending on the widget type configured for the property, criteria are stored as values (for selection widgets like List, Autocomplete, Boolean, Tree), filters (for range/condition widgets like Date, Number, Search, Map), or nested predicateObjectPairs (for child criteria when no value widget is shown).",
      "required": ["type", "variable"],
      "properties": {
        "type": {
          "const": "objectCriteria",
          "description": "Node type identifier. Always 'objectCriteria'."
        },
        "variable": {
          "$ref": "#/$defs/TermTypedVariable",
          "description": "The object variable with its associated RDF type."
        },
        "values": {
          "type": "array",
          "description": "Selected values from List, Autocomplete, Boolean, or Tree widgets. Items are GraphTerm objects (flat list of named nodes or literals) or ValuePatternRow objects (keyed by variable name for multi-variable VALUES clauses).",
          "items": {
            "oneOf": [
              { "$ref": "#/$defs/GraphTerm" },
              { "$ref": "#/$defs/ValuePatternRow" }
            ]
          }
        },
        "filters": {
          "type": "array",
          "description": "Labelled filters from Date, Number, Search, or Map widgets. Each filter generates a SPARQL FILTER clause.",
          "items": { "$ref": "#/$defs/LabelledFilter" }
        },
        "predicateObjectPairs": {
          "type": "array",
          "description": "Nested predicate-object pairs when the user adds child criteria (deeper levels in the Sparnatural query tree).",
          "items": { "$ref": "#/$defs/PredicateObjectPair" }
        }
      },
      "additionalProperties": false
    },

    "LabelledFilter": {
      "type": "object",
      "title": "LabelledFilter",
      "description": "A filter with a human-readable label. The label preserves the user's input for display purposes when reloading the query in the Sparnatural UI.",
      "required": ["type", "label", "filter"],
      "properties": {
        "type": {
          "const": "labelledFilter",
          "description": "Node type identifier. Always 'labelledFilter'."
        },
        "label": {
          "type": "string",
          "description": "Human-readable label describing the filter criteria.",
          "examples": [
            "between 1800 and 1901",
            "Leonardo",
            "from 01/01/2020 to 31/12/2025"
          ]
        },
        "filter": {
          "description": "The actual filter definition. One of: dateFilter, numberFilter, searchFilter, mapFilter.",
          "oneOf": [
            { "$ref": "#/$defs/DateFilter" },
            { "$ref": "#/$defs/NumberFilter" },
            { "$ref": "#/$defs/SearchFilter" },
            { "$ref": "#/$defs/MapFilter" }
          ]
        }
      },
      "additionalProperties": false
    },

    "DateFilter": {
      "type": "object",
      "title": "DateFilter",
      "description": "A date range filter generating a SPARQL FILTER with >= and/or <= comparisons on date values. At least one of start or stop must be defined.",
      "required": ["type"],
      "properties": {
        "type": {
          "const": "dateFilter",
          "description": "Filter type identifier. Always 'dateFilter'."
        },
        "start": {
          "type": "string",
          "description": "Start date in ISO 8601 format (e.g. '2023-10-05T14:48:00.000Z') or just a year (e.g. '2023', '-0450' for 450 BC). Absent if no lower bound.",
          "examples": ["1800-01-01T00:00:00.000Z", "2023", "-0450"]
        },
        "stop": {
          "type": "string",
          "description": "End date in ISO 8601 format or just a year. Absent if no upper bound.",
          "examples": ["1901-12-31T23:59:59.059Z", "2025"]
        }
      },
      "additionalProperties": false
    },

    "NumberFilter": {
      "type": "object",
      "title": "NumberFilter",
      "description": "A numeric range filter generating a SPARQL FILTER with >= and/or <= comparisons. At least one of min or max must be defined.",
      "required": ["type"],
      "properties": {
        "type": {
          "const": "numberFilter",
          "description": "Filter type identifier. Always 'numberFilter'."
        },
        "min": {
          "type": "number",
          "description": "Minimum value (inclusive). Absent if no lower bound.",
          "examples": [10000, 0]
        },
        "max": {
          "type": "number",
          "description": "Maximum value (inclusive). Absent if no upper bound.",
          "examples": [100000, 999]
        }
      },
      "additionalProperties": false
    },

    "SearchFilter": {
      "type": "object",
      "title": "SearchFilter",
      "description": "A text search filter. Interpreted as a regex in plain SPARQL (FILTER regex()), or as a fulltext search string when using a triplestore with fulltext search capabilities (e.g. GraphDB Lucene connector).",
      "required": ["type", "search"],
      "properties": {
        "type": {
          "const": "searchFilter",
          "description": "Filter type identifier. Always 'searchFilter'."
        },
        "search": {
          "type": "string",
          "description": "The search string or regex pattern.",
          "examples": ["Leonardo", "Monet.*"]
        }
      },
      "additionalProperties": false
    },

    "MapFilter": {
      "type": "object",
      "title": "MapFilter",
      "description": "A geographic area filter defined by a polygon or rectangle on a map. Generates a SPARQL FILTER with spatial comparisons on latitude/longitude values.",
      "required": ["type", "coordType", "coordinates"],
      "properties": {
        "type": {
          "const": "mapFilter",
          "description": "Filter type identifier. Always 'mapFilter'."
        },
        "coordType": {
          "type": "string",
          "enum": ["Polygon", "Rectangle"],
          "description": "The shape type of the geographic selection area.",
          "examples": ["Rectangle"]
        },
        "coordinates": {
          "type": "array",
          "description": "Array of coordinate rings. Each ring is an array of LatLng points defining the boundary of the area.",
          "items": {
            "type": "array",
            "items": { "$ref": "#/$defs/LatLng" }
          }
        }
      },
      "additionalProperties": false
    },

    "LatLng": {
      "type": "object",
      "title": "LatLng",
      "description": "A geographic coordinate with latitude, longitude, and an optional altitude.",
      "required": ["lat", "lng"],
      "properties": {
        "lat": {
          "type": "number",
          "description": "Latitude in decimal degrees.",
          "examples": [48.8566]
        },
        "lng": {
          "type": "number",
          "description": "Longitude in decimal degrees.",
          "examples": [2.3522]
        },
        "alt": {
          "type": "number",
          "description": "Optional altitude in meters."
        }
      },
      "additionalProperties": false
    },

    "SolutionModifiers": {
      "type": "object",
      "title": "SolutionModifiers",
      "description": "SPARQL solution modifiers for ordering results and setting limit/offset.",
      "properties": {
        "order": {
          "$ref": "#/$defs/SolutionModifierOrder",
          "description": "ORDER BY clause definition."
        },
        "limitOffset": {
          "$ref": "#/$defs/SolutionModifierLimitOffset",
          "description": "LIMIT/OFFSET clause definition."
        }
      },
      "additionalProperties": false
    },

    "SolutionModifierOrder": {
      "type": "object",
      "title": "SolutionModifierOrder",
      "description": "Defines the ORDER BY clause with one or more ordering definitions.",
      "required": ["type", "subType", "orderDefs"],
      "properties": {
        "type": {
          "const": "solutionModifier",
          "description": "Node type identifier. Always 'solutionModifier'."
        },
        "subType": {
          "const": "order",
          "description": "Modifier subtype. Always 'order'."
        },
        "orderDefs": {
          "type": "array",
          "description": "List of ordering definitions, applied in sequence.",
          "items": { "$ref": "#/$defs/Ordering" }
        }
      },
      "additionalProperties": false
    },

    "SolutionModifierLimitOffset": {
      "type": "object",
      "title": "SolutionModifierLimitOffset",
      "description": "Defines the LIMIT clause for restricting the number of results returned.",
      "required": ["type", "subType", "limit"],
      "properties": {
        "type": {
          "const": "solutionModifier",
          "description": "Node type identifier. Always 'solutionModifier'."
        },
        "subType": {
          "const": "limitOffset",
          "description": "Modifier subtype. Always 'limitOffset'."
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of results to return.",
          "examples": [1000]
        }
      },
      "additionalProperties": false
    },

    "Ordering": {
      "type": "object",
      "title": "Ordering",
      "description": "A single ordering definition within an ORDER BY clause.",
      "required": ["descending", "expression"],
      "properties": {
        "descending": {
          "type": "boolean",
          "description": "true for DESC ordering, false for ASC ordering.",
          "examples": [false, true]
        },
        "expression": {
          "$ref": "#/$defs/TermVariable",
          "description": "The variable to sort on."
        }
      },
      "additionalProperties": false
    },

    "ValuePatternRow": {
      "type": "object",
      "title": "ValuePatternRow",
      "description": "A single row in a SPARQL VALUES clause. Each key is a variable name (without '?') and each value is a GraphTerm or undefined (UNDEF in SPARQL VALUES).",
      "additionalProperties": {
        "oneOf": [
          { "$ref": "#/$defs/TermIri" },
          { "$ref": "#/$defs/TermLabelledIri" },
          { "$ref": "#/$defs/TermLiteral" }
        ]
      },
      "examples": [
        {
          "Country_4": {
            "type": "term",
            "subType": "namedNode",
            "value": "http://dbpedia.org/resource/France"
          }
        }
      ]
    },

    "ExpressionAggregate": {
      "type": "object",
      "title": "ExpressionAggregate",
      "description": "An aggregate expression such as COUNT, SUM, AVG, MIN, MAX, SAMPLE, or GROUP_CONCAT. Used inside a PatternBind to define aggregated columns.",
      "required": ["type", "subType", "aggregation", "distinct", "expression"],
      "properties": {
        "type": {
          "const": "expression",
          "description": "Node type identifier. Always 'expression'."
        },
        "subType": {
          "const": "aggregate",
          "description": "Expression subtype. Always 'aggregate'."
        },
        "aggregation": {
          "type": "string",
          "description": "The aggregation function name (lowercase): count, sum, avg, min, max, sample, group_concat.",
          "examples": ["count", "sum", "group_concat"]
        },
        "distinct": {
          "type": "boolean",
          "description": "Whether DISTINCT is applied inside the aggregate function.",
          "examples": [false, true]
        },
        "expression": {
          "type": "array",
          "description": "The variable(s) being aggregated. Currently limited to a single TermVariable.",
          "items": { "$ref": "#/$defs/TermVariable" },
          "minItems": 1,
          "maxItems": 1
        },
        "separator": {
          "type": "string",
          "description": "Separator string for GROUP_CONCAT aggregation. Only used when aggregation is 'group_concat'.",
          "examples": [", ", " ; "]
        }
      },
      "additionalProperties": false
    },

    "TermVariable": {
      "type": "object",
      "title": "TermVariable",
      "description": "An RDF variable term. The value is the variable name without the '?' prefix.",
      "required": ["type", "subType", "value"],
      "properties": {
        "type": {
          "const": "term",
          "description": "Node type identifier. Always 'term'."
        },
        "subType": {
          "const": "variable",
          "description": "Term subtype. Always 'variable'."
        },
        "value": {
          "type": "string",
          "description": "Variable name without the '?' prefix. Typically follows the pattern ClassName_N (e.g. Artwork_1, Museum_2).",
          "examples": ["Artwork_1", "Museum_2", "Country_4"]
        }
      },
      "additionalProperties": false
    },

    "TermTypedVariable": {
      "type": "object",
      "title": "TermTypedVariable",
      "description": "A variable term with an associated RDF type. Used for subjects and objects to preserve the class information needed to reconstruct the Sparnatural visual state (generates rdf:type triple patterns).",
      "required": ["type", "subType", "value", "rdfType"],
      "properties": {
        "type": {
          "const": "term",
          "description": "Node type identifier. Always 'term'."
        },
        "subType": {
          "const": "variable",
          "description": "Term subtype. Always 'variable'."
        },
        "value": {
          "type": "string",
          "description": "Variable name without the '?' prefix.",
          "examples": ["Artwork_1", "Museum_2"]
        },
        "rdfType": {
          "type": "string",
          "format": "iri",
          "description": "The RDF class IRI associated with this variable.",
          "examples": [
            "https://data.mydomain.com/ontologies/sparnatural-config/Artwork"
          ]
        }
      },
      "additionalProperties": false
    },

    "TermIri": {
      "type": "object",
      "title": "TermIri",
      "description": "An RDF named node (IRI) term.",
      "required": ["type", "subType", "value"],
      "properties": {
        "type": {
          "const": "term",
          "description": "Node type identifier. Always 'term'."
        },
        "subType": {
          "const": "namedNode",
          "description": "Term subtype. Always 'namedNode' for IRIs."
        },
        "value": {
          "type": "string",
          "format": "iri",
          "description": "The full IRI string.",
          "examples": [
            "http://dbpedia.org/resource/France",
            "http://www.w3.org/2001/XMLSchema#boolean"
          ]
        }
      },
      "additionalProperties": false
    },

    "TermLabelledIri": {
      "type": "object",
      "title": "TermLabelledIri",
      "description": "An RDF named node (IRI) with a human-readable label. Used in values to preserve the display label for the selected resource, so that Sparnatural can show it without re-fetching.",
      "required": ["type", "subType", "value", "label"],
      "properties": {
        "type": {
          "const": "term",
          "description": "Node type identifier. Always 'term'."
        },
        "subType": {
          "const": "namedNode",
          "description": "Term subtype. Always 'namedNode' for IRIs."
        },
        "value": {
          "type": "string",
          "format": "iri",
          "description": "The full IRI string.",
          "examples": ["http://dbpedia.org/resource/France"]
        },
        "label": {
          "type": "string",
          "description": "Human-readable label for the IRI, as displayed in the Sparnatural UI.",
          "examples": ["France", "Italy", "Leonardo da Vinci"]
        }
      },
      "additionalProperties": false
    },

    "TermLiteral": {
      "type": "object",
      "title": "TermLiteral",
      "description": "An RDF literal term. Can be a plain literal (no language or datatype), a language-tagged literal (langOrIri is a string like 'en'), or a datatype literal (langOrIri is a TermIri like xsd:boolean).",
      "required": ["type", "subType", "value"],
      "properties": {
        "type": {
          "const": "term",
          "description": "Node type identifier. Always 'term'."
        },
        "subType": {
          "const": "literal",
          "description": "Term subtype. Always 'literal'."
        },
        "value": {
          "type": "string",
          "description": "The lexical value of the literal.",
          "examples": ["true", "foo", "42"]
        },
        "langOrIri": {
          "description": "Language tag (string, e.g. 'en') for language-tagged literals, or a TermIri for datatype IRIs (e.g. xsd:boolean, xsd:integer). Absent for plain string literals.",
          "oneOf": [
            {
              "type": "string",
              "description": "BCP47 language tag.",
              "examples": ["en", "fr", "de"]
            },
            {
              "$ref": "#/$defs/TermIri",
              "description": "Datatype IRI for typed literals."
            }
          ]
        },
        "label": {
          "type": "string",
          "description": "Optional human-readable label for display in the Sparnatural UI.",
          "examples": ["True", "foo"]
        }
      },
      "additionalProperties": false
    },

    "GraphTerm": {
      "title": "GraphTerm",
      "description": "A term that can appear in an RDF graph: either a named node (IRI), a labelled named node (IRI with label), or a literal. Discriminated by the subType property ('namedNode' vs 'literal') and the presence of a 'label' property.",
      "oneOf": [
        { "$ref": "#/$defs/TermIri" },
        { "$ref": "#/$defs/TermLabelledIri" },
        { "$ref": "#/$defs/TermLiteral" }
      ]
    }
  }
}
```

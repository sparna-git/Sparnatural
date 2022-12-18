_[Home](index.html) > JSON-based configuration_

# Sparnatural JSON configuration

Sparnatural can be configured using a JSON(-LD) data structure. The data structure looks very much like [JSON-LD](https://www.w3.org/TR/json-ld/), but is really interpreted and parsed like a JSON, so stick with the JSON keys given below.

Sparnatural can also be configured with an [[OWL-based configuration]] editable in [Protégé](https://protege.stanford.edu/). JSON configuration will look more familiar for programmers.

## Structure of the JSON configuration

The JSON configuration consists of :
1. A fixed `@context` declaration
1. A URI for the configuration
1. A list of classes declaration
1. A list of properties declaration

## Minimal JSON configuration

A minimal JSON configuration for Sparnatural looks like the following example. It declares 1 class `foaf:Person` and a single property `foaf:knows` that has `foaf:Person` as its domain and range (a Person can know another Person). The config is stored in a `config` javascript variable that will be passed as a parameter to init Sparnatural.

```javascript
    <script>
var config = 
{
  "@context":
  {
    "Ontology" : "http://www.w3.org/2002/07/owl#Ontology",
    "Class" : "http://www.w3.org/2002/07/owl#Class",
    "ObjectProperty" : "http://www.w3.org/2002/07/owl#ObjectProperty",
    "label": "http://www.w3.org/2000/01/rdf-schema#label",
    "domain": {
      "@id": "http://www.w3.org/2000/01/rdf-schema#domain",
      "@type": "@id"
    },
    "range": {
      "@id": "http://www.w3.org/2000/01/rdf-schema#range",
      "@type": "@id"
    },
    "unionOf": {
      "@id": "http://www.w3.org/2002/07/owl#unionOf",
      "@type": "@id"
    },
    "subPropertyOf": {
      "@id": "http://www.w3.org/2000/01/rdf-schema#subPropertyOf",
      "@type": "@id"
    },
    "faIcon": "http://data.sparna.fr/ontologies/sparnatural-config-core#faIcon",
    "sparqlString": "http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString",
    "sparnatural": "http://data.sparna.fr/ontologies/sparnatural-config-core#",
    "datasources": "http://data.sparna.fr/ontologies/sparnatural-config-datasources#",
  },
  "@graph": [
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo/onto",
      "@type" : "Ontology"
    },
    {
      "@id" : "http://xmlns.com/foaf/0.1/Person",
      "@type" : "Class",
      "label": [
        {"@value" : "Person","@language" : "en"},
        {"@value" : "Personne","@language" : "fr"}
      ],
      "faIcon":  "fas fa-user"
    },
    {
      "@id" : "http://xmlns.com/foaf/0.1/knows",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:ListProperty",
      "label": [
        {"@value" : "knows","@language" : "en"},
        {"@value" : "connait","@language" : "fr"}
      ],
      "domain": "http://xmlns.com/foaf/0.1/Person",
      "range": "http://xmlns.com/foaf/0.1/Person",
      "datasource": "datasources:list_foafname_alpha"
    }
  ]
}
;
    </script>
```

## JSON @context

Copy-paste the `@context` key given in the minimal example and do not modify it. Keep it like this for your own configuration.

# Configuration URI

This part specifies a URI for your configuration, this is not used for reading/parsing the configuration, and is here only for compatibility with an OWL-base configuration. Just specify any URI here, and don't bother too much. You can use whatever URL Sparnatural will be inserted in, and append `/config` at the end :

```json
   {
      "@id" : "http://mysite.com/coll-page-with-sparnatural/onto",
      "@type" : "Ontology"
    }
```


## Classes configuration

The configuration lists the types of entities that are searchable in Sparnatural. These types either map to real RDF resources, or are used to express search criterias on literal values.

Each class is described with:
1. a URI (`@id`) and the 
1. a label (or multiple multilingual labels)
1. an icon (optional but recommended)
1. a mapping to a SPARQL string (optional)

### URI (@id) and @type "Class"

This is the URI of the class/type. It is either the URI of a class in the data graph to be queried, or a custom URI that is mapped to one or more other classes in the underlying data graph (using `sparqlString` key, see below).

The URI of the class will be inserted in the generated SPARQL query, unless you have specified a `sparqlString` replacement.

Always set `@type` to the value "Class".

Typical class declaration corresponding to a known type URI:

```
    {
      "@id" : "http://xmlns.com/foaf/0.1/Person",
      "@type" : "Class",
      ...
    },
```

Typical class declaration mapped to other classes in the data:

```
    {
      "@id" : "http://mysite.com/cool-page-with-sparnatural/onto#ArtworkType",
      "@type" : "Class",
      "sparqlString" : "<http://www.w3.org/2004/02/skos/core#Concept>; skos:inScheme <http://mysite.com/vocabulary/TypesOfArtwork>"
      ...
    },
```

(see below).

### Labels

A class needs to be associated to labels, at least one, in the language you expect it to be displayed; each label must be associated to a language code:

```
    {
      "@id" : "http://xmlns.com/foaf/0.1/Person",
      ...
      "label": [
        {"@value" : "Person","@language" : "en"},
        {"@value" : "Personne","@language" : "fr"}
      ]
      ...
    }
```

### Icon or Font Awesome icon

One of the cool thing of Sparnatural is the ability to associate an icon to each class displayed. Icon is optional and if not provided, a blank placeholder is used instead. You can provide an icon either using an image or using a [FontAwesome](https://fontawesome.com/) icon code, which is highly recommended.

Simply use the key "faIcon" and provide the code of the FA icon to be used, like `fas fa-user` for a user, or `fas fa-building` for a building:

```
    {
      "@id" : "http://xmlns.com/foaf/0.1/Person",
      ...
      "faIcon":  "fas fa-user"
    },
```

This requires that you integrate FontAwesome in the page where Sparnatural will be inserted, which is a matter of including a CSS in your page:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.9.0/css/all.min.css" />
```

See the [FontAwesome documentation](https://fontawesome.com/how-to-use/on-the-web/setup/hosting-font-awesome-yourself) for more information.


### SPARQL String

When generating the SPARQL query, Sparnatural inserts the URI of the class in the configuration, unless you specify a replacement ̀`sparqlString` that will be inserted _as is_ instead of the URI in the SPARQL query.

The replacement is done at the string level, there is no syntax checking of the generated query, so you need to make sure the provided replacement string does not violate the syntax. Typical values you can use are:
1. Mapping to a single class URI, giving the class URI **between angle brackets**: `"sparqlString" : "<http://xmlns.com/foaf/0.1/Person>"`
1. Mapping to a class with an extra criteria separated by a `;`: `"sparqlString" : "<http://www.w3.org/2004/02/skos/core#Concept>; <http://www.w3.org/2004/02/skos/core#inScheme> <http://mysite.com/vocabulary/TypesOfArtwork>"`


## Properties configuration

Each property represents a possible connection between one or more classes declared in the configuration as its domain, and one or more classes of the configuration as its range.

Similarly to classes, the URI of the property is inserted in the SPARQL query, unless you specify a replacement string (typically a property path) using `sparqlString`.

A property is configured with:
1. a URI, and the type "ObjectProperty"
1. a label (or multiple multilingual labels)
1. a domain and a range 
1. a mapping to a SPARQL property path (optional)
1. a widget
1. a datasource (for list and autocomplete widgets)
1. other optional options

### URI (@id) and type "ObjectProperty"

Declare your property with its URI in `@id`. Always give it the `@type` "ObjectProperty".

```json
    {
      "@id" : "http://xmlns.com/foaf/0.1/knows",
      "@type" : "ObjectProperty"
    }
```

### Labels

Just like classes, properties need to have labels, at least one, always associated to a language code:

```
    {
      "@id" : "http://xmlns.com/foaf/0.1/knows",
      "@type" : "ObjectProperty",
      "label": [
        {"@value" : "knows","@language" : "en"},
        {"@value" : "connait","@language" : "fr"}
      ]
    }
```

### Domain and Range

It is mandatory to specify the domain and range of each property, using the URI of classes from the configuration.

```json
    {
      "@id" : "http://xmlns.com/foaf/0.1/knows",
      "@type" : "ObjectProperty",
      "domain": "http://xmlns.com/foaf/0.1/Person",
      "range": "http://xmlns.com/foaf/0.1/Person"
    }
```

Domain and range can be specified with `unionOf` for properties that can connect multiple classes either as their domain or their range:

```
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#search",
      "@type" : "ObjectProperty",
      "domain": {
        "@type" : "Class",
        "unionOf" : {
          "@list" : [ 
            { "@id" : "http://dbpedia.org/ontology/Museum"},
            { "@id" : "http://dbpedia.org/ontology/Person"},
            { "@id" : "http://dbpedia.org/ontology/Artwork"}
          ]
        }
      },
      "range": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Search"
    },
```

### Widget

Each property must declare its associated value selection widget in the `subPropertyOf` key. Allowed values are:
  - `sparnatural:ListProperty`
  - `sparnatural:AutocompleteProperty`
  - `sparnatural:TimeProperty-Date`
  - `sparnatural:TimeProperty-Year`
  - `sparnatural:TimeProperty-Period` (forget this one)
  - `sparnatural:SearchProperty`
  - `sparnatural:NonSelectableProperty`
  - `sparnatural:MapProperty`

```json
    {
      "@id" : "http://xmlns.com/foaf/0.1/knows",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:ListProperty"
    }
```


### Datasource for list and autocomplete widgets

Lists and autocomplete widgets require a `datasource` key to populate respectively the list of values or the values proposed by autocompletion. In its simplest and most common form a datasource is basically a SPARQL query that returns the expected columns to be used to populate the list/autocomplete values.

The SPARQL datasource configuration can be either:
1. A reference to a pre-configured datasource;
1. A reference to a pre-configured SPARQL query, plus a property URI to be injected in this query;
1. Your own SPARQL query;
1. A reference to your own datasource configured in the JSON configuration (advanced);

#### Preconfigured datasources for a ListProperty


Sparnatural comes preconfigured with datasources that can populate lists based on `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` or the URI of the entity (which is the default behavior). For each of these properties, 3 flavors of datasource exist : either with an alphabetical ordering, an alphabetical ordering plus the count shown in parenthesis, or a descending count ordering

The preconfigured datasource identifiers for a ListProperty are :
1. `datasources:list_URI_alpha` and `datasources:list_URI_count`
1. `datasources:list_rdfslabel_alpha` and `datasources:list_rdfslabel_count` and `datasources:list_rdfslabel_alpha_with_count`
1. `datasources:list_skospreflabel_alpha` and `datasources:list_skospreflabel_count` and `datasources:list_skospreflabel_alpha_with_count`
1. `datasources:list_foafname_alpha` and `datasources:list_foafname_count` and `datasources:list_foafname_alpha_with_count`
1. `datasources:list_dctermstitle_alpha` and `datasources:list_dctermstitle_count` and `datasources:list_dctermstitle_alpha_with_count`
1. `datasources:list_schemaname_alpha` and `datasources:list_schemaname_count` and `datasources:list_schemaname_alpha_with_count`


e.g.:

```
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
      ...
      "datasource": "datasources:list_rdfslabel_count"
    }
```

#### Preconfigured datasources for an AutocompleteProperty

Sparnatural comes preconfigured with datasources that can populate autocomplete fields based on `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` or the URI of the entity (which is the default behavior). For each of these properties, 3 flavors of datasource exist : either searching by the beginning of the value with `strstarts`, anywhere in the value with `contains` or using Virtuoso-specific `bif:contains` function. Additionnally, a search datasource can search on the URI using the `contains` function, which is the default behavior.

The preconfigured datasource identifiers for an AutocompleteProperty are :
1. `datasources:search_URI_contains`
1. `datasources:search_rdfslabel_strstarts`
1. `datasources:search_rdfslabel_contains`
1. `datasources:search_rdfslabel_bifcontains`
1. `datasources:search_foafname_strstarts`
1. `datasources:search_foafname_contains`
1. `datasources:search_foafname_bifcontains`
1. `datasources:search_dctermstitle_strstarts`
1. `datasources:search_dctermstitle_contains`
1. `datasources:search_dctermstitle_bifcontains`
1. `datasources:search_skospreflabel_strstarts`
1. `datasources:search_skospreflabel_contains`
1. `datasources:search_skospreflabel_bifcontains`
1. `datasources:search_schemaname_strstarts`
1. `datasources:search_schemaname_contains`
1. `datasources:search_schemaname_bifcontains`


e.g.:

```
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
      ...
      "datasource": "datasources:search_rdfslabel_strstarts"
    }
```


#### Reference to a preconfigured SPARQL query + a property

If the preconfigured datasources do not fit the data model to be queried, you have the ability to refer to the same SPARQL queries used by these datasources, but adjust the property to be searched or used as a label. To do so, the `datasource` key should hold:
1. a `queryTemplate` reference to one of the preconfigured SPARQL query template, namely:
  1. `datasources:query_list_label_alpha`
  1. `datasources:query_list_label_count`
  1. `datasources:query_list_label_alpha_with_count`
  1. `datasources:query_search_label_strstarts`
  1. `datasources:query_search_label_bifcontains`
1. a `labelProperty` or `labelPath` specifying either the full URI of the labelling property to use or a SPARQL property path (using angle brackets) to use.

e.g. to create a list widget based on `http://foo.bar/label` ordered by count :

```
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
      ...
      "datasource": {
        "queryTemplate" : "datasources:query_list_label_count",
        "labelProperty" : "http://foo.bar/label"
      } 
    }
```

#### Your own SPARQL query

You can provide your own SPARQL queries to populate lists or autocomplete suggestions. To do so, provide a `queryString` key to your `datasource` object, holding the SPARQL query that should be used to populate the list/autocomplete.

**The SPARQL query MUST return 2 variables : `?uri` and `?label`, populated anyway you like.**

In this SPARQL query, the following replacements will happen:
- `$domain`, if present, will be replaced by the URI of the domain class;
- `$range`, if present, will be replaced by the URI of the range class;
- `$property`, if present, will be replaced by the URI of the property;
- `$lang`, if present, will be replaced by the language Sparnatural is configured with;
- `$key`, if present, will be replaced by the searched key for autocomplete fields;

Take a look at the preconfigured SPARQL queries in the [Sparnatural datasources ontology](http://data.sparna.fr/ontologies/sparnatural-config-datasources) to get you started.


e.g. to create a list widget based on `http://foo.bar/label` and ordered by reverse-alphabetical :

```
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
      ...
      "datasource": {
        "queryString" : `
SELECT DISTINCT ?uri ?label
WHERE {
    ?domain a $domain .
    ?domain $property ?uri .
    ?uri <http://foo.bar/label> ?label .
    FILTER(lang(?label) = "" || lang(?label) = $lang)
}
ORDER BY DESC(?label)
`
      } 
    }
```

#### Reference to your own datasource

TODO / Advanced.

#### Specifying the SPARQL service of a datasource

By default, a SPARQL datasource will be executed against the SPARQL endpoint given in the `defaultEndpoint` property of [Sparnatural configuration](Javascript-integration).

It is however possible to indicate a different SPARQL endpoint to which the query should be sent, by using the `sparqlEndpointUrl` key on the datasource object.

This is not possible for preconfigured datasources that are always executed on the default endpoint.

e.g. to populate a list with `rdfs:label`s fetched from DBPedia:

```
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
      ...
      "datasource": {
        "queryTemplate" : "datasources:query_search_label_strstarts",
        "labelProperty" : "http://www.w3.org/2000/01/rdf-schema#label",
        "sparqlEndpointUrl" : "http://dbpedia.org/sparql"
      } 
    }
```

Cool, isn't it ?


### SPARQL String (equivalent property path)

When generating the SPARQL query, Sparnatural inserts the URI of the property given in the configuration, unless you specify a replacement `sparqlString` that will be inserted as is instead of the URI in the SPARQL query.

The replacement is done at the string level, there is no syntax checking of the generated query, so you need to make sure the provided replacement string does not violate the syntax.

A typical use-case for this is to provide inverse links to the user that are not explicit in the data graph, corresponding to an inverse property path in SPARQL, e.g. if the data contains `foaf:member` from Group to Person, but you want to show an inverse `memberOf` link to the user from Person to Group:

```
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo/onto#memberOf",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:ListProperty",
      "label": [
        {"@value" : "member of","@language" : "en"},
        {"@value" : "membre de","@language" : "fr"}
      ],
      "domain": "http://xmlns.com/foaf/0.1/Person",
      "range": "http://xmlns.com/foaf/0.1/Group",
      "datasource": "datasources:list_foafname_alpha",
      "sparqlString": "^<http://xmlns.com/foaf/0.1/member>"
    }
```

### Federated Queries
Sparnatural v.8 >= provides support for basic query federation.
In order to define a sparql endpoint, a sparql service has to be defined:
```
    {
      "@id":
        "http://data.mydomain.org/ontology/sparnatural-config#DBPediaService",
      "@type": "sd:Service",
      "endpoint": "https://dbpedia.org/sparql" ,
      "label": "DBPedia (english)"
    },
```
Such a service endpoint definition can then be referenced within an object property with the *sparqlService* property:
```
    {
      "@id":"http://twin-example/geneva#Location",
      "@type": "Class",
      "subClassOf": "http://www.w3.org/2000/01/rdf-schema#Literal",
      "sparqlService": "http://data.mydomain.org/ontology/sparnatural-config#DBPediaService",
      "label": [
        { "@value": "Location", "@language": "en" },
        { "@value": "Location", "@language": "fr" }
      ],
      "faIcon": "fas fa-map-marked-alt"
    },
```


### Literal properties

TODO

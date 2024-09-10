_[Home](../index.html) > Archives > JSON-based configuration_

# Sparnatural JSON configuration

**/!\ This is now deprecated. Please transition to SHACL configuration**

Sparnatural can be configured using a JSON(-LD) data structure. The data structure looks very much like [JSON-LD](https://www.w3.org/TR/json-ld/), but is really interpreted and parsed like a JSON, so stick with the JSON keys given below.

## Minimal JSON configuration

A minimal JSON configuration for Sparnatural looks like the following example. It declares 1 class `foaf:Person` and a single property `foaf:knows` that has `foaf:Person` as its domain and range (a Person can know another Person). The config is stored in a `config` javascript variable that will be passed as a parameter to init Sparnatural.
It's advised to Copy-paste the `@context` key given in the minimal example and do not modify it. Keep it like this for your own configuration.

<details>
<summary>Show minimal JSON</summary>
<pre lang="json">
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
    "Service": "http://www.w3.org/ns/sparql-service-description#Service"
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
</pre>
</details>


## Classes configuration


The configuration lists the types of entities that are searchable in Sparnatural. These types either map to real RDF resources, or are used to express search criterias on literal values.


<details>
<summary>Show example for a class</summary>
<pre lang="json">
{
    "@id" : "http://xmlns.com/foaf/0.1/Person",
    "@type" : "Class",
    "label": [
      {"@value" : "Person","@language" : "en"},
      {"@value" : "Personne","@language" : "fr"}
    ],
    "faIcon":  "fas fa-user"
}
</pre>
</details>


|  Key  | Description | Mandatory/Optional |
| ----- | ----------- | ------------------ |
|  `@id`  | This is the URI of the class/type. It is either the URI of a class in the data graph to be queried, or a custom URI that is mapped to one or more other classes in the underlying data graph (using `sparqlString` key, see below) | Mandatory |
|  `@type`  | The type for a class is always set to `"@type": "Class"` | Mandatory |
|  `label`  | A class needs to be associated to labels, at least one, in the language you expect it to be displayed; each label must be associated to a language code | Mandatory |
|  `icon/faIcon` | One of the cool thing of Sparnatural is the ability to associate an icon to each class displayed. Icon is optional and if not provided, a blank placeholder is used instead. You can provide an icon either using an image or using a [FontAwesome](https://fontawesome.com/) icon code, which is highly recommended. Simply use the key "faIcon" and provide the code of the FA icon to be used, like `fas fa-user` for a user, or `fas fa-building` for a building. This requires that you integrate FontAwesome in the page where Sparnatural will be inserted| Optional |
|  `sparqlString`  | When generating the SPARQL query, Sparnatural inserts the URI (`@id`) of the property given in the configuration, unless you specify a replacement `sparqlString` that will be inserted instead of the URI in the SPARQL query. You need to make sure the provided replacement string does not violate SPARQL syntax. Typical values you can use are:<br>1. Mapping to a single class URI, giving the class URI between angle brackets: `"sparqlString" : "<http://xmlns.com/foaf/0.1/Person>"`<br> 2. Mapping to a class with an extra criteria separated by a semicolon: `"sparqlString" : "<http://www.w3.org/2004/02/skos/core#Concept>; <http://www.w3.org/2004/02/skos/core#inScheme> <http://mysite.com/vocabulary/TypesOfArtwork>"`| Optional |
`order` | Order of this class in classes lists. If not set, alphabetical order is used. | Optional |
`tooltip` | Text that appears as tooltip when hovering this class, in lists and when selected. Multiple values are allowed in different languages. HTML markup is supported. | Optional|
`defaultLabelProperty` | Use this annotation to relate a class in a Sparnatural configuration to a property that will be used as the default to fetch the labels of instances of this class. When a user selects this class as a column in the result set, if the class has this annotation set, everything behaves as if the user had selected also the corresponding property to be included. The label property may have no domain specified if you don't want it to be proposed to the user. The property must have a range specified to a single class. | Optional |

## Object properties 

Each property represents a possible connection between one or more classes declared in the configuration.

<details>
<summary>Show example for an object property </summary>

<pre lang="json">
 {
      "@id" : "http://xmlns.com/foaf/0.1/knows",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:ListProperty",
      "label": [
        {"@value" : "does not know","@language" : "en"},
        {"@value" : "ne connaît pas","@language" : "fr"}
      ],
      "domain": "http://xmlns.com/foaf/0.1/Person",
      "range": {
        "@type" : "Class",
        "unionOf" : {
          "@list" : [ 
            { "@id" : "http://dbpedia.org/ontology/Museum"},
            { "@id" : "http://dbpedia.org/ontology/Person"},
            { "@id" : "http://dbpedia.org/ontology/Artwork"}
          ]
        }
      },
      "sparqlString" : "^<http://xmlns.com/foaf/0.1/knows>",
      "tooltip": [
        {
          "@value": "If a person knows the other person.",
          "@language": "en",
        },
        {
          "@value": "Si une personne connaît l'autre personne.",
          "@language": "fr",
        },
      ],
      "datasource": {
        "datasources:list_foafname_alpha",
        "sparqlEndpointUrl" : "http://dbpedia.org/sparql"
      }
  }
</pre>
</details>

|  Key  | Description | Mandatory/Optional |
| ----- | ----------- | ------------------ |
|  `@id`  | This value will be inserted inside the SPARQL query if no `"sparqlString":` property is defined   | Mandatory |
|  `@type`  | The type for a object property is always set to `"@type": "ObjectProperty"` | Mandatory |
|  `subPropertyOf`  |The key `subPropertyOf` for object properties defines the value selection for the range. It defines which widget should be used or if the value is a literal. More information in the [subPropertyOf table](#subPropertyOf-table)| Mandatory |
|  `label`  | Just like classes, properties need to have labels, at least one, always associated to a language code. | Mandatory |
|  `domain & range`  | Connects classes with each other. Can be specified with single value or `unionOf`. Example above shows single value for domain and `unionOf` for the range.   | Mandatory |
|  `sparqlString`  |  Similarly to classes, the URI ( `@id` ) of the property is inserted in the SPARQL query, unless you specify a replacement string (typically a property path) using `sparqlString`. A typical use-case for this is to provide inverse links to the user that are not explicit in the data graph.| Optional |
|  `datasource`  |  Some widgets such as `sparnatural:AutocompleteProperty` or `sparnatural:ListProperty` require a datasource. This datasource is actually SPARQL query which returns the necessary information needed by the widget. This can be achieved in many different ways and is thoroughly explained [here](OWL-based-configuration-datasources) | Optional |
| `enableNegation` |  Enables the additional option to express a negation (using a `FILTER NOT EXISTS`) on this property. The `FILTER NOT EXISTS` will apply to the whole "branch" in the query (this criteria and all children criterias) | Optional 
| `enableOptional` |  Enables the additional option to express an `OPTIONAL` on this property. The `OPTIONAL` will apply to the whole "branch" in the query (this criteria and all children criterias) | Optional
| `order` |  Order of this property in property lists. If not set, alphabetical order is used. | Optional
| `tooltip` | Text that appears as tooltip when hovering this property, in lists and when selected. Multiple values are allowed in different languages. HTML markup is supported. | Optional
| `isMultilingual` | If set to `true` used to indicate that the values of the property are multilingual. A FILTER ( `FILTER((LANG(?Tree_1_label)) = "en")` )will automatically be added based on the language parameter when intiatilizing Sparnatural.  | Optional
| `sparqlService` | This annotation allows to specify a remote endpoint for federated queries. The [`federated queries`](https://www.w3.org/TR/sparql11-federated-query/) works with the SERVICE keyword. This annotation must specify a [sd:Service](#annotation-for-service-keyword) endpoint. For example: <pre> { <br>&emsp; "@id":"http://data.mydomain.org/ontology/sparnatural-config#DBPediaService",<br>&emsp; "@type":"sd:Service",<br> &emsp;"endpoint": "https://dbpedia.org/sparql"<br>}</pre> | Optional

### subPropertyOf table

This table shows possible values for the subPropertyOf of [object properties](#object-properties) (not classes!)

|  Value  | Description |
| -----   | ----------- |
|  rdfs:Literal  | For classes that correspond either to a Literal (typically a date), either to a search, set the class as subclass of rdfs:Literal. <br>1. No rdf:type criteria corresponding to this class will be put in SPARQL queries. <br> 2. The class will never appear in the initial class list <br>3. it will not be possible to traverse this class with WHERE clauses |
|  core:NotInstantiatedClass  | For classes that are references to "external" URIs that are not themselves described in the graph (i.e. they are not the subject of any triples in the graph, in particular no rdf:type), set the class as subclass of core:NotInstantiatedClass. <br>1. No rdf:type criteria corresponding to this class will be put in SPARQL queries <br>2. The class will never appear in the initial class list but can still be used to be traversed in WHERE clause |
|  sparnatural:ListProperty  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/10-list.png" width="150" height="90">  |
|  sparnatural:AutocompleteProperty  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/9-autocomplete.png" width="150" height="90"> |
|  sparnatural:TreeProperty  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/17-tree.png" width="150" height="100"> |
|  sparnatural:TimeProperty-Date  |<img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/14-chronocultural-period.png" width="150" height="90"> |
|  sparnatural:MapProperty  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/18-map.png" width="150" height="100">  |
|  sparnatural:TimeProperty-Year  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/12-time-date.png" width="140" height="100"> |
|  sparnatural:SearchProperty  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/11-search.png" width="150" height="90"> |
|  sparnatural:NonSelectableProperty  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/13-no-value.png" width="150" height="90"> |
|  sparnatural:BooleanProperty  | <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/15-boolean.png" width="150" height="70"> |


_[Home](index.html) > Integration with GraphDB Lucene connector_

# Integration with GraphDB Lucene Connector

## Introduction

GraphDB provides an integration with Lucene using the [GraphDB Lucene Connector](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html). This connector allows to create powerful full-text indexes of text properties in the graph, and write queries that combine both full-text and graph criteria, such as _"Give me the list of museums that display an artwork whose title contains word 'peace'"_

Sparnatural can be integrated with such a GraphDB Lucene index both to feed autocomplete fields and also for SPARQL query generation as described below.

## Create the index

Refer to the [GraphDB Lucene Connector documentation](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html) for complete details. Here is the idea:

1. Determine the URI of the class for which you want to build the index;
2. List each literal property or path to store in the index;
    - Typically labels, names, titles, definitions, abstract, etc. 
    - but also the literal of _related entities_ in the graph, such as the name of the place where an event took place, the name of the author of a work, the labels of subject concepts, etc.
    - Each of these properties or path will go in a separate field in the index;
3. Create a "catchAll" field named `text` that will concatenate every other field in a single one;
4. Set a custom _language_ and _Analyzer_ if you need to have language-related indexing such as accent-folding in French;

## Example: create an index on SKOS Concepts in French

### Create individual fields

1. In GraphDB Workbench go to "Setup > Connectors", and create a new Lucene Connector;
2. Set its name to `ConceptIndex`
3. In field languages enter `fr`
3. In the "Types" field enter the full URI to index all SKOS Concepts : http://www.w3.org/2004/02/skos/core#Concept
4. Fill in the "Fields" entry to index `skos:prefLabel`s :
    - Field name = prefLabel
    - Property chain = http://www.w3.org/2004/02/skos/core#prefLabel
    - Uncheck the "facet" checkbox

![](https://github.com/sparna-git/Sparnatural/raw/master/documentation/graphdb-lucene-01.png)

5. Add a new "Field" entry by clicking on the "+" on the right, this time for `skos:altLabel`s :
    - Field name = altLabel
    - Property chain = http://www.w3.org/2004/02/skos/core#altLabel
    - Uncheck the "facet" checkbox
6. Repeat for `skos:hiddenLabel` if needed
7. `skos:definition` if needed
8. `skos:scopeNote` if needed
9. `skos:example` if needed

### Create catch-all field

Then we need to create a new field `text` that will aggregate the content of every other fields. To do that declare a new "virtual field" named `text/prefLabel` to indicate that the content or field `prefLabel` should be copied in field `text` (refer to the parts about [copy-fields](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html#copy-fields) combined with [multiple property paths](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html#multiple-property-chains-per-field) per fields for details):
1. Create new Field named `text/prefLabel`
2. In property path, enter `@prefLabel`; this must correspond to the name of one of the fields created earlier, so if you chose different names, adjust accordingly;
3. Uncheck "facet"
4. Repeat by adding a new Field again, named `text/altLabel` and property path `@altLabel`
5. Repeat with `text/hiddenLabel` and property path `@hiddenLabel`
6. Repeat with `text/definition` and property path `@definition`
7. Repeat with `text/scopeNote` and property path `@scopeNote`
8. Repeat with `text/example` and property path `@example`

Here is how this part looks like:

![](https://github.com/sparna-git/Sparnatural/raw/master/documentation/graphdb-lucene-02.png)

### Set language and Analyzer

- In the `Languages` field, set the value `fr`
- In the `Analyzer` field enter the value for the Lucene French Analyzer `org.apache.lucene.analysis.fr.FrenchAnalyzer`. If you don't do that the search will be accent-sensitive (e.g. a search on "metal" will not match "métal");

### Test a SPARQL query

Test a SPARQL search like the following :

```
PREFIX : <http://www.ontotext.com/connectors/lucene#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri ?label ?snippetField ?snippet WHERE  {
    # replace "ConceptIndex" with the name of the index at the end of this URI
    ?search a <http://www.ontotext.com/connectors/lucene/instance#ConceptIndex> .
    # replace with a string to search. Also try with different fields, e.g. "altLabel:foo" or "text:foo" or with no field at all e.g. "foo"
    ?search :query "prefLabel:foo" .
    ?search :entities ?uri .
    ?uri :snippets _:s .
    _:s :snippetField ?snippetField ;
        :snippetText ?snippet .
    ?uri skos:prefLabel ?prefLabel . FILTER(lang(?prefLabel) = $lang)
```

## Feeding an autocomplete field in Sparnatural with SPARQL using GraphDB Lucene Connector

The principle is the following:
1. As stated in the [Sparnatural configuration documentation for your own queries](https://github.com/sparna-git/Sparnatural/wiki/JSON-based-configuration#your-own-sparql-query), the SPARQL query MUST return 2 variables : `?uri` and `?label`;
2. Set a custom SPARQL query string to the autocomplete field definition, using special `:query` operators to query the index;
3. Add a "*" after the search key to search for the beginning of words;
4. Query the catch-all field, so `text` in our case;
5. Generate a `label` variable by concatenating the skos:prefLabel predicate of the entity with its snippet from the search results

Here is an example query:

```
PREFIX : <http://www.ontotext.com/connectors/lucene#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri ?label WHERE  {
    # replace "ConceptIndex" with the name of the index at the end of this URI
    ?search a <http://www.ontotext.com/connectors/lucene/instance#ConceptIndex> .
    # Replace 'foo' with a test query, but keep the final "*" character
    ?search :query "text:foo*" .
    ?search :entities ?uri .
    ?uri :snippets _:s .
    _:s :snippetField ?snippetField ;
        :snippetText ?snippet .
    # get the skos:prefLabel predicate of the concept in the proper language
    ?uri skos:prefLabel ?prefLabel . FILTER(lang(?prefLabel) = "fr")
    # generate a "label" to display in autocomplete result, by concatenating skos:prefLabel, line break, and snippet in small font
    BIND(CONCAT(STR(?prefLabel), '<br /><small>', ?snippet ,'</small>') AS ?label)
}
```

And here is a query integrated in a [JSON-LD configuration of Sparnatural](JSON-based configuration). Note how it uses the placeholders `$domain`, `$range`, `$property`, `$key` and `$lang` that gets replaced at query time with actual values:

```json
    {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto#type-decouverte",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:AutocompleteProperty",
      "label": [
        {"@value" : "discovery type","@language" : "en"},
        {"@value" : "type de découverte","@language" : "fr"}
      ],
      "domain": "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto#Site",
      "range": "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto#Concept",
      "sparqlString": "<http://www.cidoc-crm.org/cidoc-crm/P2_has_type>",
      "datasource": { 
        "queryString": "\
PREFIX : <http://www.ontotext.com/connectors/lucene#>\
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\
SELECT DISTINCT ?uri ?label WHERE  {\
    ?something a $domain .\
    ?something $property ?uri .\
    ?search a <http://www.ontotext.com/connectors/lucene/instance#ConceptIndex> .\
    ?search :query \"text:$key*\" .\
    ?search :entities ?uri .\
    ?uri :snippets _:s .\
    _:s :snippetField ?snippetField ;\
        :snippetText ?snippet .\
    ?uri skos:prefLabel ?prefLabel . FILTER(lang(?prefLabel) = $lang)\
    BIND(CONCAT(STR(?prefLabel), '<br /><small>', ?snippet ,'</small>') AS ?label)\
}"
      }
```

## Integration with SPARQL query generation

You can configure Sparnatural to generate SPARQL queries that will query the full-text index. To do so:
1. Create a class in Sparnatural configuration **with the URI of index**, e.g. `http://www.ontotext.com/connectors/lucene/instance#ConceptIndex`. Create this class as a `subClassOf http://www.w3.org/2000/01/rdf-schema#Literal`, and give it a label like "Full-text Search...";
2. Create properties that correspond to the **fields in the index**. The property URIs **must end with the index field name, after the last "#" or last "/"**. e.g. `http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto/search#discovery` will query the field `discovery`
3. Set the property as `subPropertyOf sparnatural:GraphDBSearchProperty`; this parameter indicates to Sparnatural that the query to generate must use the GraphDB syntax and not the usual FILTER syntax;
4. Create multiple properties for each index field, so that the user can choose which field to query.

Here is an example configuration with 2 properties configured to query fields `commune` and `discovery`, and a third property named "all fields" / "tous les champs" to query the catch-all field:
```
    {
      "@id" : "http://www.ontotext.com/connectors/lucene/instance#SiteIndex",
      "@type" : "Class",
      "subClassOf" : "http://www.w3.org/2000/01/rdf-schema#Literal",
      "label": [
        {"@value" : "Full-text search...","@language" : "en"},
        {"@value" : "Recherche plein-texte...","@language" : "fr"}
      ],
      "faIcon":  "fad fa-search"
    },
...
     {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto/search#commune",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:GraphDBSearchProperty",
      "label": [
        {"@value" : "city","@language" : "en"},
        {"@value" : "commune","@language" : "fr"}
      ],
      "domain": "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto#Site",
      "range": "http://www.ontotext.com/connectors/lucene/instance#SiteIndex"
    },
     {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto/search#discovery",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:GraphDBSearchProperty",
      "label": [
        {"@value" : "discovery","@language" : "en"},
        {"@value" : "type de découverte","@language" : "fr"}
      ],
      "domain": "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto#Site",
      "range": "http://www.ontotext.com/connectors/lucene/instance#SiteIndex"
    },
     {
      "@id" : "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto/search#text",
      "@type" : "ObjectProperty",
      "subPropertyOf" : "sparnatural:GraphDBSearchProperty",
      "label": [
        {"@value" : "any field","@language" : "en"},
        {"@value" : "tous les champs","@language" : "fr"}
      ],
      "domain": "http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto#Site",
      "range": "http://www.ontotext.com/connectors/lucene/instance#SiteIndex"
    },
```

Which will give the following end-user behavior:

![](https://github.com/sparna-git/Sparnatural/raw/master/documentation/graphdb-lucene-03.png)
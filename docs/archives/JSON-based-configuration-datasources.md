_[Home](index.html) > Archives > Configure datasource on object properties_

# Configure datasources on object properties

**/!\ This is now deprecated. Please transition to SHACL configuration**

This is an extension chapter for the property `datasource` shown in [Object properties](./JSON-based-configuration.md#object-properties). Some widgets such as `sparnatural:AutocompleteProperty` and `sparnatural:ListProperty ` require a `datasource` key to populate respectively the list of values or the values proposed by autocompletion. Creating a datasource for a widget can be achieved in 4 ways:

<table>
      <thead>
            <th> Nr </th> <th> Method </th> <th> JSON example </th>
      </thead>

<tr>
<td> 1. </td>
<td>
<a href="#a-reference-to-a-preconfigured-datasource">A reference to a preconfigured datasource</a>
</td>
<td>
<pre lang="json">
"datasource": "datasources:list_rdfslabel_alpha"
</pre>
</td>
</tr>
      
<tr>
<td> 2. </td>
<td>
<a href="#reference-to-a-preconfigured-sparql-query--a-uri-to-be-injected">Reference to a preconfigured SPARQL query + a URI to be injected</a>
</td>
<td>
<pre lang="json">
"datasource": {
      "queryTemplate":"query_list_label_count",
      "labelProperty":"http://foo.bar/label"
}
</pre>
</td>
</tr>


<tr>
<td> 3. </td>
<td>
<a href="#your-own-sparql-query">Your own SPARQL query</a>
</td>
<td>
<pre lang="json">
"datasource": {
      "queryString":"SELECT ?uri ?label WHERE { here your own query }"
}
</pre>
</td>
</tr>

<tr>
<td> 4. </td>
<td>
Callback method provided in the JavaScript code
</td>
<td>
<a href="./Javascript-integration.md#advanced--customizing-lists-and-autocomplete">see Advanced : customizing lists and autocomplete</a>
</td>
</tr>
      
      
</table>


## A reference to a preconfigured datasource
JSON:

```json
{
      "@id" : "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
      ...
      "datasource": "datasources:list_rdfslabel_alpha" 
    }
```

Sparnatural comes preconfigured with datasources that can populate lists based on `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` or the URI of the entity (which is the default behavior). For each of these properties, 3 flavors of datasource exist : either with an alphabetical ordering, an alphabetical ordering plus the count shown in parenthesis, or a descending count ordering.

|  queryTemplate  | property path | widget |
| --------------- | ------------- | ------ |
| `datasources:list_URI_alpha` | none | `sparnatural:ListProperty` |
| `datasources:list_URI_count` |  none | `sparnatural:ListProperty` |
| `datasources:list_rdfslabel_alpha` |`rdfs:label`  | `sparnatural:ListProperty` |
| `datasources:list_rdfslabel_count` | `rdfs:label` | `sparnatural:ListProperty` |
| `datasources:list_skospreflabel_alpha` | `skos:prefLabel` | `sparnatural:ListProperty` |
| `datasources:list_skospreflabel_count` | `skos:prefLabel` | `sparnatural:ListProperty` |
| `datasources:list_skospreflabel_alpha_with_count` | `skos:prefLabel` | `sparnatural:ListProperty` |
| `datasources:list_dctermstitle_alpha` | `dcterms:title` | `sparnatural:ListProperty` |
| `datasources:list_dctermstitle_count` | `dcterms:title` | `sparnatural:ListProperty` |
| `datasources:list_dctermstitle_alpha_with_count` | `dcterms:title` | `sparnatural:ListProperty` |
| `datasources:list_schemaname_alpha` | `schema:name` | `sparnatural:ListProperty` |
| `datasources:list_schemaname_count` | `schema:name` | `sparnatural:ListProperty` |
| `datasources:list_schemaname_alpha_with_count` | `schema:name` | `sparnatural:ListProperty` |
| `datasources:search_URI_contains` |  none | `sparnatural:AutocompleteProperty` |
| `datasources:search_rdfslabel_strstarts` | `rdfs:label` | `sparnatural:AutocompleteProperty` |
| `datasources:search_rdfslabel_contains` | `rdfs:label` | `sparnatural:AutocompleteProperty` |
| `datasources:search_rdfslabel_bifcontains` | `rdfs:label` | `sparnatural:AutocompleteProperty` |
| `datasources:search_foafname_strstarts` | `foaf:name` | `sparnatural:AutocompleteProperty` |
| `datasources:search_foafname_contains` | `foaf:name` | `sparnatural:AutocompleteProperty` |
| `datasources:search_foafname_bifcontains` | `foaf:name` | `sparnatural:AutocompleteProperty` |
| `datasources:search_dctermstitle_strstarts` | `dcterms:title` | `sparnatural:AutocompleteProperty` |
| `datasources:search_dctermstitle_contains` | `dcterms:title` | `sparnatural:AutocompleteProperty` |
| `datasources:search_dctermstitle_bifcontains` | `dcterms:title` | `sparnatural:AutocompleteProperty` |
| `datasources:search_skospreflabel_strstarts` | `skos:prefLabel` | `sparnatural:AutocompleteProperty` |
| `datasources:search_skospreflabel_contains` | `skos:prefLabel` | `sparnatural:AutocompleteProperty` |
| `datasources:search_skospreflabel_bifcontains` | `skos:prefLabel` | `sparnatural:AutocompleteProperty` |
| `datasources:search_schemaname_strstarts` | `schema:name` | `sparnatural:AutocompleteProperty` |
| `datasources:search_schemaname_contains` | `schema:name` | `sparnatural:AutocompleteProperty` |
| `datasources:search_schemaname_bifcontains` | `schema:name` | `sparnatural:AutocompleteProperty` |


The queryTemplate can be viewed [here](/src/sparnatural/ontologies/SparnaturalConfigDatasources.js). For a `datasources:list_rdfslabel_alpha_with_count` it looks like the following:
```
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label)
WHERE {
{
  SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
  WHERE {
    ?domain a $domain .
    ?domain $property ?uri .
    FILTER(isIRI(?uri))
  }
  GROUP BY ?uri
}
?uri $labelPath ?theLabel .
FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
}
ORDER BY UCASE(?label)
LIMIT 500
```
Given: The selection is on domain `<http://dbpedia.org/ontology/Museum>` and we have chosen `datasources:list_rdfslabel_alpha_with_count` then this query will be transformed to the following (note: The inserted rdfs:label for the regex `$labelPath`):

```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label)
WHERE {
{
  SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
  WHERE {
    ?domain a <http://dbpedia.org/ontology/Museum> .
    ?domain <http://dbpedia.org/ontology/country> ?uri .
    FILTER(isIRI(?uri))
  }
  GROUP BY ?uri
}
?uri <http://www.w3.org/2000/01/rdf-schema#label> ?theLabel .
FILTER(lang(?theLabel) = "" || lang(?theLabel) = 'fr')
}
ORDER BY UCASE(?label)
LIMIT 500
```

### Preconfigured datasources for a TreeProperty

Sparnatural comes preconfigured with datasources that can populate a tree selector with the roots and the children of each node.

### Preconfigured datasources for the roots of a TreeProperty

These datasources are to be used with a [`treeRootsDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeRootsDatasource) on a [`TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

The preconfigured datasource identifiers for roots datasource on a TreeProperty are :

1. [`datasources:tree_root_skostopconcept`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept) : reads the roots of a SKOS ConceptScheme using `skos:hasTopConcept` or `^skos:topConceptOf`, assuming the URI of the Sparnatural class is equal to the URI of the ConceptScheme
1. [`datasources:tree_root_skostopconcept_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept_with_count) : same as previous, but returns the number of occurences of each node in parenthesis

### Preconfigured datasources for the children of a TreeProperty

These datasources are to be used with a [`treeChildrenDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeChildrenDatasource) on a [`TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

The preconfigured datasource identifiers for children datasource on a TreeProperty are :

1. [`datasources:tree_children_skosnarrower`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower) : reads the children of a node using `skos:narrower` or `^skos:broader`
1. [`datasources:tree_children_skosnarrower_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower_with_count) : same as previous, but returns the number of occurences of each node in parenthesis


## Reference to a preconfigured SPARQL query + a URI to be injected

If the preconfigured datasources do not fit the data model to be queried, you have the ability to refer to the same SPARQL queries used by these datasources, but adjust the property to be searched or used as a label. To do so, the `datasource` key should hold:
1. a `queryTemplate` reference to one of the preconfigured SPARQL query template from table [A reference to a preconfigured datasource](#a-reference-to-a-preconfigured-datasource)
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

## Your own SPARQL query

You can provide your own SPARQL queries to populate lists or autocomplete suggestions. To do so, provide a `queryString` key to your `datasource` object, holding the SPARQL query that should be used to populate the list/autocomplete.

**The SPARQL query MUST return 2 variables : `?uri` and `?label`, populated anyway you like.**

In this SPARQL query, the following replacements will happen:
- `$domain`, if present, will be replaced by the URI of the domain class;
- `$range`, if present, will be replaced by the URI of the range class;
- `$property`, if present, will be replaced by the URI of the property;
- `$lang`, if present, will be replaced by the language Sparnatural is configured with;
- `$type`, if present, will be replace by the `typePredicate` config parameter of Sparnatural; this is useful if you query wikibase endpoints where the type rpedicate is something else than rdf:type;
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

## Specifying the SPARQL service of a datasource

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

_[Home](index.html) > Datasources_

# Datasources

## Datasources basics

Lists and autocomplete properties in Sparnatural can be associated to a [`ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) annotation to populate respectively the list of values or the values proposed by autocompletion. In its simplest and most common form a datasource is a SPARQL query that returns the expected columns to be used to populate the list/autocomplete values.

The datasource annotation configuration can be either:

1. A reference to a pre-configured datasource;
1. A reference to a pre-configured SPARQL query, plus a property URI to be injected in this query;
1. Your own SPARQL query;

These 3 solutions are described below.

## Preconfigured datasources

### Preconfigured datasources for a ListProperty


Sparnatural comes preconfigured with datasources that can populate lists based on `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` or the URI of the entity (which is the default behavior). For each of these properties, 3 flavors of datasource exist : either with an alphabetical ordering, an alphabetical ordering plus the count shown in parenthesis, or a descending count ordering.

Use one of these datasources if your RDF data relies on one of these properties.

The preconfigured datasource identifiers for a ListProperty are :

1. [`datasources:list_URI_or_literal_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha) and [`datasources:list_URI_or_literal_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha_with_count) and [`datasources:list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_count)
1. [`datasources:list_URI_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_alpha) and [`datasources:list_URI_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_count)
1. [`datasources:list_rdfslabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha) and [`datasources:list_rdfslabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_count) and [`datasources:list_rdfslabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha_with_count)
1. [`datasources:list_skospreflabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha) and [`datasources:list_skospreflabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_count) and [`datasources:list_skospreflabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha_with_count)
1. [`datasources:list_foafname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha) and [`datasources:list_foafname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_count) and [`datasources:list_foafname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha_with_count)
1. [`datasources:list_dctermstitle_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha) and [`datasources:list_dctermstitle_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_count) and [`datasources:list_dctermstitle_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha_with_count)
1. [`datasources:list_schemaname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha) and [`datasources:list_schemaname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_count) and [`datasources:list_schemaname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha_with_count)

You can find these identifiers in Protégé when you create the `ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) annotation under the tabs "Entity IRI", then "Individuals" :

![Screenshot Protégé datasources](/assets/images/protege-screenshot-datasources-1.png)

### Preconfigured datasources for an AutocompleteProperty

Sparnatural comes preconfigured with datasources that can populate autocomplete fields based on `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` or the URI of the entity (which is the default behavior). For each of these properties, 3 flavors of datasource exist : either searching by the beginning of the value with `strstarts()`, anywhere in the value with `contains()` or using Virtuoso-specific `bif:contains()` function. Additionnally, a search datasource can search on the URI using the `contains()` function, which is the default behavior.

The preconfigured datasource identifiers for an AutocompleteProperty are :
1. [`datasources:search_URI_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_URI_contains)
1. [`datasources:search_rdfslabel_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_rdfslabel_strstarts)
1. [`datasources:search_rdfslabel_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_rdfslabel_contains)
1. [`datasources:search_rdfslabel_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_rdfslabel_bifcontains)
1. [`datasources:search_foafname_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_foafname_strstarts)
1. [`datasources:search_foafname_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_foafname_contains)
1. [`datasources:search_foafname_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_foafname_bifcontains)
1. [`datasources:search_dctermstitle_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_dctermstitle_strstarts)
1. [`datasources:search_dctermstitle_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_dctermstitle_contains)
1. [`datasources:search_dctermstitle_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_dctermstitle_bifcontains)
1. [`datasources:search_skospreflabel_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_skospreflabel_strstarts)
1. [`datasources:search_skospreflabel_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_skospreflabel_contains)
1. [`datasources:search_skospreflabel_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_skospreflabel_bifcontains)
1. [`datasources:search_schemaname_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_schemaname_strstarts)
1. [`datasources:search_schemaname_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_schemaname_contains)
1. [`datasources:search_schemaname_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_schemaname_bifcontains)

Similarly to list datasources, you find these under the "Entity IRI" > "Individuals" tab of Protégé when you edit the `ds:datasource` annotation :

![Screenshot Protégé datasources](/assets//images/protege-screenshot-datasources-2.png)

### Preconfigured datasources for a TreeProperty

Sparnatural comes preconfigured with datasources that can populate a tree selector with the roots and the children of each node.

#### Preconfigured datasources for the roots of a TreeProperty

These datasources are to be used with a [`treeRootsDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeRootsDatasource) on a [`TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

The preconfigured datasource identifiers for roots datasource on a TreeProperty are :

1. [`datasources:tree_root_skostopconcept`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept) : reads the roots of a SKOS ConceptScheme using `skos:hasTopConcept` or `^skos:topConceptOf`, assuming the URI of the Sparnatural class is equal to the URI of the ConceptScheme
1. [`datasources:tree_root_skostopconcept_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept_with_count) : same as previous, but returns the number of occurences of each node in parenthesis

#### Preconfigured datasources for the children of a TreeProperty

These datasources are to be used with a [`treeChildrenDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeChildrenDatasource) on a [`TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

The preconfigured datasource identifiers for children datasource on a TreeProperty are :

1. [`datasources:tree_children_skosnarrower`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower) : reads the children of a node using `skos:narrower` or `^skos:broader`
1. [`datasources:tree_children_skosnarrower_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower_with_count) : same as previous, but returns the number of occurences of each node in parenthesis

## Preconfigured SPARQL query with another property

### How-to create your own datasource with an existing SPARQL query but using another property

If the preconfigured datasources do not fit the data model to be queried, you have the ability to refer to the same SPARQL queries used by these datasources, but adjust the property to be searched or used as a label. To do so, you need to create a new individual in Protégé, of type `SparqlDatasource`, and provide 2 information:


1. in the "Object property assertion" field of Protégé, a `queryTemplate` reference to one of the preconfigured SPARQL query template, namely:
   1. [`datasources:query_list_label_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha)
   1. [`datasources:query_list_label_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_count)
   1. [`datasources:query_list_label_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha_with_count)
   1. [`datasources:query_list_label_with_range_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha)
   1. [`datasources:query_list_label_with_range_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_count)
   1. [`datasources:query_list_label_with_range_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha_with_count)
   1. [`datasources:query_search_label_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_strstarts)
   1. [`datasources:query_search_label_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_bifcontains)
1. And one of those 2 Annotations (in the "Annotations" section of Protégé):
   1. [`datasources:labelProperty`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelProperty) with the IRI of the label property to use
   1. [`datasources:labelPath`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelPath) with the SPARQL property path to use (using angle brackets, no prefixes) to fetch the label of entities. In particular this allows to deal with situations where the labels are reified as separate entities.

For example to create a new custom datasource that will use `dc:title` as the label, and use an alphabetical ordering, do the following:

![Screencast Protégé custom datasource](/assets//images/screencast-protege-custom-datasource-1.gif)

### Queries without range / queries with range

The provided queries to populate the lists do **not** use the range of the value as a criteria in the query. In other words, all the values of the given property in the given domain are returned, independantly of their type.
This is usually sufficient and more performant but this can be a problem if the same property in the same domain can refer to entities of different type in the Sparnatural configuration. For example "Document > creator > Person or Organization".
To use the range as a criteria in the query and filter the list based on the type of the value, create a datasource based on a query including "..._with_range_..." in its identifier. This will garantee that only values of the selected type will appear in the list.


## Your own SPARQL query (lists / autocomplete)

You can provide your own SPARQL queries to populate lists or autocomplete suggestions. To do so, attach a `queryString` data property assertion on your datasource object, holding the SPARQL query that should be used to populate the list/autocomplete.

**The SPARQL query MUST return 2 variables : `?uri` and `?label`, populated anyway you like.** Additionnally, the query can return, optionnally:
- an extra `?group` variable, which will be used to generate `optgroup` sections in lists widgets, and will be used as hover tooltips in autocompletion lists. This is used to indicate the source endpoint of the result in cases of multiple endpoints.
- an extra `?itemLabel` variable, which will be used, if present, as the label of the selected value; for exemple, `?label` can hold a count, like _"Italy (307)"_, while `?itemLabel` can be just _"Italy"_.

In this SPARQL query, the following replacements will happen:
- **`$domain`**, if present, will be replaced by the URI of the domain class;
- **`$range`**, if present, will be replaced by the URI of the range class;
- **`$property`**, if present, will be replaced by the URI of the property;
- **`$lang`**, if present, will be replaced by the `lang` parameter of Sparnatural;
- **`$defaultLang`**, if present, will be replaced by the `defaultLang` parameter of Sparnatural;
- **`$type`**, if present, will be replaced by the `typePredicate` parameter value of Sparnatural config (useful if you query a wikibase endpoint where the type predicate is something else than rdf:type);
- **`$key`**, if present, will be replaced by the searched key (only useful for autocomplete fields);

Take a look at the preconfigured SPARQL queries in the [Sparnatural datasources ontology](http://data.sparna.fr/ontologies/sparnatural-config-datasources) to get you started.

Here is an example of such a query: (note the use of the placeholder variables that will be replaced with the corresponding values):

```sparql
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) (STR(?theLabel) AS ?itemLabel)
WHERE { 
  { 
    SELECT DISTINCT ?uri (COUNT(?domain) AS ?count) 
    WHERE {
      ?domain a $domain .
      ?domain $property ?uri .
      FILTER(isIRI(?uri))
      # Note how the range criteria is not used in this query 
    }
    GROUP BY ?uri
   }
   ?uri $labelPath ?theLabel .
   FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang) 
}
ORDER BY UCASE(?label)
LIMIT 500
```

## Your own SPARQL query (tree)

You can provide your own SPARQL queries to populate a tree widget. To do so, you need 2 datasources : one that will populate the roots of the tree (entries at first level), and one that will be used to populate the children of a tree, when clicked (see the [annotations for a SelectResourceProperty](https://docs.sparnatural.eu/OWL-based-configuration#annotations-for-a-selectresourceproperty) for more information).

**The SPARQL query MUST return 2 variables : `?uri` and `?label`, populated anyway you like.**
The SPARQL query CAN return 2 other variables :

  - **`?hasChildren`**, a boolean to indicate if the node has children. If not present, all tree items can be unfolded, even when have no children; if present and set to false, an item cannot be unfolded. 
  - **`?count`** to indicate the number of times a node is used as a value; nodes with a count = 0 will be disabled and cannot be selected as a value.

In these SPARQL query, the same replacement of the **`$domain`**, **`$range`**, **`$property`** and **`$lang`** than in the queries for list/autocomplete will happen (see above). The following additional replacements will happen:
- **`$node`**, if present, will be replaced by the URI of the node being clicked;

A typical query that populates the `?hasChildren` and `?count` variable looks like the following :

```sparql
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) ?hasChildren (COUNT(?x) AS ?count)
WHERE {

  {
    SELECT ?uri ?theLabel ?hasChildren
    WHERE {
      # Note the $node variable that can is replaced by the URI of the node being clicked
      $node skos:narrower|^skos:broader ?uri .
      ?uri skos:prefLabel ?theLabel .
      FILTER(isIRI(?uri))
      FILTER(lang(?theLabel) = '' || lang(?theLabel) = $lang)
      # tests if the URI itself has some children to populate ?hasChildren
      OPTIONAL {
        ?uri skos:narrower|^skos:broader ?children .
      }
      BIND(IF(bound(?children),true,false) AS ?hasChildren)
    }
  }

  # Counts how many time the URI is used as value in the criteria build in Sparnatural
  OPTIONAL {
    ?x a $domain .
    ?x $property ?uri .
    # here we choose not to use the $range criteria, but it can also be used
    # ?uri a $range .
  }
}
GROUP BY ?uri ?theLabel ?hasChildren
ORDER BY UCASE(?label)
```


## Datasource configuration reference

| Annotation / Axiom | Label | Card. | Description |
| ------------------ | ----- | ----- | ----------- |
| `queryString` | query string | 0..1 | The SPARQL query string of the datasource. At least one of `queryTemplate` or `queryString` must be provided. |
| `queryTemplate` | query template | 0..1 | The SPARQL query template to be used in a SPARQL datasource. At least one of `queryTemplate` or `queryString` must be provided. |
| `labelProperty` | label property | 0..1 | Used in combination with `queryTemplate`, indicates the URI of the property that will replace the variable `$labelPath` in the SPARQL query. |
| `labelPath` | label path | 0..1 | Used in combination with `queryTemplate` indicate a SPARQL property path that will replace the variable `$labelPath` in the SPARQL query. |
| `noSort` | no sort | 0..1 | By default Sparnatural sorts the list using the locale of the client. Set this to `true` if you don't want that sorting to happen and want to rely on the sort order returned by the SPARQL query. |

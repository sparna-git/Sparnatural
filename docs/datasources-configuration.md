_[Home](index.html) > Datasources_

# Datasources

## Datasources basics

Lists and autocomplete properties in Sparnatural can be associated to a [`datasources:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) annotation to populate respectively the list of values or the values proposed by autocompletion. Tree properties can also be associated to 2 datasources to populate respectively the roots of the tree, and the children of a node.

In its simplest and most common form a datasource is a SPARQL query that returns the expected columns to be used to populate the list/autocomplete values.

The [`datasources:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) annotation is placed on the corresponding property shape in the SHACL configuration. 
 The value of this annotation can be either:

1. The URI pre-configured datasource that is shipped with Sparnatural;
1. The URI of a pre-configured SPARQL query, plus a property URI to be injected in this query;
1. The URI of your own custom datasource;

These 3 solutions are described below.

## Preconfigured datasources

### Preconfigured datasources for a ListProperty


Sparnatural comes preconfigured with datasources that can populate lists based on `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` or the URI of the entity. For each of these properties, 3 flavors of datasource exist :

  - an alphabetical ordering
  - an alphabetical ordering plus the count shown in parenthesis
  - a descending count ordering.

Use one of these datasources if your RDF data relies on one of these properties.

The preconfigured datasource identifiers for a ListProperty are :

1. [`datasources:list_URI_or_literal_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha) and [`datasources:list_URI_or_literal_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha_with_count) and [`datasources:list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_count)
1. [`datasources:list_URI_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_alpha) and [`datasources:list_URI_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_count)
1. [`datasources:list_rdfslabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha) and [`datasources:list_rdfslabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_count) and [`datasources:list_rdfslabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha_with_count)
1. [`datasources:list_skospreflabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha) and [`datasources:list_skospreflabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_count) and [`datasources:list_skospreflabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha_with_count)
1. [`datasources:list_foafname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha) and [`datasources:list_foafname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_count) and [`datasources:list_foafname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha_with_count)
1. [`datasources:list_dctermstitle_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha) and [`datasources:list_dctermstitle_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_count) and [`datasources:list_dctermstitle_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha_with_count)
1. [`datasources:list_schemaname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha) and [`datasources:list_schemaname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_count) and [`datasources:list_schemaname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha_with_count)

You can find these identifiers in the [Sparnatural datasource ontology documentation](http://data.sparna.fr/ontologies/sparnatural-config-datasources), that you can open in Protégé, under the tabs "Entity IRI", then "Individuals" :

![Screenshot Protégé datasources](/assets/images/protege-screenshot-datasources-1.png)


### A note on the range criteria in default list datasources

The provided default datasources to populate the lists do **not** use the range of the value as a criteria in the query. In other words, _all the values of the given property in the given domain are returned, whatever their type_.

This is usually sufficient and more performant but this can be a problem if the same property in the same domain can refer to entities of different type in the Sparnatural configuration. For example consider the situation where _"the creator of a Document can be either a Person or an Organization"_. When listing the values of possible creators of documents, both Persons and Organization will be mixed in the same list.

To use the range as a criteria in the query and filter the list based on the type of the value, you need to create a custom datasource based on one of the predefined query template having a "`..._with_range_...`" in its identifier. This will garantee that only values of the selected type will appear in the list. See below on how to create a custom datasource based on a predefined query template including the range criteria.



### Preconfigured datasources for an AutocompleteProperty

Sparnatural comes preconfigured with datasources that can populate autocomplete fields based on `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` or the URI of the entity. For each of these properties, 3 flavors of datasource exist : either searching by the beginning of the value with `strstarts()`, anywhere in the value with `contains()` or using Virtuoso-specific `bif:contains()` function. Additionnally, a search datasource can search on the URI using the `contains()` function.

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

Similarly to list datasources, you find these under the "Entity IRI" > "Individuals" tab of Protégé when you open the [Sparnatural datasource ontology](http://data.sparna.fr/ontologies/sparnatural-config-datasources) in Protégé :

![Screenshot Protégé datasources](/assets//images/protege-screenshot-datasources-2.png)


## Preconfigured SPARQL query with another property

### How-to create your own datasource with an existing SPARQL query but using another property

If the preconfigured datasources do not fit the data model to be queried, you have the ability to refer to the same SPARQL queries used by these datasources, but adjust the property to be searched or used as a label. To do so, you need to create a new instance of type `datasources:SparqlDatasource`, and provide 2 information:


1. a `datasources:queryTemplate` property to one of the preconfigured SPARQL query template that are bundled with Sparnatural.
  
  1. For property shapes using [`core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) as their `dash:searchWidget`, and returning URIs (the most common case) this can be:
     1. [`datasources:query_list_label_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha)
     1. [`datasources:query_list_label_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_count)
     1. [`datasources:query_list_label_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha_with_count)
     1. [`datasources:query_list_label_with_range_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha) : to be used if you need the range to be part of the query - alphabetical ordering variant
     1. [`datasources:query_list_label_with_range_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_count) : to be used if you need the range to be part of the query - descending count ordering variant
     1. [`datasources:query_list_label_with_range_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha_with_count) : to be used if you need the range to be part of the query - alphabetical ordering variant with count in parenthesis variant
  1. For property shapes using [`core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) as their `dash:searchWidget`, but returning literal values, this can be:
    1. [`datasources:query_literal_list_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_alpha) (literals ordered alphabetically)
    1. [`datasources:query_literal_list_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_count) (literals ordered by descending count)
    1. [`datasources:query_literal_list_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_alpha_with_count) (literals ordered alphabetically with the count in parenthesis)
  1. For property shapes using [`core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) as their `dash:searchWidget`, in the rare edge case where the value can be sometimes a literal value, sometimes a URI with a label property:
    1. [`datasources:query_list_URI_or_literal_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_URI_or_literal_alpha) - values ordered alphabetically
    1. [`datasources:query_list_URI_or_literal_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_URI_or_literal_alpha_with_count) - values ordered alphabetically with count in parenthesis
    1. [`datasources:query_list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_URI_or_literal_count) - values ordered by descending count
  1. For property shapes using [`core:AutocompleteProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#AutocompleteProperty) as their `dash:searchWidget`, this can be:
     1. [`datasources:query_search_label_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_strstarts) : search using `STRSTARTS` SPARQL function
     1. [`datasources:query_search_label_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_contains) : search using `CONTAINS` SPARQL function
     1. [`datasources:query_search_label_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_bifcontains) : search using `bif:contains` Virtuoso-specific SPARQL function
     1. [`datasources:query_search_URI_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_URI_contains) :  : search using `CONTAINS` SPARQL function inside the URI
     1. [`datasources:query_search_literal_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_literal_contains) :  : search inside the value as a literal, not a URI, using SPARQL `STRSTARTS` function
     1. [`datasources:query_search_literal_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_literal_contains) :  : search inside the value as a literal, not a URI, using SPARQL `CONTAINS` function

1. And one of those 2 properties:
   1. [`datasources:labelProperty`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelProperty) with the IRI of property that corresponds to the label to be retrieved or searched, in replacement, and playing the same role, as one of the 5 default properties of Sparnatural (`rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name`)
   1. [`datasources:labelPath`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelPath) with the SPARQL property path to use (using angle brackets, no prefixes) to fetch the label of entities. In particular this allows to deal with situations where the labels are reified as separate entities.

For example to create a new custom datasource that will use `dc:title` as the label, and use an alphabetical ordering, the corresponding SHACL configuration will be the following:

```turtle
exconfig:myPropertyShape
  sh:path ex:myProperty ;
  sh:name "my property" ;
  sh:node exconfig:Document ;
  # this will be a dropdown list
  dash:searchWidget datasources:ListProperty ;
  # use this custom datasource to populate the dropdown list
  datasources:datasource exconfig:myCustomDatasource ;

# The custom datasource
exconfig:myCustomDatasource a datasources:SparqlDatasource ;
  # use this SPARQL query template...
  datasources:queryTemplate datasources:query_list_label_alpha;
  # ... with this property as the display label to be fetched
  datasources:labelProperty dc:title .

```

## Your own SPARQL query (lists / autocomplete)

### Configuring your own SPARQL query

You can provide your own SPARQL queries to populate lists or autocomplete suggestions. To do so, attach a [`datasources:queryString`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#queryString) annotation on your datasource object, holding the SPARQL query that should be used to populate the list/autocomplete.

**The SPARQL query MUST return 2 variables : `?uri` and `?label`, populated anyway you like.** 

Additionnally, the query can return, optionnally:
- an extra `?group` variable, which will be used to generate `optgroup` sections in lists widgets, and will be used as hover tooltips in autocompletion lists. This is used to indicate the source endpoint of the result in cases of multiple endpoints.
- an extra `?itemLabel` variable, which will be used, if present, as the label of the selected value; for exemple, `?label` can hold a count, like _"Italy (307)"_, while `?itemLabel` can be just _"Italy"_.

In this SPARQL query, you can use the following placeholders that will be replaced automatically by Sparnatural before executing the query:
- **`$domain`**, if present, will be replaced by the URI of the domain node shape (the one pointing to the property shape with `sh:property`);
- **`$range`**, if present, will be replaced by the URI of the range node shape (the one indicated in `sh:node`, or having the same `sh:targetClass` as the one indicated in `sh:class` on the property shape);
- **`$property`**, if present, will be replaced by the URI of the property shape;
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
      # Note how the $range criteria is not used in this query 
    }
    GROUP BY ?uri
   }
   ?uri $labelPath ?theLabel .
   FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang) 
}
ORDER BY UCASE(?label)
LIMIT 500
```

Here is a SHACL configuration example:

```turtle
exconfig:myPropertyShape
  sh:path ex:myProperty ;
  sh:name "my property" ;
  sh:node exconfig:Document ;
  # this will be a dropdown list
  dash:searchWidget datasources:ListProperty ;
  # use this custom datasource to populate the dropdown list
  datasources:datasource exconfig:myCustomDatasource ;

# The custom datasource
exconfig:myCustomDatasource a datasources:SparqlDatasource ;
  # use this SPARQL query to populate the dropdown
  datasources:queryString """
    SELECT ?uri ?count WHERE { etc... }
  """
.
```

### Node Shapes and Property Shapes URI will be expanded to their target and predicate

You should remember that the final SPARQL query that will be executed will be preprocessed so that:
- Property shapes URI replaced in the `$property` placeholder will be expanded to their corresponding `sh:path`
- Node shapes URI replaced in the `$domain` and `$range` placeholder will be expanded to their corresponding `sh:targetClass` or their corresponding `sh:target/sh:select` SPARQL query.


### Configuring your own SPARQL query to return literal values

You can populate dropdown lists with literal values. In this case **The SPARQL query MUST return 2 variables : `?value` and `?label`, populated anyway you like.** The `?value` variable should hold the literal value to be used in the final SPARQL query, and `?label` should hold what is visually displayed in the dropdown. Both variables can be the same, but not necessarily, e.g. if the `?label` should hold a count in parenthesis, while the `?value` holds the actual literal value. Take a look at [the predefined query_literal_list_alpha query](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_alpha):

```sparql
SELECT DISTINCT ?value (STR(?value) AS ?label)
WHERE {
    ?domain $type $domain .
    ?domain $property ?value .
}
ORDER BY UCASE(STR(?label))
LIMIT 500
```


## Datasources for core:TreeProperty

### Preconfigured datasources for a TreeProperty

Sparnatural comes preconfigured with datasources that can populate a tree selector with the roots and the children of each node.

#### Preconfigured datasources for the roots of a TreeProperty

These datasources are to be used with a [`datasources:treeRootsDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeRootsDatasource) annotation on a property shape using a [`core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty) widget.

The preconfigured datasource identifiers for roots datasource on a TreeProperty are :

1. [`datasources:tree_root_skostopconcept`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept) : reads the roots of a SKOS ConceptScheme using `skos:hasTopConcept` or `^skos:topConceptOf`, _assuming the URI of the Sparnatural entity in the config is equal to the URI of the ConceptScheme_
1. [`datasources:tree_root_skostopconcept_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept_with_count) : same as previous, but returns the number of occurences of each node in parenthesis

#### Preconfigured datasources for the children of a TreeProperty

These datasources are to be used with a [`datasources:treeChildrenDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeChildrenDatasource) annotation on a property shape using a [`core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty) widget.

The preconfigured datasource identifiers for children datasource on a TreeProperty are :

1. [`datasources:tree_children_skosnarrower`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower) : reads the children of a node using `skos:narrower` or `^skos:broader`
1. [`datasources:tree_children_skosnarrower_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower_with_count) : same as previous, but returns the number of occurences of each node in parenthesis

### Tree widget example configuration

```turtle

# Property using a tree widget
shape:SpecialitePharmaceutique_classificationATC sh:path ex:atcClassification;
  sh:name "ATC classification"@en;
  sh:nodeKind sh:IRI;
  sh:node shape:ATC;
  # This is a tree property
  dash:searchWidget config-core:TreeProperty;
  # roots datasource
  config-datasources:treeRootsDatasource shape:tree_atc_root;
  # children datasource
  config-datasources:treeChildrenDatasource shape:tree_atc_child .


# Datasource to populate the roots
shape:tree_atc_root a config-datasources:SparqlDatasource;
  config-datasources:queryString """PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri (CONCAT(?code, \" - \", STR(?rdfs_label)) AS ?label) (COUNT(?x) AS ?count)
WHERE {
 ?uri rdfs:subClassOf <http://data.esante.gouv.fr/whocc/atc/ATC> .
 ?uri rdfs:label ?rdfs_label .
 ?uri skos:notation ?code .
 FILTER(lang(?rdfs_label) = $lang)

 # Counts how many time the URI is used as value in the criteria build in Sparnatural
 OPTIONAL {
 ?x $property ?uri .
 }
}
GROUP BY ?uri ?code ?rdfs_label
ORDER BY ?label""" .

# Datasource to populate the children of a node, when clicked
shape:tree_atc_child a config-datasources:SparqlDatasource;
  config-datasources:queryString """PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri (CONCAT(?code, \" - \", STR(?rdfs_label)) AS ?label) ?hasChildren (COUNT(?x) AS ?count)
WHERE {
 # The $node variable will be replaced by the URI of the node being expanded in the tree 
 ?uri rdfs:subClassOf $node .
 ?uri rdfs:label ?rdfs_label .
 ?uri skos:notation ?code .
 FILTER(lang(?rdfs_label) = $lang)

 # if nodes have themselves children, they will be expandable in the tree, otherwise not
 OPTIONAL { ?something rdfs:subClassOf ?uri }
 BIND(bound(?something) AS ?hasChildren)

 # Counts how many time the URI is used as value in the criteria build in Sparnatural
 OPTIONAL {
 ?x $property ?uri .
 }

}
GROUP BY ?uri ?code ?rdfs_label ?hasChildren
ORDER BY ?label""" .  
```

### Your own SPARQL queries for a Tree widget

You can provide your own SPARQL queries to populate a tree widget. To do so, you need 2 datasources : one that will populate the roots of the tree (entries at first level), and one that will be used to populate the children of a tree, when clicked (see the [annotations for a SelectResourceProperty](https://docs.sparnatural.eu/OWL-based-configuration#annotations-for-a-selectresourceproperty) for more information).

**The SPARQL query MUST return 2 variables : `?uri` and `?label`, populated anyway you like.**
The SPARQL query CAN return 2 other variables :

  - **`?hasChildren`**, a boolean to indicate if the node has children. If not present, all tree items can be unfolded, even when have no children; if present and set to false, an item cannot be unfolded. 
  - **`?count`** to indicate the number of times a node is used as a value; nodes with a count = 0 will be disabled and cannot be selected as a value.

In these SPARQL query, the same replacement of the **`$domain`**, **`$range`**, **`$property`**, etc. than in the queries for list/autocomplete will happen (see above). The following additional replacements will happen:
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

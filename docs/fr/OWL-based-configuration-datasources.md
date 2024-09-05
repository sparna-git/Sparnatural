_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

_[Accueil](index.html) > Configuration des sources de données basée sur OWL_

# Sources de données

## Principes de base des sources de données

Comme indiqué dans la référence [[configuration basée sur OWL]], les listes et les propriétés d'autocomplétion dans Sparnatural nécessitent une annotation [`ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) pour peupler respectivement la liste des valeurs ou les valeurs proposées par l'autocomplétion. Dans sa forme la plus simple et la plus courante, une source de données est essentiellement une requête SPARQL qui renvoie les colonnes attendues pour être utilisées pour peupler les valeurs de la liste/d'autocomplétion.

La configuration de l'annotation de la source de données peut être soit :

1. Une référence à une source de données préconfigurée ;
1. Une référence à une requête SPARQL préconfigurée, plus un URI de propriété à injecter dans cette requête ;
1. Votre propre requête SPARQL ;

Ces 3 solutions sont décrites ci-dessous.

## Sources de données préconfigurées

### Sources de données préconfigurées pour une propriété de liste

Sparnatural est préconfiguré avec des sources de données qui peuvent peupler des listes basées sur `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` ou l'URI de l'entité (qui est le comportement par défaut). Pour chacune de ces propriétés, 3 variantes de sources de données existent : soit avec un ordre alphabétique, un ordre alphabétique plus le nombre affiché entre parenthèses, soit un ordre décroissant par nombre.

Utilisez l'une de ces sources de données si vos données RDF reposent sur l'une de ces propriétés.

Les identifiants des sources de données préconfigurées pour une propriété de liste sont :

1. [`datasources:list_URI_or_literal_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha) et [`datasources:list_URI_or_literal_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha_with_count) et [`datasources:list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_count)
1. [`datasources:list_URI_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_alpha) et [`datasources:list_URI_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_count)
1. [`datasources:list_rdfslabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha) et [`datasources:list_rdfslabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_count) et [`datasources:list_rdfslabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha_with_count)
1. [`datasources:list_skospreflabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha) et [`datasources:list_skospreflabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_count) et [`datasources:list_skospreflabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha_with_count)
1. [`datasources:list_foafname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha) et [`datasources:list_foafname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_count) et [`datasources:list_foafname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha_with_count)
1. [`datasources:list_dctermstitle_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha) et [`datasources:list_dctermstitle_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_count) et [`datasources:list_dctermstitle_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha_with_count)
1. [`datasources:list_schemaname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha) et [`datasources:list_schemaname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_count) et [`datasources:list_schemaname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha_with_count)

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

Vous pouvez trouver ces identifiants dans Protégé lorsque vous créez l'annotation `ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) sous les onglets "Entity IRI", puis "Individuals" :

![Capture d'écran des sources de données Protégé](/assets/images/protege-screenshot-datasources-1.png)

### Sources de données préconfigurées pour une AutocompleteProperty

Sparnatural est préconfiguré avec des sources de données qui peuvent remplir les champs d'autocomplétion basés sur `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` ou l'URI de l'entité (qui est le comportement par défaut). Pour chacune de ces propriétés, 3 variantes de sources de données existent : soit en recherchant par le début de la valeur avec `strstarts()`, n'importe où dans la valeur avec `contains()` ou en utilisant la fonction spécifique à Virtuoso `bif:contains()`. De plus, une source de recherche peut rechercher sur l'URI en utilisant la fonction `contains()`, qui est le comportement par défaut.

Les identifiants des sources de données préconfigurées pour une AutocompleteProperty sont :
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

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

### Sources de données préconfigurées pour une TreeProperty

Sparnatural est préconfiguré avec des sources de données qui peuvent peupler un sélecteur d'arborescence avec les racines et les enfants de chaque nœud.

#### Sources de données préconfigurées pour les racines d'une TreeProperty

Ces sources de données doivent être utilisées avec un [`treeRootsDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeRootsDatasource) sur une [`TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

Les identifiants de source de données préconfigurées pour la source de données des racines sur une TreeProperty sont :

1. [`datasources:tree_root_skostopconcept`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept) : lit les racines d'un ConceptScheme SKOS en utilisant `skos:hasTopConcept` ou `^skos:topConceptOf`, en supposant que l'URI de la classe Sparnatural est égal à l'URI du ConceptScheme
1. [`datasources:tree_root_skostopconcept_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept_with_count) : similaire au précédent, mais renvoie le nombre d'occurrences de chaque nœud entre parenthèses

#### Sources de données préconfigurées pour les enfants d'une TreeProperty

Ces sources de données doivent être utilisées avec un [`treeChildrenDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeChildrenDatasource) sur une [`TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

Les identifiants de source de données préconfigurées pour la source de données des enfants sur une TreeProperty sont :

1. [`datasources:tree_children_skosnarrower`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower) : lit les enfants d'un nœud en utilisant `skos:narrower` ou `^skos:broader`
1. [`datasources:tree_children_skosnarrower_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower_with_count) : similaire au précédent, mais renvoie le nombre d'occurrences de chaque nœud entre parenthèses

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

## Requête SPARQL préconfigurée avec une autre propriété

### Comment créer votre propre source de données avec une requête SPARQL existante mais en utilisant une autre propriété

Si les sources de données préconfigurées ne correspondent pas au modèle de données à interroger, vous avez la possibilité de vous référer aux mêmes requêtes SPARQL utilisées par ces sources de données, mais d'ajuster la propriété à rechercher ou à utiliser comme libellé. Pour ce faire, vous devez créer un nouvel individu dans Protégé, de type `SparqlDatasource`, et fournir 2 informations :


1. dans le champ "Assertion de propriété d'objet" de Protégé, une référence `queryTemplate` à l'un des modèles de requête SPARQL préconfigurés, à savoir :
   1. [`datasources:query_list_label_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha)
   1. [`datasources:query_list_label_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_count)
   1. [`datasources:query_list_label_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha_with_count)
   1. [`datasources:query_list_label_with_range_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha)
   1. [`datasources:query_list_label_with_range_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_count)
   1. [`datasources:query_list_label_with_range_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha_with_count)
   1. [`datasources:query_search_label_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_strstarts)
   1. [`datasources:query_search_label_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_bifcontains)
1. Et l'une de ces 2 Annotations (dans la section "Annotations" de Protégé) :
   1. [`datasources:labelProperty`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelProperty) avec l'IRI de la propriété de libellé à utiliser
   1. [`datasources:labelPath`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelPath) avec le chemin de propriété SPARQL à utiliser (en utilisant des crochets angulaires, sans préfixes) pour récupérer le libellé des entités. Cela permet en particulier de gérer les situations où les libellés sont réifiés en tant qu'entités séparées.

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

Par exemple, pour créer une nouvelle source de données personnalisée qui utilisera `dc:title` comme libellé et utilisera un ordre alphabétique, suivez les étapes suivantes :

![Capture d'écran Protégé source de données personnalisée](/assets//images/screencast-protege-custom-datasource-1.gif)

### Requêtes sans plage / requêtes avec plage

Les requêtes fournies pour peupler les listes **n'utilisent pas** la plage de la valeur comme critère dans la requête. En d'autres termes, toutes les valeurs de la propriété donnée dans le domaine donné sont renvoyées, indépendamment de leur type.
Cela est généralement suffisant et plus performant, mais cela peut poser problème si la même propriété dans le même domaine peut faire référence à des entités de types différents dans la configuration Sparnatural. Par exemple, "Document > créateur > Personne ou Organisation".
Pour utiliser la plage comme critère dans la requête et filtrer la liste en fonction du type de la valeur, créez une source de données basée sur une requête incluant "..._avec_plage_..." dans son identifiant. Cela garantira que seules les valeurs du type sélectionné apparaîtront dans la liste.


## Votre propre requête SPARQL (listes / suggestions d'autocomplétion)

Vous pouvez fournir vos propres requêtes SPARQL pour peupler des listes ou des suggestions d'autocomplétion. Pour ce faire, attachez une assertion de propriété de données `queryString` sur votre objet source de données, contenant la requête SPARQL qui doit être utilisée pour peupler la liste/suggestion d'autocomplétion.

**La requête SPARQL DOIT renvoyer 2 variables : `?uri` et `?label`, remplies de la manière que vous préférez.** De plus, depuis la version 8.6.0, la requête peut renvoyer, de manière optionnelle, une variable supplémentaire `?group`, qui sera utilisée pour générer des sections `optgroup` dans les widgets de listes, et sera utilisée comme info-bulle au survol dans les listes d'autocomplétion. Cela est utilisé pour indiquer l'endpoint source du résultat en cas de multiples endpoints.

Dans cette requête SPARQL, les remplacements suivants auront lieu :
- **`$domain`**, s'il est présent, sera remplacé par l'URI de la classe de domaine ;
- **`$range`**, s'il est présent, sera remplacé par l'URI de la classe de plage ;
- **`$property`**, s'il est présent, sera remplacé par l'URI de la propriété ;
- **`$lang`**, s'il est présent, sera remplacé par le paramètre `lang` de Sparnatural ;
- **`$defaultLang`**, s'il est présent, sera remplacé par le paramètre `defaultLang` de Sparnatural ;
- **`$type`**, s'il est présent, sera remplacé par la valeur du paramètre `typePredicate` de la configuration Sparnatural (utile si vous interrogez un endpoint wikibase où le prédicat de type est autre chose que rdf:type) ;
- **`$key`**, s'il est présent, sera remplacé par la clé recherchée (uniquement utile pour les champs d'autocomplétion) ;

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

Consultez les requêtes SPARQL préconfigurées dans l'[ontologie des sources de données Sparnatural](http://data.sparna.fr/ontologies/sparnatural-config-datasources) pour commencer.

Voici un exemple de requête : (notez l'utilisation des variables de substitution qui seront remplacées par les valeurs correspondantes) :

```sparql
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label)
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

## Votre propre requête SPARQL (arborescence)

Vous pouvez fournir vos propres requêtes SPARQL pour peupler un widget d'arborescence. Pour ce faire, vous avez besoin de 2 sources de données : une qui peuplera les racines de l'arborescence (entrées au premier niveau), et une qui sera utilisée pour peupler les enfants d'un nœud d'arborescence, lorsqu'ils sont cliqués (voir les [annotations pour un SelectResourceProperty](https://docs.sparnatural.eu/OWL-based-configuration#annotations-for-a-selectresourceproperty) pour plus d'informations).

**La requête SPARQL DOIT renvoyer 2 variables : `?uri` et `?label`, peuplées de la manière que vous souhaitez.**
La requête SPARQL PEUT renvoyer 2 autres variables :

  - **`?hasChildren`**, un booléen pour indiquer si le nœud a des enfants. S'il n'est pas présent, tous les éléments de l'arborescence peuvent être dépliés, même s'ils n'ont pas d'enfants ; s'il est présent et défini sur false, un élément ne peut pas être déplié.
  - **`?count`** pour indiquer le nombre de fois qu'un nœud est utilisé comme valeur ; les nœuds avec un count = 0 seront désactivés et ne pourront pas être sélectionnés comme valeur.

Dans ces requêtes SPARQL, le même remplacement des **`$domain`**, **`$range`**, **`$property`** et **`$lang`** que dans les requêtes pour la liste/autocomplétion se produira (voir ci-dessus). Les remplacements suivants se produiront également :
- **`$node`**, s'il est présent, sera remplacé par l'URI du nœud cliqué ;

Une requête typique qui peuple les variables `?hasChildren` et `?count` ressemble à ce qui suit :

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

## Référence de configuration de la source de données

| Annotation / Axiome | Libellé | Card. | Description |
| ------------------ | ----- | ----- | ----------- |
| `queryString` | chaîne de requête | 0..1 | La chaîne de requête SPARQL de la source de données. Au moins l'un des `queryTemplate` ou `queryString` doit être fourni. |
| `queryTemplate` | modèle de requête | 0..1 | Le modèle de requête SPARQL à utiliser dans une source de données SPARQL. Au moins l'un des `queryTemplate` ou `queryString` doit être fourni. |
| `labelProperty` | propriété de libellé | 0..1 | Utilisé en combinaison avec `queryTemplate`, indique l'URI de la propriété qui remplacera la variable `$labelPath` dans la requête SPARQL. |
| `labelPath` | chemin du libellé | 0..1 | Utilisé en combinaison avec `queryTemplate`, indique un chemin de propriété SPARQL qui remplacera la variable `$labelPath` dans la requête SPARQL. |
| `noSort` | pas de tri | 0..1 | Par défaut, Sparnatural trie la liste en utilisant la langue du client. Définissez ceci sur `true` si vous ne souhaitez pas que le tri se fasse de cette manière et que vous voulez vous fier à l'ordre de tri renvoyé par la requête SPARQL. |

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Sparnatural Documentation

## Introduction

Sparnatural is a powerful tool for managing your natural products inventory. It helps you keep track of your stock, suppliers, and orders efficiently.

## Installation

To install Sparnatural, follow these steps:

```bash
$ npm install -g sparnatural
```

## Getting Started

Once installed, you can initialize Sparnatural in your project by running:

```bash
$ sparnatural init
```

## Usage

### Adding Products

To add a new product to your inventory, use the following command:

```bash
$ sparnatural add-product --name "Product Name" --price 10.99 --quantity 100
```

### Managing Orders

You can manage orders with Sparnatural by using the following commands:

- To create a new order:

```bash
$ sparnatural create-order --product "Product Name" --quantity 10
```

- To list all orders:

```bash
$ sparnatural list-orders
```

## Conclusion

Sparnatural simplifies the management of natural products inventory. Start using it today to streamline your business operations.

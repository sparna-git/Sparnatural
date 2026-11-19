_[Accueil](index.html) > Sources de données_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../datasources-configuration.md) - le 19/11/2026


# Sources de données

## Bases des sources de données

Les propriétés de liste et d'autocomplétion dans Sparnatural peuvent être associées à une annotation [`datasources:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) pour peupler respectivement la liste des valeurs ou les valeurs proposées par l'autocomplétion. Les propriétés d'arbre peuvent également être associées à 2 sources de données pour peupler respectivement les racines de l'arbre, et les enfants d'un nœud.

Dans sa forme la plus simple et la plus courante, une source de données est une requête SPARQL qui retourne les colonnes attendues pour être utilisées afin de peupler les valeurs de liste/autocomplétion.

L'annotation [`datasources:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) est placée sur la forme de propriété correspondante dans la configuration SHACL. 
La valeur de cette annotation peut être soit :

1. L'URI d'une [source de données préconfigurée](http://data.sparna.fr/ontologies/sparnatural-config-datasources#SparqlDatasource) fournie avec Sparnatural ;
1. L'URI d'une [requête SPARQL préconfigurée](http://data.sparna.fr/ontologies/sparnatural-config-datasources#SparqlQuery), plus une URI de propriété à injecter dans cette requête ;
1. L'URI de votre propre source de données personnalisée ;

Ces 3 solutions sont décrites ci-dessous.

## Sources de données préconfigurées

### Sources de données préconfigurées pour une ListProperty


Sparnatural est fourni avec des sources de données préconfigurées qui peuvent peupler des listes basées sur les propriétés `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name`, ou avec l'URI de la ressource. Pour chacune de ces propriétés, 3 variantes de source de données existent :

  - un tri alphabétique (suffixe `_alpha`)
  - un tri alphabétique plus le nombre affiché entre parenthèses (suffixe `_alpha_with_count`)
  - un tri par nombre décroissant (suffixe `_count`).

Utilisez l'une de ces sources de données si vos données RDF reposent sur l'une de ces propriétés.

Les identifiants des sources de données préconfigurées pour une ListProperty sont :

1. [`datasources:list_URI_or_literal_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha) et [`datasources:list_URI_or_literal_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_alpha_with_count) et [`datasources:list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_count)
1. [`datasources:list_URI_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_alpha) et [`datasources:list_URI_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_count)
1. [`datasources:list_rdfslabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha) et [`datasources:list_rdfslabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_count) et [`datasources:list_rdfslabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha_with_count)
1. [`datasources:list_skospreflabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha) et [`datasources:list_skospreflabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_count) et [`datasources:list_skospreflabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha_with_count)
1. [`datasources:list_foafname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha) et [`datasources:list_foafname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_count) et [`datasources:list_foafname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha_with_count)
1. [`datasources:list_dctermstitle_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha) et [`datasources:list_dctermstitle_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_count) et [`datasources:list_dctermstitle_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha_with_count)
1. [`datasources:list_schemaname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha) et [`datasources:list_schemaname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_count) et [`datasources:list_schemaname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha_with_count)

Vous pouvez trouver ces identifiants dans la [documentation de l'ontologie des sources de données Sparnatural](http://data.sparna.fr/ontologies/sparnatural-config-datasources), que vous pouvez ouvrir dans Protégé, sous l'onglet "Entity IRI", puis "Individuals" :

![Capture d'écran Protégé datasources](/assets/images/protege-screenshot-datasources-1.png)

Pour utiliser l'une de ces sources de données dans une configuration SHACL, il suffit d'annoter une forme de propriété ayant un `dash:searchWidget core:ListProperty` avec une annotation [`datasources:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource), et d'utiliser l'un des URI de source de données prédéfinis comme objet :

```turtle
  this:Place_type_list sh:path rico:hasOrHadPlaceType;
    sh:name "place type"@en;
    sh:nodeKind sh:IRI;
    sh:node this:PlaceType;
    dash:searchWidget core:ListProperty;
    datasources:datasource <http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha> .
```


### Remarque sur les critères de plage dans les sources de données de liste par défaut

Les sources de données par défaut fournies pour peupler les listes **n'utilisent pas** la plage de la valeur comme critère dans la requête. En d'autres termes, _toutes les valeurs de la propriété donnée dans le domaine donné sont retournées, quelle que soit leur type_.

Cela est généralement suffisant et plus performant, mais cela peut poser problème si la même propriété dans le même domaine peut faire référence à des entités de types différents dans la configuration Sparnatural. Par exemple, considérons la situation où _"le créateur d'un Document peut être soit une Personne, soit une Organisation"_. Lors de la liste des valeurs des créateurs possibles de documents, les Personnes et les Organisations seront mélangées dans la même liste.

Pour utiliser la plage comme critère dans la requête et filtrer la liste en fonction du type de la valeur, vous devez créer une source de données personnalisée basée sur l'un des modèles de requête prédéfinis ayant un "`..._with_range_...`" dans son URI, tel que [datasources:query_list_label_with_range_alpha](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha). Cela garantira que seules les valeurs du type sélectionné apparaîttront dans la liste. Voir [ci-dessous](#requête-sparql-préconfigurée-avec-une-autre-propriété) sur la manière de créer une source de données personnalisée basée sur un modèle de requête prédéfini incluant le critère de plage.



### Sources de données préconfigurées pour une AutocompleteProperty

Sparnatural est fourni avec des sources de données préconfigurées qui peuvent peupler les champs d'autocomplétion basés sur `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` ou avec l'URI de la ressource. Pour chacune de ces propriétés, 3 variantes de source de données existent :

  - recherche par le début de la valeur avec `strstarts()` (suffixe `strstarts`)
  - recherche n'importe où dans la valeur avec `contains()` (suffixe `contains`)
  - utiliser la fonction spécifique à Virtuoso `bif:contains()` (suffixe `bifcontains`)

De plus, une autre source de données de recherche peut rechercher sur l'URI en utilisant la fonction `contains()`.

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

De manière similaire aux sources de données de liste, vous trouverez ces identifiants sous l'onglet "Entity IRI" > "Individuals" de Protégé lorsque vous ouvrez [l'ontologie des sources de données Sparnatural](http://data.sparna.fr/ontologies/sparnatural-config-datasources) dans Protégé :

![Capture d'écran Protégé datasources](/assets/images/protege-screenshot-datasources-2.png)

Pour utiliser l'une de ces sources de données dans une configuration SHACL, il suffit d'annoter votre forme de propriété ayant un `dash:searchWidget core:AutocompleteProperty` avec une annotation [`datasources:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource), et d'utiliser l'un des URI de source de données prédéfinis comme objet :

```turtle
  this:Place_type_autocomplete sh:path rico:hasOrHadPlaceType;
    sh:name "place type"@en;
    sh:nodeKind sh:IRI;
    sh:node this:PlaceType;
    dash:searchWidget core:AutocompleteProperty;
    datasources:datasource <http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_skospreflabel_contains> .
```


## Requête SPARQL préconfigurée avec une autre propriété

### Comment créer votre propre source de données avec une requête SPARQL existante mais en utilisant une autre propriété

Si les sources de données préconfigurées ne correspondent pas au modèle de données à interroger, vous avez la possibilité de vous référer aux mêmes requêtes SPARQL utilisées par ces sources de données, mais d'ajuster la propriété à rechercher ou à utiliser comme libellé. Pour ce faire, vous devez créer une nouvelle instance de type `datasources:SparqlDatasource`, et fournir 2 informations :


1. une propriété `datasources:queryTemplate` vers l'un des modèles de requête SPARQL préconfigurés qui sont regroupés avec Sparnatural.
  
    1. Pour les formes de propriété utilisant [`core:ListProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) comme leur `dash:searchWidget`, et retournant des URIs (le cas le plus courant) cela peut être :
       1. [`datasources:query_list_label_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha)
       1. [`datasources:query_list_label_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_count)
       1. [`datasources:query_list_label_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha_with_count)
       1. [`datasources:query_list_label_with_range_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha) : à utiliser si vous avez besoin que la plage fasse partie de la requête - variante de tri alphabétique
       1. [`datasources:query_list_label_with_range_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_count) : à utiliser si vous avez besoin que la plage fasse partie de la requête - variante de tri par nombre décroissant
       1. [`datasources:query_list_label_with_range_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha_with_count) : à utiliser si vous avez besoin que la plage fasse partie de la requête - variante de tri alphabétique avec nombre entre parenthèses
    2. Pour les formes de propriété utilisant [`core:ListProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) comme leur `dash:searchWidget`, mais retournant des valeurs littérales, cela peut être :
      1. [`datasources:query_literal_list_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_alpha) (littéraux triés alphabétiquement)
      1. [`datasources:query_literal_list_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_count) (littéraux triés par nombre décroissant)
      1. [`datasources:query_literal_list_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_alpha_with_count) (littéraux triés alphabétiquement avec le nombre entre parenthèses)
    3. Pour les formes de propriété utilisant [`core:ListProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) comme leur `dash:searchWidget`, dans le cas rare où la valeur peut être parfois une valeur littérale, parfois une URI avec une propriété de libellé :
      1. [`datasources:query_list_URI_or_literal_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_URI_or_literal_alpha) - valeurs triées alphabétiquement
      1. [`datasources:query_list_URI_or_literal_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_URI_or_literal_alpha_with_count) - valeurs triées alphabétiquement avec nombre entre parenthèses
      1. [`datasources:query_list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_URI_or_literal_count) - valeurs triées par nombre décroissant
    4. Pour les formes de propriété utilisant [`core:AutocompleteProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#AutocompleteProperty) comme leur `dash:searchWidget`, cela peut être :
       1. [`datasources:query_search_label_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_strstarts) : recherche utilisant la fonction SPARQL `STRSTARTS`
       1. [`datasources:query_search_label_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_contains) : recherche utilisant la fonction SPARQL `CONTAINS`
       1. [`datasources:query_search_label_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_bifcontains) : recherche utilisant la fonction SPARQL spécifique à Virtuoso `bif:contains`
       1. [`datasources:query_search_URI_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_URI_contains) : recherche utilisant la fonction SPARQL `CONTAINS` dans l'URI
       1. [`datasources:query_search_literal_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_literal_contains) : recherche dans la valeur en tant que littéral, et non URI, en utilisant la fonction SPARQL `STRSTARTS`
       1. [`datasources:query_search_literal_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_literal_contains) : recherche dans la valeur en tant que littéral, et non URI, en utilisant la fonction SPARQL `CONTAINS`

2. Et l'une de ces 2 propriétés :
   1. [`datasources:labelProperty`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelProperty) avec l'IRI de la propriété qui correspond au libellé à récupérer ou rechercher, en remplacement, et jouant le même rôle, que l'une des 5 propriétés par défaut de Sparnatural (`rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name`)
   2. [`datasources:labelPath`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelPath) avec le chemin de propriété SPARQL à utiliser (en utilisant des chevrons, pas de préfixes) pour récupérer le libellé des entités. En particulier, cela permet de gérer les situations où les libellés sont réifiés en entités distinctes.

Par exemple, pour créer une nouvelle source de données personnalisée qui utilisera `dc:title` comme libellé, et utilisera un tri alphabétique, la configuration SHACL correspondante sera la suivante :

```turtle
exconfig:myPropertyShape
  sh:path ex:myProperty ;
  sh:name "my property" ;
  sh:node exconfig:Document ;
  # ceci sera une liste déroulante
  dash:searchWidget datasources:ListProperty ;
  # utiliser cette source de données personnalisée pour peupler la liste déroulante
  datasources:datasource exconfig:myCustomDatasource ;

# La source de données personnalisée
exconfig:myCustomDatasource a datasources:SparqlDatasource ;
  # utiliser ce modèle de requête SPARQL...
  datasources:queryTemplate datasources:query_list_label_alpha;
  # ... avec cette propriété comme libellé d'affichage à récupérer
  datasources:labelProperty dc:title .
```

## Vos propres requêtes SPARQL (listes / autocomplétion)

### Configuration de votre propre requête SPARQL

Vous pouvez fournir vos propres requêtes SPARQL pour peupler les listes ou les suggestions d'autocomplétion. Pour ce faire, créez une ressource de type [`datasources:SparqlDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#SparqlDatasource), et attachez une annotation [`datasources:queryString`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#queryString) sur celle-ci, contenant la requête SPARQL qui doit être utilisée pour peupler la liste/l'autocomplétion.

**La requête SPARQL DOIT retourner 2 variables : `?uri` et `?label`, peuplées de la manière que vous souhaitez.** 
**La requête SPARQL DOIT utiliser la variable `$this` comme URI du sujet du critère actuel, si nécessaire.** 

De plus, la requête peut retourner, optionnellement :
- une variable supplémentaire `?group`, qui sera utilisée pour générer des sections `optgroup` dans les widgets de liste, et sera utilisée comme infobulles au survol dans les listes d'autocomplétion. Cela est utilisé pour indiquer le point d'accès final du résultat dans les cas de plusieurs points d'accès.
- une variable supplémentaire `?itemLabel`, qui sera utilisée, si présente, comme libellé de la valeur sélectionnée ; par exemple, `?label` peut contenir un compte, comme _"Italie (307)"_, tandis que `?itemLabel` peut être simplement _"Italie"_.
- toute autre variable pour être affichée dans [les modèles de liste/autocomplétion/arbre](templates-configuration.md), tels que des définitions, des icônes, etc.

Dans cette requête SPARQL, vous pouvez utiliser les espaces réservés suivants qui seront automatiquement remplacés par Sparnatural avant d'exécuter la requête :
- **`$domain`**, si présent, sera remplacé par l'URI du nœud de forme de domaine (celui pointant vers la forme de propriété avec `sh:property`) ;
- **`$range`**, si présent, sera remplacé par l'URI du nœud de forme de plage (celui indiqué dans `sh:node`, ou ayant le même `sh:targetClass` que celui indiqué dans `sh:class` sur la forme de propriété) ;
- **`$property`**, si présent, sera remplacé par l'URI de la forme de propriété ;
- **`$lang`**, si présent, sera remplacé par le paramètre `lang` de Sparnatural ;
- **`$defaultLang`**, si présent, sera remplacé par le paramètre `defaultLang` de Sparnatural ;
- **`$type`**, si présent, sera remplacé par la valeur du paramètre `typePredicate` de la configuration Sparnatural (utile si vous interrogez un point d'accès Wikibase où le prédicat de type est autre chose que rdf:type) ;
- **`$key`**, si présent, sera remplacé par la clé recherchée (utile uniquement pour les champs d'autocomplétion) ;

Jetez un œil aux requêtes SPARQL préconfigurées dans [l'ontologie des sources de données Sparnatural](http://data.sparna.fr/ontologies/sparnatural-config-datasources) pour commencer.

Voici un exemple de telle requête : (remarquez l'utilisation des variables d'espace réservé qui seront remplacées par les valeurs correspondantes) :

```sparql
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) (STR(?theLabel) AS ?itemLabel)
WHERE { 
  { 
    SELECT DISTINCT ?uri (COUNT(?domain) AS ?count) 
    WHERE {
      $this a $domain .
      $this $property ?uri .
      FILTER(isIRI(?uri))
      # Remarquez comment le critère $range n'est pas utilisé dans cette requête 
    }
    GROUP BY ?uri
   }
   ?uri $labelPath ?theLabel .
   FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang) 
}
ORDER BY UCASE(?label)
LIMIT 500
```

Voici un exemple de configuration SHACL :

```turtle
exconfig:myPropertyShape
  sh:path ex:myProperty ;
  sh:name "my property" ;
  sh:node exconfig:Document ;
  # ceci sera une liste déroulante
  dash:searchWidget datasources:ListProperty ;
  # utiliser cette source de données personnalisée pour peupler la liste déroulante
  datasources:datasource exconfig:myCustomDatasource ;

# La source de données personnalisée
exconfig:myCustomDatasource a datasources:SparqlDatasource ;
  # utiliser cette requête SPARQL pour peupler la liste déroulante
  datasources:queryString """
    SELECT ?uri ?count WHERE { etc... }
  """
.
```

### Les URI des Node Shapes et Property Shapes seront développés en leur cible et prédicat

Vous devez vous rappeler que la requête SPARQL finale qui sera exécutée sera prétraitée de sorte que :
- Les URI des formes de propriété remplacées dans l'espace réservé `$property` seront développées en leur `sh:path` correspondant
- Les URI des nœuds de forme remplacées dans les espaces réservés `$domain` et `$range` seront développées en leur `sh:targetClass` correspondant ou leur requête SPARQL `sh:target/sh:select` correspondante.


### Configuration de votre propre requête SPARQL pour retourner des valeurs littérales

Vous pouvez peupler des listes déroulantes avec des valeurs littérales. Dans ce cas, **la requête SPARQL DOIT retourner 2 variables : `?value` et `?label`, peuplées de la manière que vous souhaitez.** La variable `?value` doit contenir la valeur littérale à utiliser dans la requête SPARQL finale, et `?label` doit contenir ce qui est affiché visuellement dans la liste déroulante. Les deux variables peuvent être identiques, mais pas nécessairement, par exemple si `?label` doit contenir un compte entre parenthèses, tandis que `?value` contient la valeur littérale réelle. Jetez un œil à [la requête query_literal_list_alpha prédefinie](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_literal_list_alpha) :

```sparql
SELECT DISTINCT ?value (STR(?value) AS ?label)
WHERE {
    $this $type $domain .
    $this $property ?value .
}
ORDER BY UCASE(STR(?label))
LIMIT 500
```


## Sources de données pour core:TreeProperty

### Sources de données préconfigurées pour une TreeProperty

Sparnatural est fourni avec des sources de données préconfigurées qui peuvent peupler un sélecteur d'arbre avec les racines et les enfants de chaque nœud.

#### Sources de données préconfigurées pour les racines d'une TreeProperty

Ces sources de données doivent être utilisées avec une annotation [`datasources:treeRootsDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeRootsDatasource) sur une forme de propriété utilisant un widget [`core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

Les identifiants des sources de données préconfigurées pour les sources de données de racines sur une TreeProperty sont :

1. [`datasources:tree_root_skostopconcept`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept) : lit les racines d'un Schéma de Concept SKOS en utilisant `skos:hasTopConcept` ou `^skos:topConceptOf`, _en supposant que l'URI de l'entité Sparnatural dans la config est égale à l'URI du Schéma de Concept_
1. [`datasources:tree_root_skostopconcept_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_skostopconcept_with_count) : identique au précédent, mais retourne le nombre d'occurrences de chaque nœud entre parenthèses
1. [`datasources:tree_root_domain_subClassOf`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_root_domain_subClassOf) : Un arbre basé sur subClassOf qui suppose que l'URI du domaine est la racine de l'arbre que nous voulons construire

#### Sources de données préconfigurées pour les enfants d'une TreeProperty

Ces sources de données doivent être utilisées avec une annotation [`datasources:treeChildrenDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeChildrenDatasource) sur une forme de propriété utilisant un widget [`core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty).

Les identifiants des sources de données préconfigurées pour les sources de données d'enfants sur une TreeProperty sont :

1. [`datasources:tree_children_skosnarrower`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower) : lit les enfants d'un nœud en utilisant `skos:narrower` ou `^skos:broader`
1. [`datasources:tree_children_skosnarrower_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower_with_count) : identique au précédent, mais retourne le nombre d'occurrences de chaque nœud entre parenthèses
1. [`datasources:tree_children_subClassOf`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_subClassOf) : Un arbre basé sur subClassOf qui suppose que l'URI du domaine est la racine de l'arbre que nous voulons construire

### Exemple de configuration de widget arbre

```turtle

# Propriété utilisant un widget arbre
shape:SpecialitePharmaceutique_classificationATC sh:path ex:atcClassification;
  sh:name "ATC classification"@en;
  sh:nodeKind sh:IRI;
  sh:node shape:ATC;
  # Ceci est une propriété d'arbre
  dash:searchWidget config-core:TreeProperty;
  # source de données des racines
  config-datasources:treeRootsDatasource shape:tree_atc_root;
  # source de données des enfants
  config-datasources:treeChildrenDatasource shape:tree_atc_child .


# Source de données pour peupler les racines
shape:tree_atc_root a config-datasources:SparqlDatasource;
  config-datasources:queryString """PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri (CONCAT(?code, \" - \", STR(?rdfs_label)) AS ?label) (COUNT($this) AS ?count)
WHERE {
 ?uri rdfs:subClassOf <http://data.esante.gouv.fr/whocc/atc/ATC> .
 ?uri rdfs:label ?rdfs_label .
 ?uri skos:notation ?code .
 FILTER(lang(?rdfs_label) = $lang)

 # Compte le nombre de fois que l'URI est utilisé comme valeur dans les critères construits dans Sparnatural
 OPTIONAL {
   $this $property ?uri .
 }
}
GROUP BY ?uri ?code ?rdfs_label
ORDER BY ?label""" .

# Source de données pour peupler les enfants d'un nœud, lorsqu'on clique dessus
shape:tree_atc_child a config-datasources:SparqlDatasource;
  config-datasources:queryString """PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri (CONCAT(?code, \" - \", STR(?rdfs_label)) AS ?label) ?hasChildren (COUNT($this) AS ?count)
WHERE {
 # La variable $node sera remplacée par l'URI du nœud en cours d'expansion dans l'arbre 
 ?uri rdfs:subClassOf $node .
 ?uri rdfs:label ?rdfs_label .
 ?uri skos:notation ?code .
 FILTER(lang(?rdfs_label) = $lang)

 # si les nœuds ont eux-mêmes des enfants, ils pourront être développés dans l'arbre, sinon non
 OPTIONAL { ?something rdfs:subClassOf ?uri }
 BIND(bound(?something) AS ?hasChildren)

 # Compte le nombre de fois que l'URI est utilisé comme valeur dans les critères construits dans Sparnatural
 OPTIONAL {
   $this $property ?uri .
 }

}
GROUP BY ?uri ?code ?rdfs_label ?hasChildren
ORDER BY ?label""" .  
```

### Vos propres requêtes SPARQL pour un widget Arbre

Vous pouvez fournir vos propres requêtes SPARQL pour peupler un widget arbre. Pour ce faire, vous avez besoin de 2 sources de données : une qui peuplera les racines de l'arbre (entrées au premier niveau), et une qui sera utilisée pour peupler les enfants d'un arbre, lorsqu'on clique dessus (voir les [annotations pour une SelectResourceProperty](OWL-based-configuration.md#annotations-for-a-selectresourceproperty) pour plus d'informations).

**La requête SPARQL DOIT retourner 2 variables : `?uri` et `?label`, peuplées de la manière que vous souhaitez.**
**La requête SPARQL DOIT utiliser la variable `$this` comme URI du sujet du critère actuel, si nécessaire.** 

La requête SPARQL PEUT retourner 2 autres variables :

  - **`?hasChildren`**, un booléen pour indiquer si le nœud a des enfants. Si non présent, tous les éléments de l'arbre peuvent être dépliés, même lorsqu'ils n'ont pas d'enfants ; si présent et défini à false, un élément ne peut pas être déplié. 
  - **`?count`** pour indiquer le nombre de fois qu'un nœud est utilisé comme valeur ; les nœuds avec un compte = 0 seront désactivés et ne pourront pas être sélectionnés comme valeur.
  - et elle peut retourner toute autre variable pour être affichée dans [les modèles d'arbre](templates-configuration.md), tels que des définitions, des icônes, etc.

Dans ces requêtes SPARQL, le même remplacement des variables **`$domain`**, **`$range`**, **`$property`**, etc. que dans les requêtes pour liste/autocomplétion se produira (voir ci-dessus). Les remplacements supplémentaires suivants se produiront :
- **`$node`**, si présent, sera remplacé par l'URI du nœud sur lequel on clique ;

Une requête typique qui peuplerait les variables `?hasChildren` et `?count` ressemble à ceci :

```sparql
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?uri (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) ?hasChildren (COUNT($this) AS ?count)
WHERE {

  {
    SELECT ?uri ?theLabel ?hasChildren
    WHERE {
      # Remarquez la variable $node qui peut être remplacée par l'URI du nœud sur lequel on clique
      $node skos:narrower|^skos:broader ?uri .
      ?uri skos:prefLabel ?theLabel .
      FILTER(isIRI(?uri))
      FILTER(lang(?theLabel) = '' || lang(?theLabel) = $lang)
      # teste si l'URI elle-même a des enfants pour peupler ?hasChildren
      OPTIONAL {
        ?uri skos:narrower|^skos:broader ?children .
      }
      BIND(IF(bound(?children),true,false) AS ?hasChildren)
    }
  }

  # Compte le nombre de fois que l'URI est utilisé comme valeur dans les critères construits dans Sparnatural
  OPTIONAL {
    $this a $domain .
    $this $property ?uri .
    # ici nous choisissons de ne pas utiliser le critère $range, mais il peut également être utilisé
    # ?uri a $range .
  }
}
GROUP BY ?uri ?theLabel ?hasChildren
ORDER BY UCASE(?label)
```


## Référence de configuration des sources de données

| Annotation / Axiome | Libellé | Card. | Description |
| ------------------ | ----- | ----- | ----------- |
| `queryString` | chaîne de requête | 0..1 | La chaîne de requête SPARQL de la source de données. Au moins l'un de `queryTemplate` ou `queryString` doit être fourni. |
| `queryTemplate` | modèle de requête | 0..1 | Le modèle de requête SPARQL à utiliser dans une source de données SPARQL. Au moins l'un de `queryTemplate` ou `queryString` doit être fourni. |
| `labelProperty` | propriété de libellé | 0..1 | Utilisé en combinaison avec `queryTemplate`, indique l'URI de la propriété qui remplacera la variable `$labelPath` dans la requête SPARQL. |
| `labelPath` | chemin de libellé | 0..1 | Utilisé en combinaison avec `queryTemplate` indique un chemin de propriété SPARQL qui remplacera la variable `$labelPath` dans la requête SPARQL. |
| `noSort` | pas de tri | 0..1 | Par défaut, Sparnatural trie la liste en utilisant la locale du client. Définissez ceci à `true` si vous ne souhaitez pas que ce tri ait lieu et souhaitez vous fier à l'ordre de tri retourné par la requête SPARQL. |

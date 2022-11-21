_[Accueil](/fr) > Datasources_

# Datasources

## Datasources : les bases

Comme indiqué dans la référence [Configuration OWL](OWL-based-configuration-fr-FR), les listes et les propriétés d'autocomplétion dans Sparnatural nécessitent une annotation [`ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) pour remplir respectivement la liste de valeurs ou les valeurs proposées par l'autocomplétion. Dans sa forme la plus simple et la plus courante, une datasource est essentiellement une requête SPARQL qui renvoie les colonnes attendues à utiliser pour remplir la liste/les valeurs de l'autocomplétion.

La configuration de l'annotation de la source de données peut être soit :

1. une référence à une datasource préconfigurée ;
1. une référence à une datasource préconfigurée, plus l'URI d'une propriété à injecter dans cette requête ;
1. votre propre requête SPARQL ;

Ces 3 solutions sont décrites ci-dessous.

## Les datasources préconfigurées

### Les datasources préconfigurées pour une ListProperty


Sparnatural est préconfiguré avec des datasources qui peuvent remplir des listes basées sur `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` ou l'URI de l'entité (qui est le comportement pas défaut). Pour chacune de ces propriétés, il existe trois types de datasources : soit un classement alphabétique, soit un classement alphabétique avec le compte indiqué entre parenthèses, soit un classement par ordre décroissant.

Utilisez l'une de ces sources de données si vos données RDF reposent sur l'une de ces propriétés.

Les identifiants des datasources préconfigurées pour une ListProperty sont :

1. [`datasources:list_URI_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_alpha) et [`datasources:list_URI_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_count)
1. [`datasources:list_rdfslabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha) et [`datasources:list_rdfslabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_count) et [`datasources:list_rdfslabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_rdfslabel_alpha_with_count)
1. [`datasources:list_skospreflabel_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha) et [`datasources:list_skospreflabel_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_count) et [`datasources:list_skospreflabel_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_skospreflabel_alpha_with_count)
1. [`datasources:list_foafname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha) et [`datasources:list_foafname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_count) et [`datasources:list_foafname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_foafname_alpha_with_count)
1. [`datasources:list_dctermstitle_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha) et [`datasources:list_dctermstitle_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_count) et [`datasources:list_dctermstitle_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_dctermstitle_alpha_with_count)
1. [`datasources:list_schemaname_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha) et [`datasources:list_schemaname_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_count) et [`datasources:list_schemaname_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_schemaname_alpha_with_count)

Vous pouvez trouver ces identifiants dans Protégé quand vous créez l'annotation [`ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) sous les onglets "Entity IRI", puis "Individuals" :

![Screenshot Protégé datasources](/assets/images/protege-screenshot-datasources-1.png)

### Les datasources préconfigurées pour une AutocompleteProperty

Sparnatural est préconfiguré avec des datasources qui peuvent remplir des champs d'autocomplétion basés sur `rdfs:label`, `skos:prefLabel`, `foaf:name`, `dcterms:title`, `schema:name` ou l'URI de l'entité (qui est le comportement pas défaut). Pour chacune de ces propriétés, il existe trois types de datasources : soit en cherchant au début de la valeur avec `strstarts()`, soit en cherchant n'importe où dans la valeur avec `contains()` ou en utilisant la fonction `bif:contains()` spécifique à Virtuoso. De plus, une datasource de recherche peut aussi rechercher sur l'URI en utilisant la fonction `contains()`, ce qui est le comportement par défaut.

Les identifiants des datasources préconfigurées pour une AutocompleteProperty sont :

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

De même que pour les datasources des listes, vous trouvez ces identifiants sous l'onglet "Entity IRI" > "Individuals" de Protégé quand vous éditez l'annotation `ds:datasource` :

![Screenshot Protégé datasources](/assets//images/protege-screenshot-datasources-2.png)


## Requête SPARQL préconfigurée avec une autre propriété

### Comment créer votre propre datasource à partir d'une requête SPARQL existante mais en utilisant une autre propriété ?

Si les datasources préconfigurées ne correspondent pas au modèle de données à interroger, vous avez la possibilité de vous référer aux mêmes requêtes SPARQL que celles utilisées par ces datasources, mais en ajustant la propriété à rechercher ou à utiliser comme label. Pour ce faire, vous devez créer un nouvel individu dans Protégé, de type `SparqlDatasource`, et de fournir deux informations : 


1. dans le champ "Object property assertion" de Protégé, une référence `queryTemplate` à l'un des modèles de requêtes SPARQL préconfigurés, à savoir :
   1. [`datasources:query_list_label_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha)
   1. [`datasources:query_list_label_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_count)
   1. [`datasources:query_list_label_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_alpha_with_count)
   1. [`datasources:query_list_label_with_range_alpha`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha)
   1. [`datasources:query_list_label_with_range_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_count)
   1. [`datasources:query_list_label_with_range_alpha_with_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_label_with_range_alpha_with_count)
   1. [`datasources:query_search_label_strstarts`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_strstarts)
   1. [`datasources:query_search_label_bifcontains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_label_bifcontains)
1. et une référence à l'une de ces deux annotations (dans la section "Annotations" de Protégé):
   1. [`datasources:labelProperty`](http://data.sparna.fr/ontologies/)
   1. [`datasources:labelProperty`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelProperty) avec l'IRI de la propriété de label à utiliser
   1. [`datasources:labelPath`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#labelPath) avec le property path SPARQL à utiliser (en utilisant des crochets, sans préfixe) pour récupérer le label des entités. Cela permet notamment de traiter les situations où les labels sont réifiés comme des entités séparées.

Par exemple, pour créer une nouvelle datasource personnalisée utilisant `dc:title` comme label, et un ordre alphabétique, faites comme ceci :

![Screencast Protégé custom datasource](/assets//images/screencast-protege-custom-datasource-1.gif)

### Requêtes sans portée (range)/ requêtes avec portée (range)

Les requêtes fournies pour remplir les listes n'utilisent **pas** la portée de la valeur comme critère dans la requête. En d'autres termes, toutes les valeurs d'une propriété donnée dans un domaine donné sont retournées, indépendamment de leur type.
C'est généralement suffisant et plus performant, mais cela peut poser un problème si une même propriété dans un même domaine peut faire référence à des entités de type différent dans la configuration de Sparnatural. Par exemple "Document > créateur > Personne ou Organisation".

Pour utiliser la portée comme critère dans la requête et filtrer la liste en fonction du type de la valeur, créez une datasource basée sur une requête incluant "..._with_range_..." dans son identifiant. Cela garantira que seules les valeurs du type sélectionné apparaîtront dans la liste.


## Votre propre requête SPARQL

Vous pouvez fournir vos propres requêtes SPARQL pour alimenter les listes ou les suggestions d'autocomplétion. Pour ce faire, assignez à votre datasource une "data property assertion" de type `queryString` contenant la requête SPARQL qui doit être utilisée pour remplir la liste/l'autocomplétion.

**La requête SPARQL DOIT retourner 2 variables : `?uri` et `?label`, alimentées comme vous le souhaitez.**

Dans cette requête SPARQL, les remplacements suivants auront lieu :
- **`$domain`**, si présent, sera remplacé par l'URI de la classe du domaine ;
- **`$range`**, si présent, sera remplacé par l'URI de la classe de la portée ;
- **`$property`**, si présent, sera remplacé par l'URI de la propriété ;
- **`$lang`**, si présent, sera remplacé par la langue de configuration de Sparnatural ;
- **`$key`**, si présent, sera remplacé par la chaîne recherchée pour les champs d'autocomplétion ;

Jetez un coup d'œil aux requêtes SPARQL préconfigurées sur [Sparnatural datasources ontology](http://data.sparna.fr/ontologies/sparnatural-config-datasources) pour vous aider à démarrer.

Voici un exemple d'une telle requête : (notez l'utilisation des variables de substitution qui seront remplacées par les valeurs correspondantes):

```
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
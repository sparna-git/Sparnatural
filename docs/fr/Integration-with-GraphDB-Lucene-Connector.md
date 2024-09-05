_[Accueil](index.html) > Intégration avec le connecteur Lucene de GraphDB_

# Intégration avec le connecteur Lucene de GraphDB

## Introduction

GraphDB propose une intégration avec Lucene en utilisant le [connecteur Lucene de GraphDB](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html). Ce connecteur permet de créer de puissants index de texte intégral des propriétés de texte dans le graphe, et d'écrire des requêtes qui combinent à la fois des critères de texte intégral et de graphe, tels que _"Donnez-moi la liste des musées qui exposent une œuvre d'art dont le titre contient le mot 'paix'"_

Sparnatural peut être intégré à un tel index Lucene de GraphDB à la fois pour alimenter les champs d'autocomplétion et également pour la génération de requêtes SPARQL comme décrit ci-dessous.

## Créer l'index

Reportez-vous à la [documentation du connecteur Lucene de GraphDB](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html) pour plus de détails. Voici l'idée :

1. Déterminez l'URI de la classe pour laquelle vous souhaitez construire l'index ;
2. Énumérez chaque propriété littérale ou chemin à stocker dans l'index ;
    - Typiquement des libellés, des noms, des titres, des définitions, des résumés, etc.
    - mais aussi la littérale des _entités liées_ dans le graphe, tels que le nom du lieu où un événement a eu lieu, le nom de l'auteur d'une œuvre, les libellés de concepts de sujet, etc.
    - Chacune de ces propriétés ou chemin ira dans un champ séparé de l'index ;
3. Créez un champ "catchAll" nommé `text` qui concaténera chaque autre champ en un seul ;
4. Définissez une _langue_ et un _analyseur_ personnalisés si vous avez besoin d'avoir un indexation liée à la langue telle que le pliage des accents en français ;

## Exemple : créer un index sur les concepts SKOS en français

### Créer des champs individuels

1. Dans GraphDB Workbench, allez à "Configuration > Connecteurs", et créez un nouveau connecteur Lucene ;
2. Définissez son nom sur `ConceptIndex`
3. Dans le champ des langues, saisissez `fr`
3. Dans le champ "Types", saisissez l'URI complet pour indexer tous les concepts SKOS : http://www.w3.org/2004/02/skos/core#Concept
4. Remplissez l'entrée "Champs" pour indexer les `skos:prefLabel`s :
    - Nom du champ = prefLabel
    - Chaîne de propriété = http://www.w3.org/2004/02/skos/core#prefLabel
    - Décochez la case "facet"

![](/assets/images/graphdb-lucene-01.png)

5. Ajoutez une nouvelle entrée "Field" en cliquant sur le "+" à droite, cette fois pour les `skos:altLabel`s :
    - Nom du champ = altLabel
    - Chaîne de propriétés = http://www.w3.org/2004/02/skos/core#altLabel
    - Décochez la case "facet"
6. Répétez pour `skos:hiddenLabel` si nécessaire
7. `skos:definition` si nécessaire
8. `skos:scopeNote` si nécessaire
9. `skos:example` si nécessaire

### Créer un champ de regroupement

Ensuite, nous devons créer un nouveau champ `text` qui va agréger le contenu de tous les autres champs. Pour ce faire, déclarez un nouveau "champ virtuel" nommé `text/prefLabel` pour indiquer que le contenu ou le champ `prefLabel` doit être copié dans le champ `text` (reportez-vous aux parties sur [copy-fields](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html#copy-fields) combinées avec [multiple property paths](http://graphdb.ontotext.com/documentation/free/lucene-graphdb-connector.html#multiple-property-chains-per-field) par champ pour plus de détails) :
1. Créez un nouveau champ nommé `text/prefLabel`
2. Dans le chemin de propriété, saisissez `@prefLabel`; cela doit correspondre au nom de l'un des champs créés précédemment, donc si vous avez choisi des noms différents, ajustez en conséquence ;
3. Décochez "facet"
4. Répétez en ajoutant à nouveau un nouveau champ, nommé `text/altLabel` et chemin de propriété `@altLabel`
5. Répétez avec `text/hiddenLabel` et chemin de propriété `@hiddenLabel`
6. Répétez avec `text/definition` et chemin de propriété `@definition`
7. Répétez avec `text/scopeNote` et chemin de propriété `@scopeNote`
8. Répétez avec `text/example` et chemin de propriété `@example`

Voici à quoi ressemble cette partie :

![](/assets/images/graphdb-lucene-02.png)

### Définir la langue et l'analyseur

- Dans le champ `Languages`, définissez la valeur `fr`
- Dans le champ `Analyzer`, saisissez la valeur de l'analyseur français Lucene `org.apache.lucene.analysis.fr.FrenchAnalyzer`. Si vous ne le faites pas, la recherche sera sensible aux accents (par exemple, une recherche sur "metal" ne correspondra pas à "métal");

### Tester une requête SPARQL

Testez une recherche SPARQL comme suit :

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

## Alimenter un champ d'autocomplétion dans Sparnatural avec SPARQL en utilisant GraphDB Lucene Connector

Le principe est le suivant :
1. Comme indiqué dans la [documentation de configuration Sparnatural pour vos propres requêtes](JSON-based-configuration#your-own-sparql-query), la requête SPARQL DOIT renvoyer 2 variables : `?uri` et `?label`;
2. Définissez une chaîne de requête SPARQL personnalisée pour la définition du champ d'autocomplétion, en utilisant des opérateurs spéciaux `:query` pour interroger l'index;
3. Ajoutez un "*" après la clé de recherche pour rechercher le début des mots;
4. Interrogez le champ de recherche général, donc `text` dans notre cas;
5. Générez une variable `label` en concaténant le prédicat skos:prefLabel de l'entité avec son extrait des résultats de la recherche

Voici un exemple de requête :

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

Et voici une requête intégrée dans une [configuration JSON-LD de Sparnatural](JSON-based-configuration). Notez comment elle utilise les espaces réservés `$domain`, `$range`, `$property`, `$key` et `$lang` qui sont remplacés au moment de la requête par des valeurs réelles :

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

## Intégration avec la génération de requêtes SPARQL

Vous pouvez configurer Sparnatural pour générer des requêtes SPARQL qui interrogeront l'index de texte intégral. Pour ce faire :
1. Créez une classe dans la configuration Sparnatural **avec l'URI de l'index**, par exemple `http://www.ontotext.com/connectors/lucene/instance#ConceptIndex`. Créez cette classe en tant que `subClassOf http://www.w3.org/2000/01/rdf-schema#Literal`, et donnez-lui un libellé tel que "Recherche en texte intégral...";
2. Créez des propriétés qui correspondent aux **champs de l'index**. Les URI des propriétés **doivent se terminer par le nom du champ de l'index, après le dernier "#" ou la dernière "/"**. Par exemple, `http://labs.sparna.fr/sparnatural-demo-graphdb-openarchaeo/onto/search#discovery` interrogera le champ `discovery`;
3. Définissez la propriété comme `subPropertyOf sparnatural:GraphDBSearchProperty`; ce paramètre indique à Sparnatural que la requête à générer doit utiliser la syntaxe GraphDB et non la syntaxe FILTER habituelle;
4. Créez plusieurs propriétés pour chaque champ de l'index, afin que l'utilisateur puisse choisir le champ à interroger.

Voici un exemple de configuration avec 2 propriétés configurées pour interroger les champs `commune` et `discovery`, et une troisième propriété nommée "tous les champs" pour interroger le champ de recherche général :
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

Ce qui donnera le comportement suivant pour l'utilisateur final :

![](/assets/images/graphdb-lucene-03.png)

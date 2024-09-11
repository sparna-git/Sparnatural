_[Accueil](index.html) > Widgets_

# Widgets Sparnatural

Il s'agit d'une documentation de référence pour les widgets Sparnatural.


-----


## Widget de liste

### Apparence

|  Exemple  | Description |
| -----   | ----------- |
| <img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-basic.png" width="75%" /> | Apparence typique d'un widget de liste, permettant de sélectionner une valeur d'URI, affichée avec un libellé et un nombre d'occurrences, ordonnées par nombre décroissant d'occurrences |
| <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-literals.png" width="75%" /> | Affichage des valeurs littérales uniquement (le type EDM est une valeur littérale) |
| <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-mix-literal-URIs.png" width="75%" /> | Affichage d'un mélange de valeurs littérales et d'URIs |
| <img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-literals.png" width="75%" /> | Liste des valeurs d'URI avec un libellé listé par ordre alphabétique |
| TODO | Listing des valeurs en utilisant optgroup |


### Description

Les widgets de liste permettent de sélectionner une valeur dans une liste déroulante. Ils sont adaptés si la liste des valeurs distinctes est de taille limitée (typiquement moins de 500 éléments). Le widget fournit une liste déroulante combinée avec un champ de filtrage/recherche pour rechercher dans le contenu de la liste. Le champ de saisie pour rechercher dans la liste n'apparaît pas si la liste est très petite, moins de 20 éléments.
Le widget de liste est implémenté en utilisant le [composant select2 JQuery](https://select2.org/).

Les widgets de liste peuvent fonctionner à la fois avec des URIs + des libellés, ou avec des valeurs littérales. Ils peuvent même mélanger des URIs et des littéraux dans la même liste.

L'ordre de tri des éléments dans la liste, ainsi que leurs libellés précis, dépend de la requête SPARQL sous-jacente qui peuple la liste. Sparnatural fournit des [sources de données par défaut](http://docs.sparnatural.eu/OWL-based-configuration-datasources.html#preconfigured-datasources-for-a-listproperty) qui peuvent être ordonnées alphabétiquement, alphabétiquement en montrant le nombre d'occurrences entre parenthèses, ou ordonnées par nombre décroissant d'occurrences.

Les widgets prennent en charge `optgroup` pour regrouper les valeurs en sections. Le regroupement est également fourni par la requête SPARQL, et est utilisé en particulier lors de [l'interrogation de plusieurs points de terminaison](Querying-multiple-endpoints).

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:ListProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty)

### Sources de données

La liste des URI ainsi que leurs libellés doit être [configurée à l'aide d'une source de données SPARQL](http://docs.sparnatural.eu/OWL-based-configuration-datasources.html#preconfigured-datasources-for-a-listproperty).

La source de données par défaut utilisée est [`datasources:list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#list_URI_or_literal_count), reposant elle-même sur la requête SPARQL [`datasources:query_list_URI_or_literal_count`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_list_URI_or_literal_count)

### Génération SPARQL

Si une seule valeur est sélectionnée, la valeur est insérée directement en tant qu'objet triple :

```sparql
  ?Museum_1 <http://dbpedia.org/ontology/country> <http://fr.dbpedia.org/resource/France>.
```

Si plus d'une valeur est sélectionnée, ou si la variable correspondante est sélectionnée pour inclusion dans l'ensemble de résultats, alors un mot-clé `VALUES` est utilisé :

Avec plus d'une valeur :

```sparql
  ?Museum_1 <http://dbpedia.org/ontology/country> ?Country_2.
  VALUES ?Country_2 {
    <http://fr.dbpedia.org/resource/France>
    <http://fr.dbpedia.org/resource/Italie>
  }
}
```

ou avec la variable sélectionnée :

```sparql
SELECT DISTINCT ?Museum_1 ?Country_2 WHERE {
  ?Museum_1 <http://dbpedia.org/ontology/country> ?Country_2.
  VALUES ?Country_2 {
    <http://fr.dbpedia.org/resource/France>
  }
}
```


-----


## Widget d'autocomplétion

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/autocomplete-widget.png" />

### Description

Le widget d'autocomplétion permet de sélectionner une URI en tapant quelques lettres, et en sélectionnant une valeur dans une liste de propositions. La recherche est déclenchée lorsque au moins 3 caractères ont été saisis. La recherche est effectuée sur une ou plusieurs propriétés configurées dans la source de données du widget (il peut être configuré pour rechercher sur le libellé préféré ainsi que sur les synonymes, acronymes, identifiants, etc.).
L'autocomplétion fonctionne également pour la recherche sur des valeurs littérales.
Le widget d'autocomplétion est implémenté en se basant sur la bibliothèque [awesomeplete](https://projects.verou.me/awesomplete/).

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:AutocompleteProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#AutocompleteProperty)

### Sources de données

La liste des propositions affichées à l'utilisateur doit être [configurée à l'aide d'une source de données SPARQL](http://docs.sparnatural.eu/OWL-based-configuration-datasources.html#preconfigured-datasources-for-an-autocompleteproperty).
La source de données par défaut utilisée est [`datasources:search_URI_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_URI_contains), elle-même reposant sur la requête SPARQL [`datasources:query_search_URI_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_URI_contains). Si la plage est un littéral, la source de données par défaut est [`datasources:search_literal_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#search_literal_contains), elle-même reposant sur la requête SPARQL [`datasources:query_search_literal_contains`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#query_search_literal_contains)

### Clause SPARQL

La logique de génération de requête SPARQL est identique à celle du ListWidget (voir ci-dessus).


-----

## Widget arborescent

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/17-tree.png" />

### Description

Le widget arborescent permet de sélectionner des entités à partir d'un arbre de valeurs, généralement un ConceptScheme SKOS. Un maximum de 3 valeurs peut être sélectionné. Le comportement typique est que l'arbre complet est toujours affiché, même avec les valeurs qui ne sont jamais utilisées, qui apparaîtront désactivées et ne pourront pas être sélectionnées.
Le widget arborescent est implémenté en utilisant la [bibliothèque JS tree](https://www.jstree.com/).

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:TreeProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#TreeProperty)

### Sources de données

Un widget arborescent nécessite 2 sources de données :
- Une pour lister les nœuds racines à afficher (au premier niveau).
- Une pour lister les enfants d'un nœud, lorsqu'un nœud est cliqué.

Le datasource racine est configuré en utilisant l'annotation [`datasources:treeRootsDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeRootsDatasource). Le datasource par défaut utilisé si aucun n'est indiqué est [`datasources:tree_root_skostopconcept`].
Le datasource des enfants est configuré en utilisant l'annotation [`datasources:treeChildrenDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeChildrenDatasource). Le datasource par défaut utilisé si aucun n'est indiqué est [`datasources:tree_children_skosnarrower`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tree_children_skosnarrower).

### Clause SPARQL

La logique de génération de requête SPARQL est identique à celle du ListWidget (voir ci-dessus). Cependant, veuillez noter qu'il est attendu que les widgets Tree soient configurés sur des propriétés qui utilisent un chemin de propriété SPARQL "*", indiquant que la recherche est effectuée de manière récursive sur le nœud sélectionné mais aussi sur tous ses enfants. Un chemin de propriété SPARQL typique configuré sur une propriété associée à un widget arborescent est `<http://purl.org/dc/terms/subject>/(<http://www.w3.org/2004/02/skos/core#broader>|^<http://www.w3.org/2004/02/skos/core#narrower>)*` : notez comment il recherche une connexion en utilisant le prédicat `dcterms:subject`, étendu soit à un `skos:broader` soit à l'inverse de `skos:narrower` jusqu'au nœud sélectionné dans l'arborescence.

## Widget de recherche de chaîne de caractères

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/11-search.png" />

### Description

Le widget de recherche permet simplement d'entrer des caractères qui seront recherchés, en utilisant différentes techniques (voir ci-dessous), soit en utilisant une expression régulière, soit des fonctions de recherche de texte intégral personnalisées.

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:SearchProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#SearchProperty), **ou l'une de ses sous-propriétés**, qui influencera la logique de génération SPARQL (voir ci-dessous).

### Datasources

Aucun datasource requis.

### Clause SPARQL

La clause SPARQL générée dépend de la super-propriété exacte utilisée lors de la configuration de la propriété :

**SearchProperty**

La chaîne sera recherchée en utilisant une fonction `regex`.

```sparql
FILTER(REGEX(STR(?Text_6), "picasso", "i"))
```

**StringEqualsProperty**

La chaîne sera recherchée de manière exacte, insensible à la casse. Cela est utile lors de la recherche d'identifiants exacts.

```sparql
FILTER((LCASE(?Cote_1)) = (LCASE("ABC")))
```

**GraphDBSearchProperty**

La chaîne sera recherchée en utilisant le connecteur Lucene propriétaire de GraphDB. Assurez-vous de suivre la [documentation supplémentaire](http://docs.sparnatural.eu/Integration-with-GraphDB-Lucene-Connector.html) fournie pour cela, car cela impose certaines conventions de nommage sur l'URI de la classe de plage et de la propriété.

**VirtuosoSearchProperty**

La chaîne sera recherchée en utilisant l'opérateur `bif:contains` propriétaire de Virtuoso.


-----

## Widget de plage de dates

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/12-time-date.png" />

### Description

Permet d'exprimer une plage de dates à rechercher, en utilisant une date de début et une date de fin sélectionnées à partir de calendriers. Les plages ouvertes sont autorisées (seulement la date de début ou seulement la date de fin).
Le widget de plage de dates est implémenté en utilisant [@chenfengyuan/datepicker](https://fengyuanchen.github.io/datepicker/).

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:TimeProperty-Date`](http://data.sparna.fr/ontologies/sparnatural-config-core#TimeProperty-Date).
De plus, si les entités dans le graphe de connaissances sont associées à une plage de dates et éventuellement une date exacte, et que vous souhaitez tester si la plage de dates recherchée chevauche la plage de dates des entités, vous pourriez utiliser les propriétés [`config-core:beginDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#beginDateProperty), [`config-core:endDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#endDateProperty) et éventuellement [`config-core:exactDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#exactDateProperty) pour indiquer respectivement les URI utilisés pour exprimer la date de début, la date de fin et la date exacte sur les entités. Plus de détails peuvent être trouvés dans la [documentation détaillée de la fonction de requête de plage de dates](http://docs.sparnatural.eu/Querying-date-ranges.html).

### Sources de données

Aucune source de données requise.

### Clause SPARQL

```sparql
FILTER(((xsd:dateTime(?Date_2)) >= "1948-06-12T23:00:00Z"^^xsd:dateTime) && ((xsd:dateTime(?Date_2)) <= "1948-12-31T22:59:59Z"^^xsd:dateTime))
```

Pour des requêtes avancées sur les plages de dates, consultez la [documentation détaillée](http://docs.sparnatural.eu/Querying-date-ranges.html).


-----


## Widget de plage d'années

### Apparence



### Description

Permet d'exprimer une plage d'années à rechercher, en utilisant une année de début et une année de fin. Les plages ouvertes sont autorisées (seule l'année de début ou seule l'année de fin).
Le widget de plage d'années est implémenté en utilisant [@chenfengyuan/datepicker](https://fengyuanchen.github.io/datepicker/), configuré pour n'utiliser que les années.

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:TimeProperty-Year`](http://data.sparna.fr/ontologies/sparnatural-config-core#TimeProperty-Year).

### Sources de données

Aucune source de données requise.

### Clause SPARQL

```sparql
FILTER((xsd:dateTime(?Date_2)) >= "2017-12-31T23:00:01Z"^^xsd:dateTime)
```

(ici avec seulement une année de début). Remarquez comment la valeur est explicitement convertie en xsd:dateTime.


-----


## Widget de nombre

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/19-number.png" />

### Description

Permet de sélectionner une plage de nombres, avec une limite inférieure et une limite supérieure.
Peut limiter la plage des champs de saisie en fonction du type de données indiqué dans la configuration SHACL (par exemple, xsd:byte sera limité entre -127 et 128).

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:NumberProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#NumberProperty).

### Sources de données

Aucune source de données requise.

### Clause SPARQL

Avec une limite inférieure et supérieure :

```sparql
  FILTER((?Number_2 >= "1"^^xsd:decimal) && (?Number_2 <= "1000"^^xsd:decimal))
```

Avec seulement une limite inférieure :

```sparql
   FILTER(?Number_2 >= "11"^^xsd:decimal)
```

Avec seulement une limite supérieure :

```sparql
   FILTER(?Number_2 <= "11"^^xsd:decimal)
```


-----


## Widget booléen

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/15-boolean.png" />

### Description

Permet de sélectionner une valeur booléenne "true" ou "false".

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:BooleanProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#BooleanProperty).

### Sources de données

Aucune source de données requise.

### Clause SPARQL

`TODO`


-----


## Widget Carte

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/18-map.png" />

### Description

Permet de sélectionner un rectangle sur une carte, et génère une requête GeoSPARQL correspondante, en utilisant une fonction `geof:sfWithin`. Cela implique que les données dans le triplestore doivent être encodées avec des valeurs littérales en utilisant le datatype `<http://www.opengis.net/ont/geosparql#wktLiteral>`, comme dans cet exemple (il s'agit d'un petit extrait de Wikidata, bien sûr vous pouvez utiliser différents prédicats, l'important est l'utilisation de `^^geo:wktLiteral` :

```turtle
@prefix geo: <http://www.opengis.net/ont/geosparql#> .
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix wdt: <http://www.wikidata.org/prop/direct/> .

wd:Q16214 wdt:P31 wd:Q484170 ;
  wdt:P625 "Point(4.613611111 47.098055555)"^^geo:wktLiteral ;
  wdt:P1448 "Bessey-la-Fontaine"@fr .

wd:Q16233 wdt:P31 wd:Q484170 ;
  wdt:P625 "Point(4.673611111 47.091111111)"^^geo:wktLiteral ;
  wdt:P1448 "Lusigny-sur-Ouche"@fr .

wd:Q16213 wdt:P31 wd:Q484170 ;
  wdt:P625 "Point(4.624444444 47.123611111)"^^geo:wktLiteral ;
  wdt:P1448 "Auxant"@fr .
```

Les littéraux WKT peuvent être utilisés pour encoder des points ou des polygones. Les littéraux WKT peuvent également inclure une IRI facultative avant la géométrie pour indiquer le système de référence (voir l'exemple de la spécification : `"<http://www.opengis.net/def/crs/EPSG/0/4326> Point(33.95 -83.38)"^^<http://www.opengis.net/ont/geosparql#wktLiteral>`)

Pour plus d'informations sur les littéraux WKT, consultez la [page Wikipedia](https://fr.wikipedia.org/wiki/Well-known_text), et la [spécification GeoSPARQL](https://opengeospatial.github.io/ogc-geosparql/geosparql11/spec.html#geo:wktLiteral).

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:MapProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#MapProperty).

### Sources de données

Aucune source de données requise.

### Clause SPARQL

```sparql
    ?MuseumWikidata_2 <http://www.wikidata.org/prop/direct/P625> ?Map_4.
    FILTER(<http://www.opengis.net/def/function/geosparql/sfWithin>(?Map_4, "Polygon((6.113179202657193 46.196063994634265, 6.113179202657193 46.21649770912313, 6.149914737325163 46.21649770912313, 6.149914737325163 46.196063994634265, 6.113179202657193 46.196063994634265))"^^<http://www.opengis.net/ont/geosparql#wktLiteral>))
```

-----


## Aucun widget de sélection

### Apparence

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/readme/13-no-value.png" />

### Description

Désactive complètement la possibilité pour l'utilisateur de sélectionner une valeur. Seule l'option "où" est active pour "traverser" cette entité. Cela est utile pour montrer des nœuds intermédiaires à l'utilisateur sans permettre une sélection sur une étiquette, mais uniquement sur d'autres propriétés attachées à ce nœud. C'est généralement utile pour les modèles basés sur des événements comme le CIDOC-CRM où les événements ne sont généralement pas sélectionnables en eux-mêmes mais servent à connecter d'autres propriétés.

### Configuration

Dans la configuration OWL, déclarez une sous-propriété de [`config-core:NonSelectableProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#NonSelectableProperty).

### Sources de données

Aucune source de données requise.

### Clause SPARQL

Aucun SPARQL généré.

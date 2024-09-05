_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Configuration basée sur OWL

Sparnatural peut être configuré à l'aide d'un fichier OWL édité dans [Protégé](http://protege.stanford.edu) et enregistré en Turtle.

Sparnatural peut également être configuré avec une [configuration basée sur JSON](JSON-based-configuration), mais la configuration basée sur OWL apporte :
- un environnement d'édition (Protégé);
- des liens formels lisibles par machine de la configuration Sparnatural à l'ontologie métier;
- le partage, la publication et la réutilisation des configurations;
- l'hébergement de la configuration sur des serveurs différents (activés pour CORS) de celui où Sparnatural est déployé;


## Ontologies de configuration Sparnatural

Sparnatural est livré avec 2 ontologies qui doivent être importées (via `owl:imports`) dans votre propre ontologie de configuration :
1. Une ontologie de configuration de base à [http://data.sparna.fr/ontologies/sparnatural-config-core](http://data.sparna.fr/ontologies/sparnatural-config-core)
2. Une ontologie de configuration de source de données à [http://data.sparna.fr/ontologies/sparnatural-config-datasources](http://data.sparna.fr/ontologies/sparnatural-config-datasources)

## Comment définir et tester votre propre configuration ?

### Prérequis

- Vous devez être familier avec Protégé.
- Vous devez connaître l'URL du point de terminaison SPARQL contenant vos données, soit localement sur votre machine, soit sur un serveur distant

### Configuration de votre environnement

Suivez les étapes du [guide de démarrage Hello Sparnatural](hello-sparnatural/Hello-Sparnatural.md). Cela vous permettra de :
    - configurer CORS sur votre environnement local
    - commencer avec une ontologie de configuration OWL minimale
    - configurer une page de test où vous pouvez tester votre configuration par rapport à votre point de terminaison

## Comment publier votre configuration

1. Si votre configuration est hébergée sur le même serveur que le composant Sparnatural, il n'y a rien de spécial à faire, il suffit de mettre l'ontologie de configuration dans un fichier généralement dans le même dossier que la page HTML dans laquelle Sparnatural est utilisé.
2. Si la configuration n'est pas sur le même serveur que la page dans laquelle Sparnatural est inséré, elle doit être [activée pour CORS](https://enable-cors.org/); un moyen facile de le faire est de l'héberger dans un dépôt Github ou Gist;
3. Fournissez l'URL de votre ontologie de configuration dans la configuration Sparnatural. Pour un fichier hébergé sur Github, il doit s'agir du lien "raw" vers le fichier, c'est-à-dire le lien renvoyant le fichier turtle, par exemple https://raw.githubusercontent.com/sparna-git/Sparnatural/master/demos/sparnatural-demo-semapps/sparnatural-config-semapps-meetup.ttl

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

## Référence pour les classes et propriétés d'une configuration Sparnatural

### Espaces de noms

| Préfixe | Espaces de noms |
| ------- | -------------- |
| core    | http://data.sparna.fr/ontologies/sparnatural-config-core# |
| ds      | http://data.sparna.fr/ontologies/sparnatural-config-datasources# |

### Référence de configuration des classes

| Annotation / Axiome | Libellé | Card. | Description |
| ------------------- | ------ | ----- | ----------- |
| `rdfs:subClassOf` [`core:SparnaturalClass`](http://data.sparna.fr/ontologies/sparnatural-config-core#SparnaturalClass) | sous-classe de la classe Sparnatural | 1..1 | Chaque classe de la configuration doit être déclarée comme sous-classe de core:SparnaturalClass |
| `rdfs:label` | libellé d'affichage de la classe | 1..* | Le libellé d'affichage de la classe dans les listes de sélection de classes Sparnatural. Chaque libellé peut être associé à un code de langue. Sparnatural choisira le libellé approprié en fonction de son paramètre de configuration de langue. Sparnatural utilise par défaut un libellé sans langue si aucun libellé dans la langue configurée ne peut être trouvé. |
| [`core:faIcon`](http://data.sparna.fr/ontologies/sparnatural-config-core#faIcon) | code icône fontawesome | 0..1 | Le code d'une icône Font Awesome à afficher à côté du libellé de la classe, par exemple `fas fa-user` ou `fad fa-male`. Si vous utilisez ceci, ne spécifiez pas `core:icon` ou `core:highlightedIcon` |
| [`core:icon`](http://data.sparna.fr/ontologies/sparnatural-config-core#icon) | URL de l'image de l'icône | 0..1 | URL d'une icône normale (noire) à afficher à côté du libellé de la classe. |
| [`core:highlightedIcon`](http://data.sparna.fr/ontologies/sparnatural-config-core#highlightedIcon) | URL de l'image de l'icône mise en surbrillance | 0..1 | URL d'une icône mise en surbrillance (blanche) à afficher à côté du libellé de la classe lors du survol. |
| [`core:sparqlString`](http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString) | Chaîne SPARQL | 0..1 | La chaîne de caractères qui sera insérée dans les requêtes SPARQL à la place de l'URI de cette classe. Si cela n'est pas spécifié, l'URI de la classe est insérée. N'utilisez pas de préfixes, utilisez des URIs complètes. La chaîne de caractères peut être n'importe quel morceau de SPARQL valide, donc elle DOIT utiliser `<` et `>`, par exemple "`<http://dbpedia.org/ontology/Person>`". Pour se restreindre à un ConceptScheme SKOS spécifique, utilisez `skos:Concept; [ skos:inScheme <http://exemple.fr/MyScheme> ]` |
| `rdfs:subClassOf` [`rdfs:Literal`](http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#http://www.w3.org/2000/01/rdf-schema#Literal) | sous-classe de Littéral | 0..1 | Pour les classes qui correspondent soit à un Littéral (typiquement une date), soit à une recherche, définissez la classe comme sous-classe de `rdfs:Literal`. 1. Aucun critère rdf:type correspondant à cette classe ne sera inclus dans les requêtes SPARQL 2. La classe n'apparaîtra jamais dans la liste initiale des classes 3. il ne sera pas possible de parcourir cette classe avec des clauses WHERE |
| `rdfs:subClassOf` [`core:NotInstantiatedClass`](http://data.sparna.fr/ontologies/sparnatural-config-core#NotInstantiatedClass) | sous-classe de NotInstantiatedClass | 0..1 | Pour les classes qui sont des références à des URI "externes" qui ne sont pas eux-mêmes décrits dans le graphe (c'est-à-dire qu'ils ne sont pas le sujet de triples dans le graphe, en particulier aucun rdf:type), définissez la classe comme sous-classe de `core:NotInstantiatedClass`. 1. Aucun critère rdf:type correspondant à cette classe ne sera inclus dans les requêtes SPARQL 2. La classe n'apparaîtra jamais dans la liste initiale des classes. Elle peut toujours être utilisée pour être parcourue dans une clause WHERE |
| [`core:order`](http://data.sparna.fr/ontologies/sparnatural-config-core#order) | ordre | 0..1 | Ordre de cette classe dans les listes de classes. Si non défini, l'ordre alphabétique est utilisé. |
| [`core:tooltip`](http://data.sparna.fr/ontologies/sparnatural-config-core#tooltip) | info-bulle | 0..n | Texte qui apparaît en tant qu'info-bulle lors du survol de cette classe, dans les listes et lorsqu'elle est sélectionnée. Plusieurs valeurs sont autorisées dans différentes langues. Le balisage HTML est pris en charge. |
| [`core:defaultLabelProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#defaultLabelProperty) | propriété de libellé par défaut | 0..1 | Utilisez cette annotation pour relier une classe dans une configuration Sparnatural à une propriété qui sera utilisée par défaut pour récupérer les libellés des instances de cette classe. Lorsqu'un utilisateur sélectionne cette classe comme colonne dans le jeu de résultats, si la classe a cette annotation définie, tout se comporte comme si l'utilisateur avait également sélectionné la propriété correspondante à inclure. Le nom de la variable de libellé est `xxx_label`, où `xxx` est le nom de la variable contenant les instances de classe : par exemple si `foaf:Personne` est sélectionné dans la variable `?Personne_4`, et qu'il est annoté avec une propriété de libellé par défaut définie sur `foaf:nom`, alors les valeurs de cette propriété seront incluses dans la variable `?Personne_4_label`. La propriété de libellé peut ne pas avoir de domaine spécifié si vous ne voulez pas qu'elle soit affichée à l'utilisateur. La propriété doit avoir une plage spécifiée à une seule classe. |

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

### Référence de configuration des propriétés


#### Annotations communes (applicables à toutes les propriétés)

| Annotation / Axiome | Étiquette | Card. | Description |
| ------------------ | ----- | ----- | ----------- |
| `rdfs:subPropertyOf` | sous-propriété de | 1..1 | Chaque propriété doit avoir une super-propriété correspondant à son type de widget (liste, champ de recherche, sélecteur de date, etc.). Les valeurs typiques sont [`core:ListProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) pour une liste, [`core:SearchProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#SearchProperty) pour une recherche avec autocomplétion, [`core:NonSelectableProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#NonSelectableProperty) pour un widget sans sélection. Voir [la documentation de l'ontologie de configuration](http://data.sparna.fr/ontologies/sparnatural-config-core) pour toutes les valeurs. |
| `rdfs:label` | étiquette d'affichage de la propriété | 1..* | L'étiquette d'affichage de la propriété dans les listes de sélection des propriétés de Sparnatural. Chaque étiquette peut être associée à un code de langue. Sparnatural choisira l'étiquette appropriée en fonction de son paramètre de configuration de langue. Sparnatural utilise par défaut une étiquette sans langue si aucune étiquette dans la langue configurée n'est trouvée. |
| `rdfs:domain` | domaine de la propriété | 1..1 | Le domaine de la propriété, c'est-à-dire les classes "à droite" dans Sparnatural, pour lesquelles la propriété peut être sélectionnée. Les unions de classes sont prises en charge dans le cas où la propriété peut s'appliquer à plusieurs classes (dans Protégé : "Personne ou Société ou Association").|
| `rdfs:range` | plage de la propriété | 1..1 | La plage de la propriété, c'est-à-dire les classes "à gauche" dans Sparnatural, vers lesquelles la propriété peut pointer. Les unions de classes sont prises en charge dans le cas où la propriété peut se référer à plusieurs classes (dans Protégé : "Personne ou Société ou Association") |
| [`core:sparqlString`](http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString) | Propriété SPARQL ou chemin de propriété | 0..1 | La propriété ou le chemin de propriété qui sera inséré dans les requêtes SPARQL à la place de l'URI de cette propriété. Si cela n'est pas spécifié, l'URI de la propriété est inséré. N'utilisez pas de préfixes, utilisez des URIs complets. La chaîne de caractères peut être n'importe quel chemin de propriété valide, elle DOIT utiliser `<` et `>` autour des IRI, par exemple "`<http://dbpedia.org/ontology/birthPlace>`". Vous pouvez utiliser `^` pour un chemin inverse `/` pour des chemins en séquence, `(...)` pour le regroupement, `\|` pour les alternatives. Exemples : `<http://dbpedia.org/ontology/author>` (simple mappage de propriété unique), `^<http://dbpedia.org/ontology/museum>` (chemin inverse), `<http://dbpedia.org/ontology/birthPlace>/<http://dbpedia.org/ontology/country>` (chemin en séquence), `^(<http://dbpedia.org/ontology/birthPlace>/<http://dbpedia.org/ontology/country>)` (chemin en séquence inverse) |
| [`core:enableNegation`](http://data.sparna.fr/ontologies/sparnatural-config-core#enableNegation) | activer la négation | 0..1 | Permet l'option supplémentaire d'exprimer une négation (en utilisant un `FILTER NOT EXISTS`) sur cette propriété. Le `FILTER NOT EXISTS` s'appliquera à toute la "branche" dans la requête (ce critère et tous les critères enfants) |
| [`core:enableOptional`](http://data.sparna.fr/ontologies/sparnatural-config-core#enableOptional) | activer en option | 0..1 | Permet l'option supplémentaire d'exprimer un `OPTIONAL` sur cette propriété. L'`OPTIONAL` s'appliquera à toute la "branche" dans la requête (ce critère et tous les critères enfants) |
| [`core:order`](http://data.sparna.fr/ontologies/sparnatural-config-core#order) | ordre | 0..1 | Ordre de cette propriété dans les listes de propriétés. Si non défini, l'ordre alphabétique est utilisé. |
| [`core:tooltip`](http://data.sparna.fr/ontologies/sparnatural-config-core#tooltip) | info-bulle | 0..n | Texte qui apparaît en tant qu'info-bulle lorsque vous survolez cette propriété, dans les listes et lorsqu'elle est sélectionnée. Plusieurs valeurs sont autorisées dans différentes langues. Le balisage HTML est pris en charge. |
| [`core:isMultilingual`](http://data.sparna.fr/ontologies/sparnatural-config-core#isMultilingual) | est facultatif | 0..1 | utilisé pour indiquer que les valeurs de la propriété sont multilingues (en d'autres termes, qu'il existe plusieurs valeurs avec des balises de langue différentes). Dans ce cas, lorsque la valeur d'une telle propriété est sélectionnée comme colonne, un FILTRE sera automatiquement ajouté pour filtrer la valeur en fonction de la langue par défaut de Sparnatural (passée en paramètre à l'initialisation) |
| [`core:sparqlService`](http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlService) | point de service SPARQL | 0..1 | Cette annotation permet de spécifier un point de terminaison distant pour les requêtes fédérées. Les [`requêtes fédérées`](https://www.w3.org/TR/sparql11-federated-query/) fonctionnent avec le mot-clé SERVICE. Cette annotation doit prendre une [sd:Service](#annotation-for-service-keyword) comme valeur.  |

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

#### Annotations pour une SelectResourceProperty

| Annotation / Axiom | Libellé | Card. | Description |
| ------------------ | ------ | ----- | ----------- |
| [`ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) | propriété datasource | 0..1 | Applicable aux propriétés sous `SelectResourceProperty` (généralement liste et autocomplétion). Le datasource à utiliser pour la propriété. Le datasource spécifiera comment peupler la liste ou comment retourner les propositions d'autocomplétion. Les propriétés de liste doivent utiliser un datasource de liste, les propriétés d'autocomplétion doivent utiliser un datasource de recherche. |
| [`ds:treeRootsDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeRootsDatasource) | datasource pour les racines de l'arbre | 0..1 | Applicable aux propriétés sous `TreeProperty`. Le datasource à utiliser pour peupler les racines de l'arbre (nœuds de premier niveau). |
| [`ds:treeChildrenDatasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#treeChildrenDatasource) | datasource pour les enfants de l'arbre | 0..1 | Applicable aux propriétés sous `TreeProperty`. Le datasource à utiliser pour peupler les enfants d'un nœud, lorsqu'il est cliqué. |


#### Annotations pour une TimeProperty

| [`core:beginDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#beginDateProperty) | propriété de date de début | 0..1 | Applicable aux propriétés sous `TimeProperty`. Indique la propriété utilisée dans le graphe pour exprimer le début d'une plage de validité sur les ressources, par exemple [`rico:beginningDate`](https://www.ica.org/standards/RiC/ontology#beginningDate). Spécifier `core:beginDateProperty` et `core:endDateProperty` déclenchera le [comportement de requête de plage de dates spécifique](Querying-date-ranges). |
| [`core:endDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#endDateProperty) | propriété de date de fin | 0..1 | Applicable aux propriétés sous `TimeProperty`. Indique la propriété utilisée dans le graphe pour exprimer la fin d'une plage de validité sur les ressources, par exemple [`rico:endDate`](https://www.ica.org/standards/RiC/ontology#endDate). Spécifier `core:beginDateProperty` et `core:endDateProperty` déclenchera le [comportement de requête de plage de dates spécifique](Querying-date-ranges). |
| [`core:exactDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#exactDateProperty) | propriété de date exacte | 0..1 | Applicable aux propriétés sous `TimeProperty`. Utilisée en combinaison avec `core:beginDateProperty` et `core:endDateProperty`, pour indiquer la propriété utilisée dans le graphe pour exprimer la date exacte d'une ressource, par exemple [`rico:endDate`](https://www.ica.org/standards/RiC/ontology#date). Cela est utilisé pour le [comportement de requête de plage de dates spécifique](Querying-date-ranges). |

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

#### <a name="#annotation-for-service-keyword"></a>Annotation pour un sd:Service

Note: sd:Service est une classe [définie dans l'ontologie de description de service SPARQL](https://www.w3.org/TR/sparql11-service-description/#sd-Service).

| Annotation / Axiom | Label | Card. | Description |
| ------------------ | ----- | ----- | ----------- |
| [`sd:endpoint`](https://www.w3.org/TR/sparql11-service-description/#sd-endpoint) | URL de l'endpoint | 1..1 | Définit l'URL de l'endpoint à utiliser en combinaison avec le mot-clé SERVICE |

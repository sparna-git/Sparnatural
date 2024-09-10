_[Accueil](index.html) > Prise en charge des requêtes fédérées_

# Prise en charge des requêtes fédérées (mot-clé SERVICE)

## Le problème

SPARQL et le web sémantique en général ont la capacité de fonctionner dans des contextes distribués et de résoudre des requêtes contre *plus d'un point d'accès SPARQL*. Cependant, cela est compliqué à comprendre pour un utilisateur, et encore plus compliqué pour un utilisateur de spécifier quelle partie de sa requête doit être dirigée vers quel service SPARQL.

## La solution

À partir de la version 8, Sparnatural fournit une prise en charge de base pour les requêtes fédérées en utilisant le mot-clé `SERVICE`. L'idée est que les requêtes fédérées seront activées pour certaines propriétés dans votre configuration, que vous devez configurer à l'avance. Une fois configurée, l'utilisation des requêtes fédérées sera transparente pour l'utilisateur, qui n'aura pas à définir quoi que ce soit lors de la rédaction de sa requête.

Pour configurer les requêtes fédérées, vous devez :
1. Déclarer le point d'accès vers lequel vous souhaitez envoyer les requêtes fédérées, en créant une instance de `sd:Service`
2. Indiquer l'URL du point d'accès SPARQL de ce service en utilisant la propriété `sd:endpoint`
3. Lier *des propriétés spécifiques* dans votre configuration à ce point d'accès en utilisant l'annotation `core:sparqlService`.

Dans les requêtes impliquant ces propriétés spécifiques, toute la "branche" de la requête utilisant cette propriété sera automatiquement entourée d'un mot-clé `SERVICE`.

Nous illustrerons cette configuration avec des requêtes fédérées sur Wikidata.


## Configuration en SHACL


1. Ajoutez une annotation `http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlService` sur une forme de propriété qui doit être exécutée en tant que SERVICE
2. Cette annotation pointera vers une entité qui est elle-même le sujet d'un prédicat `http://www.w3.org/ns/sparql-service-description#endpoint` contenant l'URL réelle du point d'accès SPARQL
3. Optionnellement, vous pouvez ajouter `http://data.sparna.fr/ontologies/sparnatural-config-core#executedAfter` sur la forme de propriété pour forcer le reste de la requête à être placé dans une sous-requête qui sera évaluée avant que la clause SERVICE ne soit envoyée


```turtle
PREFIX core: <http://data.sparna.fr/ontologies/sparnatural-config-core#>
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>

ex:myNodeShape a sh:NodeShape ;
  sh:property ex:myProperty .

ex:myProperty sh:path ex:myProperty ;
  # use custom annotation to link the property to the SPARQL service
  # the SPARQL service indicates its endpoint with the sd:endpoint property
  core:sparqlService [sd:endpoint <https://vocab.getty.edu/sparql> ] ;
  # rdfs:label ...
  # the remote part of the query will be executed after the rest
  core:executedAfter true ;
.
```

## Configuration en OWL

### La manière courte et simple en Turtle

Si vous éditez la configuration en Turtle, une configuration pourrait ressembler à ceci :

```turtle
PREFIX core: <http://data.sparna.fr/ontologies/sparnatural-config-core#>
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
ex:myProperty owl:subPropertyOf core:NonSelectableProperty ;
  # use custom annotation to link the property to the SPARQL service
  # the SPARQL service indicates its endpoint with the sd:endpoint property
  core:sparqlService [sd:endpoint <https://vocab.getty.edu/sparql> ] ;
  # rdfs:label ...
.
```

### Configuration dans Protégé

#### Déclarer une instance de sd:Service

`sd:Service` est une classe déclarée dans le vocabulaire de [Description de Service SPARQL](https://www.w3.org/TR/sparql11-service-description/#sd-Service). Elle est incluse pour vous dans l'ontologie de configuration Sparnatural, donc vous n'avez pas besoin d'ajouter une importation.

Dans Protégé, créez une instance de cette classe et donnez-lui l'URI que vous souhaitez, par exemple `https://www.wikidata.org` :

![](assets/images/protege-screenshot-service-instance-creation.png)

#### Déclarer l'URL de l'endpoint

Alors que l'URI du Service peut être ce que vous voulez, vous devez formellement déclarer l'URL technique à laquelle le service écoute en utilisant la propriété `sd:endpoint` sur cette instance.

Dans Protégé, vous êtes obligé de d'abord déclarer une instance de owl:Thing avec l'URL pour pouvoir la sélectionner ultérieurement (si vous éditez votre configuration manuellement, vous n'avez pas besoin de le faire).

Créez une instance de owl:Thing et donnez-lui l'URL précise du point d'extrémité SPARQL, dans notre cas `https://query.wikidata.org/` :

![](assets/images/protege-screenshot-service-endpoint-creation.png)

Ensuite, revenez à votre individu de Service, éditez-le et ajoutez une assertion de propriété d'objet avec le prédicat `sd:endpoint` et la valeur `https://query.wikidata.org/`. Dans Protégé, vous êtes obligé de passer d'abord à "View > Render by prefixed name" pour pouvoir sélectionner votre URL de point d'extrémité :

![](assets/images/protege-screenshot-service-service-endpoint-edition.png)

#### Lier une propriété au service

Maintenant que notre service est prêt, nous pouvons indiquer qu'une propriété dans notre configuration doit être routée vers ce Service. Nous le faisons avec la propriété `core:sparqlService`. Par exemple, nous pourrions imaginer qu'une propriété pour récupérer les coordonnées géographiques utilise la fédération pour récupérer la géométrie depuis Wikidata :

![](assets/images/protege-screenshot-service-sparqlService.png)

Notez comment :
- nous sélectionnons le service www.wikidata.org, pas l'URL https://query.wikidata.org
- Notre propriété est associée à `<http://www.wikidata.org/prop/direct/P625>` qui est l'identifiant de propriété dans Wikidata contenant les coordonnées géo.

#### et... TADAM !

Maintenant, lorsqu'une requête est émise impliquant cette propriété, elle est automatiquement enveloppée dans une clause SERVICE en utilisant l'URL de l'endpoint :

![](assets/images/protege-screenshot-service-final-sparql.png)

### Configuration supplémentaire (expérimentale) : executedAfter

Certaines - sinon la plupart - des cas d'utilisation de requêtes fédérées impliquent de *d'abord* interroger le triplestore local, récupérer quelques URIs, et *ensuite* récupérer certaines propriétés de ces URIs dans un triplestore fédéré distant. Et non l'inverse. Pour que ce type de requête réussisse, nous devons indiquer à Sparnatural d'exécuter d'abord la partie locale de la requête, et ensuite la partie distante de la requête. Cela implique d'envelopper la première partie de la requête dans une clause SELECT imbriquée.

Cela peut être réalisé en définissant un drapeau supplémentaire (expérimental) `config:executedAfter` sur la propriété :

```turtle
PREFIX core: <http://data.sparna.fr/ontologies/sparnatural-config-core#>
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
ex:myProperty owl:subPropertyOf core:NonSelectableProperty ;
  # use custom annotation to link the property to the SPARQL service
  # the SPARQL service indicates its endpoint with the sd:endpoint property
  core:sparqlService [sd:endpoint <https://vocab.getty.edu/sparql> ] ;
  # the remote part of the query will be executed after the rest
  core:executedAfter true ;
  # rdfs:label ...
```

De cette manière, la requête SPARQL générée ressemblera à ceci : (notez l'utilisation du SELECT interne) :

![image](https://github.com/sparna-git/Sparnatural/assets/2728945/db87236e-0583-4418-b9ec-72a8e7fcc4d2)


```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?ProvidedCHO_1 ?ProvidedCHO_1_label WHERE {
  {
    SELECT * WHERE {
      ?ProvidedCHO_1 rdf:type <http://www.europeana.eu/schemas/edm/ProvidedCHO>.
      OPTIONAL {
        ?ProvidedCHO_1 (^<http://www.openarchives.org/ore/terms/proxyFor>/<http://purl.org/dc/elements/1.1/title>) ?ProvidedCHO_1_label.
        FILTER((LANG(?ProvidedCHO_1_label)) = "en")
      }
      ?ProvidedCHO_1 (^<http://www.openarchives.org/ore/terms/proxyFor>/<http://purl.org/dc/elements/1.1/type>) ?Type_2.
    }
  }
  SERVICE <https://vocab.getty.edu/sparql> {
    ?Type_2 (<http://www.w3.org/2004/02/skos/core#scopeNote>/rdf:value) ?ScopeNote_4.
    FILTER((LANG(?ScopeNote_4)) = "en")
  }
}
LIMIT 1000
```

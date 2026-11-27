_[Accueil](index.html) > Interrogation de plusieurs points d'accès_

Voir aussi la [référence en anglais](../Querying-multiple-endpoints.md). Les exemples LDForge sont maintenus avec cette version.


# Prise en charge de la requête de plusieurs points d'accès

## Cas d'utilisation

Parfois, vous n'avez pas besoin de présenter un seul graphe de connaissances, mais plutôt **plusieurs** graphes de connaissances. Sparnatural peut agir comme une façade pour interroger plusieurs points d'accès SPARQL de manière transparente pour l'utilisateur. Notez que cela implique que tous les points d'accès SPARQL doivent partager la même structure de graphe, car la même requête SPARQL sera utilisée pour les interroger tous.

## Fonctionnement

1. Vous devez créer un fichier JSON donnant la liste des différents points d'accès qui peuvent être interrogés, avec quelques informations à leur sujet (en particulier leurs libellés d'affichage). Ce fichier JSON est le **fichier de catalogue des points d'accès**.
2. Sparnatural est configuré avec l'URL des différents services SPARQL à interroger, et le fichier de catalogue JSON.
3. Lors de la population des listes déroulantes, ou lors de la recherche de valeurs d'autocomplétion, Sparnatural interrogera **tous** les points d'accès avec lesquels il est configuré, et agrégera les résultats. En particulier, les widgets de listes utiliseront un séparateur `optgroup` pour séparer les résultats des différents points d'accès.
4. Il incombe à la page appelante d'exécuter également la requête finale fournie par Sparnatural contre tous les points d'accès, et d'agréger les résultats.

## Configuration de Sparnatural

Pour configurer Sparnatural pour interroger plusieurs points d'accès, vous devez :

1. Fournir une liste d'URL de points d'accès séparées par des espaces dans l'attribut `endpoint` de l'élément `spar-natural`. Les URL données ici doivent correspondre à l'`endpointURL` des entrées du catalogue (voir ci-dessous).
2. Fournir l'URL du fichier de catalogue à charger dans l'attribut `catalog` de l'élément HTML `spar-natural`. Le catalogue peut contenir plus d'entrées que celles réellement transmises dans l'attribut `endpoint`.
3. Gérer vous-même l'exécution de la requête finale contre la liste des points d'accès sélectionnés (voir ci-dessous)

Voici un exemple :

```html
<!-- Note how 2 SPARQL endpoints URL are provided, along with the URL of the catalog file -->
<spar-natural 
            src="..."
            endpoint="https://sage-ails.ails.ece.ntua.gr/api/content/rijksmuseum-poc/sparql https://sage-ails.ails.ece.ntua.gr/api/content/gooi-en-vecht-poc/sparql"
            catalog="datasets.jsonld"
            lang="en"
            defaultLang="en"
            distinct="true"
            limit="1000"
            debug="true"
></spar-natural>
```

## Fichier de catalogue JSON

### Exemple de fichier de catalogue

Voici un exemple de fichier de catalogue JSON :

```
{
  "type": "Catalog",
  "service": [
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/rijksmuseum",
      "type": "DataService",
      "title": {
        "en" : "Rijksmuseum Collection"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/rijksmuseum-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    },
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/gooi-en-vecht",
      "type": "DataService",
      "title": {
        "en" : "Gooi en Vecht Historisch"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/gooi-en-vecht-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    },
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/gelderland",
      "type": "DataService",
      "title": {
        "en" : "Collectie Gelderland"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/gelderland-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    }
  ]
}
```

### Référence du fichier de catalogue

Le fichier de catalogue JSON est essentiellement une description DCAT des DataServices encodée en JSON-LD. Les DataServices sont décrits avec quelques métadonnées. La racine du fichier de catalogue est l'objet Catalogue.

#### Entité Catalogue

L'objet `Catalogue` est l'entité racine du fichier. Il contient une propriété `service` qui contiendra toutes les entités `DataService` :

```
  "type": "Catalog",
  "service": [
    {
      ...
    },
    {
      ...
    }
  ]
}
```

#### Entité DataService

Un `DataService` décrit un point de terminaison à interroger. Il contient :
  - un `id`, qui est l'identifiant interne de cette entrée dans le catalogue
  - un `endpointURL`, qui est l'URL du point de terminaison SPARQL vers lequel Sparnatural enverra ses requêtes
  - ses `titres` dans différentes langues, qui seront utilisés lors de l'affichage de cette entrée dans l'interface
  - d'autres métadonnées facultatives, telles qu'une `description`, non utilisée par Sparnatural mais qui peut être utile à d'autres parties de votre application

```
    {
      "id": "https://sparna-git.github.io/europeana-linkeddata-taskforce-poc/dataset/gelderland",
      "type": "DataService",
      "title": {
        "en" : "Collectie Gelderland"
      },
      "endpointURL" : "https://sage-ails.ails.ece.ntua.gr/api/content/gelderland-poc/sparql",
      "description": {
        "en" : "Lorem ipsum..."
      }
    }
```


## Comportement de Sparnatural

Lorsqu'il est configuré avec plus d'un point de terminaison, Sparnatural se comportera de la manière suivante :

### Dans les listes, les valeurs sont présentées dans une section différente pour chaque point de terminaison

![multiples points de terminaison dans la liste](/assets/images/multiple-endpoints-list.png)

### Dans l'autocomplétion, le point de terminaison est visible en survolant le résultat

![multiples points de terminaison dans l'autocomplétion](/assets/images/multiple-endpoints-autocomplete.png)



## Exécution de la requête finale sur plusieurs points d'accès

L'[intégration LDForge](LDForge-integration.md) utilise par défaut
`sparnatural.executeSparql()`. Sparnatural interroge son catalogue et fusionne les
résultats, avec une colonne indiquant leur source, avant leur affichage.

```javascript
const sparnatural = document.querySelector("spar-natural");
const integration = SparnaturalLDForge.createSparnaturalLDForge(
  sparnatural,
  document.getElementById("ldforge"),
  { resultsContainer: document.getElementById("ldforge-results") },
);
```

Chargez les bundles et les styles et fournissez les deux conteneurs comme dans
l'[exemple JavaScript](Javascript-integration.md). La disposition séparée requiert
pour l'instant [l'extension locale LDForge](../LDForge-integration.md#testing-the-unpublished-ldforge-extension).
Aucun autre gestionnaire `submit` n'est nécessaire. Un `createHttpExecutor()`
explicite contourne le catalogue et n'interroge qu'un point d'accès.
La colonne de source reste accessible dans les tableaux, JSON et l'export CSV.

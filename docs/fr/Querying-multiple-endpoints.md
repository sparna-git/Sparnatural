_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

_[Accueil](index.html) > Interrogation de plusieurs points d'accès_

# Prise en charge de l'interrogation de plusieurs points d'accès

## Cas d'utilisation

Parfois, vous n'avez pas besoin de présenter un seul graphe de connaissances, mais plutôt **plusieurs** graphes de connaissances. Sparnatural peut agir comme une façade pour interroger plusieurs points d'accès SPARQL de manière transparente pour l'utilisateur. Notez que cela implique que tous les points d'accès SPARQL doivent partager la même structure de graphe, car la même requête SPARQL sera utilisée pour les interroger tous.

## Fonctionnement

1. Vous devez créer un fichier JSON donnant la liste des différents points d'accès qui peuvent être interrogés, avec quelques informations à leur sujet (en particulier leurs libellés d'affichage). Ce fichier JSON est le **fichier de catalogue des points d'accès**.
2. Sparnatural est configuré avec l'URL des différents services SPARQL à interroger, et le fichier de catalogue JSON.
3. Lors de la population des listes déroulantes, ou lors de l'interrogation des valeurs d'autocomplétion, Sparnatural interrogera **tous** les points d'accès avec lesquels il est configuré, et agrégera les résultats. En particulier, les widgets de listes utiliseront un séparateur `optgroup` pour séparer les résultats des différents points d'accès.
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

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

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
  - une `endpointURL`, qui est l'URL du point de terminaison SPARQL vers lequel Sparnatural enverra ses requêtes
  - ses `titres` dans différentes langues, qui seront utilisés lors de l'affichage de cette entrée dans l'interface
  - d'autres métadonnées facultatives, telles qu'une `description`, non utilisée par Sparnatural mais pouvant être utile à d'autres parties de votre application

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



## Exécution de la requête SPARQL finale contre tous les points de terminaison

Sparnatural peut gérer la population des listes déroulantes et des champs d'autocomplétion contre plusieurs points de terminaison. Vous devez également exécuter la requête finale retournée par Sparnatural contre tous les points de terminaison. Pour ce faire, vous pouvez appeler la méthode `executeSparql()` sur Sparnatural, qui se chargera de :
1. envoyer la requête SPARQL à tous les points de terminaison du catalogue
2. fusionner les résultats, en ajoutant une colonne supplémentaire pour la source
3. retourner le résultat fusionné


L'intégration complète ressemble à ceci :

```javascript
    sparnatural.addEventListener("queryUpdated", (event) => {
      queryString = sparnatural.expandSparql(event.detail.queryString);
      yasqe.setValue(queryString);
    });

    sparnatural.addEventListener("submit", (event) => {
      // enable loader on button
      sparnatural.disablePlayBtn() ;

      let finalResult = sparnatural.executeSparql(
        yasqe.getValue(),
        (finalResult) => {
          // send final result to YasR
          yasr.setResponse(finalResult);
          // re-enable submit button
          sparnatural.enablePlayBtn();
        },
        (error) => {
          console.error("Got an error when executing SPARQL in Sparnatural");
          console.dir(error);
        }
      );
    });

    sparnatural.addEventListener("reset", (event) => {
      yasqe.setValue("");
    });
```

Le point de terminaison source est ajouté en tant que colonne supplémentaire :

![liste de résultats avec une colonne supplémentaire montrant la source](/assets/images/result-table-with-source-column.png)

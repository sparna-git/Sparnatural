_[Accueil](index.html) > Intégration JavaScript_

# Intégration JavaScript et référence des paramètres

## Constructeur

Sparnatural est inséré en tant qu'élément HTML personnalisé nommé `spar-natural` (notez le tiret), avec des attributs spécifiques. Cela ressemble à ceci :

```html
  <spar-natural 
    src="sparnatural-config.ttl"
    endpoint="https://dbpedia.org/sparql"
    lang="en"
    defaultLang="en"
    limit="1000"
    debug="true"
  />
```

## Référence des attributs HTML

| Attribut | Description | Par défaut | Obligatoire/Optionnel |
| --------- | ----------- | ------- | ------------------ |
| `src` | Fournit la configuration qui spécifie les classes et propriétés à afficher, et comment elles sont mappées à SPARQL. Il peut s'agir soit de l'URL d'un fichier SHACL ou OWL, en Turtle ou RDF/XML. Exemple : `sparnatural-config.ttl`. Une autre option est de fournir un objet JSON sérialisé en tant que chaîne de caractères. Par exemple : `JSON.stringify(configAsJsonObj)`. Il est possible de passer **plusieurs** URL en les séparant par un espace, par exemple `sparnatural-config.ttl statistics.ttl` | `undefined` | Obligatoire
| `endpoint` | L'URL d'un point d'accès SPARQL qui sera utilisé comme service par défaut pour les requêtes de la source de données fournies dans la configuration. Si non spécifié, chaque source de données doit indiquer explicitement un point d'accès SPARQL. Notez que cette URL peut utiliser le paramètre `default-graph-uri` pour restreindre la requête à un graphe nommé spécifié, selon la [spécification du protocole SPARQL](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#dataset), par exemple `http://ex.com/sparql?default-graph-uri=http%3A%2F%2Fencoded-named-graph-uri`. Cela peut également contenir **plusieurs** URL de point d'accès en combinaison avec l'attribut `catalog` (voir "[interroger plusieurs points d'accès](Querying-multiple-endpoints.md)") | `undefined` | Obligatoire sauf pour les cas d'utilisation avancés. |
| `catalog` (*instable*) | Le catalogue des points d'accès, si vous passez plusieurs points d'accès. Il s'agit d'une configuration avancée. (voir "[interroger plusieurs points d'accès](Querying-multiple-endpoints.md)") | aucun | Optionnel|
| `defaultLang` | Langue par défaut du jeu de données. Une langue dans laquelle le jeu de données fournit toujours des libellés/titres qui peuvent être utilisés par défaut si un libellé dans la langue de l'utilisateur n'est pas présent. | `en` | Recommandé|
| `debug` | Si défini sur `true`, Sparnatural enregistrera les requêtes JSON et SPARQL dans la console, telles qu'elles sont générées. | `false` | Optionnel |
| `distinct` | Indique si le mot-clé `DISTINCT` doit être inséré dans la requête SPARQL générée. | `true` | Optionnel|
| `lang` | Préférence de langue de l'utilisateur. Le code de langue à utiliser pour afficher les libellés des classes et propriétés du fichier de configuration, et pour interroger les valeurs dans les listes et les champs de recherche. | `en` | Recommandé|
| `limit` | Un nombre qui sera utilisé pour ajouter un mot-clé `LIMIT` dans les requêtes SPARQL générées. S'il est défini sur une chaîne vide ou un nombre négatif, aucun mot-clé `LIMIT` n'est inséré. | `-1` | Optionnel
| `maxDepth` | Profondeur maximale de la requête construite (nombre de clauses 'Where' internes). | `4` | Optionnel
| `localCacheDataTtl` (*bêta*) | Le temps pendant lequel les listes déroulantes seront stockées en cache sur le client, si le serveur l'a autorisé dans ses en-têtes de réponse, c'est-à-dire si l'en-tête `Cache-Control: no-cache` est renvoyé dans la réponse, aucun cache ne se produira, quelle que soit la valeur de ce champ. Le serveur peut renvoyer `Cache-Control: public` pour que les listes soient correctement mises en cache. | `1000 * 60 * 60 * 24` | Optionnel|
| `maxOr` | Nombre maximal de valeurs différentes pouvant être sélectionnées pour un critère de propriété donné. Par exemple, combien de pays peuvent être choisis sur le widget de liste | `3` | Optionnel
| `prefixes` (*instable*) | Un ensemble de préfixes sous la forme `foaf: http://xmlns.com/foaf/0.1/ skos:http://www.w3.org/2004/02/skos/core#` à ajouter à la requête SPARQL de sortie. Cela est appliqué dans la méthode `expand`. | `none`
| `queryLang` | La langue utilisée comme paramètres pour les sources de données, par exemple pour peupler les listes déroulantes avec les libellés de cette langue. | même valeur que `lang` | Recommandé|
| `submitButton` | Indique si Sparnatural doit afficher un bouton de soumission pour permettre à l'utilisateur d'exécuter la requête. Un clic sur le bouton de soumission déclenchera un événement `submit`. Si ce n'est pas fourni, il incombe à la page d'exécuter automatiquement la requête à chaque mise à jour dans l'événement `queryUpdated` ou de fournir son propre moyen de soumettre la requête. | `true` | Optionnel
| `typePredicate` | Le prédicat de type à utiliser pour générer les critères de type. Par défaut à rdf:type, mais pourrait être modifié par exemple en `<http://www.wikidata.org/prop/direct/P31>+` pour une intégration Wikidata, ou `<http://www.w3.org/2000/01/rdf-schema#subClassOf>+` pour interroger des modèles de style OWL.|`rdf:type` | Optionnel |

## Événements Sparnatural

Ensuite, la page HTML doit écouter des événements spécifiques déclenchés par Sparnatural, notamment `queryUpdated` et `submit` :

```javascript
const sparnatural = document.querySelector("spar-natural");
 
// triggered as soon there is a modification in the query
sparnatural.addEventListener("queryUpdated", (event) => {
  // do something with the query
});

// triggered when submit button is called
sparnatural.addEventListener("submit", (event) => {
    // so something
});

// triggered when reset button is clicked
sparnatural.addEventListener("reset", (event) => {
  // do something
});
```

Voir ci-dessous la référence complète des événements disponibles.

Une intégration typique dans une page web ressemble à ceci :

```javascript
const sparnatural = document.querySelector("spar-natural");

sparnatural.addEventListener("queryUpdated", (event) => {
  // expand query to replace identifiers with content of sparqlScript annotation
  console.log(event.detail.queryString);
  console.log(event.detail.queryJson);
  console.log(event.detail.querySparqlJs);
  queryString = sparnatural.expandSparql(event.detail.queryString);
  // set query on YasQE
  yasqe.setValue(queryString);

  // save JSON query
  document.getElementById('query-json').value = JSON.stringify(event.detail.queryJson);
});

sparnatural.addEventListener("submit", (event) => {
  // enable loader on button
  sparnatural.disablePlayBtn() ; 
  // trigger the query from YasQE
  yasqe.query();
});

sparnatural.addEventListener("reset", (event) => {
  yasqe.setValue("");
});
```

### Événement "queryUpdated"

L'événement `queryUpdated` est déclenché à chaque fois que la requête est modifiée. Le détail de l'événement contient :
  - La chaîne SPARQL dans `queryString`
  - La structure JSON Sparnatural dans `queryJson`
  - La structure (format SPARQL.js)[https://github.com/RubenVerborgh/SPARQL.js/] dans `querySparqlJs`

```javascript
sparnatural.addEventListener("queryUpdated", (event) => {
  console.log(event.detail.queryString);
  console.log(event.detail.queryJson);
  console.log(event.detail.querySparqlJs);
});
```

### Événement "submit"

L'événement `submit` est déclenché lorsque le bouton de soumission est cliqué.

Dans des intégrations typiques, l'état du bouton de soumission peut être mis à jour lors de la soumission. Le bouton de soumission peut être "non chargé et actif", "en chargement" ou "désactivé". Les fonctions pour mettre à jour l'état du bouton sont :
  - `sparnatural.disablePlayBtn()`
  - `sparnatural.enablePlayBtn()`

`disablePlayBtn()` doit être appelé lors de l'événement `submit` et `enablePlayBtn()` lorsque la requête est terminée. Dans une intégration typique avec YasGUI, cela ressemble à ceci :

```javascript
const sparnatural = document.querySelector("spar-natural");

sparnatural.addEventListener("queryUpdated", (event) => {
  queryString = sparnatural.expandSparql(event.detail.queryString);
  yasqe.setValue(queryString);
});

sparnatural.addEventListener("submit", (event) => {
  // disable the button and show a spinning loader
  sparnatural.disablePlayBtn() ; 
  // trigger the query from YasQE
  yasqe.query();
});

const yasqe = new Yasqe(document.getElementById("yasqe"));
const yasr = new Yasr(document.getElementById("yasr"));

yasqe.on("queryResponse", function(_yasqe, response, duration) {
  // print the responses in YASR
  yasr.setResponse(response, duration);
  // re-enable play button in Sparnatural
  sparnatural.enablePlayBtn() ;
}); 
```

### Événement "reset"

L'événement `submit` est déclenché lorsque le bouton de réinitialisation est cliqué. Il peut être utilisé pour vider ou réinitialiser d'autres parties de la page, typiquement YasQE. Une intégration typique est la suivante :

```javascript
sparnatural.addEventListener("reset", (event) => {
  yasqe.setValue("");
});
```

### Événement "init"

L'événement `init` est déclenché lorsque Sparnatural a fini de lire sa configuration. Écoutez cet événement pour passer une personnalisation JSON supplémentaire avec `sparnatural.customization = { ... }` (voir ci-dessous).


```javascript
sparnatural.addEventListener("init", (event) => {
  console.log("Sparnatural is initialized");
  // sparnatural.customization = { ... }
});
```

## API de l'élément Sparnatural

Le tableau ci-dessous résume les différentes fonctions qui peuvent être appelées sur l'élément Sparnatural.

| Fonction | Description | Paramètres |
| -------- | ----------- | ---------- |
| `sparnatural.enablePlayBtn()` | Supprime le chargement du bouton de lecture une fois qu'une requête a terminé son exécution.  | aucun |
| `sparnatural.disablePlayBtn()` | Désactive le bouton de lecture une fois qu'une requête a commencé son exécution. | aucun |
| `sparnatural.loadQuery(query)` | Charge une structure de requête dans Sparnatural. | Structure de requête telle que documentée dans [le format JSON de la requête](Query-JSON-format)
| `sparnatural.expandSparql(sparqlString)` | Étend une chaîne de requête SPARQL selon la configuration, en particulier les annotations `sparqlString`, comme documenté dans la [configuration basée sur OWL](OWL-based-configuration) Une chaîne de requête SPARQL | chaîne |
| `sparnatural.clear()` | Efface l'éditeur Sparnatural, comme si le bouton de réinitialisation avait été cliqué. | aucun |
| `sparnatural.executeSparql(query:string, callback: (data: any) => void, errorCallback?:(error: any) => void)` | Exécute la requête SPARQL fournie, en utilisant l'endpoint configuré ou plusieurs endpoints du catalogue, et en utilisant les en-têtes configurés. | 1/ La chaîne de requête SPARQL 2/ le rappel en cas de succès de l'exécution 3/ le rappel en cas d'erreur |

## Liaisons Sparnatural

À partir de la version 9.1, les versions de Sparnatural incluent un fichier JavaScript [`sparnatural-bindings.js`](https://github.com/sparna-git/Sparnatural/blob/master/src/sparnatural-bindings.js) qui peut être utilisé pour faciliter l'intégration des événements et des fonctions de Sparnatural dans des scénarios d'intégration typiques.

En particulier, pour un scénario où Sparnatural est intégré avec YasQE en tant que visualiseur de requêtes en lecture seule et YasR, et où Sparnatural est responsable de l'exécution de la requête, vous pouvez appeler les fonctions suivantes :

```javascript
// binds Sparnatural with the YasR plugins
bindSparnaturalWithYasrPlugins(sparnatural, yasr);
// binds Sparnatural with itself for the query execution and integration with yasqe and yasr
bindSparnaturalWithItself(sparnatural, yasqe, yasr);
```

## Personnalisation du comportement de Sparnatural

Le comportement de Sparnatural peut être encore ajusté avec l'objet `customization` : `sparnatural.customization = { ... }`. Cet appel doit être effectué dans l'écouteur d'événements `init`, après que Sparnatural ait terminé de lire son fichier de spécification initial.

```javascript
sparnatural.addEventListener("init", (event) => {
  console.log("Sparnatural is initialized");
  sparnatural.customization = { ... }
});
```

En particulier, cet objet permet de passer des fonctions pour fournir des données aux différents widgets. Voir la documentation de référence ci-dessous.


### Référence de l'objet de personnalisation Sparnatural

La structure de l'objet de personnalisation est décrite ci-dessous. Tous les éléments sont optionnels.


```typescript
{
  autocomplete: {
    dataProvider : {
      getAutocompleteSuggestions: function(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
      )
    },
    // the maximum number of items to be proposed in the autocomplion list
    maxItems: number
  },
  list: {
    dataProvider : {
      getListContent: function(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(values:{literal:string}[]) => void
      ):void
    }
  },
  tree: {
    dataProvider : {
      getRoots: function(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
      ):void,

      getChildren: function(
        node:string,
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
      ):void
    }
  },
  map: {
    // initial zoom level of the map, when opened
    // see https://leafletjs.com/reference.html#map-setview
    // typically, from 0 to ~ 12
    zoom : number,
    // initial center of the map, when opened
    // see https://leafletjs.com/reference.html#map-setview
    center : {
      lat:number,
      long:number
    }
  },
  headers: {
    "header name": "value"
  }
}
```

Notez que la structure de données `RDFTerm` référencée ci-dessus est la suivante :

```typescript
export class RDFTerm {
  type: string;
  value: string;
  "xml:lang"?: string;
  datatype?:string 
}
```

### Exemple de spécification d'une fonction de fournisseur de données personnalisée

```javascript
sparnatural.addEventListener("init", (event) => {  
  sparnatural.customization = {
    autocomplete: {
      dataProvider: {
        getAutocompleteSuggestions: function(
        domain,
        predicate,
        range,
        key,
        lang,
        defaultLang,
        typePredicate,
        callback,
        errorCallback
      ) {
        // build the list of autocomplete items to show
        console.log("domain,predicate,range : "+domain+" "+predicate+" "+range);
        let items = [
          {
            term: {
              type:"IRI",
              value:"http://exemple.fr/1"
            },
            label: key+" : suggestion 1" 
          },
          {
            term: {
              type:"IRI",
              value:"http://exemple.fr/2"
            },
            label: key+" : suggestion 2" 
          }
        ];
        // call the callback function with the list of items
        callback(items);
      }
      }
    }
  };
});
```

### Configuration des en-têtes HTTP

Pour définir les en-têtes des requêtes effectuées par Sparnatural, utilisez l'objet de personnalisation ci-dessus, avec la clé `headers`. Voir cet exemple :

```javascript
sparnatural.addEventListener("init", (event) => {
  sparnatural.customization = {
    headers: { 
      "User-Agent" : "This is Sparnatural calling"
    }
  }
});
```

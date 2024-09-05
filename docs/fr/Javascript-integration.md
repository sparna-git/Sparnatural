_[Accueil](index.html) > Intégration Javascript_

# Intégration Javascript et référence des paramètres

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
| `src` | Fournit la configuration qui spécifie les classes et propriétés à afficher, et comment elles sont mappées à SPARQL. Il peut s'agir soit de l'URL d'un fichier SHACL ou OWL, en Turtle ou RDF/XML. Exemple : `sparnatural-config.ttl`. Une autre option est de fournir un objet JSON sérialisé en tant que chaîne de caractères. Par exemple : `JSON.stringify(configAsJsonObj)`. Il est possible de passer **plusieurs** URL en les séparant par un espace, par exemple `sparnatural-config.ttl statistics.ttl` | `undefined` | Obligatoire |
| `endpoint` | L'URL d'un point d'accès SPARQL qui sera utilisé comme service par défaut pour les requêtes de la source de données fournies dans la configuration. Si non spécifié, chaque source de données doit indiquer explicitement un point d'accès SPARQL. Notez que cette URL peut utiliser le paramètre `default-graph-uri` pour restreindre la requête à un graphe nommé spécifié, conformément à la [spécification du protocole SPARQL](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#dataset), par exemple `http://ex.com/sparql?default-graph-uri=http%3A%2F%2Fencoded-named-graph-uri`. Cela peut également contenir **plusieurs** URL de point d'accès en combinaison avec l'attribut `catalog` (voir "[interroger plusieurs points d'accès](Querying-multiple-endpoints.md)") | `undefined` | Obligatoire sauf pour les cas d'utilisation avancés. |
| `catalog` (*instable*) | Le catalogue des points d'accès, si vous passez plusieurs points d'accès. Il s'agit d'une configuration avancée. (voir "[interroger plusieurs points d'accès](Querying-multiple-endpoints.md)") | aucun | Optionnel |
| `defaultLang` | Langue par défaut du jeu de données. Une langue dans laquelle le jeu de données fournit toujours des libellés/titres pouvant être utilisés par défaut si un libellé dans la langue de l'utilisateur n'est pas présent. | `en` | Recommandé |
| `debug` | Si défini sur `true`, Sparnatural enregistrera les requêtes JSON et SPARQL dans la console au fur et à mesure de leur génération. | `false` | Optionnel |
| `distinct` | Indique si le mot-clé `DISTINCT` doit être inséré dans la requête SPARQL générée. | `true` | Optionnel |
| `lang` | Préférence de langue de l'utilisateur. Le code de langue à utiliser pour afficher les libellés des classes et propriétés du fichier de configuration, et pour interroger les valeurs dans les listes et les champs de recherche. | `en` | Recommandé |
| `limit` | Un nombre qui sera utilisé pour ajouter un mot-clé `LIMIT` dans les requêtes SPARQL générées. S'il est défini sur une chaîne vide ou un nombre négatif, aucun mot-clé `LIMIT` n'est inséré. | `-1` | Optionnel |
| `maxDepth` | Profondeur maximale de la requête construite (nombre de clauses 'Where' internes). | `4` | Optionnel |
| `localCacheDataTtl` (*bêta*) | Le temps pendant lequel les listes déroulantes seront stockées en cache sur le client, si le serveur l'a autorisé dans ses en-têtes de réponse, c'est-à-dire si l'en-tête `Cache-Control: no-cache` est renvoyé dans la réponse, aucun cache ne se produira, quelle que soit la valeur de ce champ. Le serveur peut renvoyer `Cache-Control: public` pour que les listes soient correctement mises en cache. | `1000 * 60 * 60 * 24` | Optionnel |
| `maxOr` | Nombre maximal de valeurs différentes pouvant être sélectionnées pour un critère de propriété donné. Par exemple, combien de pays peuvent être choisis sur le widget de liste | `3` | Optionnel |
| `prefixes` (*instable*) | Un ensemble de préfixes sous la forme `foaf: http://xmlns.com/foaf/0.1/ skos:http://www.w3.org/2004/02/skos/core#` à ajouter à la requête SPARQL de sortie. Cela est appliqué dans la méthode `expand`. | `none` |
| `queryLang` | La langue utilisée comme paramètre pour les sources de données, par exemple pour peupler les listes déroulantes avec les libellés de cette langue. | même valeur que `lang` | Recommandé |
| `submitButton` | Indique si Sparnatural doit afficher un bouton de soumission pour permettre à l'utilisateur d'exécuter la requête. Un clic sur le bouton de soumission déclenchera un événement `submit`. Si ce n'est pas fourni, il incombe à la page d'exécuter automatiquement la requête à chaque mise à jour dans l'événement `queryUpdated` ou de fournir son propre moyen de soumettre la requête. | `true` | Optionnel |
| `typePredicate` | Le prédicat de type à utiliser pour générer les critères de type. Par défaut à rdf:type, mais pourrait être modifié par exemple en `<http://www.wikidata.org/prop/direct/P31>+` pour une intégration Wikidata, ou `<http://www.w3.org/2000/01/rdf-schema#subClassOf>+` pour interroger des modèles de style OWL. | `rdf:type` | Optionnel |

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

Voir ci-dessous pour la référence complète des événements disponibles.

Une intégration typique dans une page web ressemble à ceci :

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

### "queryUpdated" event

The `queryUpdated` event is triggered everytime the query is modified. The event detail contains :
  - The SPARQL string in `queryString`
  - The JSON Sparnatural structure in `queryJson`
  - The (SPARQL.js format)[https://github.com/RubenVerborgh/SPARQL.js/] structure in `querySparqlJs`

```javascript
sparnatural.addEventListener("queryUpdated", (event) => {
  console.log(event.detail.queryString);
  console.log(event.detail.queryJson);
  console.log(event.detail.querySparqlJs);
});

### "submit" event

The `submit` event is triggered when the submit button is clicked. 

In typical integrations, the state of the submit button can be updated upon submit. The submit button can be "not loading and active", "loading" or "disabled". The functions to update the state of the button are:
  - `sparnatural.disablePlayBtn()`
  - `sparnatural.enablePlayBtn()`

`disablePlayBtn()` should be called on `submit` event and `enablePlayBtn()` when the query has returned. In a typical integration with YasGUI this looks like this:

```javascript
const sparnatural = document.querySelector("spar-natural");

sparnatural.addEventListener("queryUpdated", (event) => {
  queryString = sparnatural.expandSparql(event.detail.queryString);
  yasqe.setValue(queryString);
});

sparnatural.addEventListener("submit", (event) => {
  // désactiver le bouton et afficher un loader en rotation
  sparnatural.disablePlayBtn();
  // déclencher la requête depuis YasQE
  yasqe.query();
});

const yasqe = new Yasqe(document.getElementById("yasqe"));
const yasr = new Yasr(document.getElementById("yasr"));

yasqe.on("queryResponse", function(_yasqe, response, duration) {
  // afficher les réponses dans YASR
  yasr.setResponse(response, duration);
  // réactiver le bouton de lecture dans Sparnatural
  sparnatural.enablePlayBtn();
});

### "reset" event

The `submit` event is triggered when the reset button is clicked. It can be used to empty or reset other part of the page, typically YasQE. A typical integration is the following:

```javascript
sparnatural.addEventListener("reset", (event) => {
  yasqe.setValue("");
});

### "init" event

The `init` event is triggered when Sparnatural has finished reading its configuration. Listen to this event to pass additionnal JSON customization with `sparnatural.customization = { ... }` (see below).


```javascript
sparnatural.addEventListener("init", (event) => {
  console.log("Sparnatural est initialisé");
  // sparnatural.customization = { ... }
});

## Sparnatural element API

The table below summarizes the various functions that can be called on the Sparnatural element.

| Function | Description | Parameters |
| -------- | ----------- | ---------- |
| `sparnatural.enablePlayBtn()` | Removes the loading from the play button once a query has finished executing.  | none |
| `sparnatural.disablePlayBtn()` | Disables the play button once a query has started its execution.| none |
| `sparnatural.loadQuery(query)` | Loads a query structure in Sparnatural. | Query structure as documented in [the query JSON format](Query-JSON-format)
| `sparnatural.expandSparql(sparqlString)` | Expands a SPARQL query string according to the configuration, in particular the `sparqlString` annotations, as documented in the [OWL-based configuration](OWL-based-configuration) A SPARQL query string | string |
| `sparnatural.clear()` | Clears the Sparnatural editor, as if the reset button was clicked.| none |
| `sparnatural.executeSparql(query:string, callback: (data: any) => void, errorCallback?:(error: any) => void)` | Executes the provided SPARQL query, using configured endpoint or multiple endpoints from the catalog, and using the configured headers. | 1/ The SPARQL query string 2/ the callback when execution succeeds 3/ the callback on error |


## Sparnatural bindings

Starting from 9.1, releases of Sparnatural include a [`sparnatural-bindings.js`](https://github.com/sparna-git/Sparnatural/blob/master/src/sparnatural-bindings.js) Javascript file that can be used to facilitate the integration of the events and functions of Sparnatural in typical integration scenarios.

In particular for a scenario when Sparnatural is integrated with YasQE as a read-only query viewer and YasR, and where Sparnatural is responsible for executing the query, you can call the following functions:

```javascript
// lie Sparnatural aux plugins YasR
bindSparnaturalWithYasrPlugins(sparnatural, yasr);
// lie Sparnatural avec lui-même pour l'exécution de la requête et l'intégration avec yasqe et yasr
bindSparnaturalWithItself(sparnatural, yasqe, yasr);

## Sparnatural behavior customization

The behavior of Sparnatural can be further adjusted with the `customization` object : `sparnatural.customization = { ... }`. That call must be done within the `init` event listener, after Sparnatural has finished reading its initial specification file.

```javascript
sparnatural.addEventListener("init", (event) => {
  console.log("Sparnatural est initialisé");
  sparnatural.customization = { ... }
});

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
    // le nombre maximum d'éléments à proposer dans la liste d'autocomplétion
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
    // niveau de zoom initial de la carte, lorsqu'elle est ouverte
    // voir https://leafletjs.com/reference.html#map-setview
    // généralement, de 0 à ~ 12
    zoom : number,
    // centre initial de la carte, lorsqu'elle est ouverte
    // voir https://leafletjs.com/reference.html#map-setview
    center : {
      lat:number,
      long:number
    }
  },
  headers: {
    "nom de l'en-tête": "valeur"
  }
}

```typescript
export class RDFTerm {
  type: string;
  value: string;
  "xml:lang"?: string;
  datatype?:string 
}
```

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
        // construire la liste des éléments d'autocomplétion à afficher
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
        // appeler la fonction de rappel avec la liste des éléments
        callback(items);
      }
      }
    }
  };
});

```javascript
sparnatural.addEventListener("init", (event) => {
  sparnatural.customization = {
    headers: { 
      "User-Agent" : "C'est Sparnatural qui appelle"
    }
  }
});
```

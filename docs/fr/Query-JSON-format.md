_[Accueil](index.html) > Format JSON de la requête_

# Format JSON de la requête Sparnatural


## Comment ça marche : onQueryUpdated / loadQuery

Sparnatural émet l'événement [`queryUpdated`](http://docs.sparnatural.eu/Javascript-integration.html#queryupdated-event) à chaque fois que la requête est modifiée. Cet événement contient 3 fichiers : la chaîne de requête SPARQL générée, la requête SPARQL en JSON dans la syntaxe sparqljs, et une structure de données JSON personnalisée qui encode la requête. Cette structure de données JSON personnalisée est spécifique à Sparnatural, et lui permet de **charger une requête précédemment générée**, en utilisant la méthode [**`sparnatural.loadQuery(jsonQuery)`**](http://docs.sparnatural.eu/Javascript-integration.html#sparnatural-element-api).

Cela permet de mettre en œuvre 2 fonctionnalités importantes pour présenter votre graphe de connaissances :

1. La capacité de préparer des **requêtes d'exemple qui peuvent être chargées** en un seul clic pour initialiser Sparnatural avec votre requête
2. La possibilité d'**encoder la requête dans un paramètre d'URL** et de charger directement Sparnatural avec la requête reçue. Cela permet aux utilisateurs de partager des liens directs vers leurs requêtes préférées, et votre graphe de connaissances devient viral ;-)

Cela est illustré dans l'extrait de code suivant :


```javascript
$( document ).ready(function($) {          

        const sparnatural = document.querySelector("spar-natural");
        
        sparnatural.addEventListener("queryUpdated", (event) => {
                // here we get the SPARQL query string and the JSON data structure
                // if integrating with YasQE we set the value :
                queryString = sparnatural.expandSparql(event.detail.queryString);
                yasqe.setValue(queryString);

                // and we could save the JSON query for later, e.g. to pass it as a parameter in a URL
                document.getElementById('query-json').value = JSON.stringify(event.detail.queryJson);
        });


        // if we have received a JSON data structure as a URL parameter "?query="
        // then uncompress it, and pass it to the loadQuery() function of Sparnatural
      var UrlString = window.location.search;
      var urlParams = new URLSearchParams(UrlString);
      if (urlParams.has("query") === true) {
        var compressedJson = urlParams.get("query") ;
        var compressCodec = JsonUrl('lzma');
        compressCodec.decompress(compressedJson).then(json => {
          sparnatural.loadQuery(JSON.parse(json)) ;
        });
      }
});


// if we have a dropdown to select example query from...
document.getElementById('select-examples').onchange = function() {
        var key = $('#select-examples option:selected').val();
        sparnatural.loadQuery(sampleQueries[key]) ;
}

```

## Exemple de requête JSON

La requête suivante dans Sparnatural (_Toutes les œuvres d'art exposées dans des musées français ou italiens, et créées au XIXe siècle, avec leur date de création_) :

![Exemple de requête Sparnatural](/assets/images/screenshot-JSON-data-structure.png)

Est modélisée dans la structure de données JSON suivante :

```json
{
  "distinct": true,
  "variables": [
    {
      "termType": "Variable",
      "value": "Artwork_1"
    },
    {
      "termType": "Variable",
      "value": "Date_6"
    }
  ],
  "order": null,
  "branches": [
    {
      "line": {
        "s": "Artwork_1",
        "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#displayedAt",
        "o": "Museum_2",
        "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Artwork",
        "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Museum",
        "values": []
      },
      "children": [
        {
          "line": {
            "s": "Museum_2",
            "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#country",
            "o": "Country_4",
            "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Museum",
            "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Country",
            "values": [
              {
                "label": "France (3987)",
                "rdfTerm": {
                  "type": "uri",
                  "value": "http://fr.dbpedia.org/resource/France"
                }
              },
              {
                "label": "Italy (1091)",
                "rdfTerm": {
                  "type": "uri",
                  "value": "http://fr.dbpedia.org/resource/Italie"
                }
              }
            ]
          },
          "children": []
        }
      ]
    },
    {
      "line": {
        "s": "Artwork_1",
        "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#creationYear",
        "o": "Date_6",
        "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Artwork",
        "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Date",
        "values": [
          {
            "label": "from 1800 to 1901",
            "start": "1799-12-31T23:50:40.000Z",
            "stop": "1901-12-31T23:50:38.000Z"
          }
        ]
      },
      "children": []
    }
  ]
}
```

## Référence de la structure de données JSON

Fondamentalement, la structure de données JSON encode un peu plus d'informations que la requête SPARQL générée, pour faciliter notre vie lors de l'analyse de la structure de données pour initialiser Sparnatural avec celle-ci. Elle ajoute :
  - Les libellés des valeurs
  - Les types de tous les sujets et objets
  - La structure en forme d'arborescence que Sparnatural utilise, qui serait difficile à deviner en regardant la chaîne SPARQL

La structure de données est composée d'une structure "Query" principale, qui contient des "branches". Chaque "branche" contient une "ligne de requête", correspondant à une ligne de l'interface Sparnatural, et les "enfants" de cette ligne, qui sont les lignes en dessous dans l'interface Sparnatural.

### Structure de la requête

```json
{
  "distinct": true,
  "variables": [
   {
      "termType": "Variable",
      "value": "this"
    },
    {
      "termType": "Variable",
      "value": "that"
    }
  ],
  "order": null,
  "branches": [
    ...
  ]
}
```

- `distinct` : indique si le mot-clé SPARQL `DISTINCT` doit être ajouté
- `variables` : liste ordonnée des variables sélectionnées dans la clause `WHERE`. `termType` est toujours `Variable`, et `value` est le nom de la variable (sans "?")
- `order` : par exemple, `"asc"` ou `"desc"` en fonction de la direction de tri. Ou `null` s'il n'y a pas de tri. Le tri se fait toujours sur la première colonne.
- `branches` : liste ordonnée des branches de la requête, chacune contenant un "arbre" de critères en dessous

### Structure de la branche de requête

```json
{
      "line": {
        ...
      },
      "children": [
        ...
      ],
      "optional": true,
      "notExists": false,
    },
```

- `line` : une seule ligne / critère de requête
- `children` : les enfants de cette ligne / critère, ceux qui se trouvent en dessous dans le constructeur de requêtes Sparnatural
- `optional` : indique si la ligne et tous ses enfants sont facultatifs (utilisation d'un "OPTIONAL" SPARQL)
- `notExists` : indique si la ligne et tous ses enfants sont négatifs (utilisation d'un "FILTER NOT EXISTS" SPARQL)

### Structure de la ligne de requête

```json
{
  "line": {
    "s": "Museum_2",
    "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#country",
    "o": "Country_4",
    "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Museum",
    "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Country",
    "values": [
      {
        "label": "France (3987)",
        "rdfTerm": {
          "type": "uri",
          "value": "http://fr.dbpedia.org/resource/France"
        }
      },
      {
        "label": "Italy (1091)",
        "rdfTerm": {
          "type": "uri",
          "value": "http://fr.dbpedia.org/resource/Italie"
        }
      }
    ]
  },
  "children": []
}
```

- `s` : variable du sujet
- `p` : URI du prédicat
- `o` : variable de l'objet
- `sType` : URI du type sélectionné du sujet
- `oType` : URI du type sélectionné de l'objet
- `values` : tableaux de valeurs sélectionnées pour l'objet, le cas échéant

### Valeurs

La structure des valeurs dépend de la structure du critère/ligne. Cela peut être :

- Un widget de sélection d'URI (liste déroulante, autocomplétion, arborescence) :

Si la valeur est une URI :

```json
  {
        "label": "Italy (1091)",
        "rdfTerm": {
          "type": "uri",
          "value": "http://fr.dbpedia.org/resource/Italie"
        }
  }
```

Si la valeur est un littéral (avec une langue) :

```json
  {
        "label": "foo",
        "rdfTerm": {
          "type": "literal",
          "value": "foo",
          "xml:lang": "en"
        }
  }
```

Si la valeur est un littéral (avec un type de données) :

```json
  {
        "label": "1",
        "rdfTerm": {
          "type": "literal",
          "value": "1",
          "datatype": "http://www.w3.org/2001/XMLSchema#integer"
        }
  }
```

- Un widget de sélection de date/heure :

```json
  {
    "label": "From 1800 to 1901",
    "start": "1800-01-01T00:00:00",
    "stop": "1901-12-31T23:59:59"
  }
```

- Un widget booléen :

```json
  {
    "label": "Vrai",
    "boolean": true
  }
```

- Un widget de recherche regex :

```json
  {
    "label": "...",
    "search": "..."
  }
```

- Un widget de nombre :

```json
  {
    "label": "between 10000 and 100000",
    "min": 10000,
    "max": 100000
  }
```

### Variables agrégées

Si la requête contient des variables agrégées (telles que `COUNT(?x)`), la structure de la requête de variable change comme suit :

```json
{
  "distinct": true,
  "variables": [
    {
      "expression": {
        "type": "aggregate",
        "aggregation": "count",
        "distinct": false,
        "expression": {
          "termType": "Variable",
          "value": "Artwork_1"
        }
      },
      "variable": {
        "termType": "Variable",
        "value": "Artwork_1_count"
      }
    }
  ],
}
```

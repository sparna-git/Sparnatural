_[Accueil](index.html) > Intégration des plugins YASGUI_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../YasGUI-plugins-integration.md) - le 19/11/2026


_Pour savoir comment intégrer Sparnatural avec YasQE et YasR, veuillez vous référer à la [documentation d'intégration Javascript](Javascript-integration.md)._

# Intégration des plugins YASGUI

Les fonctionnalités des plugins d'affichage de résultats personnalisés sont documentées dans la [page de référence des plugins d'affichage de résultats](result-display.md). Cette page donne les détails de la manière de les intégrer en Javascript.

## Comment utiliser les plugins

Tout d'abord, téléchargez le code Javascript des plugins depuis la [section des versions du projet Github sparnatural-yasgui-plugins](https://github.com/sparna-git/Sparnatural-yasgui-plugins/releases).

Ensuite, suivez ces étapes :

1. Chargez le code des plugins dans votre page web avec la balise `<script>`
2. Enregistrez les plugins supplémentaires avec YasR
	- Pour le plugin TableX, supprimez le plugin "table" par défaut et utilisez TableX à la place
3. éventuellement, configurez les plugins individuels pour ajuster leur comportement
4. ajustez l'intégration entre Sparnatural et les plugins afin que les plugins soient notifiés de la configuration et de la requête (voir ci-dessous)

```html
<script type="text/javascript" src="./sparnatural-yasgui-plugins.js"></script>
```

```javascript
      Yasr.registerPlugin("TableX",SparnaturalYasguiPlugins.TableX);
      Yasr.registerPlugin("Grid",SparnaturalYasguiPlugins.GridPlugin);
      Yasr.registerPlugin("Stats",SparnaturalYasguiPlugins.StatsPlugin);
      Yasr.registerPlugin("Map",SparnaturalYasguiPlugins.MapPlugin);

      delete Yasr.plugins['table'];
      delete Yasr.plugins['response'];
      const yasr = new Yasr(document.getElementById("yasr"), {
        pluginOrder: ["TableX", "Grid", "Stats", "Map"],
        defaultPlugin: "TableX",
        // désactiver la persistance
        persistencyExpire: 0,
        maxPersistentResponseSize: 0
      });

      if(lang == "fr") { 
        yasr.plugins["Grid"].config.lang = "fr";
        yasr.plugins["Stats"].config.lang = "fr";
      } else {
        yasr.plugins["Grid"].config.lang = "en";
        yasr.plugins["Stats"].config.lang = "en";
      }

      yasr.plugins["TableX"].config.uriHrefAdapter = function(uri) {
        if(uri.startsWith("http://fr.dbpedia.org/resource/")) {
          return "http://fr.wikipedia.org/wiki/" + uri.substring("http://fr.dbpedia.org/resource/".length);
        } else {
          return uri;
        }
      };

      // lie Sparnatural avec les plugins YasR
      bindSparnaturalWithYasrPlugins(sparnatural, yasr);
```

## Intégration Sparnatural / plugins

Les plugins doivent être notifiés de la configuration Sparnatural et de la requête émise par Sparnatural. Voyez comment cela est fait dans le fichier `sparnatural-bindings.js` dans les versions de Sparnatural, dans `bindSparnaturalWithYasrPlugins(sparnatural, yasr)`


## API

Ces plugins ont les méthodes suivantes :

- `notifyQuery(query)` : attend la structure de requête Sparnatural, pour être notifié de la structure de requête originale qui a été exécutée.
- `notifyConfig(specProvider)` : attend la configuration Sparnatural, pour connaître les libellés et icônes des propriétés et classes dans la config.

## Configuration

### Plugin TableX

```typescript
export interface PluginConfig {
  openIriInNewWindow: boolean;
  tableConfig: DataTables.Settings;
  includeControls: boolean;
  uriHrefAdapter?: (uri: string) => string;
  bindingSetAdapter?: (binding: Parser.Binding) => Parser.Binding;
}
```

#### Adapter l'URL du lien

Parfois, l'URI des entités n'est pas directement déréférençable et cliquer dessus mène à une erreur 404. Pour cette raison, le plugin TableX peut être personnalisé avec des fonctions qui peuvent prétraiter le résultat avant qu'il ne soit imprimé. Les 2 fonctions sont `uriHrefAdapter` et `bindingSetAdapter`.

La fonction `uriHrefAdapter` vous permet de changer une URI d'entrée en une autre URL de sortie. Elle est configurée comme suit :

```javascript
Yasr.plugins.LabelledUriTable.defaults.uriHrefAdapter = function(uri) {
	console.log("adapter appelé sur l'URI "+uri);
	// retourner ce que vous voulez qui sera utilisé à la place de l'URI d'entrée
	return uri;
};
```

Elle est appelée pour chaque URI dans l'ensemble de résultats, dans chaque colonne. Par exemple, elle peut être utilisée pour modifier les URI DBPedia en articles Wikipedia correspondants :

```javascript
Yasr.plugins.LabelledUriTable.defaults.uriHrefAdapter = function(uri) {
	if(uri.startsWith("http://fr.dbpedia.org/resource/")) {
	  return "http://fr.wikipedia.org/wiki/" + uri.substring("http://fr.dbpedia.org/resource/".length);
	} else {
	  return uri;
	}
};
```

La fonction `bindingSetAdapter` vous permet de traiter un ensemble de liaisons complet, c'est-à-dire une **ligne** entière dans le tableau de résultats, y compris les valeurs littérales. Elle est configurée comme suit :

```javascript
Yasr.plugins.LabelledUriTable.defaults.bindingSetAdapter = function(bindingSet) {
	console.log("adaptateur de jeu de liaisons appelé sur "+bindingSet);
	return bindingSet;
};
```

Par exemple, elle peut être utilisée pour générer un lien cliquable à partir d'une valeur littérale dans le jeu de liaisons :

```javascript
Yasr.plugins.LabelledUriTable.defaults.bindingSetAdapter = function(bindingSet) {
	var newBindingSet = {};
	for (var key in bindingSet) {
		// si nous sommes sur une colonne commençant par "code"...
	    if(key.startsWith("code")) {
	    	// alors insérez une nouvelle valeur qui est une URI basée sur la valeur littérale du code    
	        newBindingSet[key] = {
	            type: "uri",
	            value: "http://fake.uri/"+bindingSet[key].value
	        };
	        // et définissez le code comme la colonne "xxx_label" afin qu'il soit capté
	        // comme libellé à afficher
	        newBindingSet[key+"_label"] = bindingSet[key];
	    } else {
	        // par défaut, ne rien changer
	        newBindingSet[key] = bindingSet[key];
	    }
	}
	return newBindingSet;
};
```

### Plugin Grid

```typescript
interface PluginConfig {
  lang: "en" | "fr";
}
```

### Plugin Stats

```typescript
interface PluginConfig {
  lang: "en" | "fr";
}
```

### Plugin Map

```typescript
interface PluginConfig {
    baseLayers: Array<{
        urlTemplate: string, 
        options?: L.TileLayerOptions
    }>,
    polylineOptions: L.PolylineOptions | null,
    markerOptions: L.MarkerOptions | null,
    geoDataType: Array<string>,
    polygonDefaultColor: string,
    polygonColors: Array<string>,
    searchedPolygon: {
        fillColor: string,
        weight: number,
        opacity: number,
        color: string,
        dashArray: string,
        fillOpacity: number
    },
    mapSize: {
        width:string,
        height:string
    },
    setView: {
        center: L.LatLngExpression,
        zoom?: number,
        options?: L.ZoomPanOptions
    },
    parsingFunction: (literalValue:string)=> Geometry,
    L18n: {
        warnFindNoCoordinate: string, // utiliser le motif "<count>" à remplacer par le nombre de résultats sans coordonnées géographiques
        warnFindNoCoordinateBtn: string // Libellé du lien pour l'affichage du tableau du plugin dans le message d'avertissement
    }   
}
```

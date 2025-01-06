_[Home](index.html) > YASGUI plugin integration_

_For how-to integrate Sparnatural with YasQE and YasR, please refer to the [Javascript integration](Javascript-integration.md) documentation._

# YASGUI plugins integration

The features of the custom result display plugins are documented in the [result display plugins reference page](result-display.md). This page gives the details of how to integrate them in Javascript.

## How to use the plugins

First, download the javascript of the plugins from the [release section of the sparnatural-yasgui-plugins Github project](https://github.com/sparna-git/Sparnatural-yasgui-plugins/releases).

Then follow these steps:

1. Load plugins code in your webpage with `<script>` tag
2. Register additionnal plugins with YasR
	- For the TableX plugin, delete the default "table" plugin and use TableX instead
3. optionally, configure individual plugins to adjust their behavior
4. adjust the integration between Sparnatural and the plugins so that the plugins are notified of the configuration and the query (see below)

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
        // disable persistency
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

      // binds Sparnatural with the YasR plugins
      bindSparnaturalWithYasrPlugins(sparnatural, yasr);
```

## Sparnatural / plugins integration

The plugins need to be notified of the Sparnatural configuration and of the query issued by Sparnatural. See how this is done in the `sparnatural-bindings.js` file in Sparnatural releases, in `bindSparnaturalWithYasrPlugins(sparnatural, yasr)`


## API

These plugins have the following methods:

- `notifyQuery(query)` : expects the Sparnatural query structure, to be notified of the original query structure that was executed.
- `notifyConfig(specProvider)` : expects the Sparnatural configuration, to be aware of the labels and icons of the properties and classes in the config.

## Configuration

### TableX plugin

```typescript
export interface PluginConfig {
  openIriInNewWindow: boolean;
  tableConfig: DataTables.Settings;
  includeControls: boolean;
  uriHrefAdapter?: (uri: string) => string;
  bindingSetAdapter?: (binding: Parser.Binding) => Parser.Binding;
}
```

#### Adapting the URL of the link

Sometimes the URI of the entities is not directly dereferenceable and clicking on it would lead to a 404 error. For this reason, the TableX plugin can be customized with functions that can pre-process the result before it is being printed. The 2 functions are `uriHrefAdapter` and `bindingSetAdapter`.

The `uriHrefAdapter` function enables you to change an input URI to another output URL. It is configured like so:

```javascript
Yasr.plugins.LabelledUriTable.defaults.uriHrefAdapter = function(uri) {
	console.log("adapter called on uri "+uri);
	// return anything you like that will used instead of the input uri
	return uri;
};
```

It is called for every URI in the result set, in every column. For example it can be used to modify input DBPedia URI to the corresponding Wikipedia article:

```javascript
Yasr.plugins.LabelledUriTable.defaults.uriHrefAdapter = function(uri) {
	if(uri.startsWith("http://fr.dbpedia.org/resource/")) {
	  return "http://fr.wikipedia.org/wiki/" + uri.substring("http://fr.dbpedia.org/resource/".length);
	} else {
	  return uri;
	}
};
```

The `bindingSetAdapter` function enables you to process an entire binding set, that is an entire **line** in the result table, including literal values. It is configured like so :

```javascript
Yasr.plugins.LabelledUriTable.defaults.bindingSetAdapter = function(bindingSet) {
	console.log("binding set adapter called on "+bindingSet);
	return bindingSet;
};
```

For example it can be used to generate a clickable link from a literal value in the binding set:

```javascript
Yasr.plugins.LabelledUriTable.defaults.bindingSetAdapter = function(bindingSet) {
	var newBindingSet = {};
	for (var key in bindingSet) {
		// if we are on a column starting with "code"...
	    if(key.startsWith("code")) {
	    	// then insert a new value that is a URI based on the code literal value    
	        newBindingSet[key] = {
	            type: "uri",
	            value: "http://fake.uri/"+bindingSet[key].value
	        };
	        // and set the code as the "xxx_label" column so that it is picked up
	        // as a label to display
	        newBindingSet[key+"_label"] = bindingSet[key];
	    } else {
	        // default, don't change anything
	        newBindingSet[key] = bindingSet[key];
	    }
	}
	return newBindingSet;
};
```

### Grid plugin

```typescript
interface PluginConfig {
  lang: "en" | "fr";
}
```

### Stats plugin

```typescript
interface PluginConfig {
  lang: "en" | "fr";
}
```

### Map plugin

```typescript
interface PluginConfig {
    baseLayers: Array<{
        urlTemplate: string, 
        options?: L.TileLayerOptions
    }>
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
    }
    setView: {
        center: L.LatLngExpression,
        zoom?: number,
        options?: L.ZoomPanOptions
    }
    parsingFunction: (literalValue:string)=> Geometry,
    L18n: {
        warnFindNoCoordinate: string, // use "<count>" pattern to replace with count of results with no geo coordinates
        warnFindNoCoordinateBtn: string // Link label for plugin table display on warnig message
    }   
}
```
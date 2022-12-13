_[Home](index.html) > Javascript integration version 8_


# Javascript integration and parameters reference - version 8

_/!\This documentation applies to version 8 of Sparnatural. See the [version 7 integration documentation](Javascript-integration-v7) for version 7._

## Constructor

Sparnatural is inserted like a WebComponent. You need to declare a `<spar-natural>` tag in your HTML page:

```html
  <spar-natural></spar-natural>
```
and then
```javascript
 const sparnatural = document.querySelector("spar-natural");
 const settings = {
 	 // reference to OWL or JSON configuration
   config: "sparnatural-config.ttl",
   language: "en",
   // other parameters... see below
 }
```

A typical integration in a web page looks like this :

```javascript

			const sparnatural = document.querySelector("spar-natural");

      const settings = {
        language: "fr",
        // determine endpoint from a link somewhere in the page
        defaultEndpoint: function() { return $('#endpoint').attr('href') },
        config: "sparnatural-config.ttl",

        onQueryUpdated: function(queryString, queryJson, specProvider) {
        	// ... here : query post-processing ...
          queryString = semanticPostProcess(queryString, queryJson);
          queryString = limitPostProcess(queryString, queryJson);
          // set the value of the SPARQL string in a text area
          $('#sparql code').html(queryString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
          // then : integration with YASQE and YASR
          yasqe.setValue(queryString);

          // save JSON query somewhere
          document.getElementById('query-json').value = JSON.stringify(queryJson);
        },

        // triggered when "play" button is clicked
        onSubmit: ()=> {
            sparnatural.disablePlayBtn();
            // trigger the query from YasQE
            yasqe.query();
        },
      }

      sparnatural.settings = settings;
```


## Parameters reference


| Setting / Description | Default value if not set |
| ----- | --------- |
| **config** | `null` |
| Mandatory. Provides the configuration that specifies the classes and properties to be displayed, and how they are mapped to SPARQL. This can be either the URL of an OWL Turtle or RDF/XML file, an inline Turtle String, a URL to a JSON file, or a JSON object. Example : `sparnatural-config.ttl` |
| **language** | `en` |
| Language code to use to display the labels of classes and properties from the configuration file. | 
| **defaultEndpoint()** | `function () { return null; }` |
| A function returning the URL of a SPARQL endpoint that will be used as the default service for the datasource queries provided in the configuration. If not specified, each datasource should indicate explicitely a SPARQL endpoint, or the `autocomplete` and `list` parameters must be provided for low-level datasource integration.| 
| **addDistinct** | `true` |
| Whether the `DISTINCT` keyword should be inserted to the generated SPARQL query. | 
| **typePredicate** | `rdf:type` |
| The type predicate to use to generate the type criteria. Defaults to rdf:type, but could be changed to `http://www.wikidata.org/prop/direct/P31` for Wikidata integration. | 
| **maxDepth** | `4` |
| Maximum depth of the constructed query (number of inner 'Where' clauses). | 
| **maxOr** | `3` |
| Maximum number of different values that can be selected for a given property criteria. | 
| **backgroundBaseColor** | `29, 224, 153` |
| The base color to use as the background. This color should be given in the format 'R,G,B'. Transparency is applied to the base color to generate the color gradient. | 
| **autocomplete** |  |
| A Javascript object providing the necessary functions for the autocomplete widget. If using SPARQL datasources to populate the widgets, this is optional. This provides a low-level hook to populate autocomplete fields. See the [autocomplete reference](#autocomplete-reference) below | 
| **list** |  |
| A Javascript object providing the necessary functions for the list widget. If using SPARQL datasources to populate the widgets, this is optional. This provides a low-level hook to populate list fields. See the [list reference](#list-reference) below. | 
| **dates** |  |
| A Javascript object providing the necessary functions for the date widget. See the [dates reference](#dates-reference) below. |
| **onQueryUpdated** |  |
| A Javascript `function(queryString, queryJson, sparqlAsJson?) { ... }` taking as a parameter the SPARQL query String and the SPARQL query JSON data structure. The third optional parameter is the SPARQL query data structure, in the (SPARQL.js format)[https://github.com/RubenVerborgh/SPARQL.js/] See the [onQueryUpdated reference](#onQueryUpdated-reference) below| 
| **onReset** |  |
| A Javascript `function(sparnatural) { ... }` that is triggered when the reset button inside Sparnatural is clicked. This function is optional, if not provided, it is not called.| 
| **onSubmit** |  |
| A Javascript `function(sparnatural) { ... }` that is triggered when the submit button inside Sparnatural is clicked. This function is optional, if not provided, no submit button is displayed. See the See the [onSubmit reference](#onsubmit-reference) below| 
| **tooltipConfig** |  |
| The tooltip configuration object. Possible configuration options are described in [Tippy documentation here](https://atomiks.github.io/tippyjs/v6/all-props/). Defaults to : <pre>{ <br />  allowHTML: true,<br />  plugins: [], <br />  placement: 'right-start',<br />  offset: [5, 5],<br />  theme: 'sparnatural',<br />  arrow: false,<br />  delay: [800, 100],<br />  duration: [200, 200]<br />}</pre> | 
| **sparqlPrefixes** **/!\ unstable** | `{}` |
| A set of prefixes in the form `"foaf" : "http://xmlns.com/foaf/0.1/"` to be added to the output SPARQL query. This is an unstable param, current use is discouraged. | 
| **localCacheDataTtl** **/!\ beta feature** | 1000 * 60 * 60 * 24 |
| The time that the dropdown lists will be stored in cache on the client, if the server has allowed it in its response headers, that is if `Cache-Control: no-cache` header is returned in the response, no cache will happen, whatever the value of this field. The server can return `Cache-Control: public` for lists to be properly cached. | 
| **debug** | false |
| If set to `true`, Sparnatural will log JSON and SPARQL queries on the console, as they are generated. | 


## Sparnatural element API

The table below summarizes the various functions that can be called on the Sparnatural element.

| Function | Parameters |
| -------- | ----------- |
| **sparnatural.settings = ....** | A `settings` object as documented above |
| Sets the settings on the Sparnatural element, and displays it. Sparnatural is displayed only when its settings have been set. |
| **sparnatural.enablePlayBtn()** | none |
| Removes the loading from the play button once a query has finished executing. |
| **sparnatural.disablePlayBtn()** | none |
| Disables the play button once a query has started its execution. |
| **sparnatural.loadQuery(query)** | Query as documented in [the query JSON format](Query-JSON-format) |
| Loads a query structure in Sparnatural |
| **sparnatural.expandSparql(sparqlString)** | A SPARQL query string |
| Expands a SPARQL query string according to the configuration, in particular the `sparqlString` annotations, as documented in the [OWL-based configuration](OWL-based-configuration)|
| **sparnatural.clear()** | none |
| Clears the Sparnatural editor, as if the reset button was clicked. |

## autocomplete reference

If provided, the `autocomplete` object must provide the functions documented below. It is not necessary to provide this parameter if the autocomplete fields are populated from the SPARQL endpoint being queried.
The autocomplete feature relies on [Easyautocomplete](http://easyautocomplete.com/guide) so interested readers are invited to refer to Easyautocomplete documentation for more information.

```javascript
autocomplete : {
	/**
	 * This must return the URL that will be called when the user starts
	 * typing a few letter in a search field.
	 *
	 * @param {string} domain - The domain of the criteria currently being edited, i.e. type of the triple subjects.
	 * @param {string} property - The predicate of the criteria currently being edited
	 * @param {string} range - The range of the criteria currently being edited, i.e. type of the triple objects. This is the class of the entities being searched for.
	 * @param {string} key - The letters that the user has typed in the search field.
	 **/
	autocompleteUrl : function(domain, property, range, key) {
		console.log("Please specify function for autocompleteUrl option in in init parameters of Sparnatural : function(domain, property, range, key)") ;
	},

	/**
   	 * Returns the path in the returned JSON structure where the list of entries should be read.
   	 * This is typically the data structure itself, but can correspond to a subentry inside.
   	 *
	 * @param {string} domain - The domain of the criteria currently being edited
	 * @param {string} property - The predicate of the criteria currently being edited
	 * @param {string} range - The range of the criteria currently being edited
	 * @param {object} data - The data structure returned from an autocomplete call
   	 **/
	listLocation: function(domain, property, range, data) {
		return data;
	},

	/**
   	 * Returns the label to display for a single autocomplete result; defaults to `element.label`.
   	 *
   	 * @param {object} element - A single autocomplete result
   	 **/
	elementLabel: function(element) {
		return element.label;
	},

	/**
	 * Returns the URI to of a single autocomplete result; ; defaults to `element.uri`.
	 *
	 * @param {object} element - A single autocomplete result
	 **/
	elementUri: function(element) {
		return element.uri;
	},

	/**
	 * Whether the Easyautocomplete 'enableMatch' flag should be set; this should
	 * be useful only when loading the autocomplete results from a local file, leave to
	 * false otherwise.
	 **/
	enableMatch: function(domain, property, range) {
		return false;
	},
}
```

## list reference

If provided, the `list` object must provide the functions documented below to populate select dropdowns. It is not necessary to provide this parameter if the dropdown fields are populated from the SPARQL endpoint being queried.

```javascript
list : {

	/**
	 * This must return the URL that will be called to list the values to populate the dropdown.
	 *
	 * @param {string} domain - The domain of the criteria currently being edited, i.e. type of the triple subjects.
	 * @param {string} property - The predicate of the criteria currently being edited
	 * @param {string} range - The range of the criteria currently being edited, i.e. type of the triple objects. This is the class of the entities being searched for.
	 **/
	listUrl : function(domain, property, range) {
		console.log("Please specify function for listUrl option in in init parameters of Sparnatural : function(domain, property, range)" ) ;
	},

	/**
   	 * Returns the path in the returned JSON structure where the list of entries should be read.
   	 * This is typically the data structure itself, but can correspond to a subentry inside.
   	 *
	 * @param {string} domain - The domain of the criteria currently being edited
	 * @param {string} property - The predicate of the criteria currently being edited
	 * @param {string} range - The range of the criteria currently being edited
	 * @param {object} data - The data structure returned from a list call
   	 **/
	listLocation: function(domain, property, range, data) {
		return data;
	},

	/**
   	 * Returns the label to display for a single list entry; defaults to `element.label`.
   	 *
   	 * @param {object} element - A single list entry
   	 **/
	elementLabel: function(element) {
		return element.label;
	},

	/**
   	 * Returns the URI for a single list entry; defaults to `element.uri`.
   	 *
   	 * @param {object} element - A single list entry
   	 **/
	elementUri: function(element) {
		return element.uri;
	}
```

## dates reference

```javascript
dates : {
	datesUrl : function(domain, property, range, key) {
		console.log("Please specify function for datesUrl option in in init parameters of Sparnatural : function(domain, property, range, key)") ;
	},
	listLocation: function(domain, property, range, data) {
		return data;
	},
	elementLabel: function(element) {
		return element.label+' '+element.synonyms.join(' ');
	},
	elementStart: function(element) {
		return element.start.year;
	},
	elementEnd: function(element) {
		return element.stop.year;
	}				
}
```

## onQueryUpdated reference

The `onQueryUpdated` function is called everytime the query is modified :

```typescript
/**
 * Callback notified each time the query is modified.
 *
 * @param {object} queryString - The SPARQL query string
 * @param {object} queryJson - The query as a JSON data structure
 * @param {object} sparqlAsJson - The SPARQL query in the SPARQL.js structure
 **/
onQueryUpdated: function (
    queryString: any,
    queryJson: any,
    sparqlAsJson: any
  ) {
    console.log(queryString);
}
```

## onSubmit reference

The `onSubmit` function is called when the submit button is clicked. Sparnatural listens for other events to update the state of the button (loading/not loading state and active/disabled state). The functions are:
  - `disablePlayBtn()`
  - `enablePlayBtn()`

`disablePlayBtn()` should be called inside the `onSubmit()` method and `enablePlayBtn()` when the query has returned. In a typical integration with YasGUI this looks like this:

```javascript

			const sparnatural = document.querySelector("spar-natural");

      const settings = {
      	// ... other settings here ...
        onQueryUpdated: function(queryString, queryJson, specProvider) {
          // (...)
          yasqe.setValue(queryString);
        },

        // triggered when "play" button is clicked
        onSubmit: ()=> {
        		// disable play button
            sparnatural.disablePlayBtn();
            // trigger the query from YasQE
            yasqe.query();
        },
      }

      sparnatural.settings = settings;

      // ...

      const yasqe = new Yasqe(document.getElementById("yasqe"));
      const yasr = new Yasr(document.getElementById("yasr"));

      yasqe.on("queryResponse", function(_yasqe, response, duration) {
        // print the responses in YASR
        yasr.setResponse(response, duration);
        // re-enable play button in Sparnatural
        sparnatural.enablePlayBtn() ;
      }); 
```

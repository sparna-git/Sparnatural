## Configuration parameters reference

### Constructor


```javascript
  sparnatural = $('#ui-search').Sparnatural({
  	config: 'config/spec-search.json',
  	language: "en"
  	// other parameters... see below
  }) ;
```

A typical integration in a web page looks like this :

```javascript

var sparnatural;
      $( document ).ready(function($) {          

        sparnatural = $('#ui-search').Sparnatural({
          config: config,
          language: 'fr',
          maxDepth: 4,
          addDistinct: true,
          sendQueryOnFirstClassSelected: true,
          backgroundBaseColor: '2,184,117',
          autocomplete : null,
          list : null,
          defaultEndpoint : "http://dbpedia.org/sparql",
          onQueryUpdated: function(queryString, queryJson) {
            // ... here : query post-processing ...
            // then : integration with YASQE and YASR
            yasqe.setValue(queryString);
            yasqe.query();
          }
        });

      }) ;
```


### Parameters reference


| Setting / Description | Default value if not set |
| ----- | --------- |
| **config** | `config/spec-search.json` |
| Either a JSON object or a URL to the JSON configuration file that specifies the classes and properties to be displayed. |
| **language** | `en` |
| Language code to use to display the labels of classes and properties from the configuration file. | 
| **defaultEndpoint** | null |
| the URL of a SPARQL endpoint that will be used as the default target for the datasource queries provided in the configuration. If not specified, each datasource should indicate explicitely a SPARQL endpoint, or the `autocomplete` and `list` parameters must be provided for low-level datasource integration.| 
| **addDistinct** | `false` |
| Whether the `DISTINCT` keyword should be inserted to the generated SPARQL query. | 
| **typePredicate** | `rdf:type` |
| The type predicate to use to generate the type criteria. Defaults to rdf:type, but could be changed to wdt:p31 for Wikidata integration. | 
| **sendQueryOnFirstClassSelected** | `false` |
| Whether to emit the query when the very first class is selected, before the complete first criteria is complete, to select all the instances of this class. | 
| **maxDepth** | `3` |
| Maximum depth of the constructed query (number of inner 'Where' clauses). | 
| **maxOr** | `3` |
| Maximum number of different values that can be selected for a given property criteria. | 
| **backgroundBaseColor** | `250,136,3` |
| The base color to use as the background. This color should be given in the format 'R,G,B'. Transparency is applied to the base color to generate the color gradient. | 
| **sparqlPrefixes** | `{}` |
| A set of prefixes in the form `"foaf" : "http://xmlns.com/foaf/0.1/"` to be added to the output SPARQL query. | 
| **autocomplete** |  |
| A Javascript object providing the necessary functions for the autocomplete widget. If using SPARQL datasources to populate the widgets, this is optional. This provides a low-level hook to populate autocomplete fields. See the [autocomplete reference](#autocomplete-reference) below | 
| **list** |  |
| A Javascript object providing the necessary functions for the list widget. If using SPARQL datasources to populate the widgets, this is optional. This provides a low-level hook to populate list fields. See the [list reference](#list-reference) below. | 
| **dates** |  |
| A Javascript object providing the necessary functions for the date widget. See the [dates reference](#dates-reference) below. |
| **onQueryUpdated** |  |
| A Javascript `function(queryString, queryJson) { ... }` taking as a parameter the SPARQL query String and the SPARQL JSON data structure. See the [onQueryUpdated reference](#onQueryUpdated-reference) below| 


### Deprecated parameters

| Setting / Description | _Deprecated in..._ |
| ----- | --------- |
| pathLanguages | _deprecated in V2_ |
| Relative path to the directory where the static labels file can be found for translation. | 
| addObjectsTypeCriteria | _deprecated in V4_ |
| Replaced by noTypeCriteriaForObjects that can take an array of values. |
| **noTypeCriteriaForObjects** | _deprecated in V5_ |
| Replaced by stating that a class is subClassOf sparnatural:LinkedDataClass in the config. |  

### autocomplete reference

The `autocomplete` object must provide the functions documented below.
The autocomplete feature relies on [Easyautocomplete](http://easyautocomplete.com/guide) so interested readers are invited to refer to Easyautocomplete documentation for more information.

```javascript
{
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
		console.log("Veuillez préciser le nom de la fonction pour l'option autocompleteUrl dans les parametre d'initalisation de Sparnatural. La liste des parametres envoyées a votre fonction est la suivante : domain, property, range, key"  ) ;
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

### list reference

The `list` object must provide the functions documented below to populate select dropdowns.

```javascript
{

	/**
	 * This must return the URL that will be called to list the values to populate the dropdown.
	 *
	 * @param {string} domain - The domain of the criteria currently being edited, i.e. type of the triple subjects.
	 * @param {string} property - The predicate of the criteria currently being edited
	 * @param {string} range - The range of the criteria currently being edited, i.e. type of the triple objects. This is the class of the entities being searched for.
	 **/
	listUrl : function(domain, property, range) {
		console.log("Veuillez préciser le nom de la fonction pour l'option listUrl dans les parametre d'initalisation de Sparnatural. La liste des parametres envoyées a votre fonction est la suivante : domain, property, range" ) ;
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
}
```

### dates reference

```javascript
{
	datesUrl : function(domain, property, range, key) {
		//
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

### onQueryUpdated reference

The `onQueryUpdated` function is called everytime the query is modified :

```javascript
/**
 * Callback notified each time the query is modified.
 *
 * @param {object} queryString - The SPARQL query string
 * @param {object} queryJson - The query as a JSON data structure
 **/
onQueryUpdated : function (queryString, queryJson) {
	console.log(queryString) ;
}
```
require("./assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");


//

// removed to avoid x2 bundle size
// the dependency needs to be manually inserted in HTML pages
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenfengyuan/datepicker@1.0.9/dist/datepicker.min.css">
// <script src="https://cdn.jsdelivr.net/npm/@chenfengyuan/datepicker@1.0.9/dist/datepicker.min.js"></script>
//
// const datepicker = require("@chenfengyuan/datepicker") ;
// const $$ = require('jquery');

require("./assets/js/jquery-nice-select/jquery.nice-select.js");

const removeIcon = require("./assets/icons/buttons/remove.png");

// WARNING : if you use ES6 syntax (like import instead of require), 
// webpack will automatically add "use strict" as all ES6 modules 
// are expected to be strict mode code.

// This is ugly, should use i18n features instead
const i18nLabels = { 
	"en" : require('./assets/lang/en.json'),
	"fr": require('./assets/lang/fr.json')
};

const tippy = require('tippy.js').default;

require('tippy.js/dist/tippy.css');

const Sortable = require('sortablejs/modular/sortable.core.esm.js').Sortable;

JsonLdSpecificationProvider = require("./JsonLdSpecificationProvider.js").JsonLdSpecificationProvider;
SpecificationProviderFactory = require("./SpecificationProviderFactory.js").SpecificationProviderFactory;
RDFSpecificationProvider = require("./RDFSpecificationProvider.js").RDFSpecificationProvider ;
FilteringSpecificationProvider = require("./FilteringSpecificationProvider.js").FilteringSpecificationProvider ;
SparqlBifContainsAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").SparqlBifContainsAutocompleteAndListHandler;
SimpleSparqlAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").SimpleSparqlAutocompleteAndListHandler;
RangeBasedAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").RangeBasedAutocompleteAndListHandler;
PropertyBasedAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").PropertyBasedAutocompleteAndListHandler
WikidataAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").WikidataAutocompleteAndListHandler;
UriOnlyListHandler = require("./AutocompleteAndListHandlers.js").UriOnlyListHandler;
GraphDbLuceneConnectorSparqlAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").GraphDbLuceneConnectorSparqlAutocompleteAndListHandler;
SparqlTemplateListHandler = require("./AutocompleteAndListHandlers.js").SparqlTemplateListHandler;
SparqlTemplateAutocompleteHandler = require("./AutocompleteAndListHandlers.js").SparqlTemplateAutocompleteHandler;

SimpleStatisticsHandler = require("./StatisticsHandlers.js").SimpleStatisticsHandler;

JSONQueryGenerator = require("./QueryGenerators.js").JSONQueryGenerator;

QuerySPARQLWriter = require("./Query.js").QuerySPARQLWriter ;
AbstractValue = require("./Query.js").AbstractValue ;

SparnaturalComponents = require("./SparnaturalComponents.js");

require("./Widgets.js");

var Config = require("./SparnaturalConfig.js");
var Datasources = require("./SparnaturalConfigDatasources.js");
UiuxConfig = require("./UiuxConfig.js");

(function( $ ) {
	
    HTMLElement.prototype.Sparnatural = function( options ) {
 
    	var specProvider;

        var langSearch = {} ;
        
		var defaults = {
			config: 'config/spec-search.json',
			language: 'en',
			addDistinct: false,
			typePredicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
			maxDepth: 3,
			maxOr: 3,
			sendQueryOnFirstClassSelected: false,
			backgroundBaseColor: '250,136,3',
			sparqlPrefixes: {},
			defaultEndpoint: null,
			// whether or not to send count queries to determine
			// how many instances of each classes are properties are present in the graph
			filterConfigOnEndpoint: false,

			tooltipConfig : { // see all options on https://atomiks.github.io/tippyjs/v6/all-props/
				allowHTML: true,
				plugins: [], 
				placement: 'right-start',
				offset: [5, 5],
				theme: 'sparnatural',
				arrow: false,
				delay: [800, 100], //Delay in ms once a trigger event is fired before a tippy shows or hides.
				duration: [200, 200], //Duration in ms of the transition animation.
			},
			
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
			},			
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
			},
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
			},
			statistics : {
				countClassUrl : function(aClass) {
					console.log("Please specify function to count number of instances of each class : function(aClass)") ;
				},
				countPropertyUrl : function(domain, property, range) {
					console.log("Please specify function to count number of instances of each property : function(domain, property, range)") ;
				},
				countPropertyWithoutRangeUrl : function(domain, property) {
					console.log("Please specify function to count number of instances of each property without a range : function(domain, property)") ;
				},
				elementCount: function(data) {
					return data.results.bindings[0].count.value;
				}
			},
			
			/**
			 * Callback notified each time the query is modified.
			 *
			 * @param {object} queryString - The SPARQL query string
			 * @param {object} queryJson - The query as a JSON data structure
			 * @param {object} pivotJson - The query as a JSON data structure (new version)
			 **/
			onQueryUpdated : function (queryString, queryJson, pivotJson) {
				console.log("Veuillez préciser le nom de la fonction pour l'option onQueryUpdated dans les parametre d'initalisation de Sparnatural. Les parêtres envoyés à la fonction contiendront la requête convertie en Sparql et le Json servant à générer la requête" ) ;
			}
		};

		var VALUE_SELECTION_WIDGETS = [
			Config.LIST_PROPERTY,
			Config.LITERAL_LIST_PROPERTY,
			Config.AUTOCOMPLETE_PROPERTY
		];
		
		// merge given options with default values
		var settings = $.extend( true, {}, defaults, options );
		

		// all the components in Sparnatural
		this.components = [];

        var thisForm = {
        	sparnatural : this,
			submitOpened: true,
			firstInit: false,
			// JSON of the query to be loaded
			preLoad: false 
        } ;
		$(this).addClass('Sparnatural') ;
		
		langSearch = i18nLabels[settings.language];
		// defaults to English
		if(langSearch == null) {langSearch = i18nLabels["en"];}

		thisForm.langSearch = langSearch ;

		var specProviderFactory = new SpecificationProviderFactory();

		specProviderFactory.build(settings.config, settings.language, function(sp) {
			specProvider = sp;
			initForm(thisForm);
			// add the first CriteriaGroup to the component
			addComponent(thisForm, $(thisForm.sparnatural).find('ul')) ;
			$(thisForm.sparnatural).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
			// uncomment to trigger gathering of statistics
			// initStatistics(specProvider);
		});
		
		this.loadQuery = function(json) {
			var jsonWithLinks = preprocess(json);
			// console.log(jsonWithLinks);
			//Désactiver le submit du form
			//en amont reset de ce qui est déjà dans l'interface (fonction à part)
			if (thisForm.firstInit === true) {
				thisForm = loadQuery(thisForm, jsonWithLinks) ;
			} else {
				//Si un travail est en cours on attend...
				$(thisForm.sparnatural).on('initialised', function() {
					thisForm = loadQuery(thisForm, jsonWithLinks) ;
				}) ;
			}
		}

		this.clear = function() {
			thisForm = clearForm(thisForm) ;
		}	

		function loadQuery(form, json) {
			// stores the JSON to be preloaded
			form.preLoad = json ;
			// clear the form
			// On Clear form new component is automaticaly added, json gets loaded
			clearForm(form) ;
			
			// And now, submit form
			$(form.sparnatural).trigger('submit')
			form.preLoad = false ;
			// clear the jsonQueryBranch copied on every component, otherwise they always stay here
			// and we get the same criterias over and over when removing and re-editing
			form.sparnatural.components.forEach(function(component) { component.CriteriaGroup.jsonQueryBranch = null; });
			return form ;
		}

		function clearForm(form) {
			//Stop submit form on this work.
			form.submitOpened = false ;
			for (var i = form.sparnatural.components.length-1; i > -1; i--) {
				if ($(form.sparnatural.components[i].CriteriaGroup.AncestorComponentHtml).hasClass('componentsListe')) {
					form.sparnatural.components[i].CriteriaGroup.onRemoveCriteria() ;
				}
			}
			form.submitOpened = true ;
			return form ;
		}

		/**
		 * Returns the maximum index of variables within all the criterias
		 **/
		this.getMaxVarIndex = function() {
			var max = 0;
			for (var i = 0; i < this.components.length; i++) {
				var startVarName = this.components[i].CriteriaGroup.StartClassGroup.getVarName();
				var endVarName = this.components[i].CriteriaGroup.EndClassGroup.getVarName();

				if(startVarName && startVarName.split("_").length > 1) {
					var index = parseInt(startVarName.split("_")[1]);
					if(index > max) {
						max = index;
					}
				}

				if(endVarName && endVarName.split("_").length > 1) {
					var index = parseInt(endVarName.split("_")[1]);
					if(index > max) {
						max = index;
					}	
				}
			}

			return max;
		}

		
		
		function initForm(form) {	
			var contexte = $('<div class="bg-wrapper"><ul class="componentsListe"></ul></div><div class="variablesSelection"></div>');
			$(form.sparnatural).append(contexte) ;

			form.queryOptions = {
				distinct : true,
				displayVariableList: ['?this'],
				orderSort: null
			}

			initVariablesSelector(form) ;
			
			initGeneralEvent(form) ;
			
			// triggered when Sparnatural is submitted : generates output SPARQL query
			$(form.sparnatural).on('submit', { formObject : form }, function (event) {
				if (form.submitOpened == true) {
					event.preventDefault();

					// prints the JSON query data structure on the console
					var jsonGenerator = new JSONQueryGenerator();
					var jsonQuery = jsonGenerator.generateQuery(event.data.formObject);

					if(jsonQuery != null) {					
						console.log("*** New JSON Data structure ***");
						console.log(JSON.stringify(
							jsonQuery,
							null,
							4
						));

						// prints the SPARQL generated from the writing of the JSON data structure
						console.log("*** New SPARQL from JSON data structure ***");
						var writer = new QuerySPARQLWriter(
							settings.addDistinct,
							settings.typePredicate,
							specProvider
						);
						writer.setPrefixes(settings.sparqlPrefixes);
						console.log(writer.toSPARQL(jsonQuery));

						// fire callback
						settings.onQueryUpdated(writer.toSPARQL(jsonQuery), jsonQuery);
					}
				} 
			}) ;

			$(form.sparnatural).trigger({type: 'formInitialized'}) ;
		}

		function initVariablesSelector(form) {
			form.sparnatural.variablesSelector = {} ;
			this.form = form ;
			this.html = $(form.sparnatural).find('.variablesSelection').first() ; 
			this.selectedList = [] ;

			
			this.line1 = $('<div class="line1"></div>') ;
			this.line2 = $('<div class="line2"></div>') ;
			$(this.html).append(this.line1) ;
			$(this.html).append(this.line2) ;

			this.firstSelectHtml = $('<div class="variablesFirstSelect"></div>') ;
			this.otherSelectHtml = $('<div class="variablesOtherSelect"></div>') ;
			this.ordersSelectHtml = $('<div class="variablesOrdersSelect"><strong>'+langSearch.labelOrderSort+'</strong> <a class="asc">'+UiuxConfig.ICON_AZ+'</a><a class="desc">'+UiuxConfig.ICON_ZA+'</a><a class="none selected">'+UiuxConfig.ICON_NO_ORDER+'</a></div>') ;
			this.optionsSelectHtml = $('<div class="variablesOptionsSelect"><a class="switch label">Switch name</a></div>') ;

			$(this.line1).append(this.firstSelectHtml) ;
			$(this.line1).append(this.otherSelectHtml) ;

			$(this.line2).append(this.ordersSelectHtml) ;
			$(this.line2).append(this.optionsSelectHtml) ;

			form.sparnatural.variablesSelector = this ;
			form.sparnatural.variablesSelector.switchLabel = 'name' ; // or name

			// Listening when change sort order (AZ, ZA, None)
			$(this.ordersSelectHtml).find('a').on('change',
			{arg1: this, arg2: 'changeOrderSort'},
			SparnaturalComponents.eventProxiCriteria
			);

			$(this.ordersSelectHtml).find('a').on('click', function() {
				if ($(this).hasClass('selected')) {
					//No change, make nothing
				} else {
					$(this).parent('div').find('a').removeClass('selected') ;
					$(this).addClass('selected') ;
					$(this).trigger('change') ;
				}
			});


			var sortable = new Sortable(this.otherSelectHtml[0], {
				group: "name",  // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
				sort: true,  // sorting inside list
				delay: 0, // time in milliseconds to define when the sorting should start
				delayOnTouchOnly: false, // only delay if user is using touch
				touchStartThreshold: 0, // px, how many pixels the point should move before cancelling a delayed drag event
				disabled: false, // Disables the sortable if set to true.
				store: null,  // @see Store
				animation: 150,  // ms, animation speed moving items when sorting, `0` — without animation
				easing: "cubic-bezier(1, 0, 0, 1)", // Easing for animation. Defaults to null. See https://easings.net/ for examples.
				handle: "div>.variable-handle",  // Drag handle selector within list items
				filter: ".ignore-elements",  // Selectors that do not lead to dragging (String or Function)
				preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
				draggable: ".sortableItem",  // Specifies which items inside the element should be draggable
			
				dataIdAttr: 'data-variableName', // HTML attribute that is used by the `toArray()` method
			
				ghostClass: "sortable-ghost",  // Class name for the drop placeholder
				chosenClass: "sortable-chosen",  // Class name for the chosen item
				dragClass: "sortable-drag",  // Class name for the dragging item

			
				// Element is dropped into the list from another list
				onAdd: function (/**Event*/evt) {
					// same properties as onEnd
				},
			
				// Changed sorting within list
				onUpdate: function (/**Event*/evt) {
					// same properties as onEnd
					$(this).trigger( {type:"onUpdate" } ) ;
				},
			
				// Called by any change to the list (add / update / remove)
				onSort: function (/**Event*/evt) {
					// same properties as onEnd
				},
			
				// Called when dragging element changes position
				onEnd: function(/**Event*/evt) {
					evt.newIndex // most likely why this event is used is to get the dragging element's current index
					// same properties as onEnd
					var width = $('.sortableItem').first().width() ;
					$('.variablesOrdersSelect').width(width) ;

				}
			});

			$(sortable).on('onUpdate',
			{arg1: this, arg2: 'updateVariableList'},
			SparnaturalComponents.eventProxiCriteria
			);

			this.removeVariableName = function(name) {

			}

			this.changeOrderSort = function() {
				var selected = $(this.ordersSelectHtml).find('a.selected').first() ;
				var sort = null ;
				if ($(selected).hasClass('desc')) {
					sort = 'desc' ;
				}
				if ($(selected).hasClass('asc')) {
					sort = 'asc' ;
				}
				this.form.queryOptions.orderSort = sort ;
				$(this.form.sparnatural).trigger( {type:"submit" } ) ;
			}

			
			this.updateVariableList = function() {
				var listedItems = $(this.otherSelectHtml).find('.sortableItem>div') ;
				this.form.queryOptions.displayVariableList = [] ;
				for (var i = 0; i < listedItems.length; i++) {
					var variableName = $(listedItems[i]).attr('data-variablename'); 
					this.form.queryOptions.displayVariableList.push(variableName) ;
				}
				$(this.form.sparnatural).trigger( {type:"submit" } ) ;
			}
		}

		

		function initStatistics(aSpecProvider) {
			specProvider = new FilteringSpecificationProvider(aSpecProvider);

			/* Run statistics queries */
			var statisticsHandler = new SimpleStatisticsHandler(
	    		// endpoint URL
	    		settings.defaultEndpoint,
	    		
	    		// sparqlPostProcessor
	    		{
		            semanticPostProcess : function(sparql) {
		            	// also add prefixes
		                for (key in settings.sparqlPrefixes) {
					        sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
				    	}
		                return specProvider.expandSparql(sparql);
		            }
		        }
	    	);

	    	items = specProvider.getAllSparnaturalClasses() ;
			for (var key in items) {
				var aClass = items[key];

				if(!specProvider.isRemoteClass(aClass) && !specProvider.isLiteralClass(aClass)) {
					var options = {
						url: statisticsHandler.countClassUrl(aClass),
						dataType: "json",
						method: "GET",
						data: {
							  dataType: "json"
						},
						// keep reference to current class so that it can be accessed in handler
						context: { classUri: aClass }
					} ;

					var handler = function( data ) {
						var count = statisticsHandler.elementCount(data);
						// "this" refers to the "context" property of the options, see jQuery options
					  	specProvider.notifyClassCount(this.classUri, count);

					  	if(count > 0) {
					  		for (const aRange of specProvider.getConnectedClasses(this.classUri)) {
					  			
					  			for (const aProperty of specProvider.getConnectingProperties(this.classUri, aRange)) {

					  				var url;
					  				if(specProvider.isRemoteClass(aRange) || specProvider.isLiteralClass(aRange)) {
					  					url = statisticsHandler.countPropertyWithoutRangeUrl(this.classUri, aProperty);
					  				} else {
					  					url = statisticsHandler.countPropertyUrl(this.classUri, aProperty, aRange);
					  				}

					  				var options = {
										url: url,
										dataType: "json",
										method: "GET",
										data: {
											  dataType: "json"
										},
										// keep reference to current class so that it can be accessed in handler
										context: { 
											domain: this.classUri,
											property: aProperty,
											range: aRange
										}
									} ;

									var handler = function( data ) {
										var count = statisticsHandler.elementCount(data);
										// "this" refers to the "context" property of the options, see jQuery options
									  	specProvider.notifyPropertyCount(
									  		this.domain,
									  		this.property,
									  		this.range,
									  		count
									  	);
									}

									var requestProperty = $.ajax( options );
									requestProperty.done(handler);
					  			}
					  		}					  		
					  	}
					};

					var request = $.ajax( options );
					request.done(handler);
				}
			}

		}

		function expandQuery(sparqlQuery) {
			return specProvider.expandQuery(sparqlQuery);
		}
		
	function initGeneralEvent(thisForm_) {
		$('li.groupe').off( "mouseover" ) ;
		$('li.groupe').off( "mouseleave" ) ;
		$('li.groupe').on( "mouseover", function(event) {
			event.stopImmediatePropagation();
			$('li.groupe').removeClass('OnHover') ;
			$(this).addClass('OnHover') ;
			
		} );
		$('li.groupe').on( "mouseleave", function(event) {
			event.stopImmediatePropagation();
			$('li.groupe').removeClass('OnHover') ;
		} );
		 /*background: linear-gradient(180deg, rgba(255,0,0,1) 0%, rgba(255,0,0,1) 27%, rgba(5,193,255,1) 28%, rgba(5,193,255,1) 51%, rgba(255,0,0,1) 52%, rgba(255,0,0,1) 77%, rgba(0,0,0,1) 78%, rgba(0,0,0,1) 100%); /* w3c */
		 
		// var $all_li = $(thisForm_.sparnatural).find('li.groupe') ;
		var $all_li = $(thisForm_.sparnatural).find('li.groupe') ;
		var leng = $all_li.length ;
		if (leng  <= 10 ) {
			leng = 10 ;
		}
		var ratio = 100 / leng / 100 ;
		var prev = 0 ;
		var cssdef = 'linear-gradient(180deg' ; 
		$all_li .each(function(index) {
			var a = (index + 1 ) * ratio ;
			var height = $(this).find('>div').outerHeight(true) ;
			cssdef += ', rgba('+settings.backgroundBaseColor+','+a+') '+prev+'px, rgba('+settings.backgroundBaseColor+','+a+') '+(prev+height)+'px' ;
			prev = prev + height+1 ;
			if ($(this).next().length > 0 ) {
				$(this).addClass('hasAnd') ;
				var this_li = $(this) ;
				
				var this_link_and = $(this).find('.link-and-bottom') ;
				
				$(this_link_and).height($(this_li).height() ) ;
			} else {
				 $(this).removeClass('hasAnd') ;
			}
		});

		$(thisForm_.sparnatural).find('div.bg-wrapper').css({background : cssdef+')' }) ;

	}
		
	function addComponent(thisForm_, contexte, jsonQueryBranch = null) {
		if (thisForm_.sparnatural.components.length > 0 ) {
			var new_index = thisForm_.sparnatural.components[thisForm_.sparnatural.components.length-1].index + 1 ;
		} else {
			var new_index = 0 ;
		}
		
		// disable the WHERE if we have reached maximum depth
		var classWherePossible = 'addWereEnable' ;
		if (($(contexte).parents('li.groupe').length + 1 ) == (settings.maxDepth - 1) ) {
			classWherePossible = 'addWereDisable' ;
		}
		
		var gabari = '<li class="groupe" data-index="'+new_index+'"><span class="link-and-bottom"><span>'+langSearch.And+'</span></span><span class="link-where-bottom"></span><input name="a-'+new_index+'" type="hidden" value=""><input name="b-'+new_index+'" type="hidden" value=""><input name="c-'+new_index+'" type="hidden" value=""></li>' ;
		
		// si il faut descendre d'un niveau
		if ($(contexte).is('li')) {
			if ($(contexte).find('>ul').length == 0) {
				var ul = $('<ul class="childsList"><div class="lien-top"><span>'+langSearch.Where+'</span></div></ul>').appendTo($(contexte)) ;
				var parent_li = $(ul).parent('li') ;
				var n_width = 0;
				n_width = n_width + getOffset( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) - 111 + 15 + 11 + 20 + 5 + 3 ;
				var t_width = getOffset( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) + 15 + 11 + 20 + 5  ;
				$(ul).attr('data-test', getOffset( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) );
				$(ul).find('>.lien-top').css('width', n_width) ;
				$(parent_li).find('>.link-where-bottom').css('left', t_width) ;
			} else {
				var ul = $(contexte).find('>ul') ;
			}
			
			gabari = $(gabari).appendTo(ul);
		} else {
			gabari = $(gabari).appendTo(contexte) ;
		}

		$(gabari).addClass(classWherePossible) ;		
		
		var UnCritere = new CriteriaGroup(
			{ 
				AncestorHtmlContext: contexte,
				HtmlContext : gabari,
				FormContext: thisForm_,
				ContextComponentIndex: new_index
			},
			settings,
			specProvider,
			// pass the JSON query branch as an input parameter
			jsonQueryBranch
		);
		
		thisForm_.sparnatural.components.push({index: new_index, CriteriaGroup: UnCritere });			
		initGeneralEvent(thisForm_);

		//le critère est inséré et listé dans les composants, on peut lancer l'event de création
		$(UnCritere).trigger( {type:"Created" } ) ;
		if (thisForm_.firstInit == false) {
			thisForm_.firstInit = true ;
			$(thisForm_.sparnatural).trigger({type:'initialised'}) ;
		}
		

		return $(gabari) ;
	}

	/**
	 * A single line/criteria
	 **/
	function CriteriaGroup(context, settings, specProvider, jsonQueryBranch = null) {
		this._this = this ;
		this.thisForm_ = context.FormContext ;
		this.ComponentHtml = context.HtmlContext ;
		this.AncestorComponentHtml = context.AncestorHtmlContext ;
		
		this.settings = settings;

		// JSON query line from which this line needs to be initialized
		this.jsonQueryBranch = jsonQueryBranch;
		
		this.children = [];

		this.cssClasses = {
			HasAllComplete : false,
			IsOnEdit : false
		}
		this.id =  context.ContextComponentIndex ;
		this.html = $('<div id="CriteriaGroup-'+this.id+'" class="CriteriaGroup"></div>').appendTo(this.ComponentHtml) ;
		
		// create all the elements of the criteria
		this.StartClassGroup = new SparnaturalComponents.StartClassGroup(this, specProvider, settings) ;
		this.OptionsGroup = new SparnaturalComponents.OptionsGroup(this, specProvider) ;
		this.ObjectPropertyGroup = new SparnaturalComponents.ObjectPropertyGroup(this, specProvider, settings, langSearch.ObjectPropertyTemporaryLabel) ;
		this.EndClassGroup = new SparnaturalComponents.EndClassGroup(this, specProvider, settings) ;
		this.EndClassWidgetGroup = new EndClassWidgetGroup(this, this.settings, specProvider) ;
		this.ActionsGroup = new ActionsGroup(this, specProvider) ;

		// hook all components together
		$(this).on('StartClassGroupSelected', function () { this.ObjectPropertyGroup.onStartClassGroupSelected(); });
		$(this).on('StartClassGroupSelected', function () { this.EndClassGroup.onStartClassGroupSelected(); });
		$(this).on('Created', function () { this.StartClassGroup.onCreated(); });
		$(this).on('EndClassGroupSelected', function () { this.ObjectPropertyGroup.onEndClassGroupSelected(); });
		$(this).on('ObjectPropertyGroupSelected', function () { this.EndClassWidgetGroup.onObjectPropertyGroupSelected(); });
		$(this).on('ObjectPropertyGroupSelected', function () { this.OptionsGroup.onObjectPropertyGroupSelected(); });
		$(this).on('Created', function () { this.ActionsGroup.onCreated(); });
		$(this).on('ObjectPropertyGroupSelected', function () {	this.ActionsGroup.onObjectPropertyGroupSelected();  });	

		// trigger the init event
		//$(this).trigger( {type:"Created" } ) ;
		
		this.initCompleted = function () {
			$(this.html).parent('li').addClass('completed') ;
		}
		
		this.onRemoveCriteria = function() {
			var index_to_remove = this.id ;

			//RemoveSelectedVariable names 
			if (this.EndClassGroup.variableSelector != null) {
				this.EndClassGroup.variableSelector.remove() ;
				this.EndClassGroup.variableSelector = null;
			}
			

			//Remove option selected if enbled
			if ($(this.html).parents('li').first().hasClass('optionEnabled')) {
				$(this.html).parents('li').first().parents('li.groupe').each(function() {
					$(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Enabled') ;
					$(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Disabled') ;
				});
				$(this.html).parents('li').first().find('li.groupe').each(function() {
					$(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Enabled') ;
					$(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Disabled') ;
				});
			}
			// iterate on every "line" in the query
			$(this.thisForm_.sparnatural.components).each(function() {
				var parentOrSibling = SparnaturalComponents.findParentOrSiblingCriteria(this.CriteriaGroup.thisForm_, this.index ) ;
				if ((parentOrSibling != null) && (parentOrSibling.type == 'parent')){
					// if the line is a child of the one to remove, remove it too
					if (parentOrSibling.element.id == index_to_remove) {
						this.CriteriaGroup.onRemoveCriteria() ;
					}
				}
			}) ;
			
			var formObject = this.thisForm_ ;
			var formContextHtml = this.AncestorComponentHtml;
			
			// fetch parentOrSibling _before_ removing HTML and removing
			// component from list !!
			var parentOrSibling = SparnaturalComponents.findParentOrSiblingCriteria(this.thisForm_, this.id ) ;

			// remove event listeners
			this.ComponentHtml.outerHTML = this.ComponentHtml.outerHTML;
			// remove the HTML
			$(this.ComponentHtml).remove() ;
			
			var iteration_to_remove = false ;
			$(this.thisForm_.sparnatural.components).each(function(i) {					
				if (this.index == index_to_remove){					
					iteration_to_remove = i ;
				}
			}) ;
			// remove from list of components
			this.thisForm_.sparnatural.components.splice(iteration_to_remove , 1);
			
			
			if (this.thisForm_.sparnatural.components.length == 0) {
				// top-level criteria : add first criteria and trigger click on class selection
				var jsonQueryBranch = null;
				// if this is the very first criteria and there is a query to read, start from
				// the first branch
				if(this.thisForm_.preLoad !== false) {
					jsonQueryBranch = this.thisForm_.preLoad.branches[0];
				}

				$('.variablesOtherSelect .sortableItem').remove() ;

				var new_component = addComponent(formObject, formContextHtml, jsonQueryBranch) ;			
				$(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;				
			} else {
				if (parentOrSibling !== null) {
					var dependantComponent = parentOrSibling.element ;
					if ($(dependantComponent.ComponentHtml).find('li.groupe').length > 0) {
						
					} else {
						//Si pas d'enfant, on reaffiche le where action						
						if ($(dependantComponent.ComponentHtml).hasClass('haveWhereChild') ) {
							$(dependantComponent.ComponentHtml).removeClass('haveWhereChild') ;
							$(dependantComponent.ComponentHtml).removeClass('completed') ;
						}
						$(dependantComponent.ComponentHtml).find('>ul.childsList').remove() ;
					}
				}

				// re-submit form after deletion
				initGeneralEvent(formObject) ;
				$(this.thisForm_.sparnatural).trigger( { type:"submit" } ) ;
			}
			
			return false ;
		}		
	}
	
	function GroupContenaire() {
		this.baseCssClass = "GroupContenaire";
		this.parentCriteriaGroup = null ;
		this.inputTypeComponent = null ;
		this.tools = null ;
		this.widgetHtml = false ;
		this.html = $() ;
		this.cssClasses = {
			HasInputsCompleted : false,
			IsOnEdit : false,
			Invisible: false
		};
		this.value_selected = null ;
		this.variableNamePreload = null ;
		
		this.init = function() {			
			if (!this.cssClasses.Created) {				
				this.cssClasses.IsOnEdit = true ;
				this.HtmlContainer = this.parentCriteriaGroup ;
				//this.html.remove() ;
				this.tools = new GenericTools(this) ;
				this.tools.initHtml() ;
				this.tools.attachHtml() ;
				this.cssClasses.Created = true ;				
			} else {
				this.tools.updateCssClasses() ;
			}
		} ;
	} 
	
	/**
	 * Shows the selected values at the end of a criteria/line,
	 * and encapsulates the ObjectPropertyTypeWidget to select the values
	 **/
	function EndClassWidgetGroup(CriteriaGroupe, settings, specProvider) {
		this.base = GroupContenaire ;
		this.base() ;
		this.baseCssClass = "EndClassWidgetGroup";
		this.settings = settings;
		this.specProvider = specProvider;
		this.parentCriteriaGroup = CriteriaGroupe ;
		this.cssClasses.EndClassWidgetGroup = true ;
		this.cssClasses.Created = false ;
		this.selectedValues = [] ;
		
		this.inputTypeComponent = new ObjectPropertyTypeWidget(this, this.settings, specProvider) ;

		/**
		 * Called when the property/link between domain and range is selected, to init this.
		 **/
		this.onObjectPropertyGroupSelected = function() {
			// Affichage de la ligne des actions 
			this.parentCriteriaGroup.ComponentHtml.addClass('OnEdit') ;
			// determine widget type
			// this.widgetType = this.specProvider.getObjectPropertyType(this.parentCriteriaGroup.ObjectPropertyGroup.selectedValues);
			this.inputTypeComponent.HtmlContainer.html = $(this.parentCriteriaGroup.EndClassGroup.html).find('.EditComponents') ;
			
			if (this.parentCriteriaGroup.ActionsGroup.reinsert == true) {
				this.inputTypeComponent.reload() ;
			} else {
				this.inputTypeComponent.init() ;
			}

			// binds a selection in an input widget with the display of the value in the line
			$(this.inputTypeComponent).on(
				'change',
				{
					arg1: this,
					arg2: 'onChange'
				},
				SparnaturalComponents.eventProxiCriteria
			);
			// binds a selection in an input widget with the display of the value in the line
			$(this.inputTypeComponent).on(
				'selectAll',
				{
					arg1: this,
					arg2: 'onSelectAll'
				},
				SparnaturalComponents.eventProxiCriteria
			);
			
			if(this.parentCriteriaGroup.jsonQueryBranch != null) {
				var branch = this.parentCriteriaGroup.jsonQueryBranch;
				for (var key in branch.line.values) {
					this.loadValue(branch.line.values[key]) ;
				}
			}
			
		}
		
		// input : the 'key' of the value to be deleted
		this.onRemoveValue = function removeValue(e) {
console.log('removeValue') ;
			//On all case, selectAllValue will be set to false
			this.selectAllValue = false;
			
			var keyToBeDeleted = $(e.currentTarget).attr('value-data') ;
			for (var item in this.selectedValues) {
				if(this.selectedValues[item].key == keyToBeDeleted) {
					this.selectedValues.splice(item, 1); 
				}
			}
			$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').show() ;

			$(e.currentTarget).parent('div').remove() ;

			if(this.selectedValues.length < 1) {
				$(this.parentCriteriaGroup.ComponentHtml).removeClass('completed') ;
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').remove() ;
				$(this.parentCriteriaGroup.html).parent('li').removeClass('WhereImpossible') ;
				// N'est plus à cacher, lutilisateur peut choisi d'afficher les valeurs
				//$(this.parentCriteriaGroup.html).parent('li').removeClass('hideEndClassProperty') ;
				
				// re-enable Where action if end class can be connected to others
				if (this.parentCriteriaGroup.EndClassGroup.specProvider.hasConnectedClasses(this.parentCriteriaGroup.EndClassGroup.value_selected)) {
					$(this.parentCriteriaGroup.html).parent('li').removeClass('WhereImpossible') ;
				} else {
					$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
				}

				// re-enable selection of property/link if there are multiple choices of properties
				if ($(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').find('option').length > 1 ) {
					$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').removeAttr('disabled').niceSelect('update'); 
				} else {
					$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
				}

				// re-init the widget to empty input field
				this.inputTypeComponent.reload() ;
			}

			$(this.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupUnselected" } ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;

			initGeneralEvent(this.parentCriteriaGroup.thisForm_);

		} ;

		this.loadValue = function loadValue(value) {
			this.inputTypeComponent.loadedValue = AbstractValue.valueToWidgetValue(value) ;
			$(this.inputTypeComponent).trigger('change') ;
			//Value added don't reuse preloaded data.
			this.inputTypeComponent.loadedValue = null ;
		}


		this.onSelectAll = function onSelectAll() {
			var theValueLabel = '<span>'+langSearch.SelectAllValues+'</span>';
			this.selectAllValue = true;
			this.unselect = $('<span class="unselect" value-data="allValues"><i class="far fa-times-circle"></i></span>') ;
			if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 0) {
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append($('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>')).find('div').first().append(this.unselect) ;
			}

			this.unselect.on(
				'click',
				{	arg1: this,	arg2: 'onRemoveValue'	},
				SparnaturalComponents.eventProxiCriteria
			);

			// disable the Where
			$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
			
			this.parentCriteriaGroup.initCompleted() ;
			
			$(this.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
			initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		}

		// sélection et affichage d'une valeur sélectionnée par un widget de saisie
		// la structure attendue est
		// {
		//   key : ... ,
		//   label: ... ,
		//   + soit 'uri', soit 'search', soit 'start' et 'stop' en fonction du widget
		// }
		this.onChange = function onChange() {
			var theValue = this.inputTypeComponent.getValue() ;
			// put span around with proper class if coming from a date widget
			var theValueLabel = '<span'+((theValue.start || theValue.stop)?' class="label-two-line"':'')+'>' + theValue.label + '</span>';
			if (theValue == null ) {
				return false ;
			}
			// if the same value is already selected, don't do anything
			for (var item in this.selectedValues) {
				if(this.selectedValues[item].key == theValue.key) {
					return false;
				}
			}

			this.selectedValues.push(theValue) ;			
			
			// var value_data = (Array.isArray(theValue))?theValue.toString():theValue;

			this.unselect = $('<span class="unselect" value-data="'+theValue.key+'"><i class="far fa-times-circle"></i></span>') ;
			if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 0) {
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append($('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>')).find('div').first().append(this.unselect) ;
			} else {
				var temp_html = $('<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p>'+theValueLabel+'</p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>').append(this.unselect)  ;
				var ellle = $(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').before(temp_html) ;
			}

			// binds a click on the remove cross with the removeValue function
			this.unselect.on(
				'click',
				{	arg1: this,	arg2: 'onRemoveValue'	},
				SparnaturalComponents.eventProxiCriteria
			);

			// disable the Where
			$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
			
			this.parentCriteriaGroup.initCompleted() ;
			
			$(this.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
			
			if ( VALUE_SELECTION_WIDGETS.indexOf(this.inputTypeComponent.widgetType) !== -1 ) {
				if ($(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 1) {
					$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetAddOrValue flexWrap"><div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div><p><span>+</span></p><div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div></div>') ;
					// hook a click on the plus to the needAddOrValue function
					$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup>.EndClassWidgetAddOrValue').on(
						'click',
						{arg1: this, arg2: 'onAddOrValue'},
						SparnaturalComponents.eventProxiCriteria
					);
				}
			}

			//Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
			if (this.selectedValues.length == settings.maxOr) {
				$(this.parentCriteriaGroup.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').hide() ;
			}

			if (this.selectedValues.length > 0 ) {
				$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			}
			
			$(this.parentCriteriaGroup.html).find('.EndClassGroup>.EditComponents').removeClass('newOr') ;

			initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		};
		
		this.onAddOrValue = function needAddOrValue() {
			$(this.parentCriteriaGroup.html).find('.EndClassGroup>.EditComponents').addClass('newOr') ;
			// On vide les champs de saisie du widget
			this.inputTypeComponent.reload() ;
		};
		
		this.init() ;
		
	}


	/**
	 * Groups all the actions on a line/criteria (AND / REMOVE / WHERE)
	 * even if they are visually not connected
	 **/
	function ActionsGroup(CriteriaGroupe, specProvider) {
		this.base = GroupContenaire ;
		this.base() ;
		this.baseCssClass = "ActionsGroup";
		this.parentCriteriaGroup = CriteriaGroupe ;
		this.cssClasses = {
			ActionsGroup : true ,
			Created : false
		};
		this.reinsert = false;
		
		this.actions = { 
			ActionWhere: new ActionWhere(this, specProvider),
			ActionAnd: new ActionAnd(this),
			ActionRemove: new ActionRemove(this)
		} ;

		this.onCreated = function() {
			this.actions.ActionRemove.init() ;
			
			$(this.actions.ActionRemove.html).find('a').on(
				'click',
				{
					arg1: this.parentCriteriaGroup,
					arg2: 'onRemoveCriteria'
				},
				SparnaturalComponents.eventProxiCriteria
			);

			if(this.parentCriteriaGroup.jsonQueryBranch != null) {
				var branch = this.parentCriteriaGroup.jsonQueryBranch;
				if(branch.children.length > 0) {
					$(this.actions.ActionWhere.html).find('a').trigger('click') ;
				}
				if(branch.nextSibling != null) {
					$(this.actions.ActionAnd.html).find('a').trigger('click') ;
				}
			}
		}

		this.onObjectPropertyGroupSelected = function() {
			this.actions.ActionWhere.HtmlContainer.html = $(this.parentCriteriaGroup.EndClassGroup.html).find('.EditComponents') ;
			if (this.reinsert == true) {
				this.actions.ActionWhere.reload() ;
				this.actions.ActionAnd.reload() ;
			} else {
				this.actions.ActionWhere.init() ;
				this.actions.ActionAnd.init() ;
				this.reinsert = true ;
			}			
			
			$(this.actions.ActionWhere.html).find('a').on(
				'click', 
				{
					arg1: this,
					arg2: 'onAddWhere'
				},
				SparnaturalComponents.eventProxiCriteria
			);
			$(this.actions.ActionAnd.html).find('a').on(
				'click',
				{
					arg1: this,
					arg2: 'onAddAnd'
				},
				SparnaturalComponents.eventProxiCriteria
			);
			
			initGeneralEvent(this.parentCriteriaGroup.thisForm_);
		}
		
		this.onAddWhere = function () {	
			this.parentCriteriaGroup.html.parent('li').addClass('haveWhereChild') ;
			this.parentCriteriaGroup.initCompleted() ;
			
			var new_component = addComponent(
				this.parentCriteriaGroup.thisForm_,
				this.parentCriteriaGroup.ComponentHtml,
				(this.parentCriteriaGroup.jsonQueryBranch && this.parentCriteriaGroup.jsonQueryBranch.children && this.parentCriteriaGroup.jsonQueryBranch.children.length > 0)?this.parentCriteriaGroup.jsonQueryBranch.children[0]:null
			) ;
			
			// trigger 2 clicks to select the same class as the object class (?)
			$(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
			$(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
		}

		this.onAddAnd = function () {
			var new_component = addComponent(
				this.parentCriteriaGroup.thisForm_,
				this.parentCriteriaGroup.AncestorComponentHtml,
				(this.parentCriteriaGroup.jsonQueryBranch)?this.parentCriteriaGroup.jsonQueryBranch.nextSibling:null
			) ;
			
			// trigger 2 clicks to select the same class as the current criteria (?)
			$(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
			$(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;

			return false ;			
		}

		this.onChange = function onChange() { };
		
		this.init() ;
		
	}	
	
	function ActionWhere(GroupContenaire, specProvider) {
		this.baseCssClass = "ActionWhere";
		this.specProvider = specProvider;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = {} ;
		this.cssClasses = {
			ActionWhere : true,
			ShowOnEdit : true,
			Created : false
		};

		this.init = function (reload = false) {
			if (this.ParentComponent.reinsert && !reload) {
				return this.reload() ;
			}
				
			var endClassGroup = this.ParentComponent.parentCriteriaGroup.EndClassGroup ;
			var choiceNumber = 2 ;
			if (endClassGroup.parentCriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetHtml == null) {
				choiceNumber = 1 ;
				$(endClassGroup.html).addClass('noPropertyWidget') ;
			} else {
				$(endClassGroup.html).removeClass('noPropertyWidget') ;
			}
			var endLabel = specProvider.getLabel(endClassGroup.value_selected) ;
			var widgetLabel = '<span class="trait-top"></span><span class="edit-trait"><span class="edit-num">'+choiceNumber+'</span></span>'+langSearch.Search+' '+ endLabel + ' '+langSearch.That+'...' ;

			this.widgetHtml = widgetLabel+'<a>+</a>' ;
			this.cssClasses.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.initHtml() ;
			this.tools.attachHtml() ;

			this.cssClasses.Created = true ;
		} ;	
		
		this.reload = function() {
			this.init(true);
		} ;
	}	
	
	function ActionAnd(GroupContenaire) {
		this.baseCssClass = "ActionAnd";
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.cssClasses = {
			ActionAnd : true ,
			ShowOnHover : true ,
			Created : false
		}; 

		this.init = function (reload = false) {
			if (this.ParentComponent.reinsert && !reload) {
				return this.reload() ;
			}

			this.widgetHtml = '<span class="trait-and-bottom"></span><a>'+langSearch.And+'</a>' ;
			this.cssClasses.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.initHtml() ;
			this.tools.attachHtml() ;		
			this.cssClasses.Created = true ;			
		} ;	
		
		this.reload = function() {
			this.init(true);
		} ;
	}	
	
	function ActionRemove(GroupContenaire) {
		this.baseCssClass = "ActionRemove";
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;	
		this.cssClasses = {
			ActionRemove : true ,
			Created : false
		}; 

		this.init = function () {
			this.widgetHtml = '<a><span class="unselect"><i class="far fa-times-circle"></i></span></a>' ;
			this.cssClasses.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.initHtml() ;
			this.tools.attachHtml() ;			
			this.cssClasses.Created = true ;		
		} ;	
		
		this.reload = function() {
			this.init();
		} ;	
	}	



	
	/**
	 * Selects the value for a range in a criteria/line, using a value selection widget
	 **/	
	function ObjectPropertyTypeWidget(GroupContenaire, settings, specProvider) {
		this.baseCssClass = "ObjectPropertyTypeWidget";
		this.specProvider = specProvider;
		this.settings = settings;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.html = '<div></div>' ;
		this.tools = null ;
		this.widgetHtml = null ;
		this.widgetType = null ;		
		this.cssClasses = {
			ObjectPropertyTypeWidget : true,
			Created : false
		} ;
		this.loadedValue = null ;
		
		this.init = function init(reload = false) {
			if (!reload && this.cssClasses.Created) {
				this.tools.updateCssClasses() ;
				return true ;
			}

			// determine widget type
			var objectPropertyId = this.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected;
			this.widgetType = this.specProvider.getObjectPropertyType(objectPropertyId);

			// if non selectable, simply exit
			if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
				this.ParentComponent.parentCriteriaGroup.initCompleted() ;
			
				//$(this.ParentComponent.parentCriteriaGroup).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
				$(this.ParentComponent.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
				initGeneralEvent(this.ParentComponent.parentCriteriaGroup.thisForm_);
				return true;
			}

			// determine label and bit of HTML to select value
			var rangeClassId = this.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected
			var classLabel = specProvider.getLabel(rangeClassId) ;
			if (
				this.widgetType == Config.SEARCH_PROPERTY
				||
				this.widgetType == Config.STRING_EQUALS_PROPERTY
				||
				this.widgetType == Config.GRAPHDB_SEARCH_PROPERTY
			) {
				// label of the "Search" pseudo-class is inserted alone in this case
				var endLabel = classLabel;
			} else if(
				this.widgetType == Config.LIST_PROPERTY
				||
				this.widgetType == Config.TIME_PROPERTY_DATE
				||
				this.widgetType == Config.TIME_PROPERTY_YEAR
			){
				var endLabel = langSearch.Select+" :" ;
			} else {
				var endLabel = langSearch.Find+" :" ;
			}

			//Ajout de l'option all
			var selcetAll = '<span class="selectAll"><span class="underline">'+langSearch.SelectAllValues+'</span> ('+classLabel+') </span><span class="or">'+langSearch.Or+'</span> ' ;

			var widgetLabel = '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>'+ selcetAll + '<span>'+ endLabel+'</span>' ;
			
			// init HTML by concatenating bit of HTML + widget HTML

			if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
				this.widgetHtml = "" ;
			} else {
				this.createWidgetComponent(
					this.widgetType,
					objectPropertyId,
					rangeClassId
				) ;
				this.widgetHtml = widgetLabel + this.widgetComponent.html ;
			}
			var this_component = this;
			
			

			this.cssClasses.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.initHtml() ;
			this.tools.attachHtml() ;

			this.widgetComponent.init() ;
			this.cssClasses.Created = true ;
			$(this.html).find('.selectAll').first().on("click", function() {
				$(this_component).trigger('selectAll') ;
			});

		}

		this.reload = function reload() {
			if (this.tools === null) {
				this.init(false);
				return true;
			}
			//this.html = "" ;
			this.tools.remove() ;
			this.widgetHtml = null;
			this.init(true);
		}

		this.createWidgetComponent = function createWidgetComponent(widgetType, objectPropertyId, rangeClassId) {
			switch (widgetType) {
			  case Config.LITERAL_LIST_PROPERTY: {
				// defaut handler to be used
			    var handler = this.settings.list;
			    
			    // to be passed in anonymous functions
			    var theSpecProvider = this.specProvider;

			    // determine custom datasource
			    var datasource = this.specProvider.getDatasource(objectPropertyId);

			    if(datasource == null) {
			    	// try to read it on the class
			    	datasource = this.specProvider.getDatasource(rangeClassId);
			    }

			    if(datasource == null) {

			    	// datasource still null
			    	// if a default endpoint was provided, provide default datasource
			    	if(this.settings.defaultEndpoint != null) {
				    	datasource = Datasources.DATASOURCES_CONFIG.get(Datasources.LITERAL_LIST_ALPHA);
				    }
			    }

				if(datasource != null) {
			    	// if we have a datasource, possibly the default one, provide a config based
			    	// on a SparqlTemplate, otherwise use the handler provided
				    handler = new SparqlTemplateListHandler(
			    		// endpoint URL
			    		(datasource.sparqlEndpointUrl != null)?datasource.sparqlEndpointUrl:this.settings.defaultEndpoint,
			    		
			    		// sparqlPostProcessor
			    		{
				            semanticPostProcess : function(sparql) {
				            	// also add prefixes
				                for (key in settings.sparqlPrefixes) {
							        sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
						    	}
				                return theSpecProvider.expandSparql(sparql);
				            }
				        },

			    		// language,
			    		this.settings.language,

			    		// labelPath
			    		(datasource.labelPath != null)?datasource.labelPath:((datasource.labelProperty != null)?"<"+datasource.labelProperty+">":null),

			    		// sparql query
			    		(datasource.queryString != null)?datasource.queryString:datasource.queryTemplate
			    	);
				}

				this.widgetComponent = new ListWidget(this, handler, langSearch) ;
				this.cssClasses.ListeWidget = true ;

			  	break;
			  }
			  case Config.LIST_PROPERTY:
			    // defaut handler to be used
			    var handler = this.settings.list;
			    
			    // to be passed in anonymous functions
			    var theSpecProvider = this.specProvider;

			    // determine custom datasource
			    var datasource = this.specProvider.getDatasource(objectPropertyId);

			    if(datasource == null) {
			    	// try to read it on the class
			    	datasource = this.specProvider.getDatasource(rangeClassId);
			    }

			    if(datasource == null) {
			    	// datasource still null
			    	// if a default endpoint was provided, provide default datasource
			    	if(this.settings.defaultEndpoint != null) {
				    	datasource = Datasources.DATASOURCES_CONFIG.get(Datasources.LIST_URI_COUNT);
				    }
			    }

				if(datasource != null) {
			    	// if we have a datasource, possibly the default one, provide a config based
			    	// on a SparqlTemplate, otherwise use the handler provided
				    handler = new SparqlTemplateListHandler(
			    		// endpoint URL
			    		(datasource.sparqlEndpointUrl != null)?datasource.sparqlEndpointUrl:this.settings.defaultEndpoint,
			    		
			    		// sparqlPostProcessor
			    		{
				            semanticPostProcess : function(sparql) {
				            	// also add prefixes
				                for (key in settings.sparqlPrefixes) {
							        sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
						    	}
				                return theSpecProvider.expandSparql(sparql);
				            }
				        },

			    		// language,
			    		this.settings.language,

			    		// labelPath
			    		(datasource.labelPath != null)?datasource.labelPath:((datasource.labelProperty != null)?"<"+datasource.labelProperty+">":null),

			    		// sparql query
			    		(datasource.queryString != null)?datasource.queryString:datasource.queryTemplate
			    	);
				}

				this.widgetComponent = new ListWidget(this, handler, langSearch) ;
				this.cssClasses.ListeWidget = true ;
				break;
			  case Config.AUTOCOMPLETE_PROPERTY:
			    var handler = this.settings.autocomplete;
			    // to be passed in anonymous functions
			    var theSpecProvider = this.specProvider;

			    // determine custom datasource
			    var datasource = this.specProvider.getDatasource(objectPropertyId);

			    if(datasource == null) {
			    	// try to read it on the class
			    	datasource = this.specProvider.getDatasource(rangeClassId);
			    }

			    if(datasource == null) {
			    	// datasource still null
			    	// if a default endpoint was provided, provide default datasource
			    	if(this.settings.defaultEndpoint != null) {
				    	datasource = Datasources.DATASOURCES_CONFIG.get(Datasources.SEARCH_URI_CONTAINS);
				    }
			    }

			    if(datasource != null) {
			    	// if we have a datasource, possibly the default one, provide a config based
			    	// on a SparqlTemplate, otherwise use the handler provided
				    handler = new SparqlTemplateAutocompleteHandler(
			    		// endpoint URL
			    		(datasource.sparqlEndpointUrl != null)?datasource.sparqlEndpointUrl:this.settings.defaultEndpoint,
			    		
			    		// sparqlPostProcessor
			    		{
				            semanticPostProcess : function(sparql) {
				            	// also add prefixes
				                for (key in settings.sparqlPrefixes) {
							        sparql = sparql.replace("SELECT ", "PREFIX "+key+": <"+settings.sparqlPrefixes[key]+"> \nSELECT ");
						    	}
				                return theSpecProvider.expandSparql(sparql);
				            }
				        },

			    		// language,
			    		this.settings.language,

			    		// labelPath
			    		(datasource.labelPath != null)?datasource.labelPath:((datasource.labelProperty != null)?"<"+datasource.labelProperty+">":null),

			    		// sparql query
			    		(datasource.queryString != null)?datasource.queryString:datasource.queryTemplate
			    	);
				}

				this.widgetComponent = new AutoCompleteWidget(this, handler) ;
				this.cssClasses.AutocompleteWidget = true ;
			    break;
			  case Config.GRAPHDB_SEARCH_PROPERTY:
			  case Config.STRING_EQUALS_PROPERTY:
			  case Config.SEARCH_PROPERTY:
				this.widgetComponent = new SearchWidget(this, langSearch) ;
				this.cssClasses.SearchWidget  = true ;
				break;
			  case Config.TIME_PROPERTY_YEAR:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, false, langSearch) ;
				this.cssClasses.TimeDatePickerWidget  = true ;
				break;
			  case Config.TIME_PROPERTY_DATE:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, 'day', langSearch) ;
				this.cssClasses.TimeDatePickerWidget  = true ;
				break;
			  case Config.TIME_PROPERTY_PERIOD:
				this.widgetComponent = new DatesWidget(this, this.settings.dates, langSearch) ;
				this.cssClasses.DatesWidget  = true ;
				break;
			  case Config.NON_SELECTABLE_PROPERTY:
			  	this.widgetComponent = new NoWidget(this) ;
			  	this.cssClasses.NoWidget = true ;
			  default:
			  	// TODO : throw Exception
			  	console.log("Unexpected Widget Type "+widgetType)
			}
		};
		
		this.getValue = function () {
			if (this.loadedValue !== null) {
				return this.loadedValue ;
			} else {
				return this.widgetComponent.getValue() ;
			}
		}

		/*
		this.getValueLabel = function () {			
			return this.widgetComponent.getValueLabel() ;
		}
		*/
		
	}

	function getOffset( elem, elemParent ) {
		return elem.offset().left - $(elemParent).offset().left ;
	}

	/**
	 * Preprocess JSON query to add parent and nextSibling links
	 **/
	function preprocess(jsonQuery) {
		for(var i = 0;i < jsonQuery.branches.length;i++) {
			var branch = jsonQuery.branches[i];
			var next = null;
			if(jsonQuery.branches.length > i+1) {
				next = jsonQuery.branches[i+1];
			}
			preprocessRec(branch, null, next);
		}
		return jsonQuery;
	}

	function preprocessRec(branch, parent, nextSibling) {
		branch.parent = parent;
		branch.nextSibling = nextSibling;
		for(var i = 0;i < branch.children.length;i++) {
			var child = branch.children[i];
			var next = null;
			if(branch.children.length > i+1) {
				next = branch.children[i+1];
			}
			preprocessRec(child, branch, next);
		}
	}
	
	function GenericTools(component) {
		this.component = component ;

		this.attachComponentHtml = function () {
			var instance = this.component.baseCssClass ;
			// remove existing component if already existing
			this.component.HtmlContainer.html.find('>.'+instance).remove() ;
			$(this.component.html).appendTo(this.component.HtmlContainer.html) ;
		}
		
		/**
		 * Updates the CSS classes of an element
		 **/
		this.updateCssClasses = function() {
			$(this.component.html).removeClass('*') ;
			for (var item in this.component.cssClasses) {				
				if (this.component.cssClasses[item] === true) {
					$(this.component.html).addClass(item) ;
				} else {
					$(this.component.html).removeClass(item) ;
				}
			}
		}		

		this.initHtml = function() {
			var instance = this.component.baseCssClass ;				
			if (this.component.widgetHtml != null) {
				console.log("*** init with widgetHtml on "+instance);
				this.component.html = $('<div class="'+instance+'"></div>') ;
				// remove existing component
				// this.component.html.find('>.'+instance ).remove();
				this.component.html.append(this.component.widgetHtml) ; 
			} else {
				this.component.html = '';
			}
		} 

		this.attachHtml = function() {
			this.updateCssClasses() ;
			this.attachComponentHtml() ;
		}

		this.remove = function() {
			$(this.component.html).remove() ;
		}
		
	}

	/**
	 * Expands SPARQL query by reading the config
	 **/
    this.expandSparql = function(sparql) {
		return specProvider.expandSparql(sparql);
	}

	return this ;
} // end of Sparnatural function

Object.onArray = function (arrayTosearch, objectTocompare) {
	var objectTocompare = objectTocompare ;
	var temp_return = false ;
	$.each( arrayTosearch, function( key, val ) {
		
		if (Object.compare(val, objectTocompare)) {
			temp_return = true;
		}
	}) ;
	return temp_return ;
} ;

Object.compare = function (obj1, obj2) {
	//Loop through properties in object 1
	for (var p in obj1) {
		//Check property exists on both objects
		if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
 
		switch (typeof (obj1[p])) {
			//Deep compare objects
			case 'object':
				if (!Object.compare(obj1[p], obj2[p])) return false;
				break;
			//Compare function code
			case 'function':
				if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
				break;
			//Compare values
			default:
				if (obj1[p] != obj2[p]) return false;
		}
	}
 
	//Check object 2 for any extra properties
	for (var p in obj2) {
		if (typeof (obj1[p]) == 'undefined') return false;
	}
	return true;
};

	
 
}( jQuery ));
require("jstree/dist/themes/default/style.min.css");

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
import removeIcon from "./assets/icons/buttons/remove.png"

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

import { SparqlTemplateListHandler, SparqlTemplateAutocompleteHandler } from "./AutocompleteAndListHandlers";

import { FilteringSpecificationProvider } from "./FilteringSpecificationProvider";
import { QuerySPARQLWriter, AbstractValue } from "./Query";
import JSONQueryGenerator from "./QueryGenerators";

import * as SparnaturalComponents from "./SparnaturalComponents";
import { SpecificationProviderFactory } from "./SpecificationProviderFactory";
import { SimpleStatisticsHandler } from "./StatisticsHandlers";
import { SparqlTreeHandler } from "./TreeHandlers";
import UiuxConfig from "./UiuxConfig";
import Datasources from "./SparnaturalConfigDatasources";
import { AutoCompleteWidget, SearchWidget,NoWidget,BooleanWidget,TimeDatePickerWidget,DatesWidget,ListWidget } from "./Widgets";

import Config from "./SparnaturalConfig"

// Import ts ported components
import ActionRemove from "./ts-components/ActionRemove";
import ActionAnd  from "./ts-components/ActionAnd";
import ActionWhere from "./ts-components/ActionWhere";
import EndClassWidgetGroup from "./ts-components/EndClassWidgetGroup";
import CriteriaGroup from "./ts-components/CriteriaGroup";

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
			localCacheDataTtl: 1000 * 60 * 60 * 24, // 24 hours in miliseconds
			// localCacheDataTtl: 1000 * 60 * 4, // 4 hour
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
			},
			/**
			 * Callback notified when click submit button of Sparnatural.
			 * If function is difine on settings, the button appear in the bottom of the component before variables selector section
			 *
			 * @param {object} form - The form object of Sparnatural
			 * ! Need to not to be a function if disable
			 **/
			onSubmit : null ,
		};


		
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
		settings.langSearch = langSearch
		thisForm.langSearch = langSearch ;

		var specProviderFactory = new SpecificationProviderFactory();

		specProviderFactory.build(settings.config, settings.language, (sp)=> {
			specProvider = sp;
			initForm.call(this,thisForm);
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
		this.enableSubmit = function() {
			$(thisForm.sparnatural).find('.submitSection a').removeClass('submitDisable') ;
		}	
		this.disableSubmit = function() {
			$(thisForm.sparnatural).find('.submitSection a').addClass('submitDisable') ;
		}	
		this.enableLoading = function() {
			$(thisForm.sparnatural).find('.submitSection a').addClass('submitDisable, loadingEnabled') ; /// Need to be disabled with loading
		}	
		this.disableLoading = function() {
			$(thisForm.sparnatural).find('.submitSection a').removeClass('loadingEnabled') ;
		}	

		function loadQuery(form, json) {
			// stores the JSON to be preloaded
			form.preLoad = json ;
			// clear the form
			// On Clear form new component is automaticaly added, json gets loaded
			clearForm(form) ;

			form.sparnatural.variablesSelector.loadQuery() ;
			
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
			console.log("this1.2")
			console.log(this)
			var SubmitSection = "" ;
			if (settings.onSubmit instanceof Function) {
				var SubmitSection = '<div class="submitSectionWrapper" style="background: rgba('+settings.backgroundBaseColor+');"><div class="submitSection"><a class="submitDisable">'+UiuxConfig.ICON_PLAY+'</a></div></div>' ; 
			}
			var contexte = $('<div class="bg-wrapper"><ul class="componentsListe"></ul></div>'+SubmitSection+'<div class="variablesSelection"></div>');

			$(form.sparnatural).append(contexte) ;
			
			if (settings.onSubmit instanceof Function) {
				$(form.sparnatural).find('.submitSection a').on('click', function(event) {
					if (!$(this).hasClass('submitDisable')) {
						form.sparnatural.disableSubmit() ;
						settings.onSubmit(form) ;
					}
				}) ;
			}

			//Ajout du filtre pour ombrage menu options
			$(form.sparnatural).append($('<svg data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" style="width:0;height:0;display:block"><defs><filter style="color-interpolation-filters:sRGB;" inkscape:label="Drop Shadow" id="filter19278" x="-0.15483875" y="-0.11428573" width="1.3096775" height="1.2714286"><feFlood flood-opacity="0.811765" flood-color="rgb(120,120,120)" result="flood" id="feFlood19268" /><feComposite in="flood" in2="SourceGraphic" operator="out" result="composite1" id="feComposite19270" /><feGaussianBlur in="composite1" stdDeviation="2" result="blur" id="feGaussianBlur19272" /><feOffset dx="3.60822e-16" dy="1.8" result="offset" id="feOffset19274" /><feComposite in="offset" in2="SourceGraphic" operator="atop" result="composite2" id="feComposite19276" /></filter></defs></svg>') );

			//Bouton de reset
			var reset = $('<div class="reset-wrapper"><p class="reset-form"><a>'+UiuxConfig.ICON_RESET+'</a></p></div>') ;
			$(form.sparnatural).find('.bg-wrapper').prepend(reset) ;
	
			$(reset).find('a').first().on('click', function(event) {
					clearForm(form) ;
			});
			

			form.queryOptions = {
				distinct : settings.addDistinct,
				displayVariableList: ['?this'],
				orderSort: null,
				defaultLang: settings.language
			}

			initVariablesSelector.call(this,form) ;
			
			initGeneralEvent.call(this,form) ;
			
			// triggered when Sparnatural is submitted : generates output SPARQL query
			$(form.sparnatural).on('submit', { formObject : form }, function (event) {
				if (form.submitOpened == true) {
					event.preventDefault();
					/*if ($(event.data.formObject.sparnatural).find('li.groupe').not('.completed').length > 0) {
						return false ;
					}*/

					// prints the JSON query data structure on the console
					var jsonGenerator = new JSONQueryGenerator();
					var jsonQuery = jsonGenerator.generateQuery(event.data.formObject);

					if(jsonQuery != null) {					
						console.log("*** New JSON Data structure ***");
						console.log("yes that's right")
						console.log(JSON.stringify(
							jsonQuery,
							null,
							4
						));

						// prints the SPARQL generated from the writing of the JSON data structure
						console.log("*** New SPARQL from JSON data structure ***");
						var writer = new QuerySPARQLWriter(
							settings.typePredicate,
							specProvider
						);
						writer.setPrefixes(settings.sparqlPrefixes);
						console.log(writer.toSPARQL(jsonQuery));

						// fire callback
						settings.onQueryUpdated(writer.toSPARQL(jsonQuery), jsonQuery);
						//Can enable for submit
						form.sparnatural.enableSubmit() ;
					}
				}
			}) ;

			$(form.sparnatural).trigger({type: 'formInitialized'}) ;
		}

		function initVariablesSelector(form) {
			console.log("this2")
			console.log(this)
			form.sparnatural.variablesSelector = {} ;
			this.form = form ;
			this.html = $(form.sparnatural).find('.variablesSelection').first() ; 
			this.selectedList = [] ;
			this.linesWrapper = $('<div class="linesWrapper"></div>') ;
			$(this.html).append(this.linesWrapper) ;
			
			this.line1 = $('<div class="line1"></div>') ;
			this.line2 = $('<div class="line2"></div>') ;
			$(this.linesWrapper).append(this.line1) ;
			$(this.linesWrapper).append(this.line2) ;

			this.firstSelectHtml = $('<div class="variablesFirstSelect"></div>') ;
			this.otherSelectHtml = $('<div class="variablesOtherSelect"></div>') ;
			this.ordersSelectHtml = $('<div class="variablesOrdersSelect"><strong>'+langSearch.labelOrderSort+'</strong> <a class="asc">'+UiuxConfig.ICON_AZ+'</a><a class="desc">'+UiuxConfig.ICON_ZA+'</a><a class="none selected">'+UiuxConfig.ICON_NO_ORDER+'</a></div>') ;
			this.optionsSelectHtml = $('<div class="variablesOptionsSelect">'+langSearch.SwitchVariablesNames+' <label class="switch"><input type="checkbox"><span class="slider round"></span></label></div>') ;

			$(this.line1).append(this.firstSelectHtml) ;
			$(this.line1).append(this.otherSelectHtml) ;

			$(this.line2).append(this.ordersSelectHtml) ;
			$(this.line2).append(this.optionsSelectHtml) ;

			//Show and hide button
			this.displayButton = $('<div class="VariableSelectorDisplay"><a class="displayButton">'+UiuxConfig.ICON_ARROW_TOP+UiuxConfig.ICON_ARROW_BOTTOM+'</a></div>') ;
			
			$(this.html).append(this.displayButton) ;

			// Listening when display to hide or show
			$(this.displayButton).find('a').on('click',
			{arg1: this, arg2: 'display'},
			SparnaturalComponents.eventProxiCriteria
			);

			form.sparnatural.variablesSelector = this ;
			form.sparnatural.variablesSelector.switchLabel = 'name' ; // or name

			// Listening when change sort order (AZ, ZA, None)
			$(this.ordersSelectHtml).find('a').on('change',
			{arg1: this, arg2: 'changeOrderSort'},
			SparnaturalComponents.eventProxiCriteria
			);

			// Listening when switch display variable
			$(this.optionsSelectHtml).find('label, span').on('click',
			{arg1: this, arg2: 'switchVariableName'},
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

			$(sortable).on(
				'onUpdate',
				{arg1: this, arg2: 'updateVariableList'},
				SparnaturalComponents.eventProxiCriteria
			);

			this.removeVariableName = function(name) {

			}

			this.display = function() {
				if( $(this.html).hasClass('displayed') ) {
					$(this.linesWrapper).animate({
						height: 0
					}, 500, function(){
	
					});
				} else {
					$(this.linesWrapper).animate({
						height: $(this.linesWrapper).get(0).scrollHeight
					}, 500, function(){
						$(this.linesWrapper).height('auto');
					});
				}
				
				$(this.html).toggleClass('displayed') ;

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

			/**
			 * Updates the variables in the generated query based on HTML variable line
			 **/
			this.updateVariableList = function() {
				var listedItems = $(this.otherSelectHtml).find('.sortableItem>div') ;
				this.form.queryOptions.displayVariableList = [] ;
				for (var i = 0; i < listedItems.length; i++) {
					var variableName = $(listedItems[i]).attr('data-variablename'); 
					this.form.queryOptions.displayVariableList.push(variableName) ;
				}
				$(this.form.sparnatural).trigger( {type:"submit" } ) ;
			}

			this.switchVariableName = function() {
				$(this.form.sparnatural).find('.componentsListe').first().toggleClass('displayVarName') ;

				$('li.groupe').each(function() {
					SparnaturalComponents.redrawBottomLink($(this)) ;
				});
			}

			this.loadQuery = function() {
				this.form.submitOpened = false ;
				for (var i = 0; i < this.form.preLoad.variables.length; i++) {
					var variableName = this.form.preLoad.variables[i] ;
					for (var x = 0; x < this.form.sparnatural.components.length; x++) {
						var critere = this.form.sparnatural.components[x].CriteriaGroup ;
						if (critere.StartClassGroup.variableNamePreload == variableName ) {
							critere.StartClassGroup.onchangeViewVariable() ;
							break ; // une variable ne doit être trouvé q'une seule fois et seulement la première
						}
						if (critere.EndClassGroup.variableNamePreload == variableName ) {
							critere.EndClassGroup.onchangeViewVariable() ;
							break ; // une variable ne doit être trouvé q'une seule fois et seulement la première
						}
						
					}
					x= 0 ;
				}
				this.form.submitOpened = true ;
			}

			///form.sparnatural.variablesSelector = this ;
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
			preprocessRec(branch, null, next, jsonQuery);
		}
		return jsonQuery;
	}

	function preprocessRec(branch, parent, nextSibling, jsonQuery) {
		branch.parent = parent;
		branch.nextSibling = nextSibling;
		// set flags ot indicate if the eye is open by testing the selected variables
		if(jsonQuery.variables.includes(branch.line.s)) {
			branch.line.sSelected = true;
		}
		if(jsonQuery.variables.includes(branch.line.o)) {
			branch.line.oSelected = true;
		}
		for(var i = 0;i < branch.children.length;i++) {
			var child = branch.children[i];
			var next = null;
			if(branch.children.length > i+1) {
				next = branch.children[i+1];
			}
			preprocessRec(child, branch, next, jsonQuery);
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


require("./assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");


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

SimpleJsonLdSpecificationProvider = require("./SpecificationProviders.js").SimpleJsonLdSpecificationProvider;
SpecificationProviderFactory = require("./SpecificationProviderFactory.js").SpecificationProviderFactory;
RDFSpecificationProvider = require("./RDFSpecificationProvider.js").RDFSpecificationProvider ;
SparqlBifContainsAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").SparqlBifContainsAutocompleteAndListHandler;
SimpleSparqlAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").SimpleSparqlAutocompleteAndListHandler;
RangeBasedAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").RangeBasedAutocompleteAndListHandler;
PropertyBasedAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").PropertyBasedAutocompleteAndListHandler
WikidataAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").WikidataAutocompleteAndListHandler;
UriOnlyListHandler = require("./AutocompleteAndListHandlers.js").UriOnlyListHandler;
GraphDbLuceneConnectorSparqlAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").GraphDbLuceneConnectorSparqlAutocompleteAndListHandler;

DefaultQueryGenerator = require("./QueryGenerators.js").DefaultQueryGenerator;

require("./Widgets.js");
var Config = require("./SparnaturalConfig.js");

(function( $ ) {
	
    $.fn.Sparnatural = function( options ) {
 
    	var specProvider;

        var langSearch = {} ;
        
		var defaults = {
			config: 'config/spec-search.json',
			language: 'en',
			addDistinct: false,
			noTypeCriteriaForObjects: false,
			typePredicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
			maxDepth: 3,
			maxOr: 3,
			sendQueryOnFirstClassSelected: false,
			backgroundBaseColor: '250,136,3',
			sparqlPrefixes: {},
			
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
			},
			dates : {
				datesUrl : function(domain, property, range, key) {
					console.log("Veuillez préciser le nom de la fonction pour l'option datesUrl dans les parametre d'initalisation de Sparnatural. La liste des parametres envoyées a votre fonction est la suivante : domain, property, range, key" ) ;
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
			
			/**
			 * Callback notified each time the query is modified.
			 *
			 * @param {object} queryString - The SPARQL query string
			 * @param {object} queryJson - The query as a JSON data structure
			 **/
			onQueryUpdated : function (queryString, queryJson) {
				console.log("Veuillez préciser le nom de la fonction pour l'option onQueryUpdated dans les parametre d'initalisation de Sparnatural. Les parêtres envoyés à la fonction contiendront la requête convertie en Sparql et le Json servant à générer la requête" ) ;
			}
		};

		var VALUE_SELECTION_WIDGETS = [
			Config.LIST_PROPERTY,
			Config.AUTOCOMPLETE_PROPERTY
		];
		
		// merge given options with default values
		var settings = $.extend( true, {}, defaults, options );

		this.each(function() {
            var thisForm = {
            	_this : $(this),
            	components : []
            } ;
			$(this).addClass('Sparnatural') ;
			
			langSearch = i18nLabels[settings.language];

			var specProviderFactory = new SpecificationProviderFactory();

			specProviderFactory.build(settings.config, settings.language, function(sp) {
				specProvider = sp;
				initForm(thisForm);
			});		
        });	
		
		function initForm(form) {	
			var contexte = $('<div class="bg-wrapper"><ul class="componentsListe"></ul></div>');
			$(form._this).append(contexte) ;
			
			var contexte1 = addComponent(form, contexte.find('ul')) ;
			
			$(form._this).find('.nice-select').trigger('click') ;
			
			initGeneralEvent(form) ;
			
			// triggered when Sparnatural is submitted : generates output SPARQL
			// query
			$(form._this).on('submit', { formObject : form }, function (event) {		
				event.preventDefault();
				var qGenerator = new DefaultQueryGenerator(
					settings.addDistinct,
					settings.typePredicate,
					settings.noTypeCriteriaForObjects,
					specProvider
				);
				qGenerator.setPrefixes(settings.sparqlPrefixes);
				var queries = qGenerator.generateQuery(event.data.formObject);
				// fire callback
				settings.onQueryUpdated(queries.generatedQuery, queries.jsonQuery);

			}) ;
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
		 
		var $all_li = thisForm_._this.find('li.groupe') ;
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

		thisForm_._this.find('div.bg-wrapper').css({background : cssdef+')' }) ;
	}
		
	/**
	 * Builds a selector for a class based on provided domainId, by reading the
	 * configuration. If the given domainId is null, this means we populate the first
	 * class selection (starting point) so reads all classes that are domains of any property.
	 * 
	 **/
	function ClassSelectBuilder(specProvider) {
		this.specProvider = specProvider;

		this.buildClassSelect = function(domainId, inputID, default_value) {
			var list = [] ;
			var items = [] ;

			if(domainId === null) {
				// if we are on the first class selection
			 	items = this.specProvider.getClassesInDomainOfAnyProperty() ;
			} else {
				items = this.specProvider.getConnectedClasses(domainId) ;
			}

			for (var key in items) {
				var val = items[key];
				var label = this.specProvider.getLabel(val) ;
				var icon = this.specProvider.getIcon(val) ;
				var highlightedIcon = this.specProvider.getHighlightedIcon(val) ;

				// highlighted icon defaults to icon
				if (!highlightedIcon || 0 === highlightedIcon.length) {
					highlightedIcon = icon ;
				}
				
				var image = (icon != null)?' data-icon="' + icon + '" data-iconh="' + highlightedIcon + '"':'' ;
				var selected = (default_value == val)?'selected="selected"':'';
				list.push( '<option value="'+ val +'" data-id="' + val + '"'+image+selected+'>'+ label + '</option>' );
			}

			var html_list = $( "<select/>", {
				"class": "my-new-list input-val",
				"id": 'select-'+inputID,
				html: list.join( "" )
			  });

			return html_list ;
		}
	}

	/**
	 * Builds a selector for property based on provided domain and range, by reading the
	 * configuration.
	 **/
	function PropertySelectBuilder(specProvider) {
		this.specProvider = specProvider;

		this.buildPropertySelect = function(domainClassID, rangeClassID, inputID, default_value) {
			var list = [] ;
			var items = this.specProvider.getConnectingProperties(domainClassID,rangeClassID) ;
			
			for (var key in items) {
				var val = items[key];
				var label = this.specProvider.getLabel(val) ;
				var selected = (default_value == val)?'selected="selected"':'';
				list.push( '<option value="'+val+'" data-id="'+val+'"'+selected+'>'+ label + '</option>' );
			}

			var html_list = $( "<select/>", {
				"class": "select-list input-val",
				"id": inputID,
				html: list.join( "" )
			});
			return html_list ;
		}
	}
		
	function addComponent(thisForm_, contexte) {
		
		if (thisForm_.components.length > 0 ) {
			var new_index = thisForm_.components[thisForm_.components.length-1].index + 1 ;
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
			//gabarib = $(gabari).appendTo(contexte) ;
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
			specProvider
		);
		
		thisForm_.components.push({index: new_index, CriteriaGroup: UnCritere });			
		initGeneralEvent(thisForm_);			
		return $(gabari) ;
	}

	/**
	 * A single line/criteria
	 **/
	function CriteriaGroup(context, settings, specProvider) {
		this._this = this ;
		this.thisForm_ = context.FormContext ;
		this.ParentComponent = context.FormContext  ;
		this.ComponentHtml = context.HtmlContext ;
		this.AncestorComponentHtml = context.AncestorHtmlContext ;
		
		this.settings = settings;
		
		this.cssClasses = {
			HasAllComplete : false,
			IsOnEdit : false
		}
		this.id =  context.ContextComponentIndex ;
		this.html = $('<div id="CriteriaGroup-'+this.id+'" class="CriteriaGroup"></div>').appendTo(this.ComponentHtml) ;
		
		this.Context = new Context(context) ;
		
		// create all the elements of the criteria
		this.StartClassGroup = new StartClassGroup(this, specProvider) ;
		this.ObjectPropertyGroup = new ObjectPropertyGroup(this, specProvider) ;
		this.EndClassGroup = new EndClassGroup(this, specProvider) ;
		this.EndClassWidgetGroup = new EndClassWidgetGroup(this, this.settings, specProvider) ;
		this.ActionsGroup = new ActionsGroup(this, specProvider) ;

		// hook all components together
		$(this).on('StartClassGroupSelected', function () { this.EndClassGroup.onStartClassGroupSelected(); });
		$(this).on('Created', function () { this.StartClassGroup.onCreated(); });
		$(this).on('EndClassGroupSelected', function () { this.ObjectPropertyGroup.onEndClassGroupSelected(); });
		$(this).on('ObjectPropertyGroupSelected', function () { this.EndClassWidgetGroup.onObjectPropertyGroupSelected(); });
		$(this).on('Created', function () { this.ActionsGroup.onCreated(); });
		$(this).on('ObjectPropertyGroupSelected', function () {	this.ActionsGroup.onObjectPropertyGroupSelected();  });	

		// trigger the init event
		$(this).trigger( {type:"Created" } ) ;
		
		this.initCompleted = function () {
			$(this.html).parent('li').addClass('completed') ;
		}
		
		this.onRemoveCriteria = function() {
			var index_to_remove = this.id ;
			// iterate on every "line" in the query
			$(this.ParentComponent.components).each(function() {
				var parentOrSibling = findParentOrSiblingCriteria(this.CriteriaGroup.thisForm_, this.index ) ;
				if ((parentOrSibling != null) && (parentOrSibling.type == 'parent')){
					// if the line is a child of the one to remove, remove it too
					if (parentOrSibling.element.id == index_to_remove) {
						this.CriteriaGroup.onRemoveCriteria() ;
					}
				}
			}) ;
			
			var formObject = this.thisForm_ ;
			var formContextHtml = this.Context.contexteReference.AncestorHtmlContext;
			
			// fetch parentOrSibling _before_ removing HTML and removing
			// component from list !!
			var parentOrSibling = findParentOrSiblingCriteria(this.thisForm_, this.id ) ;

			// remove event listeners
			this.ComponentHtml.outerHTML = this.ComponentHtml.outerHTML;
			// remove the HTML
			$(this.ComponentHtml).remove() ;
			
			var iteration_to_remove = false ;
			$(this.ParentComponent.components).each(function(i) {					
				if (this.index == index_to_remove){					
					iteration_to_remove = i ;
				}
			}) ;
			// remove from list of components
			this.ParentComponent.components.splice(iteration_to_remove , 1);
			
			
			if (this.ParentComponent.components.length == 0) {
				// top-level criteria : add first criteria and trigger click on class selection
				var new_component = addComponent(formObject, formContextHtml) ;			
				$(new_component).find('.nice-select').trigger('click') ;				
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
				$(this.thisForm_._this).trigger( { type:"submit" } ) ;
			}
			
			return false ;
		}		
	}

	function eventProxiCriteria(e) {
		var arg1 = e.data.arg1;
		var arg2 = e.data.arg2;
		arg1[arg2](e) ;
	}
	
	function GroupContenaire() {
		this.ParentComponent = null ;
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
		
		this.init = function() {			
			if (!this.cssClasses.Created) {				
				this.cssClasses.IsOnEdit = true ;
				this.HtmlContainer = this.ParentComponent ;
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
	 * Selection of the start class in a criteria/line
	 **/
	function StartClassGroup (CriteriaGroupe, specProvider) { 
		this.base = GroupContenaire ;
		this.base() ;

		this.specProvider = specProvider;
		this.ParentComponent = CriteriaGroupe ;
		this.cssClasses.StartClassGroup = true ;
		this.cssClasses.Created = false ;
		
		this.inputTypeComponent = new ClassTypeId(this, specProvider) ;

		// triggered when a criteria starts
		this.onCreated = function() {
			$(this.html).find('.input-val').unbind('change');
			this.inputTypeComponent.init() ;
			this.inputTypeComponent.cssClasses.IsOnEdit = true;
			var select = $(this.html).find('.input-val')

			this.niceslect = $(select).niceSelect() ;
			
			$(this.html).find('select.input-val').on(
				'change',
				{arg1: this, arg2: 'onChange'},
				eventProxiCriteria
			);
		}

		this.onChange = function onChange() {
			//this.niceslect.niceSelect('update') ;
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			// trigger event on the whole line/criteria
			$(this.ParentComponent).trigger( {type:"StartClassGroupSelected" } ) ;

			if(settings.sendQueryOnFirstClassSelected) {
				$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;
			}	
		};
		
		this.init() ;
	} 
	
	/**
	 * The property selection part of a criteria/line, encapsulating an ObjectPropertyTypeId
	 **/
	function ObjectPropertyGroup(CriteriaGroupe1, specProvider) {
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe1 ;
		this.cssClasses = {
			ObjectPropertyGroup : true,
			Created : false
		} ;

		this.objectPropertySelector = new ObjectPropertyTypeId(this, specProvider) ;
		
		// triggered when a class is selected in the range
		this.onEndClassGroupSelected = function() {
			$(this.html).find('.input-val').unbind('change');

			if (!this.objectPropertySelector.cssClasses.Created) {
				this.objectPropertySelector.init() ;
				this.objectPropertySelector.cssClasses.IsOnEdit = true;
			} else {
				this.objectPropertySelector.reload() ;
				this.objectPropertySelector.cssClasses.IsOnEdit = true;
			}
			
			this.niceslect = $(this.html).find('select.input-val').niceSelect()  ;
			$(this.html).find('.input-val').removeAttr('disabled').niceSelect('update'); 
			// opens the select automatically
			$(this.html).find('.nice-select').trigger('click') ;
			$(this.html).find('select.input-val').unbind('change');
			// hook the change event to the onChange function
			$(this.html).find('select.input-val').on(
				'change',
				{arg1: this, arg2: 'onChange'},
				eventProxiCriteria
			);
			
			// automatically selects the value if there is only one
			if ($(this.html).find('select.input-val').find('option').length == 1) {
				$(this.html).find('.nice-select').trigger('click') ;
			}
		}

		this.onChange = function onChange() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			// disable if only one possible property option between the 2 classes
			if ($(this.html).find('.input-val').find('option').length == 1) {
				$(this.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			}
			$(this.ParentComponent).trigger( {type:"ObjectPropertyGroupSelected" } ) ;			
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;			
		};
			
		this.init() ;
		
	}

	/**
	 * Refactored to extract this from InputTypeComponent
	 **/
	function ObjectPropertyTypeId(GroupContenaire, specProvider) {
		this.specProvider = specProvider;
		this.cssClasses = {
			IsCompleted : false,
			IsOnEdit : false,
			Created : false
		} ;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.html = '<div class="ObjectPropertyTypeId"></div>' ;
		this.widgetHtml = null ;

		this.init = function (reload = false) {
			var selectBuilder = new PropertySelectBuilder(this.specProvider);
			this.widgetHtml = selectBuilder.buildPropertySelect(
				this.ParentComponent.ParentComponent.StartClassGroup.value_selected,
				this.ParentComponent.ParentComponent.EndClassGroup.value_selected,
				'c-'+this.ParentComponent.ParentComponent.id
			) ;
			
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

	/**
	 * Handles the selection of a Class, either in the DOMAIN selection or the RANGE selection.
	 * The DOMAIN selection happens only for the very first line/criteria.
	 * Refactored to extract this from InputTypeComponent.
	 **/
	function ClassTypeId(GroupContenaire, specProvider) {
		this.specProvider = specProvider;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.cssClasses = {
			Highlited : true ,
			Created : false
		}; 
		this.widgetHtml = null ;

		this.init = function () {
			
			//If Start Class 
			if (this.cssClasses.Created) {
				this.tools.updateCssClasses() ;
				return true ;
			}

			var selectHtml = null ;
			var default_value = null ;
			var id = this.ParentComponent.ParentComponent.id ;
			var selectBuilder = new ClassSelectBuilder(this.specProvider);

			if (this.ParentComponent instanceof StartClassGroup) {
				
				var parentOrSibling = findParentOrSiblingCriteria(this.ParentComponent.ParentComponent.thisForm_, id) ;
				if (parentOrSibling) {
					if (parentOrSibling.type == 'parent' ) {
						// if we are child in a WHERE relation, the selected class is the selected
						// class in the RANGE selection of the parent
						default_value = parentOrSibling.element.EndClassGroup.value_selected ;
					} else {
						// if we are sibling in a AND relation, the selected class is the selected
						// class in the DOMAIN selection of the sibling
						default_value = parentOrSibling.element.StartClassGroup.value_selected ;
					}
					this.cssClasses.Highlited = false ;
				} else {
					this.cssClasses.Highlited = true ;
				}				
				
				selectHtml = selectBuilder.buildClassSelect(
					null,
					'a-'+id,
					default_value
				);
			} 
			
			if (this.ParentComponent instanceof EndClassGroup) {
				selectHtml = selectBuilder.buildClassSelect(
					this.ParentComponent.ParentComponent.StartClassGroup.value_selected,
					'b-'+id
				);
			}
			
			this.widgetHtml = selectHtml ;
			this.cssClasses.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.initHtml() ;
			this.tools.attachHtml() ;
			this.cssClasses.Created = true ;			
		} ;	
		
		this.reload = function() {
			console.log("reload on ClassTypeId should probably never be called");
			this.init();
		} ;		
	};
	
	/**
	 * The "range" select, encapsulating a ClassTypeId, with a niceselect
	 **/
	function EndClassGroup(CriteriaGroupe, specProvider) {
		this.base = GroupContenaire ;
		this.base() ;
		this.specProvider = specProvider;
		this.ParentComponent = CriteriaGroupe ;
		this.cssClasses = {
			EndClassGroup : true ,
			Created : false
		}; 
		this.inputTypeComponent = new ClassTypeId(this, specProvider) ;
		this.unselect = $('<span class="unselect unselectEndClass"><i class="far fa-times-circle"></i></span>') ;

		// triggered when the subject/domain is selected
		this.onStartClassGroupSelected = function() {
			$(this.html).find('.input-val').unbind('change');
			$(this.html).append('<div class="EditComponents ShowOnEdit"></div>');
			$(this.html).append(this.unselect);

			//this.EndClassGroup.init() ;
			this.inputTypeComponent.init() ;
			this.inputTypeComponent.cssClasses.IsOnEdit = true;
			
			this.niceslect = $(this.html).find('select.input-val').niceSelect()  ;
			$(this.html).find('.nice-select').trigger('click') ;
			
			$(this.html).find('select.input-val').on('change', {arg1: this, arg2: 'onChange'}, eventProxiCriteria);
			$(this.html).find('span.unselectEndClass').on(
				'click',
				{arg1: this, arg2: 'onRemoveSelected'},
				eventProxiCriteria
			);	
		}
		
		this.onChange = function onChange() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.EndClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update');	
			
			if (specProvider.hasConnectedClasses(this.value_selected)) {
				$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
			} else {
				$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
			}
			this.cssClasses.HasInputsCompleted = true ;
			this.cssClasses.IsOnEdit = false ;
			this.init() ;

			// show and init the property selection
			this.ParentComponent.ObjectPropertyGroup.cssClasses.Invisible = false;
			this.ParentComponent.ObjectPropertyGroup.init() ;
			// trigger the event that will call the ObjectPropertyGroup
			$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
		};

		this.onRemoveSelected = function onRemoveSelected () {			
			$(this.ParentComponent.html).find('>.EndClassWidgetGroup .EndClassWidgetValue span.unselect').trigger('click') ;
			this.ParentComponent.ObjectPropertyGroup.cssClasses.Invisible = true ;
			this.ParentComponent.ObjectPropertyGroup.init() ;
			$(this.ParentComponent.ComponentHtml).find('.childsList .ActionRemove a').trigger('click') ;
			this.value_selected = null;
			this.cssClasses.HasInputsCompleted = false ;
			this.cssClasses.IsOnEdit = true ;
			this.init() ;
			$(this.html).find('select.input-val').on('change', {arg1: this, arg2: 'onChange'}, eventProxiCriteria);
			$(this.html).find('.input-val').removeAttr('disabled').niceSelect('update');
			$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
			this.ParentComponent.ActionsGroup.reinsert = true ;
			$(this.ParentComponent.ComponentHtml).removeClass('completed') ;
			$(this.html).find('.nice-select').trigger('click') ;
		}
		
		this.init() ;
	} ;
	
	/**
	 * Shows the selected values at the end of a criteria/line,
	 * and encapsulates the ObjectPropertyTypeWidget to select the values
	 **/
	function EndClassWidgetGroup(CriteriaGroupe, settings, specProvider) {
		this.base = GroupContenaire ;
		this.base() ;
		this.settings = settings;
		this.specProvider = specProvider;
		this.ParentComponent = CriteriaGroupe ;
		this.cssClasses.EndClassWidgetGroup = true ;
		this.cssClasses.Created = false ;
		this.selectedValues = [] ;
		
		this.inputTypeComponent = new ObjectPropertyTypeWidget(this, this.settings, specProvider) ;

		/**
		 * Called when the property/link between domain and range is selected, to init this.
		 **/
		this.onObjectPropertyGroupSelected = function() {
			// Affichage de la ligne des actions 
			this.ParentComponent.ComponentHtml.addClass('OnEdit') ;
			// determine widget type
			// this.widgetType = this.specProvider.getObjectPropertyType(this.ParentComponent.ObjectPropertyGroup.selectedValues);
			this.inputTypeComponent.HtmlContainer.html = $(this.ParentComponent.EndClassGroup.html).find('.EditComponents') ;
			
			if (this.ParentComponent.ActionsGroup.reinsert == true) {
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
				eventProxiCriteria
			);			
		}
		
		this.onRemoveValue = function removeValue(e) {
			
			var valueDataAttr = $(e.currentTarget).attr('value-data') ;

			for (var item in this.selectedValues) {	

				if (Array.isArray(this.selectedValues[item])) {
					var value_data = this.selectedValues[item].toString() ;
				} else {
					var value_data = this.selectedValues[item] ;
				}

				if (value_data == valueDataAttr ) {
					this.selectedValues.splice(item, 1); 
				}
			}
			$(this.ParentComponent.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').show() ;

			$(e.currentTarget).parent('div').remove() ;

			if(this.selectedValues.length < 1) {
				$(this.ParentComponent.ComponentHtml).removeClass('completed') ;
				$(this.ParentComponent.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').remove() ;
				$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
				$(this.ParentComponent.html).parent('li').removeClass('hideEndClassProperty') ;
				
				// re-enable Where action if end class can be connected to others
				if (this.ParentComponent.EndClassGroup.specProvider.hasConnectedClasses(this.ParentComponent.EndClassGroup.value_selected)) {
					$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
				} else {
					$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
				}

				// re-enable selection of property/link if there are multiple choices of properties
				if ($(this.ParentComponent.ObjectPropertyGroup.html).find('.input-val').find('option').length > 1 ) {
					$(this.ParentComponent.ObjectPropertyGroup.html).find('.input-val').removeAttr('disabled').niceSelect('update'); 
				} else {
					$(this.ParentComponent.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
				}

				// re-init the widget to empty input field
				this.inputTypeComponent.reload() ;
			}

			$(this.ParentComponent).trigger( {type:"EndClassWidgetGroupUnselected" } ) ;
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;

		} ;

		// sélection et affichage d'une valeur sélectionnée par un widget de saisie
		this.onChange = function onChange() {
			var theValue = this.inputTypeComponent.getValue() ;
			var theValueLabel = this.inputTypeComponent.getValueLabel() ;
			if (theValue == null ) {
				return false ;
			}
			// if the same value is already selected, don't do anything
			if (
				this.selectedValues.length > 0
				&&
				Object.onArray(this.selectedValues, theValue) == true
			) {
				return false ;
			}
			
			this.selectedValues.push(theValue) ;			
			
			var value_data = (Array.isArray(theValue))?theValue.toString():theValue;

			this.unselect = $('<span class="unselect" value-data="'+value_data+'"><i class="far fa-times-circle"></i></span>') ;
			if ($(this.ParentComponent.html).find('.EndClassWidgetGroup>div').length == 0) {
				$(this.ParentComponent.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetValue"><span class="triangle-h"></span><span class="triangle-b"></span><p>'+theValueLabel+'</p></div>').find('div').append(this.unselect) ;
			} else {
				var temp_html = $('<div class="EndClassWidgetValue"><span class="triangle-h"></span><span class="triangle-b"></span><p>'+theValueLabel+'</p></div>').append(this.unselect)  ;
				var ellle = $(this.ParentComponent.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').before(temp_html) ;
			}

			// binds a click on the remove cross with the removeValue function
			this.unselect.on(
				'click',
				{	arg1: this,	arg2: 'onRemoveValue'	},
				eventProxiCriteria
			);

			// disable the Where
			$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
			
			this.ParentComponent.initCompleted() ;
			
			$(this.ParentComponent).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;
			
			if ( VALUE_SELECTION_WIDGETS.indexOf(this.inputTypeComponent.widgetType) !== -1 ) {
				if ($(this.ParentComponent.html).find('.EndClassWidgetGroup>div').length == 1) {
					$(this.ParentComponent.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetAddOrValue"><span class="triangle-h"></span><span class="triangle-b"></span><p><span>+</span></p></div>') ;
					// hook a click on the plus to the needAddOrValue function
					$(this.ParentComponent.html).find('.EndClassWidgetGroup>.EndClassWidgetAddOrValue').on(
						'click',
						{arg1: this, arg2: 'onAddOrValue'},
						eventProxiCriteria
					);
				}
			}

			//Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
			if (this.selectedValues.length == settings.maxOr) {
				$(this.ParentComponent.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').hide() ;
			}

			if (this.selectedValues.length > 0 ) {
				$(this.ParentComponent.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			}
			
			$(this.ParentComponent.html).find('.EndClassGroup>.EditComponents').removeClass('newOr') ;

			initGeneralEvent(this.ParentComponent.thisForm_);
		};
		
		this.onAddOrValue = function needAddOrValue() {
			$(this.ParentComponent.html).find('.EndClassGroup>.EditComponents').addClass('newOr') ;
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
		this.ParentComponent = CriteriaGroupe ;
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
					arg1: this.ParentComponent,
					arg2: 'onRemoveCriteria'
				},
				eventProxiCriteria
			);
		}

		this.onObjectPropertyGroupSelected = function() {
			this.actions.ActionWhere.HtmlContainer.html = $(this.ParentComponent.EndClassGroup.html).find('.EditComponents') ;
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
				eventProxiCriteria
			);
			$(this.actions.ActionAnd.html).find('a').on(
				'click',
				{
					arg1: this,
					arg2: 'onAddAnd'
				},
				eventProxiCriteria
			);
			
			initGeneralEvent(this.ParentComponent.thisForm_);			
		}
		
		this.onAddWhere = function () {	
			this.ParentComponent.html.parent('li').addClass('haveWhereChild') ;
			this.ParentComponent.initCompleted() ;
			
			var new_component = addComponent(
				this.ParentComponent.thisForm_,
				this.ParentComponent.Context.contexteReference.HtmlContext
			) ;
			
			// trigger 2 clicks to select the same class as the object class (?)
			$(new_component).find('.nice-select').trigger('click') ;
			$(new_component).find('.nice-select').trigger('click') ;
		}

		this.onAddAnd = function () {
			var new_component = addComponent(
				this.ParentComponent.thisForm_,
				this.ParentComponent.Context.contexteReference.AncestorHtmlContext
			) ;
			
			// trigger 2 clicks to select the same class as the current criteria (?)
			$(new_component).find('.nice-select').trigger('click') ;
			$(new_component).find('.nice-select').trigger('click') ;

			return false ;			
		}

		this.onChange = function onChange() { };
		
		this.init() ;
		
	}	
	
	function ActionWhere(GroupContenaire, specProvider) {
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
				
			var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
			var choiceNumber = 2 ;
			if (endClassGroup.ParentComponent.EndClassWidgetGroup.inputTypeComponent.widgetHtml == null) {
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
		this.specProvider = specProvider;
		this.settings = settings;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.html = '<div class="ObjectPropertyTypeWidget"></div>' ;
		this.tools = null ;
		this.widgetHtml = null ;
		this.widgetType = null ;		
		this.cssClasses = {
			Created : false
		} ;
		
		this.init = function init(reload = false) {
			if (!reload && this.cssClasses.Created) {
				this.tools.updateCssClasses() ;
				return true ;
			}

			// determine widget type
			this.widgetType = this.specProvider.getObjectPropertyType(this.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected);
			// if non selectable, simply exit
			if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
				return true;
			}

			// determine label and bit of HTML to select value
			var classLabel = specProvider.getLabel(this.ParentComponent.ParentComponent.EndClassGroup.value_selected) ;
			if (this.widgetType == Config.SEARCH_PROPERTY) {
				// label of the "Search" pseudo-class is inserted alone in this case
				var endLabel = classLabel;
			} else {
				var endLabel = langSearch.Find+' '+ classLabel ;
			}
			var widgetLabel = '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>'+ endLabel ;
			
			// init HTML by concatenating bit of HTML + widget HTML
			this.createWidgetComponentFromWidgetType() ;
			this.widgetHtml = widgetLabel + this.widgetComponent.html ;
		
			this.cssClasses.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.initHtml() ;
			this.tools.attachHtml() ;

			this.widgetComponent.init() ;
			this.cssClasses.Created = true ;
		}

		this.reload = function reload() {
			if (this.tools === null) {
				this.init(false);
				return true;
			}

			this.init(true);
		}

		this.createWidgetComponentFromWidgetType = function createWidgetComponentFromWidgetType() {
			switch (this.widgetType) {
			  case Config.LIST_PROPERTY:
				this.widgetComponent = new ListWidget(this, this.settings.list) ;
				this.cssClasses.ListeWidget = true ;
				break;
			  case Config.AUTOCOMPLETE_PROPERTY:
				this.widgetComponent = new AutoCompleteWidget(this, this.settings.autocomplete) ;
				this.cssClasses.AutocompleteWidget = true ;
			    break;
			  case Config.TIME_PERIOD_PROPERTY:
				this.widgetComponent = new DatesWidget(this, this.settings.dates, langSearch) ;
				this.cssClasses.DatesWidget  = true ;
				break;
			  case Config.SEARCH_PROPERTY:
				this.widgetComponent = new SearchWidget(this, langSearch) ;
				this.cssClasses.SearchWidget  = true ;
				break;
			  case Config.TIME_DATE_PICKER_PROPERTY:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, false, langSearch) ;
				this.cssClasses.TimeDatePickerWidget  = true ;
				break;
			  case Config.TIME_DATE_DAY_PICKER_PROPERTY:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, 'day', langSearch) ;
				this.cssClasses.TimeDatePickerWidget  = true ;
				break;
			  case Config.NON_SELECTABLE_PROPERTY:
			  	this.widgetComponent = new NoWidget(this) ;
			  	this.cssClasses.NoWidget = true ;
			  default:
			  	// TODO : throw Exception
			  	console.log("Unexpected Widget Type "+this.widgetType)
			}
		};
		
		this.getValue = function () {
			return this.widgetComponent.getValue() ;
		}

		this.getValueLabel = function () {			
			return this.widgetComponent.getValueLabel() ;
		}
		
	}

	function getOffset( elem, elemParent ) {
		return elem.offset().left - $(elemParent).offset().left ;
	}

	/**
	 * Utility function to find the criteria "above" a given criteria ID, being
	 * either the "parent" in a WHERE criteria, or the "sibling"
	 * in an AND criteria
	 **/
	function findParentOrSiblingCriteria(thisForm_, id) {
		var dependant = null ;
		var dep_id = null ;
		var element = thisForm_._this.find('li[data-index="'+id+'"]') ;
		
		if ($(element).parents('li').length > 0) {			
			dep_id = $($(element).parents('li')[0]).attr('data-index') ;
			dependant = {type : 'parent'}  ;
		} else {
			if ($(element).prev().length > 0) {
				dep_id = $(element).prev().attr('data-index') ;
				dependant = {type : 'sibling'}  ;				
			}
		}

		$(thisForm_.components).each(function(index) {			
			if (this.index == dep_id) {
				dependant.element = this.CriteriaGroup ;
			}
		}) ;

		return dependant ;
	}
	
	function GenericTools(component) {
		this.component = component ;

		this.attachComponentHtml = function () {
			var instance = this.component.constructor.name ;
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
			var instance = this.component.constructor.name ;			
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
		
	}
	
	
	function Context(context) {
		
		this.contexteReference = context;
		this.hasContext = false;
		
		if (context !== null) {
			this.hasContext = true;
		}
		
		this.get = function() {
			return this.contexteReference ;
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
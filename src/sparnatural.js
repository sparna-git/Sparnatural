require("./assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");


const datepicker = require("@chenfengyuan/datepicker") ;
const $$ = require('jquery');

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
SparqlBifContainsAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").SparqlBifContainsAutocompleteAndListHandler;
SimpleSparqlAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").SimpleSparqlAutocompleteAndListHandler;
RangeBasedAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").RangeBasedAutocompleteAndListHandler;
PropertyBasedAutocompleteAndListHandler = require("./AutocompleteAndListHandlers.js").PropertyBasedAutocompleteAndListHandler

DefaultQueryGenerator = require("./QueryGenerators.js").DefaultQueryGenerator;

(function( $ ) {
	
    $.fn.Sparnatural = function( options ) {
 
        var specSearch = {} ;
        var langSearch = {} ;
        var specProvider;
		var defaults = {
			config: 'config/spec-search.json',
			language: 'en',
			addDistinct: false,
			addObjectsTypeCriteria: true,
			typePredicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
			maxDepth: 3,
			maxOr: 3,
			backgroundBaseColor: '250,136,3',
			
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
		
		var WIDGET_LIST_PROPERTY 			= 'ListProperty';
		var WIDGET_TIME_PERIOD_PROPERTY 	= 'TimePeriodProperty';
		var WIDGET_TIME_DATE_PICKER_PROPERTY = 'TimeDatePickerProperty';
		var WIDGET_TIME_DATE_DAY_PICKER_PROPERTY = 'TimeDateDayPickerProperty';
		var WIDGET_AUTOCOMPLETE_PROPERTY 	= 'AutocompleteProperty';
		var WIDGET_SEARCH_PROPERTY 			= 'SearchProperty';
		
		var VALUE_SELECTION_WIDGETS = [
			WIDGET_LIST_PROPERTY,
			WIDGET_AUTOCOMPLETE_PROPERTY
		];
		
		var settings = $.extend( true, {}, defaults, options );

		this.each(function() {
            var thisForm = {} ;
            thisForm._this = $(this) ;
			$(this).addClass('Sparnatural') ;
			
			thisForm.components = [] ;
			
			langSearch = i18nLabels[settings.language];
			if(typeof(settings.config) == "object") {
				specSearch = settings.config ;
				specProvider = new SimpleJsonLdSpecificationProvider(specSearch, settings.language);
				initForm(thisForm) ;
			} else {
				$.when( loadSpecSearch() ).done(function() {
					initForm(thisForm) ;
				});
			}			
        });
		
		function loadSpecSearch() {
			return $.getJSON( settings.config, function( data ) {
				specSearch = data ;
				specProvider = new SimpleJsonLdSpecificationProvider(data, settings.language);
			}).fail(function(response) {
				console.log("Sparnatural - unable to load config file : " +settings.config);
				console.log(response);
			}) ;			
		}		
		
		function initForm(thisForm_) {			
			var contexte = $('<div class="bg-wrapper"><ul class="componentsListe"></ul></div>');
			$(thisForm_._this).append(contexte) ;
			
			var contexte1 = addComponent(thisForm_, contexte.find('ul')) ;
			
			$(thisForm_._this).find('.nice-select').trigger('click') ;
			
			initGeneralEvent(thisForm_) ;
			
			$(thisForm_._this).on('submit', { formObject : thisForm_ }, function (event) {		
				event.preventDefault();
				var qGenerator = new DefaultQueryGenerator(
					settings.addDistinct,
					settings.typePredicate,
					settings.addObjectsTypeCriteria
				);
				qGenerator.generateQuery(event.data.formObject, settings.onQueryUpdated)
			}) ;
		}
		
	function initGeneralEvent(thisForm_) {
		$('li.groupe').off( "mouseover" ) ;
		$('li.groupe').off( "mouseleave" ) ;
		$('li.groupe').on( "mouseover", function(event) {
			event.stopImmediatePropagation();
			$('li.groupe').removeClass('Hover') ;
			$(this).addClass('Hover') ;
			
		} );
		$('li.groupe').on( "mouseleave", function(event) {
			event.stopImmediatePropagation();
			$('li.groupe').removeClass('Hover') ;
			
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
			console.log($(this).next()) ;
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
		

	function ClassSelectBuilder(specProvider) {
		this.specProvider = specProvider;

		this.buildClassSelect = function(classId, inputID, default_value) {
			var list = [] ;
			var items = [] ;

			if(classId === null) {
			 	items = specProvider.getClassesInDomainOfAnyProperty() ;
			} else {
				items = specProvider.getConnectedClasses(classId) ;
			}

			$.each( items, function( key, val ) {
				var label = specProvider.getLabel(val) ;
				var icon = specProvider.getIcon(val) ;
				var highlightedIcon = specProvider.getHighlightedIcon(val) ;

				if (!highlightedIcon || 0 === highlightedIcon.length) {
					highlightedIcon = icon ;
				}
				
				var image = ' data-icon="' + icon + '" data-iconh="' + highlightedIcon + '"' ;
				var selected ='';
				if (default_value == val) {
					selected = 'selected="selected"' ;
				}
				list.push( '<option value="'+ val +'" data-id="' + val + '"'+image+selected+'>'+ label + '</option>' );
			}) ;

			var html_list = $( "<select/>", {
				"class": "my-new-list input-val",
				"id": 'select-'+inputID,
				html: list.join( "" )
			  });

			return html_list ;
		}
	}


	function PropertySelectBuilder(specProvider) {
		this.specProvider = specProvider;

		this.buildPropertySelect = function(domainClassID, rangeClassID, inputID, default_value) {
			var list = [] ;
			var items = specProvider.getConnectingProperties(domainClassID,rangeClassID) ;
			$.each( items, function( key, val ) {
				var label = specProvider.getLabel(val) ;
				var selected ='';
				if (default_value == val) {
					selected = 'selected="selected"' ;
				}
				list.push( '<option value="'+val+'" data-id="'+val+'"'+selected+'>'+ label + '</option>' );

			}) ;
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
				n_width = n_width + GetOffSet( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) - 111 + 15 + 11 + 20 + 5 + 3 ;
				var t_width = GetOffSet( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) + 15 + 11 + 20 + 5  ;
				$(ul).attr('data-test', GetOffSet( $(parent_li).find('>div>.EndClassGroup'), $(ul) ) );
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

	function GetOffSet( elem, elemParent ) {
		return elem.offset().left - $(elemParent).offset().left ;
	}

	
	function CriteriaGroup(context, settings, specProvider) {
		this._this = this ;
		this.thisForm_ = context.FormContext ;
		this.ParentComponent = context.FormContext  ;
		this.ComponentHtml = context.HtmlContext ;
		this.AncestorComponentHtml = context.AncestorHtmlContext ;
		
		this.settings = settings;
		
		this.statements = {
			HasAllComplete : false,
			IsOnEdit : false
		}
		this.id =  context.ContextComponentIndex ;
		this.html = $('<div id="CriteriaGroup-'+this.id+'" class="CriteriaGroup"></div>').appendTo(this.ComponentHtml) ;
		
		this.Context = new Context(context) ;
		this.ChildrensCriteriaGroup = new ChildrensCriteriaGroup ;
		
		this.StartClassGroup = new StartClassGroup(this, specProvider) ;		
		this.ObjectPropertyGroup = new ObjectPropertyGroup(this, specProvider) ;
		this.EndClassGroup = new EndClassGroup(this, specProvider) ;
		this.EndClassWidgetGroup = new EndClassWidgetGroup(this, this.settings, specProvider) ;
		this.ActionsGroup = new ActionsGroup(this, specProvider) ;
		
		$(this).trigger( {type:"Created" } ) ;
		
		
		this.initEnd = function () {
			$(this).trigger( {type:"StartClassGroupSelected" } ) ;
		} ;
		
		this.initCompleted = function () {
			$(this.html).parent('li').addClass('completed') ;
		}
		
		this.RemoveCriteria = function() {
			console.log(this) ;
			var index_to_remove = this.id ;
			
			
			$(this.ParentComponent.components).each(function() {
				var dependantDe = GetDependantCriteria(this.CriteriaGroup.thisForm_, this.index ) ;
				if ((dependantDe != null) && (dependantDe.type == 'parent')){
					if (dependantDe.element.id == index_to_remove) {
						this.CriteriaGroup.RemoveCriteria() ;
					}
				}
			}) ;
			
			var dependantDe = GetDependantCriteria(this.thisForm_, this.id ) ;			
			if (dependantDe === null) {
				
			} else {
				var dependantComponent = dependantDe.element ;
			}
			var formObject = this.thisForm_ ;
			var formContextHtml = this.Context.contexteReference.AncestorHtmlContext;
			
			//remove event listners
			this.ComponentHtml.outerHTML = this.ComponentHtml.outerHTML;
			$(this.ComponentHtml).remove() ;
			
			var iteration_to_remove = false ;
			$(this.ParentComponent.components).each(function(i) {					
				if (this.index == index_to_remove){					
					iteration_to_remove = i ;
				}
			}) ;
			this.ParentComponent.components.splice(iteration_to_remove , 1);
			
			
			if (this.ParentComponent.components.length == 0) {
				console.log(formObject) ;
				var new_component = addComponent(formObject, formContextHtml) ;			
				$(new_component).find('.nice-select').trigger('click') ;				
			} else {
				if (dependantDe !== null) {
					if ($(dependantComponent.ComponentHtml).find('li.groupe').length > 0) {
						
					} else { //Si pas d'enfant, on reaffiche le where action						
						if ($(dependantComponent.ComponentHtml).hasClass('haveWhereChild') ) {
							$(dependantComponent.ComponentHtml).removeClass('haveWhereChild') ;
							$(dependantComponent.ComponentHtml).removeClass('completed') ;
						}
						$(dependantComponent.ComponentHtml).find('>ul.childsList').remove() ;
					}
				}

				initGeneralEvent(formObject) ;
				//ExecuteSubmited(formObject) ;
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
	// var GroupContenaire = function () {
		this.ParentComponent = null ;
		this.GroupType = null ;
		this.hasSubvalues = false ;
		this.inputTypeComponent = null ;
		this.tools = null ;
		this.widgetHtml = false ;
		this.html = $() ;
		this.statements = {
			HasInputsCompleted : false,
			IsOnEdit : false,
			Invisible: false
		};
		this.value_selected = null ;	
		
		this.init = function() {			
			if (!this.statements.Created) {				
				this.statements.IsOnEdit = true ;
				this.HtmlContainer = this.ParentComponent ;
				//this.html.remove() ;
				this.tools = new GenericTools(this) ;
				this.tools.InitHtml() ;
				this.tools.Add() ;
				this.statements.Created = true ;				
			} else {
				this.tools.Update() ;
			}
		} ;
		
		this.Edit = function Edit() {
			this.inputTypeComponent.statements.IsOnEdit = true;
		};
		
	} 
	
	
	function StartClassGroup (CriteriaGroupe, specProvider) { 
	// var StartClassGroup = function (CriteriaGroupe) {
		this.base = GroupContenaire ;
		this.base() ;

		this.specProvider = specProvider;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'StartClassGroup' ;
		this.statements.StartClassGroup = true ;
		this.statements.Created = false ;
		
		this.inputTypeComponent = new ClassTypeId(this, specProvider) ;

		$(CriteriaGroupe).on('Created', function () {
			$(this.StartClassGroup.html).find('.input-val').unbind('change');
			this.StartClassGroup.inputTypeComponent.init() ;
			this.StartClassGroup.Edit() ;
			var select = $(this.StartClassGroup.html).find('.input-val')

			//$(this.html).find('.input-val').change($.proxy(this.initEnd() , null)); 
			this.StartClassGroup.niceslect = $(select).niceSelect() ;
			
			$(this.StartClassGroup.html).find('select.input-val').on(
				'change',
				{arg1: this.StartClassGroup, arg2: 'validSelected'},
				eventProxiCriteria
			);
			
			if ($(this.Context.get().AncestorHtmlContext).is('li')) {
				var ancestorID = parseInt( $(this.Context.get().AncestorHtmlContext).attr('data-index') )  ;
			}
		}) ;

		this.validSelected = function validSelected() {
			//this.niceslect.niceSelect('update') ;
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			//$(this.html).find('.input-val').attr('disabled', 'disabled');
			$(this.ParentComponent).trigger( {type:"StartClassGroupSelected" } ) ;
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;	
		};
		
		this.init() ;
		
		
	} //StartClassGroup.prototype = new GroupContenaire;
	
	
	function ObjectPropertyGroup(CriteriaGroupe1, specProvider) {
	// var ObjectPropertyGroup = function (CriteriaGroupe1) {
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe1 ;
		this.GroupType = 'ObjectPropertyGroup' ;
		this.statements.ObjectPropertyGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		this.inputTypeComponent = new ObjectPropertyTypeId(this, specProvider) ;
		
		$(CriteriaGroupe1).on('EndClassGroupSelected', function () {
			
			$(this.ObjectPropertyGroup.html).find('.input-val').unbind('change');
			//this.ObjectPropertyGroup.init() ;
			if (!this.ObjectPropertyGroup.inputTypeComponent.statements.Created) {
				this.ObjectPropertyGroup.inputTypeComponent.init() ;
				this.ObjectPropertyGroup.Edit() ;
			} else {
				this.ObjectPropertyGroup.reloadWidget() ;
				this.ObjectPropertyGroup.Edit() ;
			}
			
			
			this.ObjectPropertyGroup.niceslect = $(this.ObjectPropertyGroup.html).find('select.input-val').niceSelect()  ;
			$(this.ObjectPropertyGroup.html).find('.input-val').removeAttr('disabled').niceSelect('update'); 
			//$('.nice-select').removeClass('open') ;
			$(this.ObjectPropertyGroup.html).find('.nice-select').trigger('click') ;
			$(this.ObjectPropertyGroup.html).find('select.input-val').on('change', {arg1: this.ObjectPropertyGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			if ($(this.ObjectPropertyGroup.html).find('select.input-val').find('option').length == 1) {
				$(this.ObjectPropertyGroup.html).find('.nice-select').trigger('click') ;
			}
		}) ;
			
		this.validSelected = function validSelected() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			$(this.ParentComponent.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			$(this.ParentComponent).trigger( {type:"ObjectPropertyGroupSelected" } ) ;			
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;			
		};

		this.reloadWidget = function reloadWidget() {
			this.ParentComponent.ObjectPropertyGroup.inputTypeComponent.reload() ;

		};
			
		this.init() ;
		
	} //ObjectPropertyGroup.prototype = new GroupContenaire;
	
	
	function EndClassGroup(CriteriaGroupe, specProvider) {
	// var EndClassGroup = function EndClassGroup(CriteriaGroupe) {
		//GroupContenaire.call(this) ;
		this.base = GroupContenaire ;
		this.base() ;
		this.specProvider = specProvider;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'EndClassGroup' ;
		this.statements.EndClassGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		this.inputTypeComponent = new ClassTypeId(this, specProvider) ;
		this.unselect = $('<span class="unselect unselectEndClass"><i class="far fa-times-circle"></i></span>') ;



		$(CriteriaGroupe).on('StartClassGroupSelected', function () {
			$(this.EndClassGroup.html).find('.input-val').unbind('change');
			$(this.EndClassGroup.html).append('<div class="EditComponents ShowOnHover"></div>');
			$(this.EndClassGroup.html).append(this.EndClassGroup.unselect);
			//this.EndClassGroup.init() ;
			this.EndClassGroup.inputTypeComponent.init() ;
			this.EndClassGroup.Edit() ;
			
			this.EndClassGroup.niceslect = $(this.EndClassGroup.html).find('select.input-val').niceSelect()  ;
			$(this.EndClassGroup.html).find('.nice-select').trigger('click') ;
			
			$(this.EndClassGroup.html).find('select.input-val').on('change', {arg1: this.EndClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			$(this.EndClassGroup.html).find('span.unselectEndClass').on('click', {arg1: this.EndClassGroup, arg2: 'removeSelected'}, eventProxiCriteria);	
			//$(this.EndClassGroup.unselect).hide() ;	
		}) ;
		
		this.validSelected = function validSelected() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.EndClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update');	
			
			if (specProvider.hasConnectedClasses(this.value_selected)) {
				$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
			} else {
				$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
			}
			//$(this.unselect).show() ;
			console.log(this) ;
			this.statements.HasInputsCompleted = true ;
			this.statements.IsOnEdit = false ;
			this.init() ;
			this.ParentComponent.ObjectPropertyGroup.statements.Invisible = false;
			this.ParentComponent.ObjectPropertyGroup.init() ;

			$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
		};

		this.removeSelected = function removeSelected () {
			
			$(this.ParentComponent.html).find('>.EndClassWidgetGroup .EndClassWidgetValue span.unselect').trigger('click') ;
			this.ParentComponent.ObjectPropertyGroup.statements.Invisible = true ;
			this.ParentComponent.ObjectPropertyGroup.init() ;
			$(this.ParentComponent.ComponentHtml).find('.childsList .ActionRemove a').trigger('click') ;
			this.value_selected = null;
			this.statements.HasInputsCompleted = false ;
			this.statements.IsOnEdit = true ;
			this.init() ;
			$(this.html).find('select.input-val').on('change', {arg1: this, arg2: 'validSelected'}, eventProxiCriteria);
			$(this.html).find('.input-val').removeAttr('disabled').niceSelect('update');
			$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
			console.log(this.ParentComponent) ;
			this.ParentComponent.ActionsGroup.reinsert = true ;
			$(this.ParentComponent.ComponentHtml).removeClass('completed') ;
			console.log(this) ;
			$(this.html).find('.nice-select').trigger('click') ;
		}
		
		this.init() ;
	} ;
	
	function EndClassWidgetGroup(CriteriaGroupe, settings, specProvider) {
	// var EndClassWidgetGroup = function (CriteriaGroupe, settings) {
		this.base = GroupContenaire ;
		this.base() ;
		this.settings = settings;
		this.specProvider = specProvider;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'EndClassWidgetGroup' ;
		this.statements.EndClassWidgetGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		this.value_selected = [] ;
		
		this.detectWidgetType = function () {
			console.log(this.ParentComponent.ObjectPropertyGroup.value_selected) ;
			this.widgetType = this.specProvider.getWidget(this.ParentComponent.ObjectPropertyGroup.value_selected);
		};
		
		this.inputTypeComponent = new ObjectPropertyTypeWidget(this, this.settings, specProvider) ;
		
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			this.EndClassWidgetGroup.detectWidgetType() ;
			this.EndClassWidgetGroup.inputTypeComponent.HtmlContainer.html = $(this.EndClassGroup.html).find('.EditComponents') ;
			
			
			//this.EndClassWidgetGroup.inputTypeComponent.init() ;
			console.log(this) ;
			if (this.ActionsGroup.reinsert == true) {
				//this.EndClassWidgetGroup.inputTypeComponent.HtmlContainer.html.find('*').remove() ;
				this.EndClassWidgetGroup.inputTypeComponent.reload() ;
			} else {
				this.EndClassWidgetGroup.inputTypeComponent.init() ;
			}



			$(this.EndClassWidgetGroup.inputTypeComponent).on(
				'change',
				{
					arg1: this.EndClassWidgetGroup,
					arg2: 'validSelected'
				},
				eventProxiCriteria
			);
		}) ;
		
		this.removeValue = function removeValue(e) {
			
			var valueDataAttr = $(e.currentTarget).attr('value-data') ;

			for (var item in this.value_selected) {	

				if (Array.isArray(this.value_selected[item])) {
					var value_data = this.value_selected[item].toString() ;
				} else {
					var value_data = this.value_selected[item] ;
				}

				if (value_data == valueDataAttr ) {
					this.value_selected.splice(item, 1); 

				}
			}
			$(this.ParentComponent.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').show() ;

			$(e.currentTarget).parent('div').remove() ;

			if(this.value_selected.length < 1) {
				$(this.ParentComponent.ComponentHtml).removeClass('completed') ;
				$(this.ParentComponent.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').remove() ;
				$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
				if (this.ParentComponent.EndClassGroup.specProvider.hasConnectedClasses(this.ParentComponent.EndClassGroup.value_selected)) {
					$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
				} else {
					$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
				}


			}

			$(this.ParentComponent).trigger( {type:"EndClassWidgetGroupUnselected" } ) ;
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;

		} ;
		this.validSelected = function validSelected() {
			var temp_value = this.inputTypeComponent.GetValue() ;
			if (temp_value == null ) {
				return false ;
			}
			if (this.value_selected.length > 0) {
				if (Object.onArray(this.value_selected, temp_value) == true) {
					return false ;
				}
			}
			
			this.value_selected.push(this.inputTypeComponent.GetValue()) ;
			this.LabelValueSelected = this.inputTypeComponent.GetValueLabel() ;
			//$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 

			if (Array.isArray(this.inputTypeComponent.GetValue())) {
				var value_data = this.inputTypeComponent.GetValue().toString() ;
			} else {
				var value_data = this.inputTypeComponent.GetValue() ;
			}

			this.unselect = $('<span class="unselect" value-data="'+value_data+'"><i class="far fa-times-circle"></i></span>') ;
			if ($(this.ParentComponent.html).find('.EndClassWidgetGroup>div').length == 0) {
				$(this.ParentComponent.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetValue"><span class="triangle-h"></span><span class="triangle-b"></span><p>'+this.LabelValueSelected+'</p></div>').find('div').append(this.unselect) ;
			} else {
				var temp_html = $('<div class="EndClassWidgetValue"><span class="triangle-h"></span><span class="triangle-b"></span><p>'+this.LabelValueSelected+'</p></div>').append(this.unselect)  ;
				var ellle = $(this.ParentComponent.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').before(temp_html) ;

			}

			this.unselect.on('click', {	arg1: this,	arg2: 'removeValue'	}, eventProxiCriteria );

			$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
			
			this.ParentComponent.initCompleted() ;
			
			$(this.ParentComponent).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;
			
			if ( VALUE_SELECTION_WIDGETS.indexOf(this.inputTypeComponent.widgetType) !== -1 ) {
				if ($(this.ParentComponent.html).find('.EndClassWidgetGroup>div').length == 1) {
					$(this.ParentComponent.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetAddOrValue"><span class="triangle-h"></span><span class="triangle-b"></span><p><span>+</span></p></div>') ;
					$(this.ParentComponent.html).find('.EndClassWidgetGroup>.EndClassWidgetAddOrValue').on('click', {arg1: this, arg2: 'needAddOrValue'}, eventProxiCriteria);
				}
			}

			//Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
			if (this.value_selected.length == settings.maxOr) {
				$(this.ParentComponent.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').hide() ;
			}
			
			$(this.ParentComponent.html).find('.EndClassGroup>.EditComponents').removeClass('newOr') ;

			initGeneralEvent(this.ParentComponent.thisForm_);
		};
		
		this.needAddOrValue = function needAddOrValue() {
			$(this.ParentComponent.html).find('.EndClassGroup>.EditComponents').addClass('newOr') ;
		};
		
		this.init() ;
		
	} //EndClassWidgetGroup.prototype = new GroupContenaire;
	
	
	function ActionsGroup(CriteriaGroupe, specProvider) {
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'ActionsGroup' ;
		this.statements.ActionsGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		this.reinsert = false;
		
		this.detectWidgetType = function detectWidgetType() {			
			this.widgetType = 'Actions' ;			
		};
		
		this.inputTypeComponent = { 
			ActionWhere: new ActionWhere(this, specProvider),
			ActionAnd: new ActionAnd(this, specProvider),
			ActionRemove: new ActionRemove(this, specProvider)
		} ;
		
		$(CriteriaGroupe).on('Created', function () {
			this.ActionsGroup.detectWidgetType() ;
			this.ActionsGroup.inputTypeComponent.ActionRemove.init() ;
			
			$(this.ActionsGroup.inputTypeComponent.ActionRemove.html).find('a').on(
				'click',
				{arg1: this, arg2: 'RemoveCriteria'},
				eventProxiCriteria
			);
		}) ;
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			this.ActionsGroup.detectWidgetType() ;

			this.ActionsGroup.inputTypeComponent.ActionWhere.HtmlContainer.html = $(this.EndClassGroup.html).find('.EditComponents') ;
			console.log(this.ActionsGroup) ;
			if (this.ActionsGroup.reinsert == true) {
				//this.ActionsGroup.inputTypeComponent.ActionWhere.HtmlContainer.html.find('*').remove() ;
				this.ActionsGroup.inputTypeComponent.ActionWhere.reload() ;
				this.ActionsGroup.inputTypeComponent.ActionAnd.reload() ;
			} else {
				this.ActionsGroup.inputTypeComponent.ActionWhere.init() ;
				this.ActionsGroup.inputTypeComponent.ActionAnd.init() ;
			}
			
			
			$(this.ActionsGroup.inputTypeComponent.ActionWhere.html).find('a').on(
				'click', 
				{arg1: this.ActionsGroup, arg2: 'AddWhere'},
				eventProxiCriteria
			);
			$(this.ActionsGroup.inputTypeComponent.ActionAnd.html).find('a').on(
				'click',
				{arg1: this.ActionsGroup, arg2: 'AddAnd'},
				eventProxiCriteria
			);
			
			initGeneralEvent(this.thisForm_);
		}) ;
		
		this.AddWhere = function () {
			
			this.ParentComponent.html.parent('li').addClass('haveWhereChild') ;
			this.ParentComponent.initCompleted() ;
			
			var new_component = addComponent(
				this.ParentComponent.thisForm_,
				this.ParentComponent.Context.contexteReference.HtmlContext
			) ;
			
			$(new_component).find('.nice-select').trigger('click') ;
			$(new_component).find('.nice-select').trigger('click') ;
		}

		this.AddAnd = function () {
			var new_component = addComponent(
				this.ParentComponent.thisForm_,
				this.ParentComponent.Context.contexteReference.AncestorHtmlContext
			) ;
			
			$(new_component).find('.nice-select').trigger('click') ;
			$(new_component).find('.nice-select').trigger('click') ;

			return false ;			
		}

		this.validSelected = function validSelected() { };
		
		this.init() ;
		
	} //ActionsGroup.prototype = new GroupContenaire;
	

	function GetDependantCriteria(thisForm_, id) {
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
	

	function InputTypeComponent(specProvider) {
	// var InputTypeComponent = function () {
		
		this.specProvider = specProvider;
		this.ParentComponent = null ;
		this.statements = {
			IsCompleted : false,
			IsOnEdit : false
		}
		
		this.possibleValue ;
		this.tools = null ;
		this.value = null ;
		
		this.updateClass = function () {
			this.tools.Update() ;
		}
			
		this.init = function () {
			
			//If Start Class 
			if (this.statements.Created) {
				this.tools.Update() ;
				return true ;
			}
			var trigger = null ;
			var possible_values = null ;
			var default_value = null ;
			var id = this.ParentComponent.ParentComponent.id ;
			if (this.ParentComponent instanceof StartClassGroup) {
				
				var dep_element = GetDependantCriteria(this.ParentComponent.ParentComponent.thisForm_, id) ;
				if (dep_element) {
					if (dep_element.type == 'parent' ) {
						default_value = dep_element.element.EndClassGroup.value_selected ;
					} else {
						default_value = dep_element.element.StartClassGroup.value_selected ;
					}
					this.statements.Highlited = false ;
				} else {
					this.statements.Highlited = true ;
				}
				
				var selectBuilder = new ClassSelectBuilder(this.specProvider);
				possible_values = selectBuilder.buildClassSelect(null, 'a-'+id, default_value);
				// possible_values = getClassListSelectFor(null, 'a-'+id, default_value) ;
			} 
			
			if (this.ParentComponent instanceof EndClassGroup) {
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var selectBuilder = new ClassSelectBuilder(this.specProvider);
				possible_values = selectBuilder.buildClassSelect(startClassGroup.value_selected, 'b-'+id);
			}
			
			if (this.ParentComponent instanceof ObjectPropertyGroup) {
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
				var selectBuilder = new PropertySelectBuilder(this.specProvider);
				possible_values = selectBuilder.buildPropertySelect(startClassGroup.value_selected, endClassGroup.value_selected, 'c-'+id) ;
			}
			
			if (this.ParentComponent instanceof ActionsGroup) {	
				if (this.ParentComponent.reinsert)		 {
					console.log('Reload du input type component');
					console.log(this) ;
					return this.reload() ;
				}
				if (this instanceof ActionWhere) {
					var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
					var endLabel = specProvider.getLabel(endClassGroup.value_selected) ;
					var widgetLabel = '<span class="edit-trait"><span class="edit-num">2</span></span>'+langSearch.Search+' '+ endLabel + ' '+langSearch.That+'...' ;
					possible_values = widgetLabel+'<a>+</a>' ;
				}
				if (this instanceof ActionAnd) {
					possible_values = '<span class="trait-and-bottom"></span><a>'+langSearch.And+'</a>' ;
				}
				if (this instanceof ActionRemove) {
					possible_values = '<a><img src="' + removeIcon + '"></a>' ;
				}
			} 
			
			this.widgetHtml = possible_values ;
			this.statements.IsOnEdit = true ;
			this.tools = new GenericTools(this) ;
			this.tools.InitHtml() ;
			this.tools.Add() ;
			this.statements.Created = true ;
			console.log(this.tools) ;

			if (trigger) {
				//console.log(trigger) 
				//$(this.widgetHtml).trigger('change') ;
			}			
		} ;	
		
		this.reload = function() {
			var possible_values = null ;
			var default_value = null ;
			var id = this.ParentComponent.ParentComponent.id ;

			if (this.ParentComponent instanceof ObjectPropertyGroup) {
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
				var selectBuilder = new PropertySelectBuilder(this.specProvider);
				possible_values = selectBuilder.buildPropertySelect(startClassGroup.value_selected, endClassGroup.value_selected, 'c-'+id) ;
			}

			if (this.ParentComponent instanceof ActionsGroup) {				
				if (this instanceof ActionWhere) {
					var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
					var endLabel = specProvider.getLabel(endClassGroup.value_selected) ;
					var widgetLabel = '<span class="edit-trait"><span class="edit-num">2</span></span>'+langSearch.Search+' '+ endLabel + ' '+langSearch.That+'...' ;
					possible_values = widgetLabel+'<a>+</a>' ;
				}
				if (this instanceof ActionAnd) {
					possible_values = '<span class="trait-and-bottom"></span><a>'+langSearch.And+'</a>' ;
					console.log(possible_values) ;
				}
				if (this instanceof ActionRemove) {
					possible_values = '<a><img src="' + removeIcon + '"></a>' ;
				}
			}

			this.widgetHtml = possible_values ;
			this.statements.IsOnEdit = true ;
			//this.tools = new GenericTools(this) ;
			console.log(this.tools) ;
			this.tools.ReInitHtml() ;
			this.tools.Replace() ;
			this.statements.Created = true ;
		} ;
	};
	
	
	function ActionWhere(GroupContenaire, specProvider) {
		this.base = InputTypeComponent ;
		this.base(specProvider) ;
		this.ParentComponent = GroupContenaire ;
		this.statements.ActionWhere = true ;
		this.statements.ShowOnHover = true ;
		this.statements.Created = false ;
		this.HtmlContainer = {} ;
	}	
	
	function ActionAnd(GroupContenaire, specProvider) {
		this.base = InputTypeComponent ;
		this.base(specProvider) ;
		this.ParentComponent = GroupContenaire ;
		this.statements.ActionAnd = true ;
		this.statements.ShowOnHover = true ;
		this.statements.Created = false ;
		this.HtmlContainer = this.ParentComponent ;
	}	
	
	function ActionRemove(GroupContenaire, specProvider) {
		this.base = InputTypeComponent ;
		this.base(specProvider) ;
		this.ParentComponent = GroupContenaire ;
		this.statements.ActionRemove = true ;
		this.statements.Created = false ;
		this.HtmlContainer = this.ParentComponent ;		
	}
	
	function ClassTypeId(GroupContenaire, specProvider) {
	// var ClassTypeId = function (GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base(specProvider) ;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.statements.Highlited = true ;
		this.statements.Created = false ;		
	};
	
	
	function ObjectPropertyTypeId(GroupContenaire, specProvider) {
		this.base = InputTypeComponent ;
		this.base(specProvider) ;
		this.ParentComponent = GroupContenaire ;
		this.html = '<div class="ObjectPropertyTypeId"></div>' ;
		this.widgetHtml = null ;
		this.HtmlContainer = this.ParentComponent ;
		this.statements.Created = false ;		
	}
		
	function ObjectPropertyTypeWidget(GroupContenaire, settings, specProvider) {
		this.base = InputTypeComponent ;
		this.base(specProvider) ;
		this.settings = settings;
		this.ParentComponent = GroupContenaire ;
		this.html = '<div class="ObjectPropertyTypeWidget"></div>' ;
		this.widgetHtml = null ;
		this.widgetType = null ;
		this.HtmlContainer = this.ParentComponent ;
		this.statements.Created = false ;
		
		this.init = function init() {
			if (this.ParentComponent instanceof EndClassWidgetGroup) {
				if (this.statements.Created) {
					this.tools.Update() ;
					return true ;
				}
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;

				this.widgetType = this.ParentComponent.widgetType  ;
				if (this.widgetType == WIDGET_SEARCH_PROPERTY) {
					// label of the "Search" pseudo-class is inserted here in this case
					var endLabel = specProvider.getLabel(endClassGroup.value_selected) ;
				} else {
					var endLabel = langSearch.Find+' '+specProvider.getLabel(endClassGroup.value_selected) ;
				}
				var widgetLabel = '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>'+ endLabel ;
				
				this.getWigetTypeClassName() ;
				console.log(this) ;
				this.widgetHtml = widgetLabel + this.widgetComponent.html ;
				
			
				this.statements.IsOnEdit = true ;
				this.tools = new GenericTools(this) ;
				this.tools.InitHtml() ;
				this.tools.Add() ;
				this.widgetComponent.init() ;
				this.statements.Created = true ;
			}
		}

		this.reload = function reload() {
			if (this.ParentComponent instanceof EndClassWidgetGroup) {
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;

				this.widgetType = this.ParentComponent.widgetType  ;
				if (this.widgetType == WIDGET_SEARCH_PROPERTY) {
					// label of the "Search" pseudo-class is inserted here in this case
					var endLabel = specProvider.getLabel(endClassGroup.value_selected) ;
				} else {
					var endLabel = langSearch.Find+' '+specProvider.getLabel(endClassGroup.value_selected) ;
				}
				var widgetLabel = '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>'+ endLabel ;
				
				this.getWigetTypeClassName() ;
				this.widgetHtml = widgetLabel + this.widgetComponent.html ;
				
			
				this.statements.IsOnEdit = true ;
				//this.tools = new GenericTools(this) ;
				this.tools.ReInitHtml() ;
				this.tools.Replace() ;
				this.widgetComponent.init() ;
				this.statements.Created = true ;
			}
		}

		this.getWigetTypeClassName = function getWigetTypeClassName() {
			switch (this.widgetType) {
			  case WIDGET_LIST_PROPERTY:
				this.widgetComponent = new ListWidget(this, this.settings.list) ;
				break;
			  case WIDGET_AUTOCOMPLETE_PROPERTY:
				this.widgetComponent = new AutoCompleteWidget(this, this.settings.autocomplete) ;
			    break;
			  case WIDGET_TIME_PERIOD_PROPERTY:
				this.widgetComponent = new DatesWidget(this, this.settings.dates) ;
				break;
			  case WIDGET_SEARCH_PROPERTY:
				this.widgetComponent = new SearchWidget(this) ;
				break;
			  case WIDGET_TIME_DATE_PICKER_PROPERTY:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, false) ;
				break;
			  case WIDGET_TIME_DATE_DAY_PICKER_PROPERTY:
				this.widgetComponent = new TimeDatePickerWidget(this, this.settings.dates, 'day') ;
				break;
			  default:
			  	// TODO : throw Exception
				this.widgetComponent = null;
			}
		};
		
		this.GetValue = function () {
			
			var value = null ;
			switch (this.widgetType) {
			  case WIDGET_LIST_PROPERTY:
			  var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value = $(id_input).val() ;
				break;
			  case WIDGET_AUTOCOMPLETE_PROPERTY:
				var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value = $(id_input).val() ;
			    break;
			  case WIDGET_TIME_PERIOD_PROPERTY:
				var id_input = '#ecgrw-date-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
				
				value = { start: $(id_input+'-start').val() , stop: $(id_input+'-stop').val()  } ;
				
				if ((value.start == '') || (value.stop == '')) {
					value = null ;
				} else {
					if (parseInt(value.start) > parseInt(value.stop)) {
						value = null ;
					}
				}				
				break;
			  case WIDGET_TIME_DATE_PICKER_PROPERTY:
			  case WIDGET_TIME_DATE_DAY_PICKER_PROPERTY: 
				var id_input = '#ecgrw-date-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
					
				value = { start: $(id_input+'-start').val() , stop: $(id_input+'-stop').val()  } ;
					
				if ((value.start == '') || (value.stop == '')) {
					value = null ;
				} else {
					if (parseInt(value.start) > parseInt(value.stop)) {
						value = null ;
					}
				}				
				break;
			  case WIDGET_SEARCH_PROPERTY:
				var id_input = '#ecgrw-search-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value = $(id_input).val() ;
				break;
			  default:
			  	// TODO : Exception ?
			  	value = null;
			}

			return value ;
		}

		this.GetValueLabel = function () {			
			var valueLabel = null ;
			switch (this.widgetType) {
			  case WIDGET_LIST_PROPERTY:
			  	var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				valueLabel = '<span>' +$(id_input).find('option:selected').text() + '</span>' ;
				break;
			  case WIDGET_AUTOCOMPLETE_PROPERTY:
				var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
				valueLabel = '<span>' + $(id_input).val()  + '</span>' ;
			    break;
			  case WIDGET_TIME_PERIOD_PROPERTY:				
				var id_input = '#ecgrw-date-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
				valueLabel = '<span class="label-two-line">De '+ $(id_input+'-start').val() +' à '+ $(id_input+'-stop').val() + '<br/>(' + $(id_input).val() + ')</span>' ;
				break;
			  case WIDGET_TIME_DATE_PICKER_PROPERTY:
			  case WIDGET_TIME_DATE_DAY_PICKER_PROPERTY:			
				var id_input = '#ecgrw-date-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
				valueLabel = '<span class="label-two-line">De '+ $(id_input+'-start').val() +' à '+ $(id_input+'-stop').val() + '</span>' ;
				break;
			  case WIDGET_SEARCH_PROPERTY:				
				var id_input = '#ecgrw-search-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				valueLabel = '<span>'+ $(id_input).val() +'</span>' ;
				break;				
			  default:
			  	valueLabel = null;
			}
			return valueLabel ;
		}
		
	}
	

	function Widget() {		
		this.parentComponent = null ;
		this.html = null ;		
	}
	
	function AutoCompleteWidget(inputTypeComponent, autocompleteHandler) {
		this.base = Widget ;
		this.base() ;
		this.autocompleteHandler = autocompleteHandler;
		this.ParentComponent = inputTypeComponent ;
		this.ParentComponent.statements.AutocompleteWidget  = true ;

		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		this.html = '<input id="ecgrw-'+this.IdCriteriaGroupe+'-input" /><input id="ecgrw-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			var id_inputs = this.IdCriteriaGroupe ;			
			var itc_obj = this.ParentComponent;	
			var isMatch = settings.autocomplete.enableMatch(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value);
			
			var options = {
				// ajaxSettings: {crossDomain: true, type: 'GET'} ,
				url: function(phrase) {
					return autocompleteHandler.autocompleteUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, phrase) ;
				},

				listLocation: function (data) {
					return autocompleteHandler.listLocation(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, data) ;
				},
				
				
				getValue: function (element) { 
					return autocompleteHandler.elementLabel(element) ;
				},

				ajaxSettings: {
					crossDomain: true,
					dataType: "json",
					method: "GET",
					data: {
				  		dataType: "json"
					}
				},

				preparePostData: function(data) {
					data.phrase = $('#ecgrw-'+id_inputs+'-input').val();
					return data;
				},

				list: {
					match: {
						enabled: isMatch
					},

					onChooseEvent: function() {
						var value = $('#ecgrw-'+id_inputs+'-input').getSelectedItemData();
						
						var label = autocompleteHandler.elementLabel(value) ; 
						var uri = autocompleteHandler.elementUri(value) ; 
						$('#ecgrw-'+id_inputs+'-input').val(label)
						$('#ecgrw-'+id_inputs+'-input-value').val(uri).trigger("change");$(itc_obj).trigger("change");
					}
				},

				requestDelay: 400
			};
			//Need to add in html befor
			
			$('#ecgrw-'+id_inputs+'-input').easyAutocomplete(options);
		}
	}
	
	function ListWidget(inputTypeComponent, listHandler) {
		this.base = Widget ;
		this.base() ;
		this.listHandler = listHandler;
		this.ParentComponent = inputTypeComponent ;
		this.ParentComponent.statements.ListeWidget = true ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		var id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;		
		this.html = '<div class="list-widget"><select id="'+id_input+'"></select></div>' ;
		this.select = $('<select id="'+id_input+'"></select>');
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			var itc_obj = this.ParentComponent;
			var options = {
				url: settings.list.listUrl(
					startClassGroup_value,
					ObjectPropertyGroup_value,
					endClassGroup_value
				),
				dataType: "json",
				method: "GET",
				data: {
					  dataType: "json"
				}
			} ;
			
			var request = $.ajax( options );
			var select = $(this.html).find('select') ;
			request.done(function( data ) {			  
			  	var items = listHandler.listLocation(
			  		startClassGroup_value,
			  		ObjectPropertyGroup_value,
			  		endClassGroup_value,
			  		data
			  	) ;
			  	$.each( items, function( key, val ) {				  
					var label = listHandler.elementLabel(val) ; 
					var uri = listHandler.elementUri(val) ; 
					$('#'+id_input).append( "<option value='" + uri + "'>" + label + "</option>" );
			  	});
			  	$('#'+id_input).niceSelect();
			  	$('#'+id_input).on("change", function() {
					$(itc_obj).trigger('change') ;
			  	});  
			});
		}		
	}
	
	function DatesWidget(inputTypeComponent, datesHandler) {
		this.base = Widget ;
		this.base() ;
		this.datesHandler = datesHandler;
		this.ParentComponent = inputTypeComponent ;
		this.ParentComponent.statements.DatesWidget  = true ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		this.html = '<div class="date-widget"><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input" placeholder="'+langSearch.PlaceHolderDatePeriod+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-start" placeholder="'+langSearch.PlaceHolderDateFrom+'"/><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-stop" placeholder="'+langSearch.PlaceHolderDateTo+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-'+this.IdCriteriaGroupe+'-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			var phrase ="" ;
			var data_json = null ;
			
			var id_inputs = this.IdCriteriaGroupe ;
			
			var itc_obj = this.ParentComponent;			
			
			$.ajax({
				url: settings.dates.datesUrl(
					startClassGroup_value,
					ObjectPropertyGroup_value,
					endClassGroup_value,
					phrase
				) ,
				async: false,
				success: function (data){
					data_json = data;
				}
			});			
			
			var options = {
				
				data: data_json,
			
				getValue: function (element) { 
					return datesHandler.elementLabel(element) ;
				},
				 
				list: {
					match: {
						enabled: true
					},

					onChooseEvent: function() {
						
						var values = $('#ecgrw-date-'+id_inputs+'-input').getSelectedItemData();
						var value = datesHandler.elementLabel(values) ;
						var start = datesHandler.elementStart(values) ;
						var stop = datesHandler.elementEnd(values) ;

						$('#ecgrw-date-'+id_inputs+'-input').val(value).trigger("change");
						$('#ecgrw-date-'+id_inputs+'-input-start').val(start).trigger("change");
						$('#ecgrw-date-'+id_inputs+'-input-stop').val(stop).trigger("change");
						
						$('#ecgrw-'+id_inputs+'-input-value').val(value).trigger("change");
					}
				},

				template: {
					type: "custom",
					method: function(value, item) {							
						var label = datesHandler.elementLabel(item) ;
						var start = datesHandler.elementStart(item) ;
						var stop  = datesHandler.elementEnd(item) ;
						return '<div>' + label + ' <span class="start">' + start + '</span><span class="end">' + stop + '</span></div>';
					}
				},

				requestDelay: 400
			};
			
			$('#ecgrw-date-'+id_inputs+'-input').easyAutocomplete(options);
			$('#ecgrw-date-'+this.IdCriteriaGroupe+'-add').on('click', function() {
				$(itc_obj).trigger("change");
			});
		}		
	}
	
	function TimeDatePickerWidget(inputTypeComponent, datesHandler, format) {
		this.base = Widget ;
		this.base() ;
		this.datesHandler = datesHandler;
		this.ParentComponent = inputTypeComponent ;
		this.ParentComponent.statements.TimeDatePickerWidget  = true ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		this.formatDate = format ;
		
		this.html = '<div class="date-widget"><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-start" placeholder="'+langSearch.PlaceHolderDateFrom+'"/><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-stop" placeholder="'+langSearch.PlaceHolderDateTo+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-'+this.IdCriteriaGroupe+'-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			var id_inputs = this.IdCriteriaGroupe ;
			
			var itc_obj = this.ParentComponent;
			if (this.formatDate == 'day') {
				format = 'dd/mm/YYYY' ;
			} else {
				format = 'YYYY' ;
			}
			var options = {
				language: 'fr-FR',
				autoHide: true,
				format: format,
				startView: 2
			};
			
			$$('#ecgrw-date-'+id_inputs+'-input-start, #ecgrw-date-'+id_inputs+'-input-stop').datepicker(options);
			$('#ecgrw-date-'+this.IdCriteriaGroupe+'-add').on('click', function() {
				$(itc_obj).trigger("change");
			});
		}		
	}

	function SearchWidget(inputTypeComponent) {
		this.base = Widget ;
		this.base() ;
		this.ParentComponent = inputTypeComponent ;
		this.ParentComponent.statements.SearchWidget  = true ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		this.html = '<div class="search-widget"><input id="ecgrw-search-'+this.IdCriteriaGroupe+'-input-value" /><button id="ecgrw-search-'+this.IdCriteriaGroupe+'-add" class="button-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		this.init = function init() {
			var id_inputs = this.IdCriteriaGroupe;			
			var itc_obj = this.ParentComponent;			
			var EndClassGroupObject = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup ;
			
			$('#ecgrw-search-'+this.IdCriteriaGroupe+'-add').on(
				'click',
				function() {
					$('#ecgrw-search-'+id_inputs+'-input-value').trigger("change");
					$(itc_obj).trigger("change");
					$(EndClassGroupObject.html).find('.ClassTypeId').hide() ;
				}
			);
		}
	}	
	
	function GenericTools(component) {
		this.component = component ;
		this.component.inserted = false ;
		this.component.reinsert = false ;
		
		this.AppendComponentHtml = function () {
			if (!this.component.inserted ) {
				this.component.html = $(this.component.html).appendTo(this.component.HtmlContainer.html) ;
				this.component.inserted = true;
			}
			if (this.component.reinsert) {
				var instance = this.component.constructor.name ;
				console.log(this.component.HtmlContainer.html.find('*')) ;
				console.log(this.component.html) ;
				this.component.HtmlContainer.html.find('>.'+instance).remove() ;
				this.component.html = $(this.component.html).appendTo(this.component.HtmlContainer.html) ;
			}
		}
		
		this.UpdateStatementsClass = function() {
			for (var item in this.component.statements) {				
				if (this.component.statements[item] === true) {
					$(this.component.html).addClass(item) ;
				} else {
					$(this.component.html).removeClass(item) ;
				}
			}
		}
		
		this.Add = function() {
			this.UpdateStatementsClass() ;
			if (!this.component.inserted) {
				this.AppendComponentHtml() ;
			}

		} 
		this.Replace = function() {
			this.UpdateStatementsClass() ;
			this.component.reinsert = true ;
			this.AppendComponentHtml() ;
		} 
		
		this.Update = function() {
			this.UpdateStatementsClass() ;
		}
		
		this.InitHtml = function() {
			var instance = this.component.constructor.name ;
			var widget = this.component.widgetHtml ;
			this.component.html = $('<div class="'+instance+' ddd"></div>') ; 
			if (widget) {
				this.component.html.append(widget) ; 
			}
		} 

		this.ReInitHtml = function() {
			var instance = this.component.constructor.name ;
			var widget = this.component.widgetHtml ;
			this.component.html = $('<div class="'+instance+' ddd"></div>') ; 
			if (widget) {
				console.log(this) ;
				console.log(widget) ;
				this.component.html.find('>.'+instance ).remove() ;
				this.component.html.append(widget) ; 
			}
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
	
	function ChildrensCriteriaGroup() {
		this.childrensReferences = [];

		this.get = function() {
			return this.contexteReferences ;
		}
		
		this.add = function(children) {
			this.childrensReferences.push(children) ;
		}
	}

	return this ;
}

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
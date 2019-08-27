require("./assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");
var SparqlGenerator = require('sparqljs').Generator;

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

(function( $ ) {
 
    $.fn.Sparnatural = function( options ) {
 
        var specSearch = {} ;
        var langSearch = {} ;
        var specProvider;
		var defaults = {
			config: 'config/spec-search.json',
			language: 'en',
			addDistinct: false,
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
				url : function(domain, property, range, key) {
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
		var WIDGET_AUTOCOMPLETE_PROPERTY 	= 'AutocompleteProperty';
		var WIDGET_SEARCH_PROPERTY 			= 'SearchProperty';
		
		/*Utiliser pour affichage texte avant champ de recherhce mot clés */
		var LABEL_URI = 'http://www.openarchaeo.fr/explorateur/onto#Label';
		
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
				ExecuteSubmited(event.data.formObject) ;
			}) ;
		}
		
		function newQueryJson() {
			return {
				"queryType": "SELECT"+((settings.addDistinct)?' DISTINCT':'')+"",
				"variables": [
					"?this"
				],
				"where": [],
				"type": "query",
				"prefixes": {
					"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
					"xsd": "http://www.w3.org/2001/XMLSchema#"
				}
			}
		}
		
		function initTriple() {			
			return {
					"type": "bgp",
					"triples": []
			} ;
		}

		function initValues() {			
			return {
					"type": "values",
					"values": []
			} ;
		}

		function initFilterTime(StartYear, EndYear, index) {
			return {
				"type": "filter",
				"expression": {
					"type": "operation",
					"operator": "&&",
					"args": [
						{
							"type": "operation",
							"operator": ">",
							"args": [
								""+index+"",
								"\""+StartYear+"-01-01\"^^http://www.w3.org/2001/XMLSchema#date"
							]
						},
						{
							"type": "operation",
							"operator": "<=",
							"args": [
								""+index+"",
								"\""+EndYear+"-12-31\"^^http://www.w3.org/2001/XMLSchema#date"
							]
						}
					]
				}
			} ;
		}

		function initFilterSearch(Texte, index) {			
			return {
				"type": "filter",
				"expression": {
					"type": "operation",
					"operator": "regex",
					"args": [
						
						""+index+"",
						"\""+Texte+"\"",
						"\"i\""
					]
				}
			} ;
		}

		function addTriple(jsonTriples, subjet, predicate, object) {
			
			var triple = {
				"subject": subjet,
				"predicate": predicate,
				"object": object,
			} ;
						
			jsonTriples.triples.push(triple) ;
			
			return jsonTriples ;
		}
		
		function addInWhere(Json, JsonToWhere) {
			Json.where.push(JsonToWhere) ;		
			return Json ;
		}

		function addVariable(jsonValues, name, valueUrl) {			
			$.each(valueUrl, function( index, value ) {
			  var newValue = {
				//[name]: value
			  }
			  newValue[name] = value ;
			  jsonValues.values.push(newValue) ;			  
			});
			
			return jsonValues ;	
		}

		function addVariableDate(json, name, valueUrl) {			
			var newValue = {
				//[name]: valueUrl
			};
			newValue[name] = valueUrl ;
			json.where[1].values.push(newValue) ;		
			
			return json ;	
		}
		
		function ExecuteSubmited(formObject) {
			
			var Json = newQueryJson() ;
			//var levelCriteria = [] ;
			//var levelCursor = 0 ;
			//var ComponentsTree = [] ;
			//var VarsString = [] ;
			
			
			var ArrayLiIndex = [] ;

			var all_complete = true ;
			
			$(formObject._this).find('ul.componentsListe li.groupe').each(function(i) {
				
				var data_id = $(this).attr('data-index') ;

				ArrayLiIndex[data_id] = ArrayLiIndex.length ;
				//console.log(this);
				
				/*if (!$(this).hasClass('completed')) {
					all_complete = false ;
				}*/
				
			}) ;
			
			
			if (!all_complete) {
				return false ;
			}
			
			var have_queriable_criteres = false ;
			
			$(formObject.components).each(function(i) {
					
				var next_loop = false ;
				
				//if(typeof(this.CriteriaGroup.EndClassWidgetGroup.value_selected) == "undefined" || this.CriteriaGroup.EndClassWidgetGroup.value_selected === null) {
				if(this.CriteriaGroup.EndClassWidgetGroup.value_selected.length === 0 ) {
					var WidgetsNeedValueIds = [WIDGET_SEARCH_PROPERTY, WIDGET_TIME_PERIOD_PROPERTY] ;
					if ($.inArray(this.CriteriaGroup.EndClassWidgetGroup.widgetType, WidgetsNeedValueIds) > -1) {
						next_loop = true ;
					}
				}
				
				if (next_loop) {
					return true;
				} else {
					have_queriable_criteres = true ;
				}
				
				var dependantDe = GetDependantCriteria(formObject, this.index ) ;
				var addStartClass = true ;
				var StartVar;
				var EndVar;

				if ((dependantDe != null) && (dependantDe.type == 'parent')){
					StartVar = ArrayLiIndex[dependantDe.element.id] + 1;
					if (StartVar == 0) {
						StartVar = 'this' ;
					} 
					
					EndVar = ArrayLiIndex[this.index] + 1;					
					addStartClass = false ;					
				} else {						
					StartVar = 'this' ;
					EndVar = ArrayLiIndex[this.index] + 1 ;
					/*levelCursor = 0 ;
					levelCriteria[levelCursor] = this.index ;*/
				}
				if ((dependantDe != null) && (dependantDe.type == 'sibling')){
					addStartClass = false ;
				}
				
				
				var start = this.CriteriaGroup.StartClassGroup.value_selected ;
				var obj = this.CriteriaGroup.ObjectPropertyGroup.value_selected ;
				var end = this.CriteriaGroup.EndClassGroup.value_selected ; 
				
				if (start.indexOf("#") > -1) {
					var StartLabel = start.split("#") ;
					StartLabel = StartLabel[1] ;
				} else {
					var StartLabel = start.split("/") ;
					StartLabel = StartLabel[StartLabel.length - 1] ;
				}

				/** A traiter dans les cas ou une recherche est effectuer directement avec un mot clé ou si selecction incomplete **/
				if (end.indexOf("#") > -1) {
					var EndLabel = end.split("#") ;
					EndLabel = EndLabel[1] ;
				} else {
					var EndLabel = end.split("/") ;
					EndLabel = EndLabel[EndLabel.length - 1] ;
				}
				
				if (StartVar != 'this') {
					StartVar = StartLabel+''+StartVar ;
				}

				EndVar = EndLabel+''+EndVar;
				var endValueName = '?'+EndVar ;
				
				var new_triple = initTriple() ;
				if (addStartClass) {
					new_triple = addTriple(new_triple, '?'+StartVar, settings.typePredicate, start) ;
				}
				
				var _WidgetType = this.CriteriaGroup.EndClassWidgetGroup.widgetType ;
				
				if ( VALUE_SELECTION_WIDGETS.indexOf(_WidgetType) !== -1 ) {						
					if (this.CriteriaGroup.EndClassWidgetGroup.value_selected.length == 1) {
						// if we are in a value selection widget and we have a single value selected
						// then insert the value directly as the object of the triple						
						new_triple = addTriple(new_triple, '?'+StartVar, obj, this.CriteriaGroup.EndClassWidgetGroup.value_selected[0]) ;
					} else {
						// otherwise use a variable name as the object of the triple
						new_triple = addTriple(new_triple, '?'+StartVar, obj, endValueName) ;
					}						
				} else {
					new_triple = addTriple(new_triple, '?'+StartVar, obj, endValueName) ;
				}
				
				Json = addInWhere(Json, new_triple) ;
				
				
				//if(typeof(this.CriteriaGroup.EndClassWidgetGroup.value_selected) != "undefined" && this.CriteriaGroup.EndClassWidgetGroup.value_selected !== null) {
				if(this.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 0 ) {
					
					var jsonValue = initValues() ;
					
					switch (_WidgetType) {					
					  case WIDGET_LIST_PROPERTY:
						if (this.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 1) {
							// add values clause if we have more than 1 values
							jsonValue = addVariable(jsonValue, endValueName, this.CriteriaGroup.EndClassWidgetGroup.value_selected)
							Json = addInWhere(Json, jsonValue) ;
						}
						break;
					  case WIDGET_AUTOCOMPLETE_PROPERTY:
						if (this.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 1) {
							// add values clause if we have more than 1 values
							jsonValue = addVariable(jsonValue, endValueName, this.CriteriaGroup.EndClassWidgetGroup.value_selected)
							Json = addInWhere(Json, jsonValue) ;
						}
						break;
					  case WIDGET_TIME_PERIOD_PROPERTY:							
						$.each(this.CriteriaGroup.EndClassWidgetGroup.value_selected, function( index, value ) {
							jsonFilter = initFilterTime(value.start, value.stop, endValueName) ;
							Json = addInWhere(Json, jsonFilter) ;
						});
						break;
					  case WIDGET_SEARCH_PROPERTY:
						var Texte = $('#ecgrw-search-'+ this.index +'-input-value').val() ;
						jsonFilter = initFilterSearch(Texte, endValueName) ;
						Json = addInWhere(Json, jsonFilter) ;
						break;
					  default:						
					}						
				}			
				
			}) ;
					
			if (have_queriable_criteres) {
				var generator = new SparqlGenerator();
				var generatedQuery = generator.stringify(Json);
				// send generated query to callback function
				settings.onQueryUpdated(generatedQuery, Json) ;
			}
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
				var iconPath = specProvider.getIconPath(val) ;
				var highlightedIconPath = specProvider.getHighlightedIconPath(val) ;

				if (!highlightedIconPath || 0 === highlightedIconPath.length) {
					highlightedIconPath = iconPath ;
				}
				
				var image = ' data-icon="' + iconPath + '" data-iconh="' + highlightedIconPath + '"' ;
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
		
		// si il faut desscendre d'un niveau
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
				ExecuteSubmited(formObject) ;
			}
			
			return false ;
		}		
	}

	function eventProxiCriteria(e) {
		var arg1 = e.data.arg1;
		var arg2 = e.data.arg2;
		arg1[arg2]() ;
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
			IsOnEdit : false
		}		
		
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
			this.ObjectPropertyGroup.inputTypeComponent.init() ;
			this.ObjectPropertyGroup.Edit() ;
			
			this.ObjectPropertyGroup.niceslect = $(this.ObjectPropertyGroup.html).find('select.input-val').niceSelect()  ;
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

		$(CriteriaGroupe).on('StartClassGroupSelected', function () {
			$(this.EndClassGroup.html).find('.input-val').unbind('change');
			$(this.EndClassGroup.html).append('<div class="EditComponents ShowOnHover"></div>');
			//this.EndClassGroup.init() ;
			this.EndClassGroup.inputTypeComponent.init() ;
			this.EndClassGroup.Edit() ;
			
			this.EndClassGroup.niceslect = $(this.EndClassGroup.html).find('select.input-val').niceSelect()  ;
			$(this.EndClassGroup.html).find('.nice-select').trigger('click') ;
			
			$(this.EndClassGroup.html).find('select.input-val').on('change', {arg1: this.EndClassGroup, arg2: 'validSelected'}, eventProxiCriteria);		
		}) ;
		
		this.validSelected = function validSelected() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.EndClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update');	
			
			if (specProvider.hasConnectedClasses(this.value_selected)) {
				$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
			} else {
				$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
			}
			$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
		};
		
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
			this.widgetType = this.specProvider.getWidget(this.ParentComponent.ObjectPropertyGroup.value_selected);
		};
		
		this.inputTypeComponent = new ObjectPropertyTypeWidget(this, this.settings, specProvider) ;
		
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			this.EndClassWidgetGroup.detectWidgetType() ;
			this.EndClassWidgetGroup.inputTypeComponent.HtmlContainer.html = $(this.EndClassGroup.html).find('.EditComponents') ;
			this.EndClassWidgetGroup.inputTypeComponent.init() ;

			$(this.EndClassWidgetGroup.inputTypeComponent).on(
				'change',
				{
					arg1: this.EndClassWidgetGroup,
					arg2: 'validSelected'
				},
				eventProxiCriteria
			);
		}) ;
		
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
			
			if ($(this.ParentComponent.html).find('.EndClassWidgetGroup>div').length == 0) {
				$(this.ParentComponent.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetValue"><span class="triangle-h"></span><span class="triangle-b"></span><p>'+this.LabelValueSelected+'</p></div>') ;
			} else {
				$(this.ParentComponent.html).find('.EndClassWidgetGroup >.EndClassWidgetAddOrValue').before('<div class="EndClassWidgetValue"><span class="triangle-h"></span><span class="triangle-b"></span><p>'+this.LabelValueSelected+'</p></div>') ;
			}			
			
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
			this.ActionsGroup.inputTypeComponent.ActionWhere.init() ;
			this.ActionsGroup.inputTypeComponent.ActionAnd.init() ;
			
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
	// var GetDependantCriteria = function (thisForm_, id) {
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

			if (trigger) {
				//console.log(trigger) 
				//$(this.widgetHtml).trigger('change') ;
			}			
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

				if (endClassGroup.value_selected == LABEL_URI) {
					var endLabel = specProvider.getLabel(endClassGroup.value_selected) ;
				} else {
					var endLabel = langSearch.Find+' '+specProvider.getLabel(endClassGroup.value_selected) ;
				}
				var widgetLabel = '<span class="edit-trait first"><span class="edit-trait-top"></span><span class="edit-num">1</span></span>'+ endLabel ;
				
				this.widgetType = this.ParentComponent.widgetType  ;
				this.getWigetTypeClassName() ;
				this.widgetHtml = widgetLabel + this.widgetComponent.html ;
				
			
				this.statements.IsOnEdit = true ;
				this.tools = new GenericTools(this) ;
				this.tools.InitHtml() ;
				this.tools.Add() ;
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
				url: settings.dates.url(
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
		
		function AppendComponentHtml() {
			if (!this.component.inserted ) {
				this.component.html = $(this.component.html).appendTo(this.component.HtmlContainer.html) ;
				this.component.inserted = true;
			}
			
		} this.AppendComponentHtml = AppendComponentHtml ;
		
		function UpdateStatementsClass() {
			for (var item in this.component.statements) {				
				if (this.component.statements[item] === true) {
					$(this.component.html).addClass(item) ;
				} else {
					$(this.component.html).removeClass(item) ;
				}
			}
		} this.UpdateStatementsClass = UpdateStatementsClass ;
		
		function Add() {
			this.UpdateStatementsClass() ;
			if (!this.component.inserted) {
				this.AppendComponentHtml() ;
			}

		} this.Add = Add ;
		
		function Update() {
			this.UpdateStatementsClass() ;
		} this.Update = Update ;
		
		function InitHtml() {
			var instance = this.component.constructor.name ;
			var widget = this.component.widgetHtml ;
			this.component.html = $('<div class="'+instance+' ddd"></div>') ; 
			if (widget) {
				this.component.html.append(widget) ; 
			}
			
			
		} this.InitHtml = InitHtml ;
	}
	
	
	function Context(context) {
		
		this.contexteReference = context;
		this.hasContext = false;
		
		if (context !== null) {
			this.hasContext = true;
		}
		
		function get() {
			return this.contexteReference ;
		}
		this.get = get ;
	}
	
	function ChildrensCriteriaGroup() {
		this.childrensReferences = [];
		
		function get() {
			return this.contexteReferences ;
		}
		this.get = get ;
		
		
		function add(children) {
			this.childrensReferences.push(children) ;
			//console.log(this.childrensReferences ) ;
		}
		this.add = add;
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
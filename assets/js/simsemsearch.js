(function( $ ) {
 
    $.fn.SimSemSearchForm = function( options ) {
 
        var specSearch = {} ;
        var langSearch = {} ;
		var defaults = {
			pathSpecSearch: 'config/spec-search.json',
			pathLanguages: 'config/lang/',
			language: 'en',
			addDistinct: false,
			maxDepth: 3,
			maxOr: 3,
			autocompleteUrl : function(domain, property, range, key) {
					console.log("Veuillez préciser le nom de la fonction pour l'option autocompleteUrl dans les parametre d'initalisation de SimSemSearchForm. La liste des parametres envoyées a votre fonction est la suivante : domain, property, range, key" ) ;
			},
			listUrl : function(domain, property, range) {
					console.log("Veuillez préciser le nom de la fonction pour l'option listUrl dans les parametre d'initalisation de SimSemSearchForm. La liste des parametres envoyées a votre fonction est la suivante : domain, property, range" ) ;
			},
			datesUrl : function(domain, property, range, key) {
					console.log("Veuillez préciser le nom de la fonction pour l'option datesUrl dans les parametre d'initalisation de SimSemSearchForm. La liste des parametres envoyées a votre fonction est la suivante : domain, property, range, key" ) ;
			},
			onQueryUpdated : function (queryString, queryJson) {
				console.log("Veuillez préciser le nom de la fonction pour l'option onQueryUpdated dans les parametre d'initalisation de SimSemSearchForm. Les parêtres envoyés à la fonction contiendront la requête convertie en Sparql et le Json servant à générer la requête" ) ;
			}
		};
		
		const TYPE_WIDGET_LIST_URI = 'http://ontologies.sparna.fr/SimSemSearch#ListWidget';
		const TYPE_WIDGET_TIME_URI = 'http://ontologies.sparna.fr/SimSemSearch#TimeWidget';
		const TYPE_WIDGET_AUTOCOMPLETE_URI = 'http://ontologies.sparna.fr/SimSemSearch#AutocompleteWidget';
		const TYPE_WIDGET_SEARCH_URI = 'http://ontologies.sparna.fr/SimSemSearch#SearchWidget';
		
		/*Utiliser pour affichage texte avans champ de recherhce mot clés */
		const LABEL_URI = 'http://www.openarchaeo.fr/explorateur/onto#Label';
		
		
		var settings = $.extend( {}, defaults, options );
		
		function gatLabel(graphItemID) {
			var label = ''; 
			$.each( graphItemID['label'], function( key, val ) {
				if ( val['@language'] == settings.language) {
					label = val['@value'] ;
				}
			}) ;
			
			return label ;
			
		}
		
		this.each(function() {
            var thisForm = {} ;
            thisForm._this = $(this) ;
			$(this).addClass('SimSemSearch') ;
			
			thisForm.components = [] ;
			
			$.when( loadSpecSearch() && loadLangSearch() ).done(function() {
					initForm(thisForm) ;
				 });
        });
		
		function loadSpecSearch() {
			
			return $.getJSON( settings.pathSpecSearch, function( data ) {
				specSearch = data ;
			}).fail(function(response) {
				console.log("SimSemSearch - unable to load config file : " +settings.pathSpecSearch);
				console.log(response);
			}) ;
		}
		function loadLangSearch() {
			var fileName = settings.language+'.json' ;
			return $.getJSON( settings.pathLanguages+ fileName, function( data ) {
				langSearch = data ;
			}).fail(function(response) {
				console.log("SimSemSearch - unable to load lang file : " +settings.pathLanguages+ fileName);
				console.log(response);
			}) ;
		}
		
		function initForm(thisForm_) {
			
			var contexte = $('<div class="bg-wrapper"><ul class="componentsListe"></ul></div>');
			//contexte.appendTo(thisForm_._this) ;
			$(thisForm_._this).append(contexte) ;
			
			contexte1 = addComponent(thisForm_, contexte.find('ul')) ;
			
			$(thisForm_._this).find('.nice-select').trigger('click') ;
			
			intiGeneralEvent(thisForm_) ;
			
			$(thisForm_._this).on('submit', { formObject : thisForm_ }, function (event) {
				
				event.preventDefault();
				
				ExecuteSubmited(event.data.formObject) ;
				
			}) ;

		}
		
		function newQueryJson() {
			var ifDistinct = '' ;
			if (settings.addDistinct) {
				ifDistinct = ' DISTINCT' ;
			}
			return {
				"queryType": "SELECT"+ifDistinct+"",
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
								"\""+StartYear+"-01-01\"^^http://www.w3.org/2001/XMLSchema#dateTime"
							]
						},
						{
							"type": "operation",
							"operator": "<=",
							"args": [
								""+index+"",
								"\""+EndYear+"-12-31\"^^http://www.w3.org/2001/XMLSchema#dateTime"
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
			  //alert( index + ": " + value );
			  var newValue = {
							[name]: value
						}
				jsonValues.values.push(newValue) ;		
			  
			});
			
			return jsonValues ;	
		}
		function addVariableDate(json, name, valueUrl) {
			
			var newValue = {
							[name]: valueUrl
						}
				json.where[1].values.push(newValue) ;		
			
			return json ;	
		}
		
		function ExecuteSubmited(formObject) {
			
			//console.log(formObject) ;
			
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
					
						var WidgetsNeedValueIds = [TYPE_WIDGET_SEARCH_URI, TYPE_WIDGET_TIME_URI] ;
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

					EndVar = EndLabel+''+EndVar ;

					
					
					/*if (levelCursor == 0) {
						var varSuffixe = 'this' ;
						var varSuffixeEnd = 'end'+this.index ;
					} else {
						if (levelCursor-1 == -20) {
							var varSuffixe = '';
							var varSuffixeEnd = this.index ;
						} else {
							var varSuffixe = 'end'+levelCriteria[levelCursor-1] ;
							var varSuffixeEnd = 'end'+this.index ;
						}
						
					}*/

					//this.CriteriaGroup.StartClassGroup.value_selected
					
					
					//console.log(end) ;
					var endValueName = '?'+EndVar ;
					
					var new_triple = initTriple() ;
					if (addStartClass) {
						new_triple = addTriple(new_triple, '?'+StartVar, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", start) ;
					}
					
					new_triple = addTriple(new_triple, '?'+StartVar, obj, endValueName) ;
					
					
					
					
					_WidgetType = this.CriteriaGroup.EndClassWidgetGroup.widgetType ;
					
					
					
					
					
					if ( (_WidgetType == TYPE_WIDGET_TIME_URI ) || (_WidgetType == TYPE_WIDGET_SEARCH_URI ) ) {
						
						
						
					} else {
						
						
					}
					
					//if(typeof(this.CriteriaGroup.EndClassWidgetGroup.value_selected) != "undefined" && this.CriteriaGroup.EndClassWidgetGroup.value_selected !== null) {
					if(this.CriteriaGroup.EndClassWidgetGroup.value_selected.length !== 0 ) {
						
					} else {
						new_triple = addTriple(new_triple, endValueName, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", end) ;
					}
					
					Json = addInWhere(Json, new_triple) ;
					
					
					//if(typeof(this.CriteriaGroup.EndClassWidgetGroup.value_selected) != "undefined" && this.CriteriaGroup.EndClassWidgetGroup.value_selected !== null) {
					if(this.CriteriaGroup.EndClassWidgetGroup.value_selected.length > 0 ) {
						
						var jsonValue = initValues() ;
						
						switch (_WidgetType) {
						
						 case TYPE_WIDGET_LIST_URI:
						  //var id_input = '#ecgrw-'+ this.index +'-input-value' ;
							//value_widget = $(id_input).val() ;
							
							jsonValue = addVariable(jsonValue, endValueName, this.CriteriaGroup.EndClassWidgetGroup.value_selected)
						
							Json = addInWhere(Json, jsonValue) ;
							
							
							break;
						  case TYPE_WIDGET_AUTOCOMPLETE_URI:
							//var id_input = '#ecgrw-'+ this.index +'-input-value' ;
							//value_widget = $(id_input).val() ;
							
							jsonValue = addVariable(jsonValue, endValueName, this.CriteriaGroup.EndClassWidgetGroup.value_selected)
						
							Json = addInWhere(Json, jsonValue) ;
							
							break;
						  case TYPE_WIDGET_TIME_URI:
							//console.log('Mangoes and papayas are $2.79 a pound.');
							
							//var StartYear = $('#ecgrw-date-'+ this.index +'-input-start').val() ;
							//var EndYear = $('#ecgrw-date-'+ this.index +'-input-stop').val() ;
							//value_widget = $(id_input).val() ;
							
							
							$.each(this.CriteriaGroup.EndClassWidgetGroup.value_selected, function( index, value ) {
							  //alert( index + ": " + value );
							



								jsonFilter = initFilterTime(value.start, value.stop, endValueName) ;
							
							
								//jsonFilter = initFilterSearch(Texte, endValueName) ;
							
								Json = addInWhere(Json, jsonFilter) ;
							  
							});
			
			
			
							
							
							// expected output: "Mangoes and papayas are $2.79 a pound."
							break;
						  case TYPE_WIDGET_SEARCH_URI:
							//console.log('Mangoes and papayas are $2.79 a pound.');
							var Texte = $('#ecgrw-search-'+ this.index +'-input-value').val() ;
							jsonFilter = initFilterSearch(Texte, endValueName) ;
							
							Json = addInWhere(Json, jsonFilter) ;
							
							// expected output: "Mangoes and papayas are $2.79 a pound."
							break;
						  default:
						
						
						}
						
					} else {
						
						
					}



					//console.log(value_widget)
					/*if ($('.EndClassWidgetGroup>div').hasClass('ListeWidget')) {
						json = addVariable(json, endValueName, $('.EndClassWidgetGroup #listwidget').val() ) ;
					} else {
						json = addVariable(json, endValueName, $('.EndClassWidgetGroup #basics-value').val() ) ;
					}*/
					
					
					
					
					
				}) ;
				
			console.log(Json) ;
					
			if (have_queriable_criteres) {
					//var SparqlGenerator = require('sparqljs').Generator;
				var generator = new Ngenerator();
				//parsedQuery.variables = ['?mickey'];
				var generatedQuery = generator.stringify(Json);
						
						
				//console.log(generatedQuery) ;
						
						
				//$('#sparql code').html(generatedQuery.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
				//var jsons = JSON.stringify(Json, null, '\t');
				//$('#json code').html(jsons) ;
				
				settings.onQueryUpdated(generatedQuery, Json) ;
			}
		}
		
		function intiGeneralEvent(thisForm_) {
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
				cssdef += ', rgba(250,136,3,'+a+') '+prev+'px, rgba(250,136,3,'+a+') '+(prev+height)+'px' ;
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
			//console.log(cssdef) ;
			thisForm_._this.find('div.bg-wrapper').css({background : cssdef+')' }) ;
		}
	
		/*  Find Class by ID
			@Id of Class
			return object of @type Class in specSearch 
		*/
		function getClassById(ClassId) {
			var classObject = null ;
			$.each( specSearch['@graph'], function( key, val ) {
				if ( val['@type'] == 'Class') {
					if ( val['@id'] == ClassId) {
							classObject = val ;
					}
				}
			}) ;
			return classObject ;
		}
		function getClassLabel(ClassId) {
			var classLabel = null ;
			var classObject = getClassById(ClassId) ;
			if (classObject !== null) {
				$.each( classObject['label'], function( key, val ) {
					if (val['@language'] == settings.language ) {
						classLabel = val['@value'] ;
					}
				});
			}
			return classLabel ;
		}
	
		/*  Find Class by ID
			@Id of Class
			return object of @type Class in specSearch 
		*/
		function getObjectPropertyById(ObjectPropertyId) {
			var ObjectPropertyObject = null ;
			$.each( specSearch['@graph'], function( key, val ) {
				if ( val['@type'] == 'ObjectProperty') {
					if ( val['@id'] == ObjectPropertyId) {
							ObjectPropertyObject = val ;
					}
				}
			}) ;
			return ObjectPropertyObject ;
		}
		function getObjectPropertyLabel(ObjectPropertyId) {
			var ObjectPropertyLabel = null ;
			var classObject = getObjectPropertyById(ClassId) ;
			if (classObject !== null) {
				$.each( classObject['label'], function( key, val ) {
					if (val['@language'] == settings.language ) {
						ObjectPropertyLabel = val['@value'] ;
					}
				});
			}
			return ObjectPropertyLabel ;
		}
		
		
		function getClassListSelectFor(classId, inputID, default_value) {
			var list = [] ;
			var items = getAllClassFor(classId) ;
			$.each( items, function( key, val ) {
				var label = getClassLabel(val['@id']) ;
				if (!val['highlightedIconPath'] || 0 === val['highlightedIconPath'].length) {
					val['highlightedIconPath'] = val['iconPath'] ;
				}
				
				var image = ' data-icon="'+val['iconPath']+'" data-iconh="'+val['highlightedIconPath']+'"' ;
				var selected ='';
				if (default_value == val['@id']) {
					selected = 'selected="selected"' ;
				}
				list.push( '<option value="'+val['@id']+'" data-id="'+val['@id']+'"'+image+selected+'>'+ label + '</option>' );

			}) ;
			var html_list = $( "<select/>", {
				"class": "my-new-list input-val",
				"id": 'select-'+inputID,
				html: list.join( "" )
			  });
			return html_list ;
		}
		
		function ClassHaveRange(ClassID) {
			//console.log(getAllClassFor(ClassID)) ;
			if (getAllClassFor(ClassID).length > 0 ) {
				return true;
			} else {
				return false ;
			}
			
		}
		
		function getObjectListSelectFor(domainClassID, rangeClassID, inputID, default_value) {
			var list = [] ;
			var items = getAllObjectPropertyFor(domainClassID,rangeClassID) ;
			$.each( items, function( key, val ) {
				var label = gatLabel(val) ;
				var selected ='';
				if (default_value == val['@id']) {
					selected = 'selected="selected"' ;
				}
				list.push( '<option value="'+val['@id']+'" data-id="'+val['@id']+'"'+selected+'>'+ label + '</option>' );

			}) ;
			var html_list = $( "<select/>", {
				"class": "select-list input-val",
				"id": inputID,
				html: list.join( "" )
			  });
			return html_list ;
		}
		
		
		/*  Find if Class is in objectProperty domain list
			@Id of objectProperty where search
			@Id of Class we will retrive
			return true if  we find the class or false
		*/
		function classIsInDomain(ObjectPropertyId, ClassId) {
			var classIsDomain = false ;
			$.each( specSearch['@graph'], function( key, val ) {
				if ( ( val['@type'] == 'ObjectProperty') &&  (val['@id'] == ObjectPropertyId) ){
					//console.log(val) ;
					if ($.type(val['domain']) === "object") {
						$.each( val['domain']['unionOf']['@list'], function( domkey, domval ) {
							if (domval['@id'] == ClassId ) {
								classIsDomain = true
							}
						}) ;
					} else {
						if (val['domain'] == ClassId ) {
							classIsDomain = true ;
						}
					}
				}
			});
			return classIsDomain;
		}
		/* List of possible Class relative to a Class
			@Id of Class or null if is the first list selection
			return array of @type Class in specSearch 
		*/
		function getAllClassFor(ClassID) {
			var items = [];
			$searchKey = 'range' ;
			if (ClassID === null) {
				$searchKey = 'domain' ;
			}
			//console.log(ClassID) ;
			$.each( specSearch['@graph'], function( key, val ) {
				if ( val['@type'] == 'ObjectProperty') {
					if ($.type(val[$searchKey]) === "object") {
						$.each( val[$searchKey]['unionOf']['@list'], function( domkey, domval ) {
							if (ClassID === null) {
								var item = getClassById(domval['@id']) ;
								items = pushIfNotInArray(item, items);
							} else {
								if (classIsInDomain(val['@id'], ClassID)) {
									var item = getClassById(domval['@id']) ;
									items = pushIfNotInArray(item, items);
								}
							}
						}) ;
					} else {						
						if (ClassID === null) {
								var item = getClassById(val[$searchKey]) ;
								items = pushIfNotInArray(item, items);
						} else {
							//console.log(val['@id']) ;
							if (classIsInDomain(val['@id'], ClassID)) {
								var item = getClassById(val[$searchKey]) ;
								items = pushIfNotInArray(item, items);
							}
						}
					}
				}
			});
			return items ;
		}
		/* List of possible ObjectProperty relative to a Class
			@Id of Class
			return array of @type ObjectProperty in specSearch 
		*/
		function getAllObjectPropertyFor(domainClassID, rangeClassID) {
			var items = [];
			$.each( specSearch['@graph'], function( key, val ) {
				if (domainClassID !== null) {
					var haveDomain = objectPropertyhaveClassLink(val, 'domain' , domainClassID) ;
				} else {
					var haveDomain = true ;
				}
				if (rangeClassID !== null) {
					var haveRange = objectPropertyhaveClassLink(val, 'range', rangeClassID) ;
				} else {
					var haveRange = true ;
				}
				
				
				if ( haveDomain && haveRange) {
					items = pushIfNotInArray(val, items);
				}
			});
			return items ;
		}
		
		function objectPropertyhaveClassLink(graphItem, type, ClassID) {
			var ifHave = false ;
			if ( graphItem['@type'] == 'ObjectProperty') {
					
					
				if ($.type(graphItem[type]) === "object") {
					$.each( graphItem[type]['unionOf']['@list'], function( domkey, domval ) {
						if (domval['@id'] == ClassID ) {
								ifHave = true ;
						}
					}) ;
				} else {
					if (graphItem[type] == ClassID ) {
						ifHave = true ;
					}
				}
			}
			return ifHave ;
		}
		
		function pushIfNotInArray(item, items) {

			if ($.inArray(item, items) < 0) {
				items.push(item) ;
				
			}
			return items ;
			
		}
		
		function addComponent(thisForm_, contexte) {
			
			//console.log(thisForm_.components) ;
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
			
			
			//contexte.html('span') ;
			//gabari = '<div></div>' ;
			//$(contexte).append(gabari) ;
			
			//return $(contexte).find('li[data-index='+new_index+']') ;
			
			
			var UnCritere = new CriteriaGroup({ AncestorHtmlContext: contexte, HtmlContext : gabari, FormContext: thisForm_, ContextComponentIndex: new_index }) ;
			
			
			thisForm_.components.push({index: new_index, CriteriaGroup: UnCritere }) ;
			
			
			
			intiGeneralEvent(thisForm_);
			
			return $(gabari) ;
		}

		function GetOffSet( elem, elemParent ) {
			return elem.offset().left - $(elemParent).offset().left ;
		}

	
	function CriteriaGroup(context) {
		this._this = this ;
		this.thisForm_ = context.FormContext ;
		this.ParentComponent = context.FormContext  ;
		this.ComponentHtml = context.HtmlContext ;
		this.AncestorComponentHtml = context.AncestorHtmlContext ;
		
		
		this.statements = {
			HasAllComplete : false,
			IsOnEdit : false
		}
		this.id =  context.ContextComponentIndex ;
		this.html = $('<div id="CriteriaGroup-'+this.id+'" class="CriteriaGroup"></div>').appendTo(this.ComponentHtml) ;
		
		this.Context = new Context(context) ;
		this.ChildrensCriteriaGroup = new ChildrensCriteriaGroup ;
		
		this.StartClassGroup = new StartClassGroup(this) ;
		
		this.ObjectPropertyGroup = new ObjectPropertyGroup(this) ;
		
		//EndClassGroup.prototype = new GroupContenaire;
		this.EndClassGroup = new EndClassGroup(this) ;
		this.EndClassWidgetGroup = new EndClassWidgetGroup(this) ;
		this.ActionsGroup = new ActionsGroup(this) ;
		//
		
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
				
				
				intiGeneralEvent(formObject) ;
				ExecuteSubmited(formObject) ;
			}
			
			return false ;
		}
		
	}
	function eventProxiCriteria(e) {
		
		var arg1 = e.data.arg1;
		var arg2 = e.data.arg2;
		//console.log(arg1) ;
		//$('.nice-select').removeClass('open') ;
		arg1[arg2]() ;
	}
	
	var GroupContenaire = function () {
		this.ParentComponent = null ;
		this.GroupType = null ;
		this.hasSubvalues = false ;
		this.InputTypeComponent = null ;
		this.tools = null ;
		this.widgetHtml = false ;
		this.html = $() ;
		this.statements = {
			HasInputsCompleted : false,
			IsOnEdit : false
		}
		
		
		//this.tools = new GenericTools(this) ;
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
		
		function Edit() {
			this.InputTypeComponent.statements.IsOnEdit = true;
			
			
			
			
			/*this.InputTypeComponent.UpdateStatementsClass() ;
			this.InputTypeComponent.AppendInputHtml() ;*/
			
		} this.Edit = Edit ;
		
		
		
	} 
	
	
	var StartClassGroup = function (CriteriaGroupe) {
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'StartClassGroup' ;
		//console.log(this) ;
		this.statements.StartClassGroup = true ;
		this.statements.Created = false ;
		//console.log('befor created') ;
		
		//ClassTypeId.prototype = new InputTypeComponent();      // child class inherits from Parent
		//ClassTypeId.prototype.constructor = ClassTypeId; // constructor alignment
		this.InputTypeComponent = new ClassTypeId(this) ;
		
		$(CriteriaGroupe).on('Created', function () {
			//console.log('after created') ;
			$(this.StartClassGroup.html).find('.input-val').unbind('change');
			//this.StartClassGroup.init() ;
			this.StartClassGroup.InputTypeComponent.init() ;
			this.StartClassGroup.Edit() ;
			var select = $(this.StartClassGroup.html).find('.input-val')
			//console.log(selet) ;

			//$(this.html).find('.input-val').change($.proxy(this.initEnd() , null)); 
			this.StartClassGroup.niceslect = $(select).niceSelect() ;
			
			
			$(this.StartClassGroup.html).find('select.input-val').on('change', {arg1: this.StartClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			if ($(this.Context.get().AncestorHtmlContext).is('li')) {
				var ancestorID = parseInt( $(this.Context.get().AncestorHtmlContext).attr('data-index') )  ;
				
				
			}
		}) ;
		function validSelected() {
			//this.niceslect.niceSelect('update') ;
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			//$(this.html).find('.input-val').attr('disabled', 'disabled');
			$(this.ParentComponent).trigger( {type:"StartClassGroupSelected" } ) ;
			
			
		} this.validSelected = validSelected ;
		
		this.init() ;
		
		
	} //StartClassGroup.prototype = new GroupContenaire;
	
	
	
	var ObjectPropertyGroup = function (CriteriaGroupe1) {
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe1 ;
		this.GroupType = 'ObjectPropertyGroup' ;
		this.statements.ObjectPropertyGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		this.InputTypeComponent = new ObjectPropertyTypeId(this) ;
		
		$(CriteriaGroupe1).on('EndClassGroupSelected', function () {
			
			$(this.ObjectPropertyGroup.html).find('.input-val').unbind('change');
			//this.ObjectPropertyGroup.init() ;
			this.ObjectPropertyGroup.InputTypeComponent.init() ;
			this.ObjectPropertyGroup.Edit() ;
			
			//console.log(this.ParentComponent) ;
			this.ObjectPropertyGroup.niceslect = $(this.ObjectPropertyGroup.html).find('select.input-val').niceSelect()  ;
			//$('.nice-select').removeClass('open') ;
			$(this.ObjectPropertyGroup.html).find('.nice-select').trigger('click') ;
			$(this.ObjectPropertyGroup.html).find('select.input-val').on('change', {arg1: this.ObjectPropertyGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			//console.log(this.ObjectPropertyGroup.html);
			if ($(this.ObjectPropertyGroup.html).find('select.input-val').find('option').length == 1) {
				$(this.ObjectPropertyGroup.html).find('.nice-select').trigger('click') ;
			}
			
			
			//console.log('Edit endClassGroup is on ! ') ;
		}) ;
			
		function validSelected() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.ObjectPropertyGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			 
			$(this.ParentComponent).trigger( {type:"ObjectPropertyGroupSelected" } ) ;
			
			
			var objSpec = getObjectPropertyById(this.value_selected) ;
			
			
			if ( (objSpec.widget["@type"] == TYPE_WIDGET_SEARCH_URI )  || (objSpec.widget["@type"] == TYPE_WIDGET_TIME_URI ) ) {
				
			} else {
				
			}
			
			$(this.ParentComponent.thisForm_._this).trigger( {type:"submit" } ) ;
			
			
		} this.validSelected = validSelected ;
			
		this.init() ;
		
	} //ObjectPropertyGroup.prototype = new GroupContenaire;
	
	
	
	var EndClassGroup = function EndClassGroup(CriteriaGroupe) {
		//GroupContenaire.call(this) ;
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'EndClassGroup' ;
		this.statements.EndClassGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		this.InputTypeComponent = new ClassTypeId(this) ;
		$(CriteriaGroupe).on('StartClassGroupSelected', function () {
			$(this.EndClassGroup.html).find('.input-val').unbind('change');
			$(this.EndClassGroup.html).append('<div class="EditComponents ShowOnHover"></div>');
			//this.EndClassGroup.init() ;
			this.EndClassGroup.InputTypeComponent.init() ;
			this.EndClassGroup.Edit() ;
			
			this.EndClassGroup.niceslect = $(this.EndClassGroup.html).find('select.input-val').niceSelect()  ;
			$(this.EndClassGroup.html).find('.nice-select').trigger('click') ;
			
			$(this.EndClassGroup.html).find('select.input-val').on('change', {arg1: this.EndClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
		}) ;
		
		function validSelected() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			
			$(this.ParentComponent.EndClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update');
			
			
			if (ClassHaveRange(this.value_selected)) {
				$(this.ParentComponent.html).parent('li').removeClass('WhereImpossible') ;
			} else {
				$(this.ParentComponent.html).parent('li').addClass('WhereImpossible') ;
			}
			$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
			
			
		} this.validSelected = validSelected ;
		
		this.init() ;
		
	} ;// EndClassGroup.prototype = GroupContenaire.prototype;
	
	
	var EndClassWidgetGroup = function (CriteriaGroupe) {
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'EndClassWidgetGroup' ;
		this.statements.EndClassWidgetGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		this.value_selected = [] ;
		
		 this.detectWidgetType = function () {
			
			this.objectPropertyDefinition = getObjectPropertyById(this.ParentComponent.ObjectPropertyGroup.value_selected) ;
			
			this.widgetType = this.objectPropertyDefinition.widget['@type'] ;
			
			
		}  ;
		
		this.InputTypeComponent = new ObjectPropertyTypeWidget(this) ;
		
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			//console.log(this.StartClassGroup) ;
			// ;
			//console.log('Init  EndClassWidgetGroup -----------------------------------------------------------------------------------------------') ;
			this.EndClassWidgetGroup.detectWidgetType() ;
			this.EndClassWidgetGroup.InputTypeComponent.HtmlContainer.html = $(this.EndClassGroup.html).find('.EditComponents') ;
			this.EndClassWidgetGroup.InputTypeComponent.init() ;
			
			//console.log(this.EndClassWidgetGroup.InputTypeComponent) ;
			$(this.EndClassWidgetGroup.InputTypeComponent).on('change', {arg1: this.EndClassWidgetGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
			//console.log('Edit endClassWidgetGroup is on ! ') ;
		}) ;
		
		function validSelected() {
			var temp_value = this.InputTypeComponent.GetValue() ;
			if (temp_value == null ) {
				return false ;
			}
			if (this.value_selected.length > 0) {

				
				if (Object.onArray(this.value_selected, temp_value) == true) {
					return false ;
				}
			}
			
			this.value_selected.push(this.InputTypeComponent.GetValue()) ;
			this.LabelValueSelected = this.InputTypeComponent.GetValueLabel() ;
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
			
			
			if ( (this.InputTypeComponent.widgetType == TYPE_WIDGET_LIST_URI )  || (this.InputTypeComponent.widgetType == TYPE_WIDGET_AUTOCOMPLETE_URI ) ) {

			
				if ($(this.ParentComponent.html).find('.EndClassWidgetGroup>div').length == 1) {
					$(this.ParentComponent.html).find('.EndClassWidgetGroup').append('<div class="EndClassWidgetAddOrValue"><span class="triangle-h"></span><span class="triangle-b"></span><p><span>+</span></p></div>') ;
					$(this.ParentComponent.html).find('.EndClassWidgetGroup>.EndClassWidgetAddOrValue').on('click', {arg1: this, arg2: 'needAddOrValue'}, eventProxiCriteria);
				}
			}
			//Plus d'ajjout possible si nombre de valeur suppérieur à l'option maxOr
			if (this.value_selected.length == settings.maxOr) {
				$(this.ParentComponent.html).find('.EndClassWidgetGroup .EndClassWidgetAddOrValue').hide() ;
			}
			
			$(this.ParentComponent.html).find('.EndClassGroup>.EditComponents').removeClass('newOr') ;
			
			
			intiGeneralEvent(this.ParentComponent.thisForm_);
			
		} this.validSelected = validSelected ;
		
		function needAddOrValue() {
			$(this.ParentComponent.html).find('.EndClassGroup>.EditComponents').addClass('newOr') ;
			
		} this.needAddOrValue = needAddOrValue ;
		
		this.init() ;
		
	} //EndClassWidgetGroup.prototype = new GroupContenaire;
	
	
	function ActionsGroup(CriteriaGroupe) {
		this.base = GroupContenaire ;
		this.base() ;
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'ActionsGroup' ;
		this.statements.ActionsGroup = true ;
		this.statements.Created = false ;
		this.hasSubvalues = true ;
		
		function detectWidgetType() {
			
			this.widgetType = 'Actions' ;
			
		} this.detectWidgetType = detectWidgetType ;
		
		this.InputTypeComponent = { ActionWhere: new ActionWhere(this), ActionAnd: new ActionAnd(this), ActionRemove: new ActionRemove(this) } ;
		
		$(CriteriaGroupe).on('Created', function () {
			//console.log(this.StartClassGroup) ;
			// ;
			this.ActionsGroup.detectWidgetType() ;
			this.ActionsGroup.InputTypeComponent.ActionRemove.init() ;
			
			$(this.ActionsGroup.InputTypeComponent.ActionRemove.html).find('a').on('click', {arg1: this, arg2: 'RemoveCriteria'}, eventProxiCriteria);
			
			//console.log('Edit ActionRemove is on ! ') ;
		}) ;
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			//console.log(this.StartClassGroup) ;
			// ;
			this.ActionsGroup.detectWidgetType() ;
			
			//console.log($(this.EndClassGroup) ) 
			this.ActionsGroup.InputTypeComponent.ActionWhere.HtmlContainer.html = $(this.EndClassGroup.html).find('.EditComponents') ;
			this.ActionsGroup.InputTypeComponent.ActionWhere.init() ;
			this.ActionsGroup.InputTypeComponent.ActionAnd.init() ;
			
			$(this.ActionsGroup.InputTypeComponent.ActionWhere.html).find('a').on('click', {arg1: this.ActionsGroup, arg2: 'AddWhere'}, eventProxiCriteria);
			$(this.ActionsGroup.InputTypeComponent.ActionAnd.html).find('a').on('click', {arg1: this.ActionsGroup, arg2: 'AddAnd'}, eventProxiCriteria);
			
			intiGeneralEvent(this.thisForm_);
			//console.log('Edit ActionWhere et ActionAnd is on ! ') ;
		}) ;
		
		this.AddWhere = function () {
			
			this.ParentComponent.html.parent('li').addClass('haveWhereChild') ;
			this.ParentComponent.initCompleted() ;
			
			var new_component = addComponent(this.ParentComponent.thisForm_, this.ParentComponent.Context.contexteReference.HtmlContext) ;
			
			$(new_component).find('.nice-select').trigger('click') ;
			$(new_component).find('.nice-select').trigger('click') ;
			
			//$(new_component).find('.nice-select').trigger('change') ;
			//new_component.appendTo(this.ParentComponent.Context.HtmlContext) ;
			
			//this.value_selected = $(this.html).find('.input-val').val() ;
			//$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			//$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
			
			//return false ;
			
			
			
		}
		this.AddAnd = function () {
			
			//this.ParentComponent.initCompleted() ;
			
			
			var new_component = addComponent(this.ParentComponent.thisForm_, this.ParentComponent.Context.contexteReference.AncestorHtmlContext) ;
			
			$(new_component).find('.nice-select').trigger('click') ;
			$(new_component).find('.nice-select').trigger('click') ;
			//this.value_selected = $(this.html).find('.input-val').val() ;
			//$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			//$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
			
			return false ;
			
		}
		function validSelected() {
			//this.value_selected = $(this.html).find('.input-val').val() ;
			//$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			//$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
			
		} this.validSelected = validSelected ;
		
		this.init() ;
		
	} //ActionsGroup.prototype = new GroupContenaire;
	
	var GetDependantCriteria = function (thisForm_, id) {
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
				
			} else {
				
			}
		}
		$(thisForm_.components).each(function(index) {
			
			if (this.index == dep_id) {
				dependant.element = this.CriteriaGroup ;
			}
			
		}) ;
		return dependant ;
		
	}
	
	var InputTypeComponent = function () {
		
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
				
				possible_values = getClassListSelectFor(null, 'a-'+id, default_value) ;
				
			} 
			
			if (this.ParentComponent instanceof EndClassGroup) {
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				possible_values = getClassListSelectFor(startClassGroup.value_selected, 'b-'+id) ;
			}
			
			if (this.ParentComponent instanceof ObjectPropertyGroup) {
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
				possible_values = getObjectListSelectFor(startClassGroup.value_selected, endClassGroup.value_selected, 'c-'+id) ;
			}
			
			if (this.ParentComponent instanceof ActionsGroup) {
				
				if (this instanceof ActionWhere) {
					var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
					var endLabel = getClassLabel(endClassGroup.value_selected) ;
					var widgetLabel = '<span class="edit-trait"><span class="edit-num">2</span></span>'+langSearch.Search+' '+ endLabel + ' '+langSearch.That+'...' ;
					
					
					possible_values = widgetLabel+'<a>+</a>' ;
				}
				if (this instanceof ActionAnd) {
					possible_values = '<span class="trait-and-bottom"></span><a>'+langSearch.And+'</a>' ;
				}
				if (this instanceof ActionRemove) {
					possible_values = '<a><img src="assets/icons/buttons/remove.png"></a>' ;
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
			
		}  ;
		
	} ;
	
	
	function ActionWhere(GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base() ;
		this.ParentComponent = GroupContenaire ;
		this.statements.ActionWhere = true ;
		this.statements.ShowOnHover = true ;
		this.statements.Created = false ;
		this.HtmlContainer = {} ;
		
		
		
		
		//this.widgetHtml = 'hohohoh' ;
		//this.html = '<div class="ClassTypeId"></div>' ;
		
	} //ActionWhere.prototype = new InputTypeComponent;
	
	
	function ActionAnd(GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base() ;
		this.ParentComponent = GroupContenaire ;
		this.statements.ActionAnd = true ;
		this.statements.ShowOnHover = true ;
		this.statements.Created = false ;
		this.HtmlContainer = this.ParentComponent ;
		
		
		//this.widgetHtml = 'hohohoh' ;
		//this.html = '<div class="ClassTypeId"></div>' ;
		
	} //ActionAnd.prototype = new InputTypeComponent;
	
	
	function ActionRemove(GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base() ;
		this.ParentComponent = GroupContenaire ;
		this.statements.ActionRemove = true ;
		this.statements.Created = false ;
		this.HtmlContainer = this.ParentComponent ;
		
		
		
		//this.widgetHtml = 'hohohoh' ;
		//this.html = '<div class="ClassTypeId"></div>' ;
		
	} //ActionRemove.prototype = new InputTypeComponent;
	
	var ClassTypeId = function (GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base() ;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.statements.Highlited = true ;
		this.statements.Created = false ;
		
		
		
		
		
		//this.widgetHtml = 'hohohoh' ;
		//this.html = '<div class="ClassTypeId"></div>' ;
		
	} ; //ClassTypeId.prototype = new InputTypeComponent;




	function ClassTypeId2(GroupContenaire) {
		console.log('new classTypeId2--------------------------------------------------------------------------------------------------------------------------------------') ;
		
		this.base = InputTypeComponent ;
		this.base() ;
		console.log(this) ;
		this.ParentComponent = GroupContenaire ;
		this.HtmlContainer = this.ParentComponent ;
		this.statements.Highlited = true ;
		this.statements.Created = false ;
		
		
		
		
		//this.widgetHtml = 'hohohoh' ;
		//this.html = '<div class="ClassTypeId"></div>' ;
		
	} //ClassTypeId2.prototype = new InputTypeComponent;
	
	
	function ObjectPropertyTypeId(GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base() ;
		this.ParentComponent = GroupContenaire ;
		this.html = '<div class="ObjectPropertyTypeId"></div>' ;
		this.widgetHtml = null ;
		this.HtmlContainer = this.ParentComponent ;
		this.statements.Created = false ;
		
	} //ObjectPropertyTypeId.prototype = new InputTypeComponent;
	
		
	function ObjectPropertyTypeWidget(GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base() ;
		this.ParentComponent = GroupContenaire ;
		this.html = '<div class="ObjectPropertyTypeWidget"></div>' ;
		this.widgetHtml = null ;
		this.widgetType = null ;
		this.HtmlContainer = this.ParentComponent ;
		this.statements.Created = false ;
		
		console.log(this) ;
		
		function init() {
			console.log(this) ;
			if (this.ParentComponent instanceof EndClassWidgetGroup) {
				if (this.statements.Created) {
					this.tools.Update() ;
					return true ;
				}
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;

				console.log(endClassGroup) ;
				if (endClassGroup.value_selected == LABEL_URI) {
					var endLabel = getClassLabel(endClassGroup.value_selected) ;
				} else {
					var endLabel = langSearch.Find+' '+getClassLabel(endClassGroup.value_selected) ;
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
			
			
		} this.init = init
		
;		function getWigetTypeClassName() {
			switch (this.widgetType) {
			  case TYPE_WIDGET_LIST_URI:
				this.widgetComponent = new ListWidget(this) ;
				break;
			  case TYPE_WIDGET_AUTOCOMPLETE_URI:
				this.widgetComponent = new autoCompleteWidget(this) ;
			    break;
			  case TYPE_WIDGET_TIME_URI:
				//console.log('Mangoes and papayas are $2.79 a pound.');
				this.widgetComponent = new DatesWidget(this) ;
				// expected output: "Mangoes and papayas are $2.79 a pound."
				break;
			  case TYPE_WIDGET_SEARCH_URI:
				//console.log('Mangoes and papayas are $2.79 a pound.');
				this.widgetComponent = new SearchWidget(this) ;
				// expected output: "Mangoes and papayas are $2.79 a pound."
				break;
			  default:
				//console.log('Sorry, we are out of ' + expr + '.');
			}
		} this.getWigetTypeClassName = getWigetTypeClassName ;
		
		this.GetValue = function () {
			
			var value_widget = null ;
			switch (this.widgetType) {
			  case TYPE_WIDGET_LIST_URI:
			  var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value_widget = $(id_input).val() ;
				console.log(value_widget) ;
				break;
			  case TYPE_WIDGET_AUTOCOMPLETE_URI:
				var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value_widget = $(id_input).val() ;
				console.log(value_widget) ;
			    break;
			  case TYPE_WIDGET_TIME_URI:
				//console.log('Mangoes and papayas are $2.79 a pound.');
				var id_input = '#ecgrw-date-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
				
				value_widget = { start: $(id_input+'-start').val() , stop: $(id_input+'-stop').val()  } ;
				
				if ((value_widget.start == '') || (value_widget.stop == '')) {
						value_widget = null ;
				} else {
					if (parseInt(value_widget.start) > parseInt(value_widget.stop)) {
						value_widget = null ;
					}
				}
				
				// expected output: "Mangoes and papayas are $2.79 a pound."
				break;
			  case TYPE_WIDGET_SEARCH_URI:
				//console.log('Mangoes and papayas are $2.79 a pound.');
				var id_input = '#ecgrw-search-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value_widget = $(id_input).val() ;
				// expected output: "Mangoes and papayas are $2.79 a pound."
				break;
			  default:
				//console.log('Sorry, we are out of ' + expr + '.');
			}
			return value_widget ;
		}
		this.GetValueLabel = function () {
			
			var value_widget = null ;
			switch (this.widgetType) {
			  case TYPE_WIDGET_LIST_URI:
			  var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value_widget = '<span>' +$(id_input).find('option:selected').text() + '</span>' ;
				break;
			  case TYPE_WIDGET_AUTOCOMPLETE_URI:
				var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
				value_widget = '<span>' + $(id_input).val()  + '</span>' ;
				//console.log(value_widget) ;
			    break;
			  case TYPE_WIDGET_TIME_URI:
				
				var id_input = '#ecgrw-date-'+ this.widgetComponent.IdCriteriaGroupe +'-input' ;
				//console.log(id_input);
				value_widget = '<span class="label-two-line">De '+ $(id_input+'-start').val() +' à '+ $(id_input+'-stop').val() + '<br/>(' + $(id_input).val() + ')</span>' ;
				break;
			  case TYPE_WIDGET_SEARCH_URI:
				
				var id_input = '#ecgrw-search-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				//console.log(id_input);
				value_widget = '<span>'+ $(id_input).val() +'</span>' ;
				break;
				
			  default:
			  
			}
			return value_widget ;
		}
		
	} //ObjectPropertyTypeWidget.prototype = new InputTypeComponent;
	
	
	
	
	function widgetType() {
		
		this.parentComponent = null ;
		this.html = null ;
		
		
		
	}
	
	function autoCompleteWidget(InputTypeComponent) {
		this.base = widgetType ;
		this.base() ;
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.AutocompleteWidget  = true ;
		
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		
		
		this.html = '<input id="ecgrw-'+this.IdCriteriaGroupe+'-input" /><input id="ecgrw-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/>' ;
		
		function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			var id_inputs = this.IdCriteriaGroupe ;
			
			var itc_obj = this.ParentComponent;
			
			var options = {
				ajaxSettings: {crossDomain: true, type: 'GET'} ,
				url: function(phrase) {
					return settings.autocompleteUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, phrase) ;
				},
				 getValue: function(element) {
					return element.label;
				  },

				  ajaxSettings: {
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

					onChooseEvent: function() {
							var value = $('#ecgrw-'+id_inputs+'-input').getSelectedItemData();
							$('#ecgrw-'+id_inputs+'-input').val(value.label)
							$('#ecgrw-'+id_inputs+'-input-value').val(value.uri).trigger("change");$(itc_obj).trigger("change");
							
					}
				  },

				  requestDelay: 400
			};
			//Need to add in html befor
			
			$('#ecgrw-'+id_inputs+'-input').easyAutocomplete(options);
			
			
		} this.init = init ;
		
		
		
	} //autoCompleteWidget.prototype = new widgetType;
	
	function ListWidget(InputTypeComponent) {
		this.base = widgetType ;
		this.base() ;
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.ListeWidget = true ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		var id_input = 'ecgrw-'+ this.IdCriteriaGroupe +'-input-value' ;
		
		
		this.html = '<div class="list-widget"><select id="'+id_input+'"></select></div>' ;
		this.select = $('<select id="'+id_input+'"></select>');
		
		function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			var itc_obj = this.ParentComponent;
			var options = {

				url: settings.listUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value),
				dataType: "json",
				method: "GET",
				data: {
					  dataType: "json"
				}
			} ;
			
			var request = $.ajax( options );
			var select = $(this.html).find('select') ;
			request.done(function( data ) {
			  
			  $.each( data, function( key, val ) {
				$('#'+id_input).append( "<option value='" + val.uri + "'>" + val.label + "</option>" );
			  });
			  $('#'+id_input).niceSelect();
			  $('#'+id_input).on("change", function() {
				  $(itc_obj).trigger('change') ;
			  });
			  //$(this.ParentComponent).trigger("change");
			  
			});
				
			//Need to add in html befor
			
			
			
			
		} this.init = init ;
		
		
		
	} //ListWidget.prototype = new widgetType;
	
	function DatesWidget(InputTypeComponent) {
		this.base = widgetType ;
		this.base() ;
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.DatesWidget  = true ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		this.html = '<div class="date-widget"><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input" placeholder="'+langSearch.PlaceHolderDatePeriod+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-start" placeholder="'+langSearch.PlaceHolderDateFrom+'"/><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-stop" placeholder="'+langSearch.PlaceHolderDateTo+'" /><input id="ecgrw-date-'+this.IdCriteriaGroupe+'-input-value" type="hidden"/><button class="button-add" id="ecgrw-date-'+this.IdCriteriaGroupe+'-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			var phrase ="" ;
			var data_json = null ;
			
			var id_inputs = this.IdCriteriaGroupe ;
			
			var itc_obj = this.ParentComponent;
			
			
			$.ajax({
				url: settings.datesUrl(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, phrase) ,
				async: false,
				success: function (data){
					data_json = data;
				}
			});
			
			
				var options = {
					
						data: data_json ,
				
					 getValue: function(element) {
						 //console.log(element) ;
						return element.label+' '+element.synonyms.join(' '); // +'' convert array to string ; https://stackoverflow.com/questions/5289403/jquery-convert-javascript-array-to-string
					  },

					 
					list: {
						match: {
			enabled: true
		},

					onChooseEvent: function() {
							var value = $('#ecgrw-date-'+id_inputs+'-input').getSelectedItemData().label;
							var start = $('#ecgrw-date-'+id_inputs+'-input').getSelectedItemData().start.year;
							var stop = $('#ecgrw-date-'+id_inputs+'-input').getSelectedItemData().stop.year;

							$('#ecgrw-date-'+id_inputs+'-input').val(value).trigger("change");
							$('#ecgrw-date-'+id_inputs+'-input-start').val(start).trigger("change");
							$('#ecgrw-date-'+id_inputs+'-input-stop').val(stop).trigger("change");
							
							$('#ecgrw-'+id_inputs+'-input-value').val(value).trigger("change");
					}
				  },
					 template: {
						type: "custom",
						method: function(value, item) {
							return '<div>' + item.label + ' <span class="start">' + item.start.year + '</span><span class="end">' + item.stop.year + '</span></div>';
						}
					},

					requestDelay: 400
				};
				//Need to add in html befor
				
				$('#ecgrw-date-'+id_inputs+'-input').easyAutocomplete(options);
				$('#ecgrw-date-'+this.IdCriteriaGroupe+'-add').on('click', function() {
					$(itc_obj).trigger("change");
				})
			
			
		} this.init = init ;
		
		
		
	} //DatesWidget.prototype = new widgetType;
	function SearchWidget(InputTypeComponent) {
		this.base = widgetType ;
		this.base() ;
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.SearchWidget  = true ;
		this.IdCriteriaGroupe = this.ParentComponent.ParentComponent.ParentComponent.id ;
		
		this.html = '<div class="search-widget"><input id="ecgrw-search-'+this.IdCriteriaGroupe+'-input-value" /><button id="ecgrw-search-'+this.IdCriteriaGroupe+'-add" class="button-add">'+langSearch.ButtonAdd+'</button></div>' ;
		
		function init() {
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			var phrase ="" ;
			var data_json = null ;
			
			var id_inputs = this.IdCriteriaGroupe ;
			
			var itc_obj = this.ParentComponent;
			
			var EndClassGroupObject = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup ;
			
		
				//Need to add in html befor

				$('#ecgrw-search-'+this.IdCriteriaGroupe+'-add').on('click', function() {
					$('#ecgrw-search-'+id_inputs+'-input-value').trigger("change");
					$(itc_obj).trigger("change");
					$(EndClassGroupObject.html).find('.ClassTypeId').hide() ;
				})
			
			
		} this.init = init ;
		
		
		
	} //DatesWidget.prototype = new widgetType;
	
	
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
			
			//var html = this.component.html ;
			for (var item in this.component.statements) {
				
				if (this.component.statements[item] === true) {
					
					$(this.component.html).addClass(item) ;
				} else {
					$(this.component.html).removeClass(item) ;
				}
				
			}
			//console.log(this.component.html) ;
			//this.component.html = html ;
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
	//console.log(arrayTosearch) ;
	//console.log(objectTocompare) ;
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




/*  
	Pour implementation du widget list utilisation de 
	jQuery Nice Select - v1.1.0 modifié pour ce composant de recherche
    https://github.com/hernansartorio/jquery-nice-select
    Made by Hernán Sartorio 
	
	Les modifications concernent un changement de comportement pour l'ouverture et la fermeture de la liste ainsi que la possibilité d'ajouter des icon dans les options listées.
*/
 
(function($) {

  $.fn.niceSelect = function(method) {
    
    // Methods
    if (typeof method == 'string') {      
      if (method == 'update') {
        this.each(function() {
          var $select = $(this);
          var $dropdown = $(this).next('.nice-select');
          var open = $dropdown.hasClass('open');
          
          if ($dropdown.length) {
            $dropdown.remove();
            create_nice_select($select);
            
            if (open) {
              $select.next().trigger('click');
            }
          }
        });
      } else if (method == 'destroy') {
        this.each(function() {
          var $select = $(this);
          var $dropdown = $(this).next('.nice-select');
          
          if ($dropdown.length) {
            $dropdown.remove();
            $select.css('display', '');
          }
        });
        if ($('.nice-select').length == 0) {
          $(document).off('.nice_select');
        }
      } else {
        console.log('Method "' + method + '" does not exist.')
      }
      return this;
    }
      
    // Hide native select
    this.hide();
    
    // Create custom markup
    this.each(function() {
      var $select = $(this);
      
      if (!$select.next().hasClass('nice-select')) {
        create_nice_select($select);
      }
    });
    
    function create_nice_select($select) {
      $select.after($('<div></div>')
        .addClass('nice-select')
        .addClass($select.attr('class') || '')
        .addClass($select.attr('disabled') ? 'disabled' : '')
        .attr('tabindex', $select.attr('disabled') ? null : '0')
        .html('<span class="current"></span><ul class="list"></ul>')
      );
        
      var $dropdown = $select.next();
      var $options = $select.find('option');
      var $selected = $select.find('option:selected');
	  
	  var icon ='';
	  if ($selected.attr('data-icon') !== undefined) {
			if($selected.attr('data-icon').indexOf('<') == 0) {
        icon = $selected.attr('data-icon')+"&nbsp;&nbsp;";
      } else {
        icon = '<img src="'+$selected.attr('data-icon')+'" /><img class="highlited" src="'+$selected.attr('data-iconh')+'" />' ;  
      }
		}
		
      
      $dropdown.find('.current').html($selected.data('display') || icon+$selected.html());
      
      $options.each(function(i) {
        var $option = $(this);
        var display = $option.data('display');
		var icon = '' ;
		if ($option.attr('data-icon') !== undefined) {
      if($option.attr('data-icon').indexOf('<') == 0) {
        icon = $option.attr('data-icon')+"&nbsp;&nbsp;";
      } else {
        icon = '<img src="'+$option.attr('data-icon')+'" /><img class="highlited" src="'+$option.attr('data-iconh')+'" />' ;
      }

			
		}

        $dropdown.find('ul').append($('<li></li>')
          .attr('data-value', $option.val())
          .attr('data-display', (display || null))
          .addClass('option' +
            ($option.is(':selected') ? ' selected' : '') +
            ($option.is(':disabled') ? ' disabled' : ''))
          .html(icon+$option.text())
        );
      });
    }
    
    /* Event listeners */
    
    // Unbind existing events in case that the plugin has been initialized before
    $(document).off('.nice_select');
    
    // Open/close
    $(document).on('click.nice_select', '.nice-select', function(event) {
		//alert("hohoh") ;
      var $dropdown = $(this);
	  if ($dropdown.hasClass('open') ) {
		  $dropdown.toggleClass('open');
		  $dropdown.prev('select').val($dropdown.find('.selected').data('value')).trigger('change');
	  } else {
		  $('.nice-select').not($dropdown).removeClass('open');
		  $dropdown.toggleClass('open');
	  }
      
      //
      
      
      if ($dropdown.hasClass('open')) {
        $dropdown.find('.option');  
        $dropdown.find('.focus').removeClass('focus');
        $dropdown.find('.selected').addClass('focus');
      } else {
        $dropdown.focus();
      }
    });
    
    // Close when clicking outside
   /* $(document).on('click.nice_select', function(event) {
      if ($(event.target).closest('.nice-select').length === 0) {
        $('.nice-select').removeClass('open').find('.option');  
      }
    });*/
    
    // Option click
    $(document).on('click.nice_select', '.nice-select .option:not(.disabled)', function(event) {
      var $option = $(this);
      var $dropdown = $option.closest('.nice-select');
      
      $dropdown.find('.selected').removeClass('selected');
      $option.addClass('selected');
      
	  
		
      var text = $option.data('display') || $option.html();
      $dropdown.find('.current').html(text);
      
      
    });

    // Keyboard events
    $(document).on('keydown.nice_select', '.nice-select', function(event) {    
      var $dropdown = $(this);
      var $focused_option = $($dropdown.find('.focus') || $dropdown.find('.list .option.selected'));
      
      // Space or Enter
      if (event.keyCode == 32 || event.keyCode == 13) {
        if ($dropdown.hasClass('open')) {
          $focused_option.trigger('click');
        } else {
          $dropdown.trigger('click');
        }
        return false;
      // Down
      } else if (event.keyCode == 40) {
        if (!$dropdown.hasClass('open')) {
          $dropdown.trigger('click');
        } else {
          var $next = $focused_option.nextAll('.option:not(.disabled)').first();
          if ($next.length > 0) {
            $dropdown.find('.focus').removeClass('focus');
            $next.addClass('focus');
          }
        }
        return false;
      // Up
      } else if (event.keyCode == 38) {
        if (!$dropdown.hasClass('open')) {
          $dropdown.trigger('click');
        } else {
          var $prev = $focused_option.prevAll('.option:not(.disabled)').first();
          if ($prev.length > 0) {
            $dropdown.find('.focus').removeClass('focus');
            $prev.addClass('focus');
          }
        }
        return false;
      // Esc
      } else if (event.keyCode == 27) {
        if ($dropdown.hasClass('open')) {
          $dropdown.trigger('click');
        }
      // Tab
      } else if (event.keyCode == 9) {
        if ($dropdown.hasClass('open')) {
          return false;
        }
      }
    });

    // Detect CSS pointer-events support, for IE <= 10. From Modernizr.
    var style = document.createElement('a').style;
    style.cssText = 'pointer-events:auto';
    if (style.pointerEvents !== 'auto') {
      $('html').addClass('no-csspointerevents');
    }
    
    return this;

  };

}(jQuery));


/*
 * easy-autocomplete
 * jQuery plugin for autocompletion
 * 
 * @author Łukasz Pawełczak (http://github.com/pawelczak)
 * @version 1.3.5
 * Copyright  License: 
 */

var EasyAutocomplete=function(a){return a.Configuration=function(a){function b(){if("xml"===a.dataType&&(a.getValue||(a.getValue=function(a){return $(a).text()}),a.list||(a.list={}),a.list.sort||(a.list.sort={}),a.list.sort.method=function(b,c){return b=a.getValue(b),c=a.getValue(c),c>b?-1:b>c?1:0},a.list.match||(a.list.match={}),a.list.match.method=function(a,b){return a.search(b)>-1}),void 0!==a.categories&&a.categories instanceof Array){for(var b=[],c=0,d=a.categories.length;d>c;c+=1){var e=a.categories[c];for(var f in h.categories[0])void 0===e[f]&&(e[f]=h.categories[0][f]);b.push(e)}a.categories=b}}function c(){function b(a,c){var d=a||{};for(var e in a)void 0!==c[e]&&null!==c[e]&&("object"!=typeof c[e]||c[e]instanceof Array?d[e]=c[e]:b(a[e],c[e]));return void 0!==c.data&&null!==c.data&&"object"==typeof c.data&&(d.data=c.data),d}h=b(h,a)}function d(){if("list-required"!==h.url&&"function"!=typeof h.url){var b=h.url;h.url=function(){return b}}if(void 0!==h.ajaxSettings.url&&"function"!=typeof h.ajaxSettings.url){var b=h.ajaxSettings.url;h.ajaxSettings.url=function(){return b}}if("string"==typeof h.listLocation){var c=h.listLocation;"XML"===h.dataType.toUpperCase()?h.listLocation=function(a){return $(a).find(c)}:h.listLocation=function(a){return a[c]}}if("string"==typeof h.getValue){var d=h.getValue;h.getValue=function(a){return a[d]}}void 0!==a.categories&&(h.categoriesAssigned=!0)}function e(){void 0!==a.ajaxSettings&&"object"==typeof a.ajaxSettings?h.ajaxSettings=a.ajaxSettings:h.ajaxSettings={}}function f(a){return void 0!==h[a]&&null!==h[a]}function g(a,b){function c(b,d){for(var e in d)void 0===b[e]&&a.log("Property '"+e+"' does not exist in EasyAutocomplete options API."),"object"==typeof b[e]&&-1===$.inArray(e,i)&&c(b[e],d[e])}c(h,b)}var h={data:"list-required",url:"list-required",dataType:"json",listLocation:function(a){return a},xmlElementName:"",getValue:function(a){return a},autocompleteOff:!0,placeholder:!1,ajaxCallback:function(){},matchResponseProperty:!1,list:{sort:{enabled:!1,method:function(a,b){return a=h.getValue(a),b=h.getValue(b),b>a?-1:a>b?1:0}},maxNumberOfElements:6,hideOnEmptyPhrase:!0,match:{enabled:!1,caseSensitive:!1,method:function(a,b){return a.search(b)>-1}},showAnimation:{type:"normal",time:400,callback:function(){}},hideAnimation:{type:"normal",time:400,callback:function(){}},onClickEvent:function(){},onSelectItemEvent:function(){},onLoadEvent:function(){},onChooseEvent:function(){},onKeyEnterEvent:function(){},onMouseOverEvent:function(){},onMouseOutEvent:function(){},onShowListEvent:function(){},onHideListEvent:function(){}},highlightPhrase:!0,theme:"",cssClasses:"",minCharNumber:0,requestDelay:0,adjustWidth:!0,ajaxSettings:{},preparePostData:function(a,b){return a},loggerEnabled:!0,template:"",categoriesAssigned:!1,categories:[{maxNumberOfElements:4}]},i=["ajaxSettings","template"];this.get=function(a){return h[a]},this.equals=function(a,b){return!(!f(a)||h[a]!==b)},this.checkDataUrlProperties=function(){return"list-required"!==h.url||"list-required"!==h.data},this.checkRequiredProperties=function(){for(var a in h)if("required"===h[a])return logger.error("Option "+a+" must be defined"),!1;return!0},this.printPropertiesThatDoesntExist=function(a,b){g(a,b)},b(),c(),h.loggerEnabled===!0&&g(console,a),e(),d()},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.Logger=function(){this.error=function(a){console.log("ERROR: "+a)},this.warning=function(a){console.log("WARNING: "+a)}},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.Constans=function(){var a={CONTAINER_CLASS:"easy-autocomplete-container",CONTAINER_ID:"eac-container-",WRAPPER_CSS_CLASS:"easy-autocomplete"};this.getValue=function(b){return a[b]}},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.ListBuilderService=function(a,b){function c(b,c){function d(){var d,e={};return void 0!==b.xmlElementName&&(e.xmlElementName=b.xmlElementName),void 0!==b.listLocation?d=b.listLocation:void 0!==a.get("listLocation")&&(d=a.get("listLocation")),void 0!==d?"string"==typeof d?e.data=$(c).find(d):"function"==typeof d&&(e.data=d(c)):e.data=c,e}function e(){var a={};return void 0!==b.listLocation?"string"==typeof b.listLocation?a.data=c[b.listLocation]:"function"==typeof b.listLocation&&(a.data=b.listLocation(c)):a.data=c,a}var f={};if(f="XML"===a.get("dataType").toUpperCase()?d():e(),void 0!==b.header&&(f.header=b.header),void 0!==b.maxNumberOfElements&&(f.maxNumberOfElements=b.maxNumberOfElements),void 0!==a.get("list").maxNumberOfElements&&(f.maxListSize=a.get("list").maxNumberOfElements),void 0!==b.getValue)if("string"==typeof b.getValue){var g=b.getValue;f.getValue=function(a){return a[g]}}else"function"==typeof b.getValue&&(f.getValue=b.getValue);else f.getValue=a.get("getValue");return f}function d(b){var c=[];return void 0===b.xmlElementName&&(b.xmlElementName=a.get("xmlElementName")),$(b.data).find(b.xmlElementName).each(function(){c.push(this)}),c}this.init=function(b){var c=[],d={};return d.data=a.get("listLocation")(b),d.getValue=a.get("getValue"),d.maxListSize=a.get("list").maxNumberOfElements,c.push(d),c},this.updateCategories=function(b,d){if(a.get("categoriesAssigned")){b=[];for(var e=0;e<a.get("categories").length;e+=1){var f=c(a.get("categories")[e],d);b.push(f)}}return b},this.convertXml=function(b){if("XML"===a.get("dataType").toUpperCase())for(var c=0;c<b.length;c+=1)b[c].data=d(b[c]);return b},this.processData=function(c,d){for(var e=0,f=c.length;f>e;e+=1)c[e].data=b(a,c[e],d);return c},this.checkIfDataExists=function(a){for(var b=0,c=a.length;c>b;b+=1)if(void 0!==a[b].data&&a[b].data instanceof Array&&a[b].data.length>0)return!0;return!1}},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.proccess=function(b,c,d){function e(a,c){var d=[],e="";if(b.get("list").match.enabled)for(var g=0,h=a.length;h>g;g+=1)e=b.get("getValue")(a[g]),f(e,c)&&d.push(a[g]);else d=a;return d}function f(a,c){return b.get("list").match.caseSensitive||("string"==typeof a&&(a=a.toLowerCase()),c=c.toLowerCase()),!!b.get("list").match.method(a,c)}function g(a){return void 0!==c.maxNumberOfElements&&a.length>c.maxNumberOfElements&&(a=a.slice(0,c.maxNumberOfElements)),a}function h(a){return b.get("list").sort.enabled&&a.sort(b.get("list").sort.method),a}a.proccess.match=f;var i=c.data,j=d;return i=e(i,j),i=g(i),i=h(i)},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.Template=function(a){var b={basic:{type:"basic",method:function(a){return a},cssClass:""},description:{type:"description",fields:{description:"description"},method:function(a){return a+" - description"},cssClass:"eac-description"},iconLeft:{type:"iconLeft",fields:{icon:""},method:function(a){return a},cssClass:"eac-icon-left"},iconRight:{type:"iconRight",fields:{iconSrc:""},method:function(a){return a},cssClass:"eac-icon-right"},links:{type:"links",fields:{link:""},method:function(a){return a},cssClass:""},custom:{type:"custom",method:function(){},cssClass:""}},c=function(a){var c,d=a.fields;return"description"===a.type?(c=b.description.method,"string"==typeof d.description?c=function(a,b){return a+" - <span>"+b[d.description]+"</span>"}:"function"==typeof d.description&&(c=function(a,b){return a+" - <span>"+d.description(b)+"</span>"}),c):"iconRight"===a.type?("string"==typeof d.iconSrc?c=function(a,b){return a+"<img class='eac-icon' src='"+b[d.iconSrc]+"' />"}:"function"==typeof d.iconSrc&&(c=function(a,b){return a+"<img class='eac-icon' src='"+d.iconSrc(b)+"' />"}),c):"iconLeft"===a.type?("string"==typeof d.iconSrc?c=function(a,b){return"<img class='eac-icon' src='"+b[d.iconSrc]+"' />"+a}:"function"==typeof d.iconSrc&&(c=function(a,b){return"<img class='eac-icon' src='"+d.iconSrc(b)+"' />"+a}),c):"links"===a.type?("string"==typeof d.link?c=function(a,b){return"<a href='"+b[d.link]+"' >"+a+"</a>"}:"function"==typeof d.link&&(c=function(a,b){return"<a href='"+d.link(b)+"' >"+a+"</a>"}),c):"custom"===a.type?a.method:b.basic.method},d=function(a){return a&&a.type&&a.type&&b[a.type]?c(a):b.basic.method},e=function(a){var c=function(){return""};return a&&a.type&&a.type&&b[a.type]?function(){var c=b[a.type].cssClass;return function(){return c}}():c};this.getTemplateClass=e(a),this.build=d(a)},a}(EasyAutocomplete||{}),EasyAutocomplete=function(a){return a.main=function(b,c){function d(){return 0===t.length?void p.error("Input field doesn't exist."):o.checkDataUrlProperties()?o.checkRequiredProperties()?(e(),void g()):void p.error("Will not work without mentioned properties."):void p.error("One of options variables 'data' or 'url' must be defined.")}function e(){function a(){var a=$("<div>"),c=n.getValue("WRAPPER_CSS_CLASS");o.get("theme")&&""!==o.get("theme")&&(c+=" eac-"+o.get("theme")),o.get("cssClasses")&&""!==o.get("cssClasses")&&(c+=" "+o.get("cssClasses")),""!==q.getTemplateClass()&&(c+=" "+q.getTemplateClass()),a.addClass(c),t.wrap(a),o.get("adjustWidth")===!0&&b()}function b(){var a=t.outerWidth();t.parent().css("width",a)}function c(){t.unwrap()}function d(){var a=$("<div>").addClass(n.getValue("CONTAINER_CLASS"));a.attr("id",f()).prepend($("<ul>")),function(){a.on("show.eac",function(){switch(o.get("list").showAnimation.type){case"slide":var b=o.get("list").showAnimation.time,c=o.get("list").showAnimation.callback;a.find("ul").slideDown(b,c);break;case"fade":var b=o.get("list").showAnimation.time,c=o.get("list").showAnimation.callback;a.find("ul").fadeIn(b),c;break;default:a.find("ul").show()}o.get("list").onShowListEvent()}).on("hide.eac",function(){switch(o.get("list").hideAnimation.type){case"slide":var b=o.get("list").hideAnimation.time,c=o.get("list").hideAnimation.callback;a.find("ul").slideUp(b,c);break;case"fade":var b=o.get("list").hideAnimation.time,c=o.get("list").hideAnimation.callback;a.find("ul").fadeOut(b,c);break;default:a.find("ul").hide()}o.get("list").onHideListEvent()}).on("selectElement.eac",function(){a.find("ul li").removeClass("selected"),a.find("ul li").eq(w).addClass("selected"),o.get("list").onSelectItemEvent()}).on("loadElements.eac",function(b,c,d){var e="",f=a.find("ul");f.empty().detach(),v=[];for(var h=0,i=0,k=c.length;k>i;i+=1){var l=c[i].data;if(0!==l.length){void 0!==c[i].header&&c[i].header.length>0&&f.append("<div class='eac-category' >"+c[i].header+"</div>");for(var m=0,n=l.length;n>m&&h<c[i].maxListSize;m+=1)e=$("<li><div class='eac-item'></div></li>"),function(){var a=m,b=h,f=c[i].getValue(l[a]);e.find(" > div").on("click",function(){t.val(f).trigger("change"),w=b,j(b),o.get("list").onClickEvent(),o.get("list").onChooseEvent()}).mouseover(function(){w=b,j(b),o.get("list").onMouseOverEvent()}).mouseout(function(){o.get("list").onMouseOutEvent()}).html(q.build(g(f,d),l[a]))}(),f.append(e),v.push(l[m]),h+=1}}a.append(f),o.get("list").onLoadEvent()})}(),t.after(a)}function e(){t.next("."+n.getValue("CONTAINER_CLASS")).remove()}function g(a,b){return o.get("highlightPhrase")&&""!==b?i(a,b):a}function h(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}function i(a,b){var c=h(b);return(a+"").replace(new RegExp("("+c+")","gi"),"<b>$1</b>")}t.parent().hasClass(n.getValue("WRAPPER_CSS_CLASS"))&&(e(),c()),a(),d(),u=$("#"+f()),o.get("placeholder")&&t.attr("placeholder",o.get("placeholder"))}function f(){var a=t.attr("id");return a=n.getValue("CONTAINER_ID")+a}function g(){function a(){s("autocompleteOff",!0)&&n(),b(),c(),d(),e(),f(),g()}function b(){t.focusout(function(){var a,b=t.val();o.get("list").match.caseSensitive||(b=b.toLowerCase());for(var c=0,d=v.length;d>c;c+=1)if(a=o.get("getValue")(v[c]),o.get("list").match.caseSensitive||(a=a.toLowerCase()),a===b)return w=c,void j(w)})}function c(){t.off("keyup").keyup(function(a){function b(a){function b(){var a={},b=o.get("ajaxSettings")||{};for(var c in b)a[c]=b[c];return a}function c(a,b){return o.get("matchResponseProperty")!==!1?"string"==typeof o.get("matchResponseProperty")?b[o.get("matchResponseProperty")]===a:"function"==typeof o.get("matchResponseProperty")?o.get("matchResponseProperty")(b)===a:!0:!0}if(!(a.length<o.get("minCharNumber"))){if("list-required"!==o.get("data")){var d=o.get("data"),e=r.init(d);e=r.updateCategories(e,d),e=r.processData(e,a),k(e,a),t.parent().find("li").length>0?h():i()}var f=b();void 0!==f.url&&""!==f.url||(f.url=o.get("url")),void 0!==f.dataType&&""!==f.dataType||(f.dataType=o.get("dataType")),void 0!==f.url&&"list-required"!==f.url&&(f.url=f.url(a),f.data=o.get("preparePostData")(f.data,a),$.ajax(f).done(function(b){var d=r.init(b);d=r.updateCategories(d,b),d=r.convertXml(d),c(a,b)&&(d=r.processData(d,a),k(d,a)),r.checkIfDataExists(d)&&t.parent().find("li").length>0?h():i(),o.get("ajaxCallback")()}).fail(function(){p.warning("Fail to load response data")}).always(function(){}))}}switch(a.keyCode){case 27:i(),l();break;case 38:a.preventDefault(),v.length>0&&w>0&&(w-=1,t.val(o.get("getValue")(v[w])),j(w));break;case 40:a.preventDefault(),v.length>0&&w<v.length-1&&(w+=1,t.val(o.get("getValue")(v[w])),j(w));break;default:if(a.keyCode>40||8===a.keyCode){var c=t.val();o.get("list").hideOnEmptyPhrase!==!0||8!==a.keyCode||""!==c?o.get("requestDelay")>0?(void 0!==m&&clearTimeout(m),m=setTimeout(function(){b(c)},o.get("requestDelay"))):b(c):i()}}})}function d(){t.on("keydown",function(a){a=a||window.event;var b=a.keyCode;return 38===b?(suppressKeypress=!0,!1):void 0}).keydown(function(a){13===a.keyCode&&w>-1&&(t.val(o.get("getValue")(v[w])),o.get("list").onKeyEnterEvent(),o.get("list").onChooseEvent(),w=-1,i(),a.preventDefault())})}function e(){t.off("keypress")}function f(){t.focus(function(){""!==t.val()&&v.length>0&&(w=-1,h())})}function g(){t.blur(function(){setTimeout(function(){w=-1,i()},250)})}function n(){t.attr("autocomplete","off")}a()}function h(){u.trigger("show.eac")}function i(){u.trigger("hide.eac")}function j(a){u.trigger("selectElement.eac",a)}function k(a,b){u.trigger("loadElements.eac",[a,b])}function l(){t.trigger("blur")}var m,n=new a.Constans,o=new a.Configuration(c),p=new a.Logger,q=new a.Template(c.template),r=new a.ListBuilderService(o,a.proccess),s=o.equals,t=b,u="",v=[],w=-1;a.consts=n,this.getConstants=function(){return n},this.getConfiguration=function(){return o},this.getContainer=function(){return u},this.getSelectedItemIndex=function(){return w},this.getItems=function(){return v},this.getItemData=function(a){return v.length<a||void 0===v[a]?-1:v[a]},this.getSelectedItemData=function(){return this.getItemData(w)},this.build=function(){e()},this.init=function(){d()}},a.eacHandles=[],a.getHandle=function(b){return a.eacHandles[b]},a.inputHasId=function(a){return void 0!==$(a).attr("id")&&$(a).attr("id").length>0},a.assignRandomId=function(b){var c="";do c="eac-"+Math.floor(1e4*Math.random());while(0!==$("#"+c).length);elementId=a.consts.getValue("CONTAINER_ID")+c,$(b).attr("id",c)},a.setHandle=function(b,c){a.eacHandles[c]=b},a}(EasyAutocomplete||{});!function(a){a.fn.easyAutocomplete=function(b){return this.each(function(){var c=a(this),d=new EasyAutocomplete.main(c,b);EasyAutocomplete.inputHasId(c)||EasyAutocomplete.assignRandomId(c),d.init(),EasyAutocomplete.setHandle(d,c.attr("id"))})},a.fn.getSelectedItemIndex=function(){var b=a(this).attr("id");return void 0!==b?EasyAutocomplete.getHandle(b).getSelectedItemIndex():-1},a.fn.getItems=function(){var b=a(this).attr("id");return void 0!==b?EasyAutocomplete.getHandle(b).getItems():-1},a.fn.getItemData=function(b){var c=a(this).attr("id");return void 0!==c&&b>-1?EasyAutocomplete.getHandle(c).getItemData(b):-1},a.fn.getSelectedItemData=function(){var b=a(this).attr("id");return void 0!==b?EasyAutocomplete.getHandle(b).getSelectedItemData():-1}}(jQuery);

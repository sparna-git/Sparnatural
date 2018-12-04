(function( $ ) {
 
    $.fn.SimSemSearchForm = function( options ) {
 
        var specSearch = {} ;
		var defaults = {
			pathSpecSearch: 'config/spec-search.json',
			language: 'fr',
			UrlAutocomplete : function(domain, property, range, key) {
					return 'http://openarchaeo.sparna.fr/federation/api/autocomplete?key='+key+'&domain='+encodeURIComponent(domain)+'&property='+encodeURIComponent(property)+'&range='+encodeURIComponent(range) ;
			},
			UrlList : function(domain, property, range) {
					return 'http://openarchaeo.sparna.fr/federation/api/list?domain='+encodeURIComponent(domain)+'&property='+encodeURIComponent(property)+'&range='+encodeURIComponent(range) ;
			},
			UrlDates : function(domain, property, range, key) {
					return '/data/periodes.jsonld' ;
			}
		};
		
		
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
			
			thisForm.components = [] ;
			
			
			
			$.when( loadSpecSearch() ).done(function() {
				
					initForm(thisForm) ;
					
					
				

				 });
				
        });
		
		function loadSpecSearch() {
			
			return $.getJSON( settings.pathSpecSearch, function( data ) {
				specSearch = data ;
			}) ;
		}
		
		function initForm(thisForm_) {
			//console.log(specSearch) ;
			
			var list = getClassListSelectFor(null,'id_1') ;
			var list_2 = getClassListSelectFor(null,'id_2') ;
			var list_3 = getObjectListSelectFor(null,null,'id_3') ;
			//$(thisForm_._this).append(list) ;
			//$(thisForm_._this).append(list_3) ;
			//$(thisForm_._this).append(list_2) ;
			
			
			
			
			var contexte = $('<ul></ul>') ;
			$(thisForm_._this).append(contexte) ;
			contexte = addComponent(thisForm_, contexte) ;
			//console.log(contexte) ;
			
			
			var UnCritere = new CriteriaGroup(contexte) ;
					
			UnCritere.ChildrensCriteriaGroup.add('hohoh') ; 
			
			contexte.appendTo(thisForm_._this) ;
			
			
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
		
		
		function getClassListSelectFor(classId, inputID) {
			var list = [] ;
			var items = getAllClassFor(classId) ;
			$.each( items, function( key, val ) {
				var label = getClassLabel(val['@id']) ;
				list.push( '<option value="'+val['@id']+'" data-id="'+val['@id']+'">'+ label + '</option>' );

			}) ;
			var html_list = $( "<select/>", {
				"class": "my-new-list input-val",
				"id": inputID,
				html: list.join( "" )
			  });
			return html_list ;
		}
		
		function getObjectListSelectFor(domainClassID, rangeClassID, inputID) {
			var list = [] ;
			var items = getAllObjectPropertyFor(domainClassID,rangeClassID) ;
			$.each( items, function( key, val ) {
				var label = gatLabel(val) ;
				list.push( '<option value="'+val['@id']+'" data-id="'+val['@id']+'">'+ label + '</option>' );

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
					console.log(val) ;
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
			console.log(ClassID) ;
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
							console.log(val['@id']) ;
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
			console.log(thisForm_) ;
			var new_index = thisForm_.components.length ;
			var gabari = '<li data-index="'+new_index+'"><input name="a-'+new_index+'" type="hidden" value=""><input name="b-'+new_index+'" type="hidden" value=""><input name="c-'+new_index+'" type="hidden" value=""><ul></ul></li>' ;
			thisForm_.components.push(new_index) ;
			//contexte.html('span') ;
			//gabari = '<div></div>' ;
			return $(contexte).append(gabari) ;
		}

		

	
	function CriteriaGroup(context) {
		this._this = this ;
		this.ParentComponent = context ;
		this.statements = {
			HasAllComplete : false,
			IsOnEdit : false
		}
		this.id = 'CriteriaGroup-'+$(context).find('.CriteriaGroup').length ;
		this.html = $('<div id="'+this.id+'" class="CriteriaGroup"></div>').appendTo(context.find('ul')) ;
		
		this.Context = new Context(context) ;
		this.ChildrensCriteriaGroup = new ChildrensCriteriaGroup ;
		
		this.StartClassGroup = new StartClassGroup(this) ;
		this.ObjectPropertyGroup = new ObjectPropertyGroup(this) ;
		this.EndClassGroup = new EndClassGroup(this) ;
		this.EndClassWidgetGroup = new EndClassWidgetGroup(this) ;
		//
		
		$(this).trigger( {type:"Created" } ) ;
		
		
		function initEnd() {
			console.log(this) ;
			$(this).trigger( {type:"StartClassGroupSelected" } ) ;
		} this.initEnd = initEnd ;
		
	}
	function eventProxiCriteria(e) {
		
		var arg1 = e.data.arg1;
		var arg2 = e.data.arg2;
		console.log(arg1) ;
		//$('.nice-select').removeClass('open') ;
		arg1[arg2]() ;
	}
	
	function GroupContenaire() {
		this.ParentComponent = null ;
		this.GroupType = null ;
		this.hasSubvalues = false ;
		this.InputTypeComponent = null ;
		this.widgetHtml = false ;
		this.html = $() ;
		this.statements = {
			HasInputsCompleted : false,
			IsOnEdit : false
		}
		
		
		//this.tools = new GenericTools(this) ;
		function init() {
			this.statements.IsOnEdit = true ;
			//this.html.remove() ;
			this.tools = new GenericTools(this) ;
			this.tools.InitHtml() ;
			this.tools.Add() ;
			
		} this.init = init ;
		
		function Edit() {
			this.InputTypeComponent.statements.IsOnEdit = true;
			
			
			
			
			/*this.InputTypeComponent.UpdateStatementsClass() ;
			this.InputTypeComponent.AppendInputHtml() ;*/
			
		} this.Edit = Edit ;
		
		
		
	} 
	
	
	function StartClassGroup(CriteriaGroupe) {
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'StartClassGroup' ;
		//console.log(this) ;
		this.statements.StartClassGroup = true ;
		console.log('befor created') ;
		this.InputTypeComponent = new ClassTypeId(this) ;
		
		$(CriteriaGroupe).on('Created', function () {
			console.log('after created') ;
			$(this.StartClassGroup.html).find('.input-val').unbind('change');
			//this.StartClassGroup.init() ;
			this.StartClassGroup.InputTypeComponent.init() ;
			this.StartClassGroup.Edit() ;
			var select = $(this.StartClassGroup.html).find('.input-val')
			//console.log(selet) ;

			//$(this.html).find('.input-val').change($.proxy(this.initEnd() , null)); 
			this.StartClassGroup.niceslect = $(select).niceSelect() ;
			console.log('Reclick') ;
			$(this.StartClassGroup.niceslect).next().trigger('click') ;
			
			//$('.StartClassGroup .nice-select').trigger('click') ;
			console.log(this.StartClassGroup.niceslect) ;
			
			
			$(this.StartClassGroup.html).find('.input-val').on('change', {arg1: this.StartClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			console.log('Edit startClassGroup is on ! ') ;
		}) ;
		function validSelected() {
			//this.niceslect.niceSelect('update') ;
			this.value_selected = $(this.html).find('.input-val').val() ;
			//$(this.html).find('.input-val').attr('disabled', 'disabled');
			$(this.ParentComponent).trigger( {type:"StartClassGroupSelected" } ) ;
			console.log(this) ;
			
		} this.validSelected = validSelected ;
		
		this.init() ;
		
		
	} StartClassGroup.prototype = new GroupContenaire;
	
	
	
	function ObjectPropertyGroup(CriteriaGroupe) {
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'ObjectPropertyGroup' ;
		this.statements.ObjectPropertyGroup = true ;
		this.hasSubvalues = true ;
		this.InputTypeComponent = new ObjectPropertyTypeId(this) ;
		
		$(CriteriaGroupe).on('EndClassGroupSelected', function () {
			$(this.ObjectPropertyGroup.html).find('.input-val').unbind('change');
			//this.ObjectPropertyGroup.init() ;
			this.ObjectPropertyGroup.InputTypeComponent.init() ;
			this.ObjectPropertyGroup.Edit() ;
			
			//console.log(this.ParentComponent) ;
			this.ObjectPropertyGroup.niceslect = $(this.ObjectPropertyGroup.html).find('select.input-val').niceSelect()  ;
			//$('.nice-select').removeClass('open') ;
			$('.ObjectPropertyGroup .nice-select').trigger('click') ;
			
			$(this.ObjectPropertyGroup.html).find('.input-val').on('change', {arg1: this.ObjectPropertyGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
			//console.log('Edit endClassGroup is on ! ') ;
		}) ;
			
		function validSelected() {
			this.value_selected = $(this.html).find('.input-val').val() ;
			$(this.ParentComponent.EndClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			$(this.ParentComponent).trigger( {type:"ObjectPropertyGroupSelected" } ) ;
			console.log(this) ;
			
		} this.validSelected = validSelected ;
			
		this.init() ;
		
	} ObjectPropertyGroup.prototype = new GroupContenaire;
	
	
	
	function EndClassGroup(CriteriaGroupe) {
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'EndClassGroup' ;
		this.statements.EndClassGroup = true ;
		this.hasSubvalues = true ;
		this.InputTypeComponent = new ClassTypeId(this) ;
		
		$(CriteriaGroupe).on('StartClassGroupSelected', function () {
			//console.log(this.StartClassGroup) ;
			$(this.EndClassGroup.html).find('.input-val').unbind('change');
			//this.EndClassGroup.init() ;
			this.EndClassGroup.InputTypeComponent.init() ;
			this.EndClassGroup.Edit() ;
			
			this.EndClassGroup.niceslect = $(this.EndClassGroup.html).find('select.input-val').niceSelect()  ;
			console.log($('.EndClassGroup .nice-select')) ;
			$('.EndClassGroup .nice-select').trigger('click') ;
			
			$(this.EndClassGroup.html).find('.input-val').on('change', {arg1: this.EndClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
			console.log('Edit endClassGroup is on ! ') ;
		}) ;
		
		function validSelected() {
			this.value_selected = $(this.html).find('.input-val').val() ;
			$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
			console.log(this) ;
			
		} this.validSelected = validSelected ;
		
		this.init() ;
		
	} EndClassGroup.prototype = new GroupContenaire;
	
	
	function EndClassWidgetGroup(CriteriaGroupe) {
		this.ParentComponent = CriteriaGroupe ;
		this.GroupType = 'EndClassWidgetGroup' ;
		this.statements.EndClassWidgetGroup = true ;
		this.hasSubvalues = true ;
		
		function detectWidgetType() {
			this.objectPropertyDefinition = getObjectPropertyById(this.ParentComponent.ObjectPropertyGroup.value_selected) ;
			console.log(this.objectPropertyDefinition) ;
			this.widgetType = this.objectPropertyDefinition.widget['@type'] ;
			
		} this.detectWidgetType = detectWidgetType ;
		
		this.InputTypeComponent = new ObjectPropertyTypeWidget(this) ;
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			//console.log(this.StartClassGroup) ;
			// ;
			this.EndClassWidgetGroup.detectWidgetType() ;
			this.EndClassWidgetGroup.InputTypeComponent.init() ;
			
			
			//this.EndClassGroup.init() ;
			//this.EndClassGroup.InputTypeComponent.init() ;
			//this.EndClassGroup.Edit() ;
			
			//this.EndClassGroup.niceslect = $(this.EndClassGroup.html).find('select.input-val').niceSelect()  ;
			//console.log($('.EndClassGroup .nice-select')) ;
			//$('.EndClassGroup .nice-select').trigger('click') ;
			
			//$(this.EndClassGroup.html).find('.input-val').on('change', {arg1: this.EndClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
			console.log('Edit endClassWidgetGroup is on ! ') ;
		}) ;
		
		function validSelected() {
			this.value_selected = $(this.html).find('.input-val').val() ;
			$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			$(this.ParentComponent).trigger( {type:"EndClassGroupSelected" } ) ;
			console.log(this) ;
			
		} this.validSelected = validSelected ;
		
		this.init() ;
		
	} EndClassWidgetGroup.prototype = new GroupContenaire;
	
	
	function InputTypeComponent() {
		this.ParentComponent = null ;
		this.statements = {
			IsCompleted : false,
			IsOnEdit : false
		}

		this.possibleValue ;
		
		
		
		
		console.log('loading class') ;
		console.log(this.ParentComponent) ;
		
		
		function init() {
			
			//If Start Class 
			var possible_values = null ;
			console.log(this.ParentComponent) ;
			if (this.ParentComponent instanceof StartClassGroup) {
				possible_values = getClassListSelectFor(null, 'a') ;
				
				console.log(possible_values) ;
			} 
			
			if (this.ParentComponent instanceof EndClassGroup) {
				console.log(this.ParentComponent.ParentComponent) ;
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				possible_values = getClassListSelectFor(startClassGroup.value_selected, 'b') ;
			}
			
			if (this.ParentComponent instanceof ObjectPropertyGroup) {
				console.log(this.ParentComponent.ParentComponent) ;
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
				possible_values = getObjectListSelectFor(startClassGroup.value_selected, endClassGroup.value_selected, 'c') ;
			}
			
			
			
			this.widgetHtml = possible_values ;
			
			this.statements.IsOnEdit = true ;
			console.log('load genericTools') ;
			this.tools = new GenericTools(this) ;
			console.log('After load genericTools') ;
			this.tools.InitHtml() ;
			this.tools.Add() ;
			
		} this.init = init ;
		
	} 
	
	
	function ClassTypeId(GroupContenaire) {
		this.ParentComponent = GroupContenaire ;
		
		console.log(this) ;
		
		
		
		//this.widgetHtml = 'hohohoh' ;
		//this.html = '<div class="ClassTypeId"></div>' ;
		
	} ClassTypeId.prototype = new InputTypeComponent;
	
	
	function ObjectPropertyTypeId(GroupContenaire) {
		this.ParentComponent = GroupContenaire ;
		this.html = '<div class="ObjectPropertyTypeId"></div>' ;
		this.widgetHtml = null ;
		
	} ObjectPropertyTypeId.prototype = new InputTypeComponent;
	
		
	function ObjectPropertyTypeWidget(GroupContenaire) {
		this.ParentComponent = GroupContenaire ;
		this.html = '<div class="ObjectPropertyTypeWidget"></div>' ;
		this.widgetHtml = null ;
		this.widgetType = null ;
		
		
		function init() {
			
			if (this.ParentComponent instanceof EndClassWidgetGroup) {
				console.log(this.ParentComponent.ParentComponent) ;
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
				
				
				
				this.widgetType = this.ParentComponent.widgetType  ;
				this.getWigetTypeClassName() ;
				this.widgetHtml = this.widgetComponent.html ;
				
			
				this.statements.IsOnEdit = true ;
				console.log('load genericTools') ;
				this.tools = new GenericTools(this) ;
				console.log('After load genericTools') ;
				this.tools.InitHtml() ;
				this.tools.Add() ;
				this.widgetComponent.init() ;
			}
			
			
		} this.init = init
		
;		function getWigetTypeClassName() {
			console.log(this.widgetType);
			switch (this.widgetType) {
			  case 'http://ontologies.sparna.fr/SimSemSearch#ListWidget':
				this.widgetComponent = new ListWidget(this) ;
				break;
			  case 'http://ontologies.sparna.fr/SimSemSearch#AutocompleteWidget':
				this.widgetComponent = new autoCompleteWidget(this) ;
			    break;
			  case 'http://ontologies.sparna.fr/SimSemSearch#TimeWidget':
				//console.log('Mangoes and papayas are $2.79 a pound.');
				this.widgetComponent = new DatesWidget(this) ;
				// expected output: "Mangoes and papayas are $2.79 a pound."
				break;
			  default:
				//console.log('Sorry, we are out of ' + expr + '.');
			}
		} this.getWigetTypeClassName = getWigetTypeClassName ;
		
	} ObjectPropertyTypeWidget.prototype = new InputTypeComponent;
	
	
	
	
	function widgetType() {
		
		this.parentComponent = null ;
		this.html = null ;
		
		
		
	}
	
	function autoCompleteWidget(InputTypeComponent) {
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.AutocompleteWidget  = true ;
		
		
		this.html = '<input id="basics" /><input id="basics-value" type="hidden"/>' ;
		
		function init() {
			console.log(this.ParentComponent.ParentComponent) ;
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			
			var options = {
				ajaxSettings: {crossDomain: true, type: 'GET'} ,
				url: function(phrase) {
					return settings.UrlAutocomplete(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, phrase) ;
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
					data.phrase = $("#basics").val();
					return data;
				  },
				  list: {

					onSelectItemEvent: function() {
							var value = $("#basics").getSelectedItemData().uri;

							$("#basics-value").val(value).trigger("change");
					}
				  },

				  requestDelay: 400
			};
			//Need to add in html befor
			
			$("#basics").easyAutocomplete(options);
			
			
		} this.init = init ;
		
		
		
	} autoCompleteWidget.prototype = new widgetType;
	
	function ListWidget(InputTypeComponent) {
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.ListeWidget = true ;
		
		this.html = '<select id="listwidget"></select>' ;
		this.select = $('<select id="listwidget"></select>');
		
		function init() {
			console.log(this.ParentComponent.ParentComponent) ;
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			
			
			var options = {

				url: settings.UrlList(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value),
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
				$('#listwidget').append( "<option value='" + val.uri + "'>" + val.label + "</option>" );
			  });
			  $("#listwidget").niceSelect();
			  
			});
				
			//Need to add in html befor
			
			
			
			
		} this.init = init ;
		
		
		
	} ListWidget.prototype = new widgetType;
	
	function DatesWidget(InputTypeComponent) {
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.AutocompleteWidget  = true ;
		
		
		this.html = '<input id="basics" /><input id="basics-start" /><input id="basics-stop" /><input id="basics-value" type="hidden"/>' ;
		
		function init() {
			console.log(this.ParentComponent.ParentComponent) ;
			var startClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.StartClassGroup.value_selected ;
			var endClassGroup_value = this.ParentComponent.ParentComponent.ParentComponent.EndClassGroup.value_selected ;
			var ObjectPropertyGroup_value = this.ParentComponent.ParentComponent.ParentComponent.ObjectPropertyGroup.value_selected ;
			var phrase ="" ;
			var data_json = null ;
			
			$.ajax({
				url: settings.UrlDates(startClassGroup_value, ObjectPropertyGroup_value, endClassGroup_value, phrase) ,
				async: false,
				success: function (data){
					data_json = data;
					console.log(data_json) ;
					console.log(data) ;
					
					
				}
			});
			
			
				var options = {
					
						data: data_json ,
				
					 getValue: function(element) {
						return element.synonyms;
					  },

					 
					list: {

					onSelectItemEvent: function() {
							var value = $("#basics").getSelectedItemData().label;
							var start = $("#basics").getSelectedItemData().start.year;
							var stop = $("#basics").getSelectedItemData().stop.year;

							$("#basics").val(value).trigger("change");
							$("#basics-start").val(start).trigger("change");
							$("#basics-stop").val(stop).trigger("change");
					}
				  },
					 template: {
						type: "custom",
						method: function(value, item) {
							return '<div>' + item.label + "<br/>" + item.start.year + " - " + item.stop.year + '</div>';
						}
					},

					  requestDelay: 400
				};
				//Need to add in html befor
				
				$("#basics").easyAutocomplete(options);
			
			
		} this.init = init ;
		
		
		
	} DatesWidget.prototype = new widgetType;
	
	
	function GenericTools(component) {
		this.component = component ;
		
		function AppendComponentHtml() {
			console.log(this.component) ;
			this.component.html = $(this.component.html).appendTo(this.component.ParentComponent.html) ;
			
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
			this.AppendComponentHtml() ;

		} this.Add = Add ;
		
		function InitHtml() {
			console.log(this.component);
			var instance = this.component.constructor.name ;
			var widget = this.component.widgetHtml ;
			console.log(widget) ;
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

	
 
}( jQuery ));
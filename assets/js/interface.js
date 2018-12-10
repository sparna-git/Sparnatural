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
			
			//var list = getClassListSelectFor(null,'id_1') ;
			//var list_2 = getClassListSelectFor(null,'id_2') ;
			//var list_3 = getObjectListSelectFor(null,null,'id_3') ;
			//$(thisForm_._this).append(list) ;
			//$(thisForm_._this).append(list_3) ;
			//$(thisForm_._this).append(list_2) ;
			
			var contexte = $('<ul class="componentsListe"></ul>') ;
			$(thisForm_._this).append(contexte) ;
			contexte1 = addComponent(thisForm_, contexte) ;
			//contexte2 = addComponent(thisForm_, contexte1) ;
			//contexte3 = addComponent(thisForm_, contexte2) ;
			//contexte4 = addComponent(thisForm_, contexte1) ;
			//contexte5 = addComponent(thisForm_, contexte) ;
			
			contexte.appendTo(thisForm_._this) ;
			
			$(thisForm_._this).find('.nice-select').trigger('click') ;

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
				var selected ='';
				if (default_value == val['@id']) {
					selected = 'selected="selected"' ;
				}
				list.push( '<option value="'+val['@id']+'" data-id="'+val['@id']+'"'+selected+'>'+ label + '</option>' );

			}) ;
			var html_list = $( "<select/>", {
				"class": "my-new-list input-val",
				"id": 'select-'+inputID,
				html: list.join( "" )
			  });
			return html_list ;
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
			var new_index = thisForm_.components.length ;
			var gabari = '<li class="groupe" data-index="'+new_index+'"><input name="a-'+new_index+'" type="hidden" value=""><input name="b-'+new_index+'" type="hidden" value=""><input name="c-'+new_index+'" type="hidden" value=""></li>' ;
			
			// si il faut desscendre d'un niveau
			if ($(contexte).is('li')) {
				if ($(contexte).find('>ul').length == 0) {
					var ul = $('<ul></ul>').appendTo($(contexte)) 
				} else {
					var ul = $(contexte).find('>ul') ;
				}
				
				gabari = $(gabari).appendTo(ul);
				//gabarib = $(gabari).appendTo(contexte) ;
			} else {
				gabari = $(gabari).appendTo(contexte) ;
			}
			
			
			//contexte.html('span') ;
			//gabari = '<div></div>' ;
			//$(contexte).append(gabari) ;
			
			//return $(contexte).find('li[data-index='+new_index+']') ;
			
			
			var UnCritere = new CriteriaGroup({ AncestorHtmlContext: contexte, HtmlContext : gabari, FormContext: thisForm_, ContextComponentIndex: new_index }) ;
			
			
			thisForm_.components.push({index: new_index, CriteriaGroup: UnCritere }) ;
			
			var $all_li = thisForm_._this.find('li.groupe') ;
			var ratio = 80 / $all_li.length / 100 ;
			$all_li .each(function(index) {
				var a = (index + 1 ) * ratio ;
				$(this).css({background : 'rgba(255,49,46,'+a+')'}) ;
			});
			
			return $(gabari) ;
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
		
		
		function initEnd() {
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
		console.log('befor created') ;
		
		//ClassTypeId.prototype = new InputTypeComponent();      // child class inherits from Parent
		//ClassTypeId.prototype.constructor = ClassTypeId; // constructor alignment
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
			
			
			$(this.StartClassGroup.html).find('select.input-val').on('change', {arg1: this.StartClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			if ($(this.Context.get().AncestorHtmlContext).is('li')) {
				var ancestorID = parseInt( $(this.Context.get().AncestorHtmlContext).attr('data-index') )  ;
				
				
			}
		}) ;
		function validSelected() {
			//this.niceslect.niceSelect('update') ;
			this.value_selected = $(this.html).find('select.input-val').val() ;
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
			$('.ObjectPropertyGroup .nice-select').trigger('click') ;
			$(this.ObjectPropertyGroup.html).find('select.input-val').on('change', {arg1: this.ObjectPropertyGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
			//console.log('Edit endClassGroup is on ! ') ;
		}) ;
			
		function validSelected() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			$(this.ParentComponent.EndClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			$(this.ParentComponent).trigger( {type:"ObjectPropertyGroupSelected" } ) ;
			
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
			//this.EndClassGroup.init() ;
			this.EndClassGroup.InputTypeComponent.init() ;
			this.EndClassGroup.Edit() ;
			
			this.EndClassGroup.niceslect = $(this.EndClassGroup.html).find('select.input-val').niceSelect()  ;
			$('.EndClassGroup .nice-select').trigger('click') ;
			
			$(this.EndClassGroup.html).find('select.input-val').on('change', {arg1: this.EndClassGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
		}) ;
		
		function validSelected() {
			this.value_selected = $(this.html).find('select.input-val').val() ;
			$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
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
		
		function detectWidgetType() {
			this.objectPropertyDefinition = getObjectPropertyById(this.ParentComponent.ObjectPropertyGroup.value_selected) ;
			this.widgetType = this.objectPropertyDefinition.widget['@type'] ;
			
		} this.detectWidgetType = detectWidgetType ;
		
		this.InputTypeComponent = new ObjectPropertyTypeWidget(this) ;
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			//console.log(this.StartClassGroup) ;
			// ;
			console.log('Init  EndClassWidgetGroup -----------------------------------------------------------------------------------------------') ;
			this.EndClassWidgetGroup.detectWidgetType() ;
			this.EndClassWidgetGroup.InputTypeComponent.init() ;
			
			
			$(this.EndClassWidgetGroup.InputTypeComponent).on('change', {arg1: this.EndClassWidgetGroup, arg2: 'validSelected'}, eventProxiCriteria);
			
			
			console.log('Edit endClassWidgetGroup is on ! ') ;
		}) ;
		
		function validSelected() {
			this.value_selected = this.InputTypeComponent.GetValue() ;
			//$(this.ParentComponent.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
			$(this.ParentComponent).trigger( {type:"EndClassWidgetGroupSelected" } ) ;
			console.log(this) ;
			$(this.ParentComponent.html).addClass('completed') ;
			
		} this.validSelected = validSelected ;
		
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
		
		this.InputTypeComponent = { ActionOr: new ActionOr(this), ActionAnd: new ActionAnd(this), ActionRemove: new ActionRemove(this) } ;
		
		$(CriteriaGroupe).on('Created', function () {
			//console.log(this.StartClassGroup) ;
			// ;
			this.ActionsGroup.detectWidgetType() ;
			this.ActionsGroup.InputTypeComponent.ActionRemove.init() ;
			
			console.log('Edit ActionRemove is on ! ') ;
		}) ;
		
		$(CriteriaGroupe).on('ObjectPropertyGroupSelected', function () {
			//console.log(this.StartClassGroup) ;
			// ;
			this.ActionsGroup.detectWidgetType() ;
			this.ActionsGroup.InputTypeComponent.ActionOr.init() ;
			this.ActionsGroup.InputTypeComponent.ActionAnd.init() ;
			
			$(this.ActionsGroup.InputTypeComponent.ActionOr.html).find('a').on('click', {arg1: this.ActionsGroup, arg2: 'AddOr'}, eventProxiCriteria);
			$(this.ActionsGroup.InputTypeComponent.ActionAnd.html).find('a').on('click', {arg1: this.ActionsGroup, arg2: 'AddAnd'}, eventProxiCriteria);
			
			console.log('Edit ActionOR et ActionAnd is on ! ') ;
		}) ;
		
		this.AddOr = function () {
			
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
					trigger = {element:$(this.ParentComponent.html).find('select.input-val'), eventName: 'change'} ;
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
				
				if (this instanceof ActionOr) {
					possible_values = '<a href="#or">OR</a>' ;
				}
				if (this instanceof ActionAnd) {
					possible_values = '<a href="#and">AND</a>' ;
				}
				if (this instanceof ActionRemove) {
					possible_values = '<a href="#remove">Remove</a>' ;
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
	
	
	function ActionOr(GroupContenaire) {
		this.base = InputTypeComponent ;
		this.base() ;
		this.ParentComponent = GroupContenaire ;
		this.statements.ActionOr = true ;
		this.statements.ShowOnHover = true ;
		this.statements.Created = false ;
		this.HtmlContainer = this.ParentComponent.ParentComponent.EndClassGroup ;
		
		
		
		//this.widgetHtml = 'hohohoh' ;
		//this.html = '<div class="ClassTypeId"></div>' ;
		
	} //ActionOr.prototype = new InputTypeComponent;
	
	
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
		this.statements.triangleR = true ;
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
		this.statements.triangleR = true ;
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
		
		function init() {
			
			if (this.ParentComponent instanceof EndClassWidgetGroup) {
				if (this.statements.Created) {
					this.tools.Update() ;
					return true ;
				}
				var startClassGroup = this.ParentComponent.ParentComponent.StartClassGroup ;
				var endClassGroup = this.ParentComponent.ParentComponent.EndClassGroup ;
				
				
				
				this.widgetType = this.ParentComponent.widgetType  ;
				this.getWigetTypeClassName() ;
				this.widgetHtml = this.widgetComponent.html ;
				
			
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
		
		this.GetValue = function () {
			
			var value_widget = null ;
			switch (this.widgetType) {
			  case 'http://ontologies.sparna.fr/SimSemSearch#ListWidget':
			  var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value_widget = $(this.widgetComponent.html).find(id_input).val() ;
				break;
			  case 'http://ontologies.sparna.fr/SimSemSearch#AutocompleteWidget':
				var id_input = '#ecgrw-'+ this.widgetComponent.IdCriteriaGroupe +'-input-value' ;
				value_widget = $(id_input).val() ;
			    break;
			  case 'http://ontologies.sparna.fr/SimSemSearch#TimeWidget':
				//console.log('Mangoes and papayas are $2.79 a pound.');
				value_widget = $(this.widgetComponent.html).find('input').val() ;
				// expected output: "Mangoes and papayas are $2.79 a pound."
				break;
			  default:
				//console.log('Sorry, we are out of ' + expr + '.');
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
					data.phrase = $('#ecgrw-'+id_inputs+'-input').val();
					return data;
				  },
				  list: {

					onChooseEvent: function() {
							var value = $('#ecgrw-'+id_inputs+'-input').getSelectedItemData().uri;
						$(itc_obj).trigger("change");
							$('#ecgrw-'+id_inputs+'-input-value').val(value).trigger("change");
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
		
		this.html = '<select id="listwidget"></select>' ;
		this.select = $('<select id="listwidget"></select>');
		
		function init() {
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
		
		
		
	} //ListWidget.prototype = new widgetType;
	
	function DatesWidget(InputTypeComponent) {
		this.base = widgetType ;
		this.base() ;
		this.ParentComponent = InputTypeComponent ;
		this.ParentComponent.statements.AutocompleteWidget  = true ;
		
		
		this.html = '<input id="basics" /><input id="basics-start" /><input id="basics-stop" /><input id="basics-value" type="hidden"/>' ;
		
		function init() {
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

	
 
}( jQuery ));
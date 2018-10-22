(function( $ ) {
 
    $.fn.SimSemSearchForm = function( options ) {
 
        var specSearch = {} ;
		var defaults = {
			pathSpecSearch: 'config/spec-search.json',
			language: 'fr'
		};
		
		
		var settings = $.extend( {}, defaults, options );
		
		
		
		this.each(function() {
            var thisForm = {} ;
            thisForm._this = $(this) ;
			
			thisForm.components = [] ;
			
			
			
			$.when( loadSpecSearch() ).done(function() {
				
					initForm(thisForm) ;
					
					var UnCritere = new CriteriaGroup(null) ;
					
						UnCritere.ChildrensCriteriaGroup.add('hohoh') ; 
				

				 });
				
        });
		
		function loadSpecSearch() {
			
			return $.getJSON( settings.pathSpecSearch, function( data ) {
				specSearch = data ;
			}) ;
		}
		
		function initForm(thisForm_) {
			console.log(specSearch) ;
			
			var list = getClassListSelectFor(null) ;
			$(thisForm_._this).append(list) ;
			var contexte = $('<ul></ul>') ;
			$(thisForm_._this).append(contexte) ;
			contexte = addComponent(thisForm_, contexte) ;
			console.log(contexte) ;
			//contexte.appendTo(thisForm_._this)
			
			
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
		
		
		function getClassListSelectFor(classId) {
			var list = [] ;
			var items = getAllClassFor(classId) ;
			$.each( items, function( key, val ) {
				var label = getClassLabel(val['@id']) ;
				list.push( '<li data-id="'+val['@id']+'">'+ label + ' => '+val['@id']+'</li>' );

			}) ;
			var html_list = $( "<ul/>", {
				"class": "my-new-list",
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
			$.each( specSearch['@graph'], function( key, val ) {
				if ( val['@type'] == 'ObjectProperty') {
					if ($.type(val[$searchKey]) === "object") {
						$.each( val[$searchKey]['unionOf']['@list'], function( domkey, domval ) {
							if (ClassID === null) {
								var item = getClassById(domval['@id']) ;
								items = pushIfNotInArray(item, items);
							} else {
								if (classIsInDomain(val['@id'], ClassId)) {
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
							if (classIsInDomain(val[$searchKey], ClassId)) {
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
		function getAllObjectPropertyFor(ClassId) {
			var items = [];
			$.each( specSearch['@graph'], function( key, val ) {
				if ( val['@type'] == 'ObjectProperty') {
					if ($.type(val['domain']) === "object") {
						$.each( val['domain']['unionOf']['@list'], function( domkey, domval ) {
							if (domval['@id'] == ClassId ) {
								items = pushIfNotInArray(val, items);
							}
						}) ;
					} else {
						if (val['domain'] == ClassId ) {
							items = pushIfNotInArray(val, items);
						}
					}
					
				}
			});
			return items ;
		}
		function pushIfNotInArray(item, items) {

			if ($.inArray(item, items) < 0) {
				items.push(item) ;
				
			}
			return items ;
			
		}
		
		function addComponent(thisForm_, contexte) {
			console.log(contexte) ;
			var new_index = thisForm_.components.length ;
			var gabari = '<li data-index="'+new_index+'"><input name="a-'+new_index+'" type="hidden" value=""><input name="b-'+new_index+'" type="hidden" value=""><input name="c-'+new_index+'" type="hidden" value=""><ul></ul></li>' ;
			thisForm_.components.push(new_index) ;
			//contexte.html('span') ;
			//gabari = '<div></div>' ;
			return $(contexte).append(gabari) ;
		}

		
		return this ;
    }
	
	function CriteriaGroup(context) {
		
		this.statements = {
			HasAllComplete : false,
			IsOnEdit : false
		}
		this.html = $('<div class="CriteriaGroup"></div>').appendTo(context) ;
		
		this.Context = new Context(context) ;
		this.ChildrensCriteriaGroup = new ChildrensCriteriaGroup ;
		
		this.StartClassGroup = new StartClassGroup(this) ;
		this.UnionLinkGroup = new UnionLinkGroup(this) ;
		this.EndClassGroup = new EndClassGroup(this) ;
		
		$(this).trigger( {type:"Created" } ) ;
		
		
	}
	
	function GroupContenaire(CriteriaGroupe) {
		this.CriteriaGroupe = CriteriaGroupe ;
		this.hasSubvalues = false ;
		this.statements = {
			HasInputsCompleted : false,
			IsOnEdit : false
		}
		this.InputTypeComponent = null ;
		
		function Process(valeur) {
			
		}
		this.Process = Process ;
		
		
		
	}
	
	
	function StartClassGroup(CriteriaGroupe) {
		this.CriteriaGroupe = CriteriaGroupe ;
		console.log(this) ;
		this.InputTypeComponent = new ClassTypeId(this) ;
		
		$(CriteriaGroupe).on('Created', function () {
			this.StartClassGroup.Edit() ;
		}) ;
		
		function Edit() {
			this.InputTypeComponent.statements.IsOnEdit = true;
			this.InputTypeComponent.UpdateClass() ;
			this.InputTypeComponent.AppendInputHtml() ;
			console.log('Edit startClassGroup is on ! ') ;
		} this.Edit = Edit ;
	} StartClassGroup.prototype = new GroupContenaire;
	
	
	
	function UnionLinkGroup() {
		this.InputTypeComponent = new ObjectPropertyTypeId ;
		
		
	} UnionLinkGroup.prototype = new GroupContenaire;
	
	
	
	function EndClassGroup(CriteriaGroupe) {
		this.CriteriaGroupe = CriteriaGroupe ;
		this.hasSubvalues = true ;
		this.InputTypeComponent = new ClassTypeId(this) ;
		
		
	} EndClassGroup.prototype = new GroupContenaire;
	
	
	function tInputTypeComponent(GroupContenaire) {
		this.GroupContenaire = GroupContenaire ;
		
		console.log(this.GroupContenaire) ;
		
		this.statements = {
			IsCompleted : false,
			IsOnEdit : false
		}
		this.html = '' ;
		this.possibleValue ;
		
		function UpdateClass() {
			
			if (this.statements.IsCompleted) {
				$(this.html).addClass('IsCompleted') ;
			} else {
				$(this.html).removeClass('IsCompleted') ;
			}
			
			if (this.statements.IsOnEdit) {
				$(this.html).addClass('IsOnEdit') ;
			} else {
				$(this.html).removeClass('IsOnEdit') ;
			}
			
		} this.UpdateClass = UpdateClass ;
		
		function AppendInputHtml() {
			
			//this.html = $(this.html).appendTo(this.GroupContenaire.CriteriaGroupe.html) ;
			
		} this.AppendInputHtml = AppendInputHtml ;
		
	}
	
	
	function ClassTypeId(GroupContenaire) {
		this.GroupContenaire = GroupContenaire ;
		console.log(this.GroupContenaire) ;
		this.html = '<div class="ClassTypeId"></div>' ;
		
	}
	ClassTypeId.prototype = new tInputTypeComponent;
	
	
	function ObjectPropertyTypeId() {
		this.html = '<div class="ObjectPropertyTypeId"></div>' ;
		
	}
	ObjectPropertyTypeId.prototype = new tInputTypeComponent;
	
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
			console.log(this.childrensReferences ) ;
		}
		this.add = add;
	}
	

	
 
}( jQuery ));
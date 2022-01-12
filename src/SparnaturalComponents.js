
const tippy = require('tippy.js').default;
var UiuxConfig = require("./UiuxConfig.js");

export class HTMLComponent {

	constructor(baseCssClass, cssClasses, parentComponent, widgetHtml) {
		this.baseCssClass = baseCssClass;
		this.cssClasses = cssClasses;
		this.parentComponent = parentComponent;
		// TODO : see if this is really needed
		// must be false if not set for the moment
		this.widgetHtml = widgetHtml;
		this.html = $();
		this.needBackArrow = false;
		this.needFrontArrow = false;
	}

	attachComponentHtml() {
		// remove existing component if already existing
		this.parentComponent.html.find('>.'+this.baseCssClass).remove() ;	
		$(this.html).appendTo(this.parentComponent.html) ;
	}

	/**
	 * Updates the CSS classes of an element
	 **/
	updateCssClasses() {
		$(this.html).removeClass('*') ;
		for (var item in this.cssClasses) {				
			if (this.cssClasses[item] === true) {
				$(this.html).addClass(item) ;
			} else {
				$(this.html).removeClass(item) ;
			}
		}
	}

	initHtml() {
		if (this.widgetHtml != null) {
			this.html = $('<div class="'+this.baseCssClass+'"></div>') ;
			// remove existing component
			// this.component.html.find('>.'+instance ).remove();
			this.html.append(this.widgetHtml) ; 
			if(this.needBackArrow) {
				this.addBackArrow() ;
			}
			if(this.needFrontArrow) {
				this.addFrontArrow() ;
			}
		} else {
			this.html = $();
		}
	} 

	attachHtml() {
		this.updateCssClasses() ;
		this.attachComponentHtml() ;
	}	

	addBackArrow() {
		this.backArrow = $('<div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div>') ;
		this.html.prepend(this.backArrow) ;
	}

	addFrontArrow() {
		this.frontArrow = $('<div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div>') ;
		this.html.append(this.frontArrow) ;
	}
}

export class GroupContenaire extends HTMLComponent {

	constructor(baseCssClass, parentComponent) {
		super(
 			baseCssClass,
 			{
				HasInputsCompleted : false,
				IsOnEdit : false,
				Invisible: false
			},
			parentComponent,
			false
 		);
		this.parentCriteriaGroup = parentComponent;
		this.inputTypeComponent = null ;

		// TODO : to be removed from here
		this.value_selected = null ;
		this.variableNamePreload = null ;
	}		

	
	init() {
		if (!this.cssClasses.Created) {			
			this.cssClasses.IsOnEdit = true ;
			this.initHtml() ;
			this.attachHtml() ;
			this.cssClasses.Created = true ;				
		} else {
			this.updateCssClasses() ;
		}
	} ;

	onSelctValue() {
		var current = $(this.html).find('.nice-select .current').first() ;
		var varNameForDisplay = '<span class="variableName">'+this.varName.replace('?', '')+'</span>' ;
		$(varNameForDisplay).insertAfter($(current).find('.label').first()) ;

	}
} 


/**
 * Selection of the start class in a criteria/line
 **/
 export class StartClassGroup extends GroupContenaire { 

 	constructor(parentCriteriaGroup, specProvider, settings) {
 		super(
			"StartClassGroup",
			parentCriteriaGroup
		);

		this.specProvider = specProvider;
		this.settings = settings;
		this.cssClasses.StartClassGroup = true ;
		this.cssClasses.Created = false ;
		
		this.inputTypeComponent = new ClassTypeId(this, specProvider) ;
		this.inputTypeComponent.needFrontArrow= true ;

		// contains the name of the SPARQL variable associated to this component
		this.varName = (this.parentCriteriaGroup.jsonQueryBranch)?this.parentCriteriaGroup.jsonQueryBranch.line.s:null;
		this.variableSelector = null ;

		//this.needFrontArrow= true ;
		//this.needBackArrow= true ;
		

		this.init();
	}

	// triggered when a criteria starts
	onCreated() {
		$(this.html).find('.input-val').unbind('change');
		this.inputTypeComponent.init() ;
		this.inputTypeComponent.cssClasses.IsOnEdit = true;
		var select = $(this.html).find('.input-val')[0] ;
		select.sparnaturalSettings = this.settings ;
		this.niceslect = $(select).niceSelect() ;

		
		$(this.html).find('select.input-val').on(
			'change',
			{arg1: this, arg2: 'onChange'},
			SparnaturalComponents.eventProxiCriteria
		);
		if(this.inputTypeComponent.needTriggerClick == true) {
			$(this.html).find('select.input-val').trigger('change');
			this.inputTypeComponent.needTriggerClick = false ;
		}
		
	}

	onchangeViewVariable() {
		if (this.variableSelector === null) {
			//Add varableSelector on variableSelector list ;
			this.variableSelector = new VariableSelector(this) ;
			$(this.selectViewVariable).html(UiuxConfig.ICON_SELECTED_VARIABLE) ;
			$(this.html).addClass('VariableSelected') ;
		} else {
			if (this.variableSelector.canRemove()) {
				this.variableSelector.remove() ;
				this.variableSelector = null ;
				$(this.selectViewVariable).html(UiuxConfig.ICON_NOT_SELECTED_VARIABLE) ;
				$(this.html).removeClass('VariableSelected') ;
			}
		}
		this.parentCriteriaGroup.thisForm_.sparnatural.variablesSelector.updateVariableList() ;
	}

	onChange() {
		
		//this.niceslect.niceSelect('update') ;
		this.value_selected = $(this.html).find('select.input-val').val() ;
		//Sets the SPARQL variable name if not initialized from loaded query
		var parentOrSibling = SparnaturalComponents.findParentOrSiblingCriteria(this.parentCriteriaGroup.thisForm_, this.parentCriteriaGroup.id) ;
		if(this.varName == null) {
			if (parentOrSibling && parentOrSibling.type == 'parent' ) {
				this.varName = parentOrSibling.element.EndClassGroup.getVarName();
			} else if (parentOrSibling && parentOrSibling.type == 'sibling' ) {
				this.varName = parentOrSibling.element.StartClassGroup.getVarName();
			} else {
				this.varName = "?this";
			}
		}

		if ((this.varName == '?this') && (parentOrSibling === null)) {
			this.selectViewVariable = $('<span class="selectViewVariable">'+UiuxConfig.ICON_SELECTED_VARIABLE+'</span>') ;
			$(this.html).append(this.selectViewVariable) ;
			$(this.html).find('span.selectViewVariable').on(
				'click',
				{arg1: this, arg2: 'onchangeViewVariable'},
				SparnaturalComponents.eventProxiCriteria
			);
			//Add varableSelector on variableSelector list ;
			this.variableSelector = new VariableSelector(this) ;
			$(this.html).addClass('VariableSelected') ;
		}

		$(this.parentCriteriaGroup.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
		//add varName on curent selection display
		this.onSelctValue() ;
		// trigger event on the whole line/criteria
		$(this.parentCriteriaGroup).trigger( {type:"StartClassGroupSelected" } ) ;

		if(this.settings.sendQueryOnFirstClassSelected) {
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
		}

		var desc = this.specProvider.getTooltip(this.value_selected) ;
		if(desc) {
			$(this.parentCriteriaGroup.StartClassGroup.html).find('.ClassTypeId').attr('data-tippy-content', desc ) ;
			var tippySettings = Object.assign({}, this.settings.tooltipConfig);
			tippySettings.placement = "top-start";
			tippy('.StartClassGroup .ClassTypeId[data-tippy-content]', tippySettings);
		} else {
			$(this.parentCriteriaGroup.StartClassGroup.html).removeAttr('data-tippy-content') ;
		}
	};

	setClass(value) {
		$(this.html).find('nice-select ul li[data-value="'+value+'"]').trigger('click');
	}

	getVarName() {
		return this.varName;
	}
} 



/**
 * The property selection part of a criteria/line, encapsulating an ObjectPropertyTypeId
 **/
export class ObjectPropertyGroup extends GroupContenaire {

	constructor(parentCriteriaGroup, specProvider, settings, temporaryLabel) {
		super(
			"ObjectPropertyGroup",
			parentCriteriaGroup
		);

		this.specProvider = specProvider;
		this.settings = settings;
		this.temporaryLabel = temporaryLabel;
		// TODO : this is removing CSS classes
		this.cssClasses = {
			ObjectPropertyGroup : true,
			Created : false
		} ;		

		this.objectPropertySelector = new SparnaturalComponents.ObjectPropertyTypeId(this, specProvider) ;

		this.init() ;

	}

	onStartClassGroupSelected() {
		this.html.append('<span class="current temporary-label">'+this.temporaryLabel+'</span>') ;
	}
	
	// triggered when a class is selected in the range
	onEndClassGroupSelected() {
		$(this.html).find('.temporary-label').remove() ;
		$(this.html).find('.input-val').unbind('change');
		this.value_selected = null;

		if (!this.objectPropertySelector.cssClasses.Created) {
			this.objectPropertySelector.init() ;
			this.objectPropertySelector.cssClasses.IsOnEdit = true;
		} else {
			this.objectPropertySelector.reload() ;
			this.objectPropertySelector.cssClasses.IsOnEdit = true;
		}
		var select = $(this.html).find('select.input-val') ;
		select[0].sparnaturalSettings = this.settings ;
		this.niceslect = $(this.html).find('select.input-val').niceSelect()  ;
		$(this.html).find('.input-val').removeAttr('disabled').niceSelect('update'); 
		// opens the select automatically
		if(this.objectPropertySelector.needTriggerClick == false) {
			$(this.html).find('.nice-select:not(.disabled)').trigger('click') ;
		}
		$(this.html).find('select.input-val').unbind('change');
		// hook the change event to the onChange function
		$(this.html).find('select.input-val').on(
			'change',
			{arg1: this, arg2: 'onChange'},
			SparnaturalComponents.eventProxiCriteria
		);
		
		
		if(this.objectPropertySelector.needTriggerClick == true) {
			// $(this.html).find('.nice-select:not(.disabled)').trigger('click') ;
			$(this.html).find('select.input-val:not(.disabled)').trigger('change');
			this.objectPropertySelector.needTriggerClick = false ;
			//$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
		} else {
			// automatically selects the value if there is only one
			if ($(this.html).find('select.input-val').find('option').length == 1) {
				$(this.html).find('.nice-select:not(.disabled)').trigger('click') ;
			}
		}
	}

	onChange() {
		if (this.value_selected) {
			this.parentCriteriaGroup.OptionsGroup.reload() ;
		}
		this.value_selected = $(this.html).find('select.input-val').val() ;
		// disable if only one possible property option between the 2 classes
		if ($(this.html).find('.input-val').find('option').length == 1) {
			$(this.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
		}
		$(this.parentCriteriaGroup).trigger( {type:"ObjectPropertyGroupSelected" } ) ;
		console.log(this.parentCriteriaGroup.html) ;
		if($(this.parentCriteriaGroup.html).parent('li').first().hasClass('completed'))	{
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
		}
		

		// sets tooltip ready
		var desc = this.specProvider.getTooltip(this.value_selected) ;
		if(desc) {
			$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.ObjectPropertyTypeId').attr('data-tippy-content', desc ) ;
			// tippy('.ObjectPropertyGroup .ObjectPropertyTypeId[data-tippy-content]', settings.tooltipConfig);
			var tippySettings = Object.assign({}, this.settings.tooltipConfig);
			tippySettings.placement = "top-start";
			tippy('.ObjectPropertyGroup .ObjectPropertyTypeId[data-tippy-content]', tippySettings);
		} else {
			$(this.parentCriteriaGroup.ObjectPropertyGroup.html).removeAttr('data-tippy-content') ;
		}
		
		//ici peut être lancer le reload du where si il y a des fils
	};
		
	
	
}




/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
export class EndClassGroup extends GroupContenaire {

	constructor(parentCriteriaGroup, specProvider, settings) {
		super(
			"EndClassGroup",
			parentCriteriaGroup
		);

		this.specProvider = specProvider;
		this.settings = settings;
		// TODO : this is removing classes from GroupContainer
		this.cssClasses = {
			EndClassGroup : true ,
			Created : false
		}; 
		this.inputTypeComponent = new ClassTypeId(this, specProvider) ;
		this.inputTypeComponent.needBackArrow= true ;
		this.inputTypeComponent.needFrontArrow= true ;

		// contains the name of the SPARQL variable associated to this component
		this.varName = (this.parentCriteriaGroup.jsonQueryBranch)?this.parentCriteriaGroup.jsonQueryBranch.line.o:null;
		this.variableSelector = null ;

		this.init();
	}

	// triggered when the subject/domain is selected
	onStartClassGroupSelected() {
		$(this.html).find('.input-val').unbind('change');
		$(this.html).append('<div class="EditComponents ShowOnEdit"></div>');

		var unselect = $('<span class="unselect unselectEndClass"><i class="far fa-times-circle"></i></span>') ;
		this.selectViewVariable = $('<span class="selectViewVariable">'+UiuxConfig.ICON_NOT_SELECTED_VARIABLE+'</span>') ;
		$(this.html).append(unselect);
		$(this.html).append(this.selectViewVariable);


		//this.EndClassGroup.init() ;
		this.inputTypeComponent.init() ;
		this.inputTypeComponent.cssClasses.IsOnEdit = true;

		var select = $(this.html).find('select.input-val') ;
		select[0].sparnaturalSettings = this.settings ;
		
		this.niceslect = $(this.html).find('select.input-val').niceSelect()  ;
		if(this.inputTypeComponent.needTriggerClick == false) {
			$(this.html).find('.nice-select:not(.disabled)').trigger('click') ;
		}
		$(this.html).find('select.input-val').on('change', {arg1: this, arg2: 'onChange'}, SparnaturalComponents.eventProxiCriteria);
		$(this.html).find('span.unselectEndClass').on(
			'click',
			{arg1: this, arg2: 'onRemoveSelected'},
			SparnaturalComponents.eventProxiCriteria
		);
		$(this.html).find('span.selectViewVariable').on(
			'click',
			{arg1: this, arg2: 'onchangeViewVariable'},
			SparnaturalComponents.eventProxiCriteria
		);
		if(this.inputTypeComponent.needTriggerClick == true) {
			//$(this.html).find('.nice-select').trigger('click') ;
			$(this.html).find('select.input-val').trigger('change');
			this.inputTypeComponent.needTriggerClick = false ;
			//$(this.parentCriteriaGroup.thisForm.sparnatural).trigger( {type:"submit" } ) ;
		}
	}

	onchangeViewVariable() {
		if (this.variableSelector === null) {
			//Add varableSelector on variableSelector list ;
			this.variableSelector = new VariableSelector(this) ;
			$(this.selectViewVariable).html(UiuxConfig.ICON_SELECTED_VARIABLE) ;
			$(this.html).addClass('VariableSelected') ;
		} else {
			if (this.variableSelector.canRemove()) {
				this.variableSelector.remove() ;
				this.variableSelector = null ;
				$(this.selectViewVariable).html(UiuxConfig.ICON_NOT_SELECTED_VARIABLE) ;
				$(this.html).removeClass('VariableSelected') ;
			}
		}
		this.parentCriteriaGroup.thisForm_.sparnatural.variablesSelector.updateVariableList() ;
	}
	
	onChange() {
		this.value_selected = $(this.html).find('select.input-val').val() ;

		//Set the variable name for Sparql
		if(this.varName == null) {
			this.varName = "?"+localName(this.value_selected)+"_"+(this.parentCriteriaGroup.thisForm_.sparnatural.getMaxVarIndex()+1);
		}

		$(this.parentCriteriaGroup.EndClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update');
		
		//add varName on curent selection display
		this.onSelctValue() ;	
		
		if (this.specProvider.hasConnectedClasses(this.value_selected)) {
			$(this.parentCriteriaGroup.html).parent('li').removeClass('WhereImpossible') ;
		} else {
			$(this.parentCriteriaGroup.html).parent('li').addClass('WhereImpossible') ;
		}
		this.cssClasses.HasInputsCompleted = true ;
		this.cssClasses.IsOnEdit = false ;
		this.init() ;

		// show and init the property selection
		this.parentCriteriaGroup.ObjectPropertyGroup.cssClasses.Invisible = false;
		this.parentCriteriaGroup.ObjectPropertyGroup.init() ;
		// trigger the event that will call the ObjectPropertyGroup
		$(this.parentCriteriaGroup).trigger( {type:"EndClassGroupSelected" } ) ;

		var desc = this.specProvider.getTooltip(this.value_selected) ;
		if(desc) {
			$(this.parentCriteriaGroup.EndClassGroup.html).find('.ClassTypeId').attr('data-tippy-content', desc ) ;
			// tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
			var tippySettings = Object.assign({}, this.settings.tooltipConfig);
			tippySettings.placement = "top-start";
			tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', tippySettings);

		} else {
			$(this.parentCriteriaGroup.EndClassGroup.html).removeAttr('data-tippy-content') ;
		}
	};

	onRemoveSelected() {			
		$(this.parentCriteriaGroup.html).find('>.EndClassWidgetGroup .EndClassWidgetValue span.unselect').trigger('click') ;
		this.parentCriteriaGroup.ObjectPropertyGroup.cssClasses.Invisible = true ;
		this.parentCriteriaGroup.ObjectPropertyGroup.init() ;
		this.parentCriteriaGroup.ObjectPropertyGroup.onStartClassGroupSelected() ;
		$(this.parentCriteriaGroup.ComponentHtml).find('.childsList .ActionRemove a').trigger('click') ;
		this.value_selected = null;
		this.cssClasses.HasInputsCompleted = false ;
		this.cssClasses.IsOnEdit = true ;
		$(this.html).removeClass('VariableSelected') ;
		this.init() ;
		$(this.html).find('select.input-val').on('change', {arg1: this, arg2: 'onChange'}, SparnaturalComponents.eventProxiCriteria);
		$(this.html).find('.input-val').removeAttr('disabled').niceSelect('update');

		$(this.parentCriteriaGroup.html).parent('li').removeClass('WhereImpossible') ;
		this.parentCriteriaGroup.ActionsGroup.reinsert = true ;
		$(this.parentCriteriaGroup.ComponentHtml).removeClass('completed') ;
		var select = $(this.html).find('.ClassTypeId select.input-val') ;
		select[0].sparnaturalSettings = this.settings ;
		$(this.html).find('.ClassTypeId .nice-select').trigger('click') ;

		//Removote to Variable list
		if (this.variableSelector !== null) {
			this.variableSelector.remove() ;
			this.variableSelector = null ;
			$(this.selectViewVariable).html(UiuxConfig.ICON_NOT_SELECTED_VARIABLE) ;
		}

		//Reload options menu to wait objectProperty selection
		this.parentCriteriaGroup.OptionsGroup.reload() ;

		// clean the variable name so that it is regenerated when a new value is selected in the onChange
		this.varName = null;
	}

	getVarName() {
		return this.varName;
	}
} ;



/**
 * Selection of the start class in a criteria/line
 **/
export class OptionsGroup extends GroupContenaire {

	constructor(parentCriteriaGroup, specProvider) { 
		super(
			"OptionsGroup",
			parentCriteriaGroup
		);

		this.specProvider = specProvider;
		this.cssClasses.OptionsGroup = true ;
		this.cssClasses.Created = false ;
		this.valuesSelected = [] ;
		
		this.inputTypeComponent = new OptionTypeId(this, specProvider) ;

		this.init() ;
		$(this.html).append('<div class="EditComponents flexWrap">'+ '<div class="componentBackArrow">'+ UiuxConfig.COMPONENT_OPTION_ARROW_FRONT + '</div></div>');
	}

	reload() {
		if($(this.html).find('.EditComponents').first().hasClass('Enabled')) {
			$(this.html).removeClass('Opended') ;
			redrawBottomLink($(this.html).parents('li.groupe').first()) ;
		}
		$(this.html).find('.EditComponents').removeClass('Disabled') ;
		$(this.html).find('.EditComponents').removeClass('NoOptionEnabled') ;
		$(this.html).find('.EditComponents').removeClass('Enabled') ;
		$(this.html).find('.EditComponents').removeClass('ShowOnEdit') ;
		$(this.html).find('.EditComponents>div').first().unbind('click') ;
		$(this.html).find('.input-val input').unbind('click') ;
		$(this.html).find('.input-val label').unbind('click') ;
		// for re init all options menu and criteria conditional css if option is enbled
		this.onChange() ;
		$(this.html).find('.OptionTypeId').remove() ;
		this.inputTypeComponent = new OptionTypeId(this, this.specProvider) ;

		this.valuesSelected = [] ;
	}

	onObjectPropertyGroupSelected() {
		if($(this.html).find('div.ShowOnEdit').length == 0){
			$(this.html).find('div.EditComponents').addClass('ShowOnEdit');
			var parentOptionEnable = false ;
			$(this.html).parents('li.groupe').each(function(){
				if ($(this).hasClass('optionEnabled')) {
					parentOptionEnable = true ;
				}
			});

			if (
				parentOptionEnable
				||
				(
					!this.specProvider.isEnablingOptional(this.parentCriteriaGroup.ObjectPropertyGroup.value_selected)
					&&
					!this.specProvider.isEnablingNegation(this.parentCriteriaGroup.ObjectPropertyGroup.value_selected)
				)
			) {
				$(this.html).find('.EditComponents').addClass('Disabled') ;
				$(this.html).find('.EditComponents').removeClass('NoOptionEnabled') ;
				if (
					!this.specProvider.isEnablingOptional(this.parentCriteriaGroup.ObjectPropertyGroup.value_selected)
					&&
					!this.specProvider.isEnablingNegation(this.parentCriteriaGroup.ObjectPropertyGroup.value_selected)
				) {
					$(this.html).find('.EditComponents').addClass('NoOptionEnabled') ;
				}
			} else {
				$(this.html).find('.EditComponents').addClass('Enabled') ;
			}

			$(this.html).find('.EditComponents>div').first().on('click', function(e) {
				if($(e.target).parents('.EditComponents').first().hasClass('Enabled')) {
					$(e.target).parents('.OptionsGroup').first().toggleClass('Opended') ;
					redrawBottomLink($(e.target).parents('li.groupe').first()) ;
				}
			}) ;

			this.inputTypeComponent.init() ;
			this.inputTypeComponent.cssClasses.IsOnEdit = true;

			$(this.html).find('.input-val label').on('click', function(e) {
				$(e.target).parents('label').first().addClass('justClicked') ;
			});
			$(this.html).find('.input-val input').on('click', function(e) {
				e.stopPropagation();
			});
			$(this.html).find('.input-val label').on('click', {arg1: this, arg2: 'onChange'}, eventProxiCriteria);

			if(this.inputTypeComponent.needTriggerClick == true) {
				if (this.inputTypeComponent.default_value['optional']) {
					$(this.html).find('.input-val input[data-id="optional"]').parents('label').first().trigger('click') ;
				} else if (this.inputTypeComponent.default_value['notExists']) {
					$(this.html).find('.input-val input[data-id=notExists]').parents('label').first().trigger('click') ;
				}
				this.inputTypeComponent.needTriggerClick = false ;
			}
		}
	}

	// triggered when a criteria starts
	onCreated() {

	}

	onChange() {
		var optionsInputs = $(this.html).find('.input-val input').get() ;
		var optionSelected = false ;
		for (var item in  optionsInputs) {
			if ($(optionsInputs[item]).parents('label').first().hasClass("justClicked")) {
				if(this.valuesSelected[$(optionsInputs[item]).attr('data-id')] !== true) {
					this.valuesSelected[$(optionsInputs[item]).attr('data-id')]  = true ;
					$(optionsInputs[item]).parents('label').first().addClass('Enabled');
					optionSelected = true ;
					$(optionsInputs[item]).parents('li.groupe').first().addClass($(optionsInputs[item]).attr('data-id')+'-enabled') ;
				} else {
					this.valuesSelected[$(optionsInputs[item]).attr('data-id')]  = false ;
					$(optionsInputs[item]).parents('label').first().removeClass('Enabled');
					optionsInputs[item].checked = false; 
					$(optionsInputs[item]).parents('li.groupe').first().removeClass($(optionsInputs[item]).attr('data-id')+'-enabled') ;
				}					
			} else {					
				this.valuesSelected[$(optionsInputs[item]).attr('data-id')]  = false ;
				$(optionsInputs[item]).parents('label').first().removeClass('Enabled');
				$(optionsInputs[item]).parents('li.groupe').first().removeClass($(optionsInputs[item]).attr('data-id')+'-enabled') ;
			}
		}

		if (optionSelected == true ) {
			$(this.parentCriteriaGroup.html).parents('li').first().addClass('optionEnabled') ;
			$(this.parentCriteriaGroup.html).parents('li').first().parents('li.groupe').each(function() {
				$(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Disabled') ;
				$(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Enabled') ;
				$(this).find('>div>.OptionsGroup').first().removeClass('Opended') ;

			});
			$(this.parentCriteriaGroup.html).parents('li').first().find('li.groupe').each(function() {
				$(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Disabled') ;
				$(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Enabled') ;
				$(this).find('>div>.OptionsGroup').first().removeClass('Opended') ;
			});
			$('li.groupe').each(function() {
				redrawBottomLink($(this)) ;
			});

		} else {
			$(this.parentCriteriaGroup.html).parents('li').first().removeClass('optionEnabled') ;
			$(this.parentCriteriaGroup.html).parents('li').first().parents('li.groupe').each(function() {
				if ($(this).find('>div>.OptionsGroup label').length > 0) {
					$(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Enabled') ;
					$(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Disabled') ;
				}
			});
			$(this.parentCriteriaGroup.html).parents('li').first().find('li.groupe').each(function() {
				if ($(this).find('>div>.OptionsGroup label').length > 0) {
					$(this).find('>div>.OptionsGroup .EditComponents').first().addClass('Enabled') ;
					$(this).find('>div>.OptionsGroup .EditComponents').first().removeClass('Disabled') ;
				}
			});
		}

		// update the query
		$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( {type:"submit" } ) ;

		$(this.html).find('.input-val label').removeClass('justClicked') ;
	};

	setClass(value) {
		$(this.html).find('nice-select ul li[data-value="'+value+'"]').trigger('click');
	}
} 


/**
 * Handles the selection of a Class, either in the DOMAIN selection or the RANGE selection.
 * The DOMAIN selection happens only for the very first line/criteria.
 * Refactored to extract this from InputTypeComponent.
 **/
export class ClassTypeId extends HTMLComponent {

	constructor(parentComponent, specProvider) {
		super(
 			"ClassTypeId",
 			{
				Highlited : true ,
				Created : false,

			},
			parentComponent,
			false
 		);

		this.specProvider = specProvider;
		this.needTriggerClick = false ;
		this.cssClasses.flexWrap = true;
	}

	init() {
		
		//If Start Class 
		if (this.cssClasses.Created) {
			this.updateCssClasses() ;
			return true ;
		}
		var default_value_s = null ;
		var default_value_o = null ;
		
		if(this.parentComponent.parentCriteriaGroup.jsonQueryBranch) {
			var branch = this.parentComponent.parentCriteriaGroup.jsonQueryBranch
			default_value_s = branch.line.sType ;
			default_value_o = branch.line.oType ;
			this.needTriggerClick = true ;
			if (this.parentComponent.baseCssClass == "StartClassGroup") {
				this.parentComponent.variableNamePreload = branch.line.s;
			} else {
				this.parentComponent.variableNamePreload = branch.line.o;
			}
		}

		var selectHtml = null ;
		
		var id = this.parentComponent.parentCriteriaGroup.id ;
		var selectBuilder = new ClassSelectBuilder(this.specProvider);

		if (this.parentComponent.baseCssClass == "StartClassGroup") {
			
			var parentOrSibling = findParentOrSiblingCriteria(this.parentComponent.parentCriteriaGroup.thisForm_, id) ;
			if (parentOrSibling) {
				if (parentOrSibling.type == 'parent' ) {
					// if we are child in a WHERE relation, the selected class is the selected
					// class in the RANGE selection of the parent
					default_value_s = parentOrSibling.element.EndClassGroup.value_selected ;
				} else {
					// if we are sibling in a AND relation, the selected class is the selected
					// class in the DOMAIN selection of the sibling
					default_value_s = parentOrSibling.element.StartClassGroup.value_selected ;
				}
				this.cssClasses.Highlited = false ;
			} else {
				this.cssClasses.Highlited = true ;
			}
			
			this.id = 'a-'+id ;
			this.rowIndex = id;
			this.check
			
			selectHtml = selectBuilder.buildClassSelect(
				null,
				this.id,
				default_value_s
			);
		} 
		
		if (this.parentComponent.baseCssClass == "EndClassGroup") {
			this.id = 'b-'+id ;
			selectHtml = selectBuilder.buildClassSelect(
				this.parentComponent.parentCriteriaGroup.StartClassGroup.value_selected,
				this.id,
				default_value_o
			);
		}
		
		this.widgetHtml = selectHtml ;
		this.cssClasses.IsOnEdit = true ;
		this.initHtml() ;
		this.attachHtml() ;
		this.cssClasses.Created = true ;
	} ;	
	
	reload() {
		console.log("reload on ClassTypeId should probably never be called");
		this.init();
	} ;		
};


/**
 * Refactored to extract this from InputTypeComponent
 **/
export class ObjectPropertyTypeId extends HTMLComponent {

	constructor(parentComponent, specProvider) {
		super(
 			"ObjectPropertyTypeId",
 			{
				IsCompleted : false,
				IsOnEdit : false,
				Created : false
			},
			parentComponent,
			false
 		);

		this.specProvider = specProvider;
		this.needTriggerClick = false ;	
		this.cssClasses.flexWrap = true;
		this.needBackArrow= false ;
		this.needFrontArrow= true ;
	}

	init(reload = false) {
		var selectBuilder = new PropertySelectBuilder(this.specProvider);
		var default_value = null ;

		if(this.parentComponent.parentCriteriaGroup.jsonQueryBranch != null) {
			var default_value = this.parentComponent.parentCriteriaGroup.jsonQueryBranch.line.p ;
			this.needTriggerClick = true ;
		}

		this.widgetHtml = selectBuilder.buildPropertySelect(
			this.parentComponent.parentCriteriaGroup.StartClassGroup.value_selected,
			this.parentComponent.parentCriteriaGroup.EndClassGroup.value_selected,
			'c-'+this.parentComponent.parentCriteriaGroup.id,
			default_value
		) ;
		
		this.cssClasses.IsOnEdit = true ;
		this.initHtml() ;
		this.attachHtml() ;
		this.cssClasses.Created = true ;
	} ;	
	
	reload() {
		this.init(true);
	} ;

}



/**
 * 
 **/
 export class OptionTypeId extends HTMLComponent {

 	constructor(parentComponent, specProvider) {
 		super(
 			"OptionTypeId",
 			{
				Highlited : false ,
				Created : false
			},
			parentComponent,
			false
 		);

		this.specProvider = specProvider;
		this.needTriggerClick = false ;
		this.default_value = [];
		this.cssClasses.flexWrap = true;
 	}


	init() {	
		//If Start Class 
		if (this.cssClasses.Created) {
			this.updateCssClasses() ;
			return true ;
		}
		this.default_value['optional'] = false ;
		this.default_value['notexist'] = false ;
		
		if(this.parentComponent.parentCriteriaGroup.jsonQueryBranch) {
			var branch = this.parentComponent.parentCriteriaGroup.jsonQueryBranch
			this.default_value['optional'] = branch.optional ;
			this.default_value['notexist'] = branch.notExists ;
			this.needTriggerClick = true ;
		}

		var id = this.parentComponent.parentCriteriaGroup.id ;
		var selectBuilder = new OptionSelectBuilder(this.specProvider, this);

		this.id = 'option-'+id ;
		var selectHtml = selectBuilder.buildOptionSelect(
			this.parentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected,
			this.id,
			this.default_value
		);
		
		
		this.widgetHtml = selectHtml ;
		this.cssClasses.IsOnEdit = true ;
		this.initHtml() ;
		this.attachHtml() ;
		this.cssClasses.Created = true ;
	} ;	
	
	reload() {
		console.log("reload on OptionTypeId should probably never be called");
		this.init();
	} ;		
}

export class VariableSelector extends HTMLComponent {
	constructor(GroupContenaire) {
		super(
			"VariableSelector",
			GroupContenaire
		);
		this.GroupContenaire = GroupContenaire;
		this.specProvider = GroupContenaire.specProvider;
		this.globalVariablesSelctor = this.GroupContenaire.parentComponent.thisForm_.sparnatural.variablesSelector ;
		this.icon = this.GroupContenaire.specProvider.getIcon(GroupContenaire.value_selected) ;
		this.highlightedIcon = this.GroupContenaire.specProvider.getHighlightedIcon(GroupContenaire.value_selected) ;

		this.displayVariableList = this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList ;

		this.init();
	}

	//On init add varible to selected list
	init() {
		// highlighted icon defaults to icon
		if (!this.highlightedIcon || 0 === this.highlightedIcon.length) {
			this.highlightedIcon = this.icon ;
		}

		if (this.icon !== undefined) {
		if(this.icon.indexOf('<') == 0) {
			this.image = this.icon+"&nbsp;&nbsp;";
		} else {
			this.image = '<img src="'+this.icon+'" /><img class="highlited" src="'+this.highlightedIcon+'" />' ;   
		}
		}	else {
		this.image = "";
		}

		this.varLabel = localName(this.GroupContenaire.value_selected) ;
		this.varName = this.GroupContenaire.varName ;
		this.varNameForDisplay = this.varName.replace('?', '') ;
		this.labelDisplayed = '' ;

		if (this.globalVariablesSelctor.switchLabel == 'label') {
		this.labelDisplayed = this.image + '<div>'+this.varLabel+'</div>' ;
		} else {
		this.labelDisplayed = this.image + '<div>'+this.varNameForDisplay+'</div>' ;
		}

		this.element = '<div class="sortableItem"><div class="variableSelected flexWrap" data-variableName="'+this.varName+'" data-variableLabel="'+this.varLabel+'"><span class="variable-handle">'+ UiuxConfig.COMPONENT_DRAG_HANDLE + '</span>'+this.labelDisplayed+'</div></div>' ;

		$(this.globalVariablesSelctor.otherSelectHtml).append($(this.element)) ;

		//this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList.push(this.varName) ;
		if (this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList.length == 1) {
			var width = $('.sortableItem').first().width() ;
			$('.variablesOrdersSelect').width(width) ;
		}
		

		if (this.GroupContenaire instanceof StartClassGroup) {

		}
		if (this.GroupContenaire instanceof EndClassGroup) {

		}
		//$(this.GroupContenaire.parentComponent.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
	}

	remove () {
		var checkVarName = this.varName
		this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList = this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList.filter(function(value, index, arr){
			return value !== checkVarName;
		});
		$('[data-variableName="'+this.varName+'"]').parents('div.sortableItem').remove() ;
		//Any one can be the first in line, compute the width for first place
		var width = $('.sortableItem').first().width() ;
		$('.variablesOrdersSelect').width(width) ;

		//Si plus de valeur selectionnée on rajoute this
		if (this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList.length == 0) {
			$(this.GroupContenaire.parentComponent.thisForm_.sparnatural).find('.selectViewVariable').first().trigger('click') ;
		}

		$(this.GroupContenaire.parentComponent.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
		
	}

	canRemove() {
		if (this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList.length > 1) {
			return true ;
		}
		return false ;
	}

}


/**
 * Builds a selector for a class based on provided domainId, by reading the
 * configuration. If the given domainId is null, this means we populate the first
 * class selection (starting point) so reads all classes that are domains of any property.
 * 
 **/
class ClassSelectBuilder {
	constructor(specProvider) {
		this.specProvider = specProvider;
	}

	buildClassSelect(domainId, inputID, default_value) {
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
			//var selected = (default_value == val)?'selected="selected"':'';
			var desc = this.specProvider.getTooltip(val) ;
			var selected = (default_value == val)?' selected="selected"':'';
			var description_attr = '';
			if(desc) {
				description_attr = ' data-desc="'+desc+'"';
			} 
			list.push( '<option value="'+val+'" data-id="'+val+'"'+image+selected+' '+description_attr+'  >'+ label + '</option>' );
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
 * 
 **/
 class OptionSelectBuilder {
	
 	constructor(specProvider, OptionTypeId) {
 		this.specProvider = specProvider;
		this.OptionTypeId = OptionTypeId ;
 	}		

	buildOptionSelect(objectId, inputID, default_value) {			
		var items = [] ;
		if(this.specProvider.isEnablingOptional(objectId)) {
			items['optional'] = this.OptionTypeId.parentComponent.parentCriteriaGroup.thisForm_.langSearch.labelOptionOptional ;
		}
		
		if(this.specProvider.isEnablingNegation(objectId)) {
			items['notExists'] = this.OptionTypeId.parentComponent.parentCriteriaGroup.thisForm_.langSearch.labelOptionNotExists ;
		}

		var list = [] ;
		for (var key in items) {
			var label = items[key] ;
			var selected = (default_value[key] == label)?' checked="checked"':'';
			list.push( '<label class="flexWrap"><input type="radio" name="'+inputID+'" data-id="'+key+'"'+selected+' '+'  />' + '<div class="componentBackArrow">' + UiuxConfig.COMPONENT_ARROW_BACK + '</div><span>'+ label + '</span><div class="componentFrontArrow">' + UiuxConfig.COMPONENT_ARROW_FRONT + '</div></label>' );
		}

		var html_list = $( "<div/>", {
			"class": "optionsGroupe-list input-val flexWrap",
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
class PropertySelectBuilder {
	constructor(specProvider) {
		this.specProvider = specProvider;
	}

	buildPropertySelect(domainClassID, rangeClassID, inputID, default_value) {
		var list = [] ;
		var items = this.specProvider.getConnectingProperties(domainClassID,rangeClassID) ;
		
		for (var key in items) {
			var val = items[key];
			var label = this.specProvider.getLabel(val) ;
			var desc = this.specProvider.getTooltip(val) ;
			var selected = (default_value == val)?'selected="selected"':'';
			var description_attr = '';
			if(desc) {
				description_attr = ' data-desc="'+desc+'"';
			} 
			list.push( '<option value="'+val+'" data-id="'+val+'"'+selected+' '+description_attr+'  >'+ label + '</option>' );
		}

		var html_list = $( "<select/>", {
			"class": "select-list input-val",
			"id": inputID,
			html: list.join( "" )
		});
		return html_list ;
	}
}





/**
 * Utility function to find the criteria "above" a given criteria ID, being
 * either the "parent" in a WHERE criteria, or the "sibling"
 * in an AND criteria
 **/
export function findParentOrSiblingCriteria(thisForm_, id) {
	var dependant = null ;
	var dep_id = null ;
	var element = $(thisForm_.sparnatural).find('li[data-index="'+id+'"]') ;
	
	if ($(element).parents('li').length > 0) {			
		dep_id = $($(element).parents('li')[0]).attr('data-index') ;
		dependant = {type : 'parent'}  ;
	} else {
		if ($(element).prev().length > 0) {
			dep_id = $(element).prev().attr('data-index') ;
			dependant = {type : 'sibling'}  ;				
		}
	}

	$(thisForm_.sparnatural.components).each(function(index) {			
		if (this.index == dep_id) {
			dependant.element = this.CriteriaGroup ;
		}
	}) ;

	return dependant ;
}

export function eventProxiCriteria(e) {
	var arg1 = e.data.arg1;
	var arg2 = e.data.arg2;
	arg1[arg2](e) ;
}

export function localName(uri) {
	if (uri.indexOf("#") > -1) {
		return uri.split("#")[1] ;
	} else {
		var components = uri.split("/") ;
		return components[components.length - 1] ;
	}
}
export function redrawBottomLink(parentElementLi) {
	var n_width = 0;
	var ul = $(parentElementLi).children('ul').first() ;
	if (ul.length == 1) {
		n_width = n_width + getOffset( $(parentElementLi).find('>div>.EndClassGroup'), $(ul) ) - 111 + 15 + 11 + 20 + 5 + 3 ;
		var t_width = getOffset( $(parentElementLi).find('>div>.EndClassGroup'), $(ul) ) + 15 + 11 + 20 + 5  ;
		$(ul).find('>.lien-top').css('width', n_width) ;
		$(parentElementLi).find('>.link-where-bottom').css('left', t_width) ;
	}
}
export function getOffset( elem, elemParent ) {
	return elem.offset().left - $(elemParent).offset().left ;
}
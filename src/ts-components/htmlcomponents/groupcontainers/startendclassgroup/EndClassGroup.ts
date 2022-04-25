import ClassTypeId from "./ClassTypeId"
import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig"
import ISettings from "../../../../configs/client-configs/ISettings"
import GroupContenaire from "../GroupContenaire"
import { eventProxiCriteria, localName, } from "../../../globals/globalfunctions" 
import VariableSelector from "./VariableSelector"
import JsonLdSpecificationProvider from "../../../../JsonLdSpecificationProvider"
import { RDFSpecificationProvider } from "../../../../RDFSpecificationProvider"
import CriteriaGroup from "../CriteriaGroup"
import tippy from "tippy.js"
import IStartEndClassGroup from "./IStartEndClassGroup"

/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
 class EndClassGroup extends GroupContenaire implements IStartEndClassGroup  {
	varName:any //IMPORTANT varName is only present at EndClassGroup and StartClassGroup. Refactor on selectedValue method from upper class
	settings:ISettings
	variableSelector:any
    selectViewVariable:JQuery<HTMLElement>
	value_selected: any
	notSelectForview: boolean
	inputTypeComponent: ClassTypeId
	variableNamePreload: string
	variableViewPreload: string
	constructor(parentCriteriaGroup:CriteriaGroup, specProvider: JsonLdSpecificationProvider | RDFSpecificationProvider, settings: ISettings) {
		super(
			"EndClassGroup",
			parentCriteriaGroup,
            specProvider
		);
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

		//this.inputTypeComponent.cssClasses.IsOnEdit = true;
		
		$(this.html).find('select.input-val').niceSelect()  ;
		if(this.inputTypeComponent.needTriggerClick == false) {
			$(this.html).find('.nice-select:not(.disabled)').trigger('click') ;
		}
		$(this.html).find('select.input-val').on('change', {arg1: this, arg2: 'onChange'}, eventProxiCriteria);
		$(this.html).find('span.unselectEndClass').on(
			'click',
			{arg1: this, arg2: 'onRemoveSelected'},
			eventProxiCriteria
		);
		$(this.html).find('span.selectViewVariable').on(
			'click',
			{arg1: this, arg2: 'onchangeViewVariable'},
			eventProxiCriteria
		);
		if(this.inputTypeComponent.needTriggerClick == true) {
			// Ne pas selectionner pour les résultats si chargement en cours
			this.notSelectForview = true ;
			//$(this.html).find('.nice-select').trigger('click') ;
			$(this.html).find('select.input-val').trigger('change');
			this.inputTypeComponent.needTriggerClick = false ;
			this.notSelectForview = false ;
			//$(this.parentCriteriaGroup.thisForm.sparnatural).trigger( {type:"submit" } ) ;
		}
	}

	onchangeViewVariable() {
		if (this.variableSelector === null) {
			//Add varableSelector on variableSelector list ;
			this.variableSelector = new VariableSelector(this,this.specProvider) ;
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
		this.onSelectValue(this.varName) ;	
		
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
		$(this.parentCriteriaGroup).trigger( "EndClassGroupSelected" ) ;

		var desc = this.specProvider.getTooltip(this.value_selected) ;
		if(desc) {
			$(this.parentCriteriaGroup.EndClassGroup.html).find('.ClassTypeId').attr('data-tippy-content', desc ) ;
			// tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
			var tippySettings = Object.assign({}, this.settings?.tooltipConfig);
			tippySettings.placement = "top-start";
			tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', tippySettings);

		} else {
			$(this.parentCriteriaGroup.EndClassGroup.html).removeAttr('data-tippy-content') ;
		}
	};

	onRemoveSelected() {
		console.warn('endClassGroup.onRemoveSelected()')			
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
		$(this.html).find('select.input-val').on('change', {arg1: this, arg2: 'onChange'}, eventProxiCriteria);
		$(this.html).find('.input-val').removeAttr('disabled').niceSelect('update');

		$(this.parentCriteriaGroup.html).parent('li').removeClass('WhereImpossible') ;
		this.parentCriteriaGroup.ActionsGroup.reinsert = true ;
		$(this.parentCriteriaGroup.ComponentHtml).removeClass('completed') ;
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
export default EndClassGroup

import tippy from "tippy.js"
import JsonLdSpecificationProvider from "../../../../JsonLdSpecificationProvider"
import { RDFSpecificationProvider } from "../../../../RDFSpecificationProvider"
import { eventProxiCriteria, findParentOrSiblingCriteria } from "../../../../SparnaturalComponents"
import UiuxConfig from "../../../../UiuxConfig"
import ClassTypeId from "./ClassTypeId"
import VariableSelector from "./VariableSelector"
import ISettings from "../../../globals/ISettings"
import CriteriaGroup from "../CriteriaGroup"
import GroupContenaire from "../GroupContenaire"
import IStartEndClassGroup from "./IStartEndClassGroup"

 /**
 * Selection of the start class in a criteria/line
 **/
class StartClassGroup extends GroupContenaire implements IStartEndClassGroup { 
	varName:any
	settings:ISettings
	variableSelector:any
	selectViewVariable:JQuery<HTMLElement>
	notSelectForview: boolean
	value_selected:any
	inputTypeComponent: ClassTypeId
	variableViewPreload: string = ''
	variableNamePreload: string
 	constructor(parentCriteriaGroup:CriteriaGroup, specProvider: JsonLdSpecificationProvider | RDFSpecificationProvider, settings: ISettings) {
 		super(
			"StartClassGroup",
			parentCriteriaGroup,
			specProvider
		);
		this.settings = settings;
		this.cssClasses.StartClassGroup = true ;
		this.cssClasses.Created = false ;
		
		this.inputTypeComponent = new ClassTypeId(this, specProvider) ;
		this.inputTypeComponent.needFrontArrow= true ; // IMPORTANT FOUND IN HTMLCOMPONENT CLASS

		// contains the name of the SPARQL variable associated to this component
		this.varName = (this.parentCriteriaGroup.jsonQueryBranch)?this.parentCriteriaGroup.jsonQueryBranch.line.s:null;
		this.variableSelector = null ;

		this.notSelectForview = false ;

		//this.needFrontArrow= true ;
		//this.needBackArrow= true ;
		

		this.init();
	}


	// triggered when a criteria starts
	onCreated() {
		$(this.html).find('.input-val').unbind('change');
		this.inputTypeComponent.init() ; //ClassTypeId contains class html input val so init first then we can find it
		var select = $(this.html).find('.input-val')[0] ;
		select.setAttribute("sparnaturalSettings",JSON.stringify(this.settings)) ;
		$(select).niceSelect() ;

		
		$(this.html).find('select.input-val').on(
			'change',
			{arg1: this, arg2: 'onChange'},
			eventProxiCriteria
		);
		if(this.inputTypeComponent.needTriggerClick == true) {
			// Ne pas selectionner pour les résultats si chargement en cours
			this.notSelectForview = true ;
			$(this.html).find('select.input-val').trigger('change');
			this.inputTypeComponent.needTriggerClick = false ;
			this.notSelectForview = false ;
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
		
		//this.niceslect.niceSelect('update') ;
		this.value_selected = $(this.html).find('select.input-val').val() ;
		//Sets the SPARQL variable name if not initialized from loaded query
		var parentOrSibling = findParentOrSiblingCriteria(this.parentCriteriaGroup.thisForm_, this.parentCriteriaGroup.id) ;
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
			//Si une requete est en chargement pas d'obligation d'aficher la première variable
			if (!this.notSelectForview) { // Pas de requete à charger, oeil actif
				this.selectViewVariable = $('<span class="selectViewVariable">'+UiuxConfig.ICON_SELECTED_VARIABLE+'</span>') ;
				$(this.html).append(this.selectViewVariable) ;
				$(this.html).find('span.selectViewVariable').on(
					'click',
					{arg1: this, arg2: 'onchangeViewVariable'},
					eventProxiCriteria
				);
				//Add varableSelector on variableSelector list ;
				this.variableSelector = new VariableSelector(this,this.specProvider) ;
				$(this.html).addClass('VariableSelected') ;
			} else { //Pour le chargement d'une requête, par défaul l'oeil est barré.
				this.selectViewVariable = $('<span class="selectViewVariable">'+UiuxConfig.ICON_NOT_SELECTED_VARIABLE+'</span>') ;
				$(this.html).append(this.selectViewVariable) ;
				$(this.html).find('span.selectViewVariable').on(
					'click',
					{arg1: this, arg2: 'onchangeViewVariable'},
					eventProxiCriteria
				);
			}
		}

		$(this.parentCriteriaGroup.StartClassGroup.html).find('.input-val').attr('disabled', 'disabled').niceSelect('update'); 
		//add varName on curent selection display
		this.onSelectValue(this.varName) ;
		// trigger event on the whole line/criteria
		$(this.parentCriteriaGroup).trigger( "StartClassGroupSelected" ) ;

		if(this.settings.sendQueryOnFirstClassSelected) {
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( "submit" ) ;
		}

		var desc = this.specProvider.getTooltip(this.value_selected) ;
		if(desc) {
			$(this.parentCriteriaGroup.StartClassGroup.html).find('.ClassTypeId').attr('data-tippy-content', desc ) ;
			// tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
			var tippySettings = Object.assign({}, this.settings.tooltipConfig);
			tippySettings.placement = "top-start";
			tippy('.StartClassGroup .ClassTypeId[data-tippy-content]', tippySettings);
		} else {
			$(this.parentCriteriaGroup.StartClassGroup.html).removeAttr('data-tippy-content') ;
		}
	};
	/*
	setClass(value) {
		$(this.html).find('nice-select ul li[data-value="'+value+'"]').trigger('click');
	}*/ // IMPORTANT unecessary method?

	getVarName() {
		return this.varName;
	}
} 
export default StartClassGroup

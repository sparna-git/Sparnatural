import tippy from "tippy.js";
import JsonLdSpecificationProvider from "../../../JsonLdSpecificationProvider";
import { eventProxiCriteria } from "../../globals/globalfunctions";
import ObjectPropertyTypeId from "../ObjectPropertyTypeId";
import ISettings from "../../../configs/client-configs/ISettings";
import CriteriaGroup from "./CriteriaGroup";
import GroupContenaire from "./GroupContenaire";

/**
 * The property selection part of a criteria/line, encapsulating an ObjectPropertyTypeId
 **/
 class ObjectPropertyGroup extends GroupContenaire {
	temporaryLabel:string;
	settings:ISettings;
	objectPropertySelector:ObjectPropertyTypeId
	value_selected:any = null;
	constructor(parentCriteriaGroup:CriteriaGroup, specProvider:JsonLdSpecificationProvider, settings:ISettings, temporaryLabel:string) {
		super(
			"ObjectPropertyGroup",
			parentCriteriaGroup,
            specProvider
		);
		this.settings = settings;
		this.temporaryLabel = temporaryLabel;
		// TODO : this is removing CSS classes
		this.cssClasses = {
			ObjectPropertyGroup : true,
			Created : false
		} ;		

		this.objectPropertySelector = new ObjectPropertyTypeId(this, specProvider) ;

		this.init() ;

	}

	onStartClassGroupSelected() {
		this.html.append('<span class="current temporary-label">'+this.temporaryLabel+'</span>') ;
	}
	
	// triggered when a class is selected in the range
	onEndClassGroupSelected() {
		$(this.html).find('.temporary-label').remove() ;
		$(this.html).find('.input-val').unbind('change');
		
		if (!this.objectPropertySelector.cssClasses.Created) {
			this.objectPropertySelector.init() ;
			this.objectPropertySelector.cssClasses.IsOnEdit = true;
		} else {
			this.objectPropertySelector.reload() ;
			this.objectPropertySelector.cssClasses.IsOnEdit = true;
		}
		$(this.html).find('select.input-val').niceSelect()  ;
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
			eventProxiCriteria
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
		$(this.parentCriteriaGroup).trigger( "ObjectPropertyGroupSelected" ) ;
		if($(this.parentCriteriaGroup.html).parent('li').first().hasClass('completed'))	{
			$(this.parentCriteriaGroup.thisForm_.sparnatural).trigger( "submit" ) ;
		}
		

		// sets tooltip ready
		var desc = this.specProvider.getTooltip(this.value_selected) ;
		if(desc) {
			$(this.parentCriteriaGroup.ObjectPropertyGroup.html).find('.ObjectPropertyTypeId').attr('data-tippy-content', desc ) ;
			// tippy('.ObjectPropertyGroup .ObjectPropertyTypeId[data-tippy-content]', settings.tooltipConfig);
			var tippySettings = Object.assign({}, this.settings?.tooltipConfig);
			tippySettings.placement = "top-start";
			tippy('.ObjectPropertyGroup .ObjectPropertyTypeId[data-tippy-content]', tippySettings);
		} else {
			$(this.parentCriteriaGroup.ObjectPropertyGroup.html).removeAttr('data-tippy-content') ;
		}
		
		//ici peut être lancer le reload du where si il y a des fils
	};	
}
export default ObjectPropertyGroup

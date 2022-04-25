import ActionAnd from "./ActionAnd";
import ActionRemove from "./ActionRemove";
import ActionWhere from "./ActionWhere";
import CriteriaGroup from "../groupcontainers/CriteriaGroup";
import ISettings from "../../../configs/client-configs/ISettings";
import GroupContenaire from "../groupcontainers/GroupContenaire";
import JsonLdSpecificationProvider from "../../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../../RDFSpecificationProvider";
import { eventProxiCriteria } from "../../globals/globalfunctions";
import { addComponent, initGeneralEvent } from "../../globals/globalfunctions";


/**
 	Groups all the actions on a line/criteria (AND / REMOVE / WHERE)
	even if they are visually not connected. ActionWhere for example is rendered under EndClassGroup -> EditComponent -> ActionWhere
 **/
class ActionsGroup extends GroupContenaire {
    actions: {ActionWhere:ActionWhere,
        ActionAnd:ActionAnd,
        ActionRemove:ActionRemove};
    settings:ISettings
    constructor(parentCriteriaGroup:CriteriaGroup, specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider, settings:ISettings){
        super("ActionsGroup",parentCriteriaGroup, specProvider)
        this.cssClasses = {
            ActionsGroup: true,
            Created : false
        }
        this.actions =  { 
            ActionWhere: new ActionWhere(this, specProvider,settings),
            ActionAnd: new ActionAnd(this,settings,specProvider),
            ActionRemove: new ActionRemove(this,specProvider)
        } ;

        this.settings = settings
        this.init()
    }
    onCreated() {
		
		this.#attachActionRemoveButtonToCriteriaGroup()

        if(this.parentCriteriaGroup.jsonQueryBranch != null) {
            var branch = this.parentCriteriaGroup.jsonQueryBranch;
            if(branch.children.length > 0) {
                $(this.actions.ActionWhere.html).find('a').trigger('click') ;
            }
            if(branch.nextSibling != null) {
                $(this.actions.ActionAnd.html).find('a').trigger('click') ;
            }
        }
    }

	/*
		Create the ActionRemove button which deletes a row when clicked. 
		Add this Button to the CriteriaGroup e.g row 
		TODO: Refactor to ActionRemove class. ActionRemove class should get render() method
	*/
	#attachActionRemoveButtonToCriteriaGroup(){
        this.actions.ActionRemove.initHtml()
		//this.actions.ActionRemove.attachComponentHtml()
		this.actions.ActionRemove.attachHtml()
		// when click then remove row
        $(this.actions.ActionRemove.html).find('a').on(
            'click',
            {
                arg1: this.parentCriteriaGroup,
                arg2: 'onRemoveCriteria'
            },
            eventProxiCriteria
        );
	}

    onObjectPropertyGroupSelected() {
		this.#renderActionAnd()
		this.#renderActionWhere()
        
        initGeneralEvent(this,this.parentCriteriaGroup.thisForm_);
    }
	/*
		Create the ActionAnd button which adds another row. 
		TODO: Refactor to ActionAnd class. ActionRemove class should get render() method
	*/
	#renderActionAnd(){
		
		this.actions.ActionAnd.render()
        $(this.actions.ActionAnd.html).find('a').on(
            'click',
            {
                arg1: this,
                arg2: 'onAddAnd'
            },
            eventProxiCriteria
        );
		
	}
	/*
		Create the ActionWhere button which opens another where row
		TODO: Refactor to ActionAnd class. ActionRemove class should get render() method
	*/
	#renderActionWhere(){
		this.actions.ActionWhere.render()
		$(this.actions.ActionWhere.html).find('a').on(
			'click', 
			{
				arg1: this,
				arg2: 'onAddWhere'
			},
			eventProxiCriteria
		);
	}

	// This code should probably be in a higher located component such as criteria group or even higher(might need to introduce one)
    onAddWhere() {
		console.warn("ActionsGroup.onAddWhere()")	
        this.parentCriteriaGroup.html.parent('li').addClass('haveWhereChild') ;
        this.parentCriteriaGroup.initCompleted() ;
        
        var new_component = addComponent.call(this,
            this.parentCriteriaGroup.thisForm_,
            this.parentCriteriaGroup.ComponentHtml,
            (this.parentCriteriaGroup.jsonQueryBranch && this.parentCriteriaGroup.jsonQueryBranch.children && this.parentCriteriaGroup.jsonQueryBranch.children.length > 0)?this.parentCriteriaGroup.jsonQueryBranch.children[0]:null
        ) ;
        
        // trigger 2 clicks to select the same class as the object class (?)
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
    }
    onAddAnd(){
		console.warn("ActionsGroup.onAddWhere()")
        var new_component = addComponent.call(this,
            this.parentCriteriaGroup.thisForm_,
            this.parentCriteriaGroup.AncestorComponentHtml,
            (this.parentCriteriaGroup.jsonQueryBranch)?this.parentCriteriaGroup.jsonQueryBranch.nextSibling:null
        ) ;
        
        // trigger 2 clicks to select the same class as the current criteria (?)
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;
        $(new_component).find('.StartClassGroup .nice-select:not(.disabled)').trigger('click') ;

        return false ;			
    }
}
export default ActionsGroup
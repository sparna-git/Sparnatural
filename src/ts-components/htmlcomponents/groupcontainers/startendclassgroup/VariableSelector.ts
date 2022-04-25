import { eventProxiCriteria, localName, redrawBottomLink } from "../../../globals/globalfunctions";
import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import CriteriaGroup from "../CriteriaGroup";
import EndClassGroup from "./EndClassGroup";
import StartClassGroup from "./StartClassGroup";
import HTMLComponent from "../../HtmlComponent";
import ISpecProvider from "../../../../spec-providers/ISpecProviders";

class VariableSelector extends HTMLComponent {
    displayVariableList: any;
    globalVariablesSelctor: any;
    icon: any;
    highlightedIcon: any;
    element: JQuery<HTMLElement>;
    contentEditableElement: JQuery<HTMLElement>;
    currentValue: string;
    parentVarName:any
    GrandParent:CriteriaGroup
	varLabel:string
	constructor(ParentComponent:StartClassGroup | EndClassGroup,specProvider:ISpecProvider) {
		super(
			"VariableSelector",
			ParentComponent,
			specProvider,
            null            
		);
        this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup // IMPORTANT : Dangerous cast?
        this.parentVarName = ParentComponent.varName
		this.ParentComponent = ParentComponent;
		this.globalVariablesSelctor = this.GrandParent.thisForm_.sparnatural.variablesSelector ;
		this.icon = specProvider.getIcon(ParentComponent.value_selected) ;
		this.highlightedIcon = specProvider.getHighlightedIcon(ParentComponent.value_selected) ;
		this.varLabel = localName(ParentComponent.value_selected) ;
		this.displayVariableList = this.GrandParent.thisForm_.queryOptions.displayVariableList ;

		this.init();
	}

	//On init add varible to selected list
	init() {
		// highlighted icon defaults to icon
		if (!this.highlightedIcon || 0 === this.highlightedIcon.length) {
			this.highlightedIcon = this.icon ;
		}
        let image = ""
		if (this.icon !== undefined) {
			if(this.icon.indexOf('<') == 0) {
				image = this.icon+"&nbsp;&nbsp;";
			} else {
				image = '<img src="'+this.icon+'" /><img class="highlited" src="'+this.highlightedIcon+'" />' ;   
			}
		}

		
		let varName = this.parentVarName ;
		let varNameForDisplay = varName.replace('?', '') ;
		let labelDisplayed = '' ;

		if (this.globalVariablesSelctor.switchLabel == 'label') {
			labelDisplayed = image + '<div id="editable-'+varName+'"><div contenteditable="true">'+this.varLabel+'</div></div>' ;
		} else {
			labelDisplayed = image + '<div id="editable-'+varName+'"><div contenteditable="true">'+varNameForDisplay+'</div></div>' ;
		}

		this.element = $('<div class="sortableItem"><div class="variableSelected flexWrap" data-variableName="'+varName+'" data-variableLabel="'+this.varLabel+'"><span class="variable-handle">'+ UiuxConfig.COMPONENT_DRAG_HANDLE + '</span>'+labelDisplayed+'</div></div>') ;

		

		//trigger change editable variable
		this.contentEditableElement = $(this.element).find('div[contenteditable="true"]').first() ;

		this.contentEditableElement.on('focus',{arg1: this, arg2: 'onFocusEdit'}, eventProxiCriteria);
		this.contentEditableElement.on('focusout',{arg1: this, arg2: 'onFocusOutEdit'}, eventProxiCriteria);

		
		$(this.globalVariablesSelctor.otherSelectHtml).append(this.element) ;

		this.contentEditableElement.on('keypress',{arg1: this, arg2: 'onEditKeyPress'}, eventProxiCriteria);

		this.contentEditableElement.on('keyup', function(event: any) {
			var width = $('.sortableItem').first().width() ;
			$('.variablesOrdersSelect').width(width) ;
	 	});

		//this.GroupContenaire.parentComponent.thisForm_.queryOptions.displayVariableList.push(this.varName) ;
		if (this.GrandParent.thisForm_.queryOptions.displayVariableList.length == 1) {
			var width = $('.sortableItem').first().width() ;
			$('.variablesOrdersSelect').width(width) ;
		}
		

		if (this.ParentComponent instanceof StartClassGroup) {

		}
		if (this.ParentComponent instanceof EndClassGroup) {

		}
		//$(this.GroupContenaire.parentComponent.thisForm_.sparnatural).trigger( {type:"submit" } ) ;
	}

	onFocusEdit() {
		this.currentValue = $(this.contentEditableElement).text() ;
		var width = $('.sortableItem').first().width() ;
		$('.variablesOrdersSelect').width(width) ;
	}

	onFocusOutEdit() {

		var newValue = $(this.contentEditableElement).text();
		if (newValue == '') {
			$(this.contentEditableElement).text(this.currentValue) ;
		}

		if (this.currentValue !== newValue) {
			this.currentValue = newValue;
			$(this.contentEditableElement).trigger('change');
			$(this.contentEditableElement).parents('.variableSelected').attr('data-variableName', '?'+this.currentValue);
			$(this.ParentComponent.html).find('.variableName').first().text(this.currentValue) ;

			//Set variable name for childs criteria
			var curent_value = this.currentValue ;
			let childs_index:Array<string> = []
			//Set variable neme displayed for childs
			$(this.ParentComponent.html).parents('.haveWhereChild').first().find('.childsList>li>.CriteriaGroup>.StartClassGroup').each(function(index) {
				childs_index[index] = $(this).parents('li').first().attr('data-index') ;
				$(this).find('.variableName').first().text(curent_value) ;
			});
			// If is startClassGroup, update siblings. (normaly is root)
			if (this.ParentComponent instanceof StartClassGroup) {
				$(this.ParentComponent.html).parents('ul').first().find('>li>.CriteriaGroup>.StartClassGroup').each(function(index) {
					if (index != 0) {
						childs_index[index] = $(this).parents('li').first().attr('data-index') ;
						$(this).find('.variableName').first().text(curent_value) ;
					}
				});
			}

			//Set varialbeles names on components list for StartClassGroup childs
            childs_index.forEach(child =>{
                for (var componentKey in this.GrandParent.thisForm_.sparnatural.components) {
					if(this.GrandParent.thisForm_.sparnatural.components[componentKey].index == child) {
						this.GrandParent.thisForm_.sparnatural.components[componentKey].CriteriaGroup.StartClassGroup.varName = '?'+this.currentValue ;
					}
				}
            });

			//Set variable name used on query for criteria
			this.parentVarName = '?'+this.currentValue ;
			//Updates the variables in the generated query based on HTML variable line
			this.GrandParent.thisForm_.sparnatural.variablesSelector.updateVariableList() ;
			//Variable name blocks whidth can be change, redraw lines links
			redrawBottomLink($(this.GrandParent.html).parents('li').first());
			$(this.GrandParent.thisForm_.sparnatural).trigger( "submit" ) ;
		}
		var width = $('.sortableItem').first().width() ;
		$('.variablesOrdersSelect').width(width) ;
	}

	onEditKeyPress(event: { keyCode?: any; which?: number; charCode: number; preventDefault: () => void; }) {
		var code = event.keyCode ? event.keyCode : event.which;
		if (code === 13) { // If press Enter
			this.contentEditableElement.blur() ;		
			return false;
		}

		// check if string is allowed as a SPARQL variable name
		var regex = new RegExp("^[a-zA-Z0-9_]+$");
		var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
		if (!regex.test(key)) {
		   event.preventDefault();
		   return false;
		}
	 }

	remove () {
		var checkVarName = this.parentVarName;
		this.GrandParent.thisForm_.queryOptions.displayVariableList = this.GrandParent.thisForm_.queryOptions.displayVariableList.filter(function(value: any, index: any, arr: any){
			return value !== checkVarName;
		});
		this.element.remove() ;
		//Any one can be the first in line, compute the width for first place
		var width = $('.sortableItem').first().width() ;
		$('.variablesOrdersSelect').width(width) ;

		// If no value selected, then select "this"
		if (this.GrandParent.thisForm_.queryOptions.displayVariableList.length == 0) {
			$(this.GrandParent.thisForm_.sparnatural).find('.selectViewVariable').first().trigger('click') ;
		}
		
		$(this.GrandParent.thisForm_.sparnatural).trigger( "submit" ) ;	
	}

	canRemove() {
		// returns true if more than one
		return (this.GrandParent.thisForm_.queryOptions.displayVariableList.length > 1);
	}
}

export default VariableSelector
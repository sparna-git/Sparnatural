import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider";
import ClassTypeId from "../htmlcomponents/ClassTypeId";
import HTMLComponent from "../htmlcomponents/HtmlComponent";
import OptionTypeId from "../htmlcomponents/OptionTypeId";

class GroupContenaire extends HTMLComponent {
	parentCriteriaGroup: GroupContenaire
	inputTypeComponent: ObjectPropertyTypeWidget | ClassTypeId | OptionTypeId
	value_selected:any
	variableNamePreload:any
	constructor(baseCssClass: any, parentComponent: any, specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider) {
		super(
 			baseCssClass,
 			{
				HasInputsCompleted : false,
				IsOnEdit : false,
				Invisible: false
			},
			parentComponent,
			null,
			specProvider
 		);
		this.parentCriteriaGroup = parentComponent; // IMPORTANT ParentComponent the same as parentCritiriaGroup?
		this.inputTypeComponent = null ;

		// TODO : to be removed from here
		this.value_selected = null ;
		this.variableNamePreload = null ;
	}		

	
	init() {
		console.log("init called with:")
		console.log(this.baseCssClass)
		if (!this.cssClasses.Created) {			
			this.cssClasses.IsOnEdit = true ;
			this.initHtml() ;
			this.attachHtml() ;
			this.cssClasses.Created = true ;				
		} else {
			this.updateCssClasses() ;
		}
	} ;

	onSelectValue(varName:any) {
		var current = $(this.html).find('.nice-select .current').first() ;
		var varNameForDisplay = '<span class="variableName">'+varName.replace('?', '')+'</span>' ;
		$(varNameForDisplay).insertAfter($(current).find('.label').first()) ;

	}
} 
export default GroupContenaire
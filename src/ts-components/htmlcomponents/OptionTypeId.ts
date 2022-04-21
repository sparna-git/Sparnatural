import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider";
import { UiuxConfig } from "../../UiuxConfig";
import GroupContenaire from "../groupcontainers/GroupContenaire";
import HTMLComponent from "./HtmlComponent";

/**
 * 
 **/
class OptionTypeId extends HTMLComponent {
	needTriggerClick:boolean
	default_value: {optional?: boolean, notExists?:boolean}
 	constructor(parentComponent:GroupContenaire, specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider) {
 		super(
 			"OptionTypeId",
 			{
				Highlited : false ,
				Created : false,
                flexWrap: true
			},
			parentComponent,
			null,
            specProvider
 		);

		this.needTriggerClick = false ;
		this.default_value = {optional: false, notExists: false};
 	}


	init() {	
		//If Start Class 
		if (this.cssClasses.Created) {
			this.updateCssClasses() ;
			return true ;
		}
		this.default_value['optional'] = false ;
		this.default_value['notExists'] = false ;
		
		if(this.ParentComponent.parentCriteriaGroup.jsonQueryBranch) {
			var branch = this.ParentComponent.parentCriteriaGroup.jsonQueryBranch
			this.default_value['optional'] = branch.optional ;
			this.default_value['notExists'] = branch.notExists ;
			this.needTriggerClick = true ;
		}

		var id = this.ParentComponent.parentCriteriaGroup.id ;
		var selectBuilder = new OptionSelectBuilder(this.specProvider, this);

		id = 'option-'+id ;
		var selectHtml = selectBuilder.buildOptionSelect(
			this.ParentComponent.parentCriteriaGroup.ObjectPropertyGroup.value_selected,
			id,
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
export default OptionTypeId

/**
 * 
 **/
 class OptionSelectBuilder {
	specProvider: any
	OptionTypeId: any
 	constructor(specProvider: any, OptionTypeId: any) {
 		this.specProvider = specProvider;
		this.OptionTypeId = OptionTypeId ;
 	}		

	buildOptionSelect(objectId: any, inputID: string, default_value: { [x: string]: any; optional?: boolean; notExists?: boolean; }) {			
		let items:{optional?:string, notExists?:string} ;
		if(this.specProvider.isEnablingOptional(objectId)) {
			items['optional'] = this.OptionTypeId.parentComponent.parentCriteriaGroup.thisForm_.langSearch.labelOptionOptional ;
		}
		
		if(this.specProvider.isEnablingNegation(objectId)) {
			items['notExists'] = this.OptionTypeId.parentComponent.parentCriteriaGroup.thisForm_.langSearch.labelOptionNotExists ;
		}

		var list = [] ;
		for (const [key, value] of Object.entries(items)) {
			let label = value;
			let selected = (default_value[key]?' checked="checked"':'')
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
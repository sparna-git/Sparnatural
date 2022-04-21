import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider";
import GroupContenaire from "../groupcontainers/GroupContenaire";
import HTMLComponent from "./HtmlComponent";


/**
 * Refactored to extract this from InputTypeComponent
 **/
class ObjectPropertyTypeId extends HTMLComponent {
	needTriggerClick:boolean
	constructor(parentComponent:GroupContenaire, specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider) {
		super(
 			"ObjectPropertyTypeId",
 			{
				IsCompleted : false,
				IsOnEdit : false,
				Created : false,
				flexWrap : true
			},
			parentComponent,
			null,
            specProvider
 		);

		this.needTriggerClick = false ;	
		this.needBackArrow= false ;
		this.needFrontArrow= true ;
	}

	init() {
		var selectBuilder = new PropertySelectBuilder(this.specProvider);
		var default_value = null ;

		if(this.ParentComponent.parentCriteriaGroup.jsonQueryBranch != null) {
			var default_value = this.ParentComponent.parentCriteriaGroup.jsonQueryBranch.line.p ;
			this.needTriggerClick = true ;
		}

		this.widgetHtml = selectBuilder.buildPropertySelect(
			this.ParentComponent.parentCriteriaGroup.StartClassGroup.value_selected,
			this.ParentComponent.parentCriteriaGroup.EndClassGroup.value_selected,
			'c-'+this.ParentComponent.parentCriteriaGroup.id,
			default_value
		) ;
		
		this.cssClasses.IsOnEdit = true ;
		this.initHtml() ;
		this.attachHtml() ;
		this.cssClasses.Created = true ;
	} ;	
	
	reload() {
		this.init();
	} ;

}
export default ObjectPropertyTypeId


/**
 * Builds a selector for property based on provided domain and range, by reading the
 * configuration.
 **/
 class PropertySelectBuilder {
    specProvider:any
	constructor(specProvider:any) {
		this.specProvider = specProvider;
	}

	buildPropertySelect(domainClassID: any, rangeClassID: any, inputID: string, default_value: any) {
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

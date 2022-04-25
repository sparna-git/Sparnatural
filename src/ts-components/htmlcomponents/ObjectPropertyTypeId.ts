import ISpecProvider from "../../spec-providers/ISpecProviders";
import CriteriaGroup from "./groupcontainers/CriteriaGroup";
import HTMLComponent from "./HtmlComponent";


/**
 * Refactored to extract this from InputTypeComponent
 **/
class ObjectPropertyTypeId extends HTMLComponent {
	needTriggerClick:boolean
	GrandParent:CriteriaGroup
	constructor(ParentComponent:HTMLComponent, specProvider:ISpecProvider) {
		super(
 			"ObjectPropertyTypeId",
			ParentComponent,
            specProvider,
			null
 		);
		this.cssClasses.flexWrap = true;
		this.needTriggerClick = false ;	
		this.needBackArrow= false ;
		this.needFrontArrow= true ;
		this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup
	}

	render() {
		var selectBuilder = new PropertySelectBuilder(this.specProvider);
		var default_value = null ;

		if(this.GrandParent.jsonQueryBranch != null) {
			var default_value = this.GrandParent.jsonQueryBranch.line.p ;
			this.needTriggerClick = true ;
		}

		this.widgetHtml = selectBuilder.buildPropertySelect(
			this.GrandParent.StartClassGroup.value_selected,
			this.GrandParent.EndClassGroup.value_selected,
			'c-'+this.GrandParent.id,
			default_value
		) ;
		
		this.init()
	} ;	
	
	reload() {
		this.render(); // IMPORTANT  is this right? or should it be this.init()? to only update css classes
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

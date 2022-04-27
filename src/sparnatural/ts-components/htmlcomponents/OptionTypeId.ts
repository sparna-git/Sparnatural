import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import CriteriaGroup from "./CriteriaGroup";
import HTMLComponent from "./HtmlComponent";

/**
 * 
 **/
class OptionTypeId extends HTMLComponent {
	needTriggerClick:boolean
	default_value: {optional?: boolean, notExists?:boolean}
	GrandParent: CriteriaGroup
 	constructor(ParentComponent:HTMLComponent, specProvider:ISpecProvider) {
 		super(
 			"OptionTypeId",
			ParentComponent,
            specProvider,
            null,
 		);
		 this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup

		this.needTriggerClick = false ;
		this.default_value = {optional: false, notExists: false};
 	}


	render() {	
		//Test if this ever happens
		if(this.cssClasses.Created){
			console.warn("this should not have happened")
		}
		/* Original Code
		if (this.cssClasses.Created) {
			this.updateCssClasses() ;
			return true ;
		}
		*/
		this.default_value['optional'] = false ;
		this.default_value['notExists'] = false ;
		
		if(this.GrandParent.jsonQueryBranch) {
			var branch = this.GrandParent.jsonQueryBranch
			this.default_value['optional'] = branch.optional ;
			this.default_value['notExists'] = branch.notExists ;
			this.needTriggerClick = true ;
		}

		var id = this.GrandParent.id ;
		var selectBuilder = new OptionSelectBuilder(this.specProvider, this);

		id = 'option-'+id ;
		var selectHtml = selectBuilder.buildOptionSelect(
			this.GrandParent.ObjectPropertyGroup.value_selected,
			id,
			this.default_value
		);
		
		
		this.widgetHtml = selectHtml ;
		this.init()
	} ;	
	
	reload() {
		console.warn("optiontypeid reload called")
		this.render();
	} ;		
}
export default OptionTypeId

/**
 * 
 **/
 class OptionSelectBuilder {
	specProvider: ISpecProvider
	OptionTypeId: any
 	constructor(specProvider:ISpecProvider, OptionTypeId: any) {
 		this.specProvider = specProvider;
		this.OptionTypeId = OptionTypeId ;
 	}		

	buildOptionSelect(objectId: any, inputID: string, default_value: { [x: string]: any; optional?: boolean; notExists?: boolean; }) {			
		let items:{optional?:string, notExists?:string} = {} ;
		if(this.specProvider.isEnablingOptional(objectId)) {
			items.optional = this.OptionTypeId.GrandParent.thisForm_.langSearch.labelOptionOptional ;
		}
		
		if(this.specProvider.isEnablingNegation(objectId)) {
			items.notExists = this.OptionTypeId.GrandParent.thisForm_.langSearch.labelOptionNotExists ;
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
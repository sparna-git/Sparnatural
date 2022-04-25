import { findParentOrSiblingCriteria } from "../../../globals/globalfunctions";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";
import ISpecProvider from "../../../../spec-providers/ISpecProviders";
import StartClassGroup from "./StartClassGroup";
import EndClassGroup from "./EndClassGroup";

/**
 * Handles the selection of a Class, either in the DOMAIN selection or the RANGE selection.
 * The DOMAIN selection happens only for the very first line/criteria.
 * Refactored to extract this from InputTypeComponent.
 **/
class ClassTypeId extends HTMLComponent {
	needTriggerClick:any
	GrandParent:CriteriaGroup
	constructor(ParentComponent:HTMLComponent, specProvider:ISpecProvider) {
		super(
 			"ClassTypeId",
			ParentComponent,
			specProvider,
			null
 		);
		this.cssClasses.Highlited = true,
		this.cssClasses.flexWrap = true,
		this.needTriggerClick = false ;
		this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup
	}

	render() {
		console.log("classtypeid render()")
		if(this.cssClasses.Created){
			console.log("CHECK here. Didn't think that would happen")
		}
		
		/* Original code
		if (this.cssClasses.Created) {
			this.updateCssClasses() ;
			return true ;
		}
		*/

		var default_value_s = null ;
		var default_value_o = null ;
		
		if(this.GrandParent.jsonQueryBranch) {
			var branch = this.GrandParent.jsonQueryBranch
			default_value_s = branch.line.sType ;
			default_value_o = branch.line.oType ;
			this.needTriggerClick = true ;
			if (isStartClassGroup(this.ParentComponent)) {
				this.ParentComponent.variableNamePreload = branch.line.s;
				this.ParentComponent.variableViewPreload = branch.line.sSelected ;

			} 
			if(isEndClassGroup(this.ParentComponent)) {
				this.ParentComponent.variableNamePreload = branch.line.o;
				this.ParentComponent.variableViewPreload = branch.line.oSelected ;
			}
		}

		var selectHtml = null ;
		
		var id = this.GrandParent.id ;
		var selectBuilder = new ClassSelectBuilder(this.specProvider);

		if (isStartClassGroup(this.ParentComponent)) {
			var parentOrSibling = findParentOrSiblingCriteria.call(this,this.GrandParent.thisForm_, id) ;
			if (parentOrSibling.type) {
				if (parentOrSibling.type == 'parent' ) {
					// if we are child in a WHERE relation, the selected class is the selected
					// class in the RANGE selection of the parent
					default_value_s = parentOrSibling.element.EndClassGroup.value_selected ;
				} else {
					// if we are sibling in a AND relation, the selected class is the selected
					// class in the DOMAIN selection of the sibling
					default_value_s = parentOrSibling.element.StartClassGroup.value_selected ;
				}
				this.cssClasses.Highlited = false ;
			} else {
				this.cssClasses.Highlited = true ;
			}
			
			id = 'a-'+id ;
			selectHtml = selectBuilder.buildClassSelect(
				null,
				id,
				default_value_s
			);
		} 
		
		if (isEndClassGroup(this.ParentComponent)) {
			id = 'b-'+id ;
			selectHtml = selectBuilder.buildClassSelect(
				this.GrandParent.StartClassGroup.value_selected,
				id,
				default_value_o
			);
		}
		this.widgetHtml = selectHtml ;
		this.init()
	} ;	
	
	reload() {
		console.log("reload on ClassTypeId should probably never be called");
		this.reload();
	} ;		
};
export default ClassTypeId

/**
 * Builds a selector for a class based on provided domainId, by reading the
 * configuration. If the given domainId is null, this means we populate the first
 * class selection (starting point) so reads all classes that are domains of any property.
 * 
 **/
 class ClassSelectBuilder {
	specProvider:any
	constructor(specProvider:any) {
		this.specProvider = specProvider;
	}

	buildClassSelect(domainId: any, inputID: string, default_value: any) {
		var list = [] ;
		var items = [] ;

		if(domainId === null) {
			// if we are on the first class selection
		 	items = this.specProvider.getClassesInDomainOfAnyProperty() ;
		} else {
			items = this.specProvider.getConnectedClasses(domainId) ;
		}

		for (var key in items) {
			var val = items[key];
			var label = this.specProvider.getLabel(val) ;
			var icon = this.specProvider.getIcon(val) ;
			var highlightedIcon = this.specProvider.getHighlightedIcon(val) ;

			// highlighted icon defaults to icon
			if (!highlightedIcon || 0 === highlightedIcon.length) {
				highlightedIcon = icon ;
			}
			
			var image = (icon != null)?' data-icon="' + icon + '" data-iconh="' + highlightedIcon + '"':'' ;
			//var selected = (default_value == val)?'selected="selected"':'';
			var desc = this.specProvider.getTooltip(val) ;
			var selected = (default_value == val)?' selected="selected"':'';
			var description_attr = '';
			if(desc) {
				description_attr = ' data-desc="'+desc+'"';
			} 
			list.push( '<option value="'+val+'" data-id="'+val+'"'+image+selected+' '+description_attr+'  >'+ label + '</option>' );
		}

		var html_list = $( "<select/>", {
			"class": "my-new-list input-val",
			"id": 'select-'+inputID,
			html: list.join( "" )
		  });

		return html_list ;
	}
}


function isStartClassGroup(ParentComponent: HTMLComponent ): ParentComponent is StartClassGroup {
	return (ParentComponent as unknown as StartClassGroup).baseCssClass === "StartClassGroup";
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
function isEndClassGroup(ParentComponent: HTMLComponent ): ParentComponent is EndClassGroup {
	return (ParentComponent as unknown as EndClassGroup).baseCssClass === "EndClassGroup";
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards

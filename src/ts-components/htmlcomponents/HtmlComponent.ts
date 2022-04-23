import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider"
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider"
import UiuxConfig from "../../UiuxConfig"
import CriteriaGroup from "./groupcontainers/CriteriaGroup"
import GroupContenaire from "./groupcontainers/GroupContenaire"

class HTMLComponent {
	baseCssClass: string
	cssClasses:any
	ParentComponent: GroupContenaire |CriteriaGroup 
	// TODO refactor widgetHtml and html to one? seems very confusing
	widgetHtml: JQuery<HTMLElement>
	html:JQuery<HTMLElement>
	needBackArrow: boolean
	needFrontArrow: boolean
	specProvider: JsonLdSpecificationProvider | RDFSpecificationProvider
	// TODO this is only temporarly. Some components (ActionWhere) don't need to be attached on there parentcomponent but somewhere else
	htmlParent:JQuery<HTMLElement> = null 
	constructor(baseCssClass: any, cssClasses: any, ParentComponent: GroupContenaire | CriteriaGroup, specProvider: JsonLdSpecificationProvider | RDFSpecificationProvider,widgetHtml: JQuery<HTMLElement>) {
		this.specProvider = specProvider
		this.baseCssClass = baseCssClass;
		this.cssClasses = cssClasses;
		this.ParentComponent = ParentComponent;
		// TODO : see if this is really needed
		// must be false if not set for the moment
		this.widgetHtml = widgetHtml;
		this.html = $();
		this.needBackArrow = false;
		this.needFrontArrow = false;
	}

	attachComponentHtml() {
		// sometimes components don't need to be rendered under their parentcomponent but under htmlParent... like ActionWhere
		if(this.htmlParent){
			console.log(`Component: ${this.baseCssClass} gets attached to htmlParent: ${this.htmlParent}`)
			// remove existing component if already existing
			this.htmlParent.find('>.'+this.baseCssClass).remove()
			$(this.html).appendTo(this.htmlParent)
		}else{
			console.log(`Component: ${this.baseCssClass} gets attached to ParentComponent: ${this.ParentComponent}`)
			// remove existing component if already existing
			this.ParentComponent.html.find('>.'+this.baseCssClass).remove()
			$(this.html).appendTo(this.ParentComponent.html) ;
		}

	}

	/**
	 * Updates the CSS classes of an element
	 **/
	updateCssClasses() {
		$(this.html).removeClass('*') ;
		for (var item in this.cssClasses) {				
			if (this.cssClasses[item] === true) {
				$(this.html).addClass(item) ;
			} else {
				$(this.html).removeClass(item) ;
			}
		}
	}

	remove(){
		$(this.html).remove()
	}

	initHtml() {
		if (this.widgetHtml != null) {
			this.html = $('<div class="'+this.baseCssClass+'"></div>') ;
			// remove existing component
			// this.component.html.find('>.'+instance ).remove();
			this.html.append(this.widgetHtml) ; 
			if(this.needBackArrow) {
				this.addBackArrow() ;
			}
			if(this.needFrontArrow) {
				this.addFrontArrow() ;
			}
		} else {
			this.html =  $('<div class="'+this.baseCssClass+'"></div>') ;
		}
	} 

	attachHtml() {
		this.updateCssClasses() ;
		this.attachComponentHtml() ;
	}	

	addBackArrow() {
		let backArrow = $('<div class="componentBackArrow">'+UiuxConfig.COMPONENT_ARROW_BACK+'</div>') ;
		this.html.prepend(backArrow) ;
	}

	addFrontArrow() {
		let frontArrow = $('<div class="componentFrontArrow">'+UiuxConfig.COMPONENT_ARROW_FRONT+'</div>') ;
		this.html.append(frontArrow) ;
	}
}
export default HTMLComponent
import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider"
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider"
import { UiuxConfig } from "../../UiuxConfig"

class HTMLComponent {
	baseCssClass: {}
	cssClasses:any
	ParentComponent: HTMLComponent
	widgetHtml: JQuery<HTMLElement>
	html:JQuery<HTMLElement>
	needBackArrow: boolean
	needFrontArrow: boolean
	specProvider: JsonLdSpecificationProvider | RDFSpecificationProvider
	constructor(baseCssClass: any, cssClasses: any, ParentComponent: any, widgetHtml: JQuery<HTMLElement>,specProvider: JsonLdSpecificationProvider | RDFSpecificationProvider) {
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
		// remove existing component if already existing
		this.ParentComponent.html.find('>.'+this.baseCssClass).remove() ;	
		$(this.html).appendTo(this.ParentComponent.html) ;
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
			this.html = $();
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
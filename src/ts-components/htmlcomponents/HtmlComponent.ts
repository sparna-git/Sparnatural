import UiuxConfig from "../../configs/fixed-configs/UiuxConfig"
import ISpecProvider from "../../spec-providers/ISpecProviders"

interface IcssClasses {
    TreeWidget?: boolean
    BooleanWidget?: boolean
    NoWidget?: boolean
    DatesWidget?: boolean //typo? plural?
    TimeDatePickerWidget?: boolean
	HasInputsCompleted: boolean,
	IsOnEdit?: boolean,
	Invisible?: boolean,
	Created?:boolean,
	ShowOnHover?:boolean,
	ShowOnEdit?:boolean,
	HasAllComplete?:boolean,
	ListeWidget?:boolean, // TODO ListWidget or ListEWidget? typo?
	AutocompleteWidget?:boolean, //typo?
	SearchWidget?:boolean,
	Highlited?: boolean ,
	flexWrap?: boolean,

}

class HTMLComponent {
	baseCssClass: string
	cssClasses:IcssClasses = {
		HasInputsCompleted: false,
		IsOnEdit: false,
		Invisible: false,
		Created:false // each component starts uncreated. init() will change it
	}

	ParentComponent: HTMLComponent 
	// TODO refactor widgetHtml and html to one? seems very confusing
	widgetHtml: JQuery<HTMLElement>
	html:JQuery<HTMLElement> 
	needBackArrow: boolean
	needFrontArrow: boolean
	specProvider: ISpecProvider
	// TODO this is only temporarly. Some components (ActionWhere) don't need to be attached on there parentcomponent but somewhere else
	htmlParent:JQuery<HTMLElement> = null
	constructor(baseCssClass: any, ParentComponent: HTMLComponent, specProvider:ISpecProvider,widgetHtml: JQuery<HTMLElement>) {
		this.specProvider = specProvider
		this.baseCssClass = baseCssClass;
		this.ParentComponent = ParentComponent;
		// TODO : see if this is really needed
		// must be false if not set for the moment
		this.widgetHtml = widgetHtml;
		this.html = $(`<div class=${this.baseCssClass}></div>`);
		this.needBackArrow = false;
		this.needFrontArrow = false;
	}

	#attachComponentHtml() {
		// sometimes components don't need to be rendered under their parentcomponent but under htmlParent... like ActionWhere
		if(this.htmlParent){
			// remove existing component if already existing
			this.htmlParent.find('>.'+this.baseCssClass).remove()
			$(this.html).appendTo(this.htmlParent)
		}else{
			// remove existing component if already existing
			this.ParentComponent.html.find('>.'+this.baseCssClass).remove()
			$(this.html).appendTo(this.ParentComponent.html) ;
		}
	}

	/**
	 * Updates the CSS classes of an element. All elements with true are added
	 **/
	#updateCssClasses() {
		$(this.html).removeClass('*') ;
		for (const [k, v] of Object.entries(this.cssClasses)) {
			if(v != true){
				$(this.html).removeClass(k) ;
			}else{
				$(this.html).addClass(k) ;
			}
		}
	}

	remove(){
		$(this.html).remove()
	}

	#initHtml() {
		if (this.widgetHtml != null) {
			// remove existing component
			this.html.remove();
			this.html = $('<div class="'+this.baseCssClass+'"></div>') ;
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

	#attachHtml() {
		this.#updateCssClasses() ;
		this.#attachComponentHtml() ;
	}
	
	update(){
		this.#initHtml()
		this.#attachHtml()

	}	

	init() {
		if (!this.cssClasses.Created) {			
			this.cssClasses.IsOnEdit = true ;
			this.#initHtml() ;
			this.#attachHtml() ;
			this.cssClasses.Created = true 			
		} else {
			this.#updateCssClasses()
		}
	};


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
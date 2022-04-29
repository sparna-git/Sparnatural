import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import { eventProxiCriteria } from "../../globals/globalfunctions";
import ArrowComponent from "../arrows/ArrowComponent";
import HTMLComponent from "../HtmlComponent";
import { OptionsGroup } from "./OptionsGroup";


/*
    This is the base class for the optioncomponents such as NotExistComponent or OptionalComponent
*/
class OptionComponent extends HTMLComponent {
    // If you would like to change the shape of the Arrow. Do it here
    frontArrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_FRONT)
    backArrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_BACK)
    default_value:string = ''
    ParentOptionsGroup: OptionsGroup;
    label:string
    inputElement:JQuery<HTMLElement>
    name:string
    id:string
    objectId:any
    constructor(baseCssClass:string,ParentComponent:OptionsGroup,specProvider:ISpecProvider, name:string, crtGroupId:number){
        super(baseCssClass,ParentComponent,specProvider,null)
        this.name = name
        this.id = `option-${crtGroupId}`
        this.ParentOptionsGroup = ParentComponent as OptionsGroup
        this.cssClasses.IsOnEdit = true;
        this.cssClasses.flexWrap = true;
    }

    render(): this {
        if(this.ParentOptionsGroup.ParentCriteriaGroup.jsonQueryBranch){
            let branch =  this.ParentOptionsGroup.ParentCriteriaGroup.jsonQueryBranch;
            this.default_value =  branch[this.name]  ? ' checked="checked"' : ""
            this.#needsTriggerClick()
    }

        this.inputElement = $(`<input type="radio" name="${this.name}" data-id="${this.id}" ${this.default_value} />`)
        
        // htmlStructure rendering:
        super.render()
        this.widgetHtml = this.inputElement
        super.appendWidgetHtml()
        this.backArrow.render()
        this.widgetHtml = $(`<span>${this.label}</span>`)
        super.appendWidgetHtml()
        this.frontArrow.render()

        this.#addEventListeners()

        return this
    }
    #needsTriggerClick(){
        // pour ouvrir le menu :
        $(this.backArrow.html).trigger("click");
        // pour selectionner l'option
        this.html.trigger("click");
    }

    #addEventListeners(){
        this.html.on("click", (e) => {
            e.stopPropagation();
          });
        this.html.on("click", { arg1: this, arg2: "onChange" }, eventProxiCriteria);
    }

    onChange(cls:string){
        // get the ref to the list element
        let listRef = this.ParentOptionsGroup.ParentCriteriaGroup.liRef
        listRef.hasClass(cls) ? listRef.removeClass(cls) : listRef.addClass(cls)
        let listElements = listRef.find('li.groupe')
        listElements.each(index=>{
            // convert the htmlelement again in a Jquery<HTMLElement> so hasClass method is available
            this.#changeDisabledEnabled($(listElements[index]))
        })
        
    }

    #changeDisabledEnabled(listEl:JQuery<HTMLElement>){
        if(listEl.hasClass("Enabled")){
            listEl.addClass("Disabled")
            listEl.removeClass(["Enabled","Opended"])
        } else{
            listEl.addClass(["Enabled","Opended"])
            listEl.removeClass("Disabled")
        }
    }

}

export default OptionComponent
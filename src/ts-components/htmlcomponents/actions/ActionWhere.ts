import ISettings from "../../../configs/client-configs/ISettings";
import * as $ from "jquery"
import HTMLComponent from "../HtmlComponent";
import JsonLdSpecificationProvider from "../../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../../RDFSpecificationProvider";
import ActionsGroup from "./ActionsGroup";
import CriteriaGroup from "../groupcontainers/CriteriaGroup";
/*
    The parent component here is in the beginning the ActionsGroup component. That seems very useless. 
    check if there are any things going on eith ActionWhere.ParenComponent except the rendering in init()
    There the Endclassgroup is foun
*/
class ActionWhere extends HTMLComponent {
    settings: ISettings
    GrandParentComponent:CriteriaGroup
    constructor(ParentComponent:ActionsGroup, specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider, settings:ISettings){
        let cssClasses = {
            ActionWhere : true,
            ShowOnEdit : true,
            Created : false
        };
        super("ActionWhere",cssClasses,ParentComponent,specProvider,null)
        this.GrandParentComponent = ParentComponent.ParentComponent as CriteriaGroup
        
        this.settings = settings 
    }
    init = () => {
       		// Endclassgroup -> EditComponents -> ActionWhere
        var endClassGroup = this.GrandParentComponent.EndClassGroup ;
        this.htmlParent = $(endClassGroup.html).find('.EditComponents')    
        var choiceNumber = 2 ;
        if (endClassGroup.parentCriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetHtml == null) {
            choiceNumber = 1 ;
            $(endClassGroup.html).addClass('noPropertyWidget') ;
        } else {
            $(endClassGroup.html).removeClass('noPropertyWidget') ;
        }
        var endLabel = this.specProvider.getLabel(endClassGroup.value_selected) ;
        var widgetLabel = '<span class="trait-top"></span><span class="edit-trait"><span class="edit-num">'+choiceNumber+'</span></span>'+this.settings.langSearch.Search+' '+ 'endlbl:'+endLabel + ' '+this.settings.langSearch.That+'...' ;

        this.widgetHtml = $(widgetLabel+'<a>+</a>') ;
        this.initHtml()
        this.attachHtml()

    }
    render = ()=> {
        this.init();
    } ;
}
export default ActionWhere
import ISettings from "../ISettings";
import * as $ from "jquery"
import HTMLComponent from "./HtmlComponent";
import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider";

class ActionWhere extends HTMLComponent {
    HtmlContainer:{html?:any} = {};
    settings: ISettings
    constructor(parentComponent:any, specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider, settings:ISettings){
        let cssClasses = {
            ActionWhere : true,
            ShowOnEdit : true,
            Created : false
        };

        super("ActionWhere",cssClasses,parentComponent,null,specProvider)
        
        this.settings = settings 
    }
    init = () => {
        var endClassGroup = this.ParentComponent.parentCriteriaGroup.EndClassGroup ;
        var choiceNumber = 2 ;
        if (endClassGroup.parentCriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetHtml == null) {
            choiceNumber = 1 ;
            $(endClassGroup.html).addClass('noPropertyWidget') ;
        } else {
            $(endClassGroup.html).removeClass('noPropertyWidget') ;
        }
        var endLabel = this.specProvider.getLabel(endClassGroup.value_selected) ;
        var widgetLabel = '<span class="trait-top"></span><span class="edit-trait"><span class="edit-num">'+choiceNumber+'</span></span>'+this.settings.langSearch.Search+' '+ endLabel + ' '+this.settings.langSearch.That+'...' ;

        this.widgetHtml = $(widgetLabel+'<a>+</a>') ;
        super.initHtml()
        super.attachHtml

    }
    reload = ()=> {
        this.init();
    } ;
}
export default ActionWhere
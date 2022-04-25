import GroupContenaire from "../groupcontainers/GroupContenaire"
import ISettings from "../../../configs/client-configs/ISettings"
import JsonLdSpecificationProvider from "../../../JsonLdSpecificationProvider"
import { RDFSpecificationProvider } from "../../../RDFSpecificationProvider"
import ActionsGroup from "./ActionsGroup"
import HTMLComponent from "../HtmlComponent"


class ActionAnd extends HTMLComponent {
    HtmlContainer:GroupContenaire //IMPORTANT unecessary?
    constructor(parentComponent:ActionsGroup,settings:ISettings,specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider){
        let widgetHtml = $('<span class="trait-and-bottom"></span><a>'+settings.langSearch.And+'</a>') ;
        let cssClasses = {
            ActionAnd : true ,
            ShowOnHover : true ,
            Created : false
        }
        super("ActionAnd",cssClasses,parentComponent,specProvider,widgetHtml)
        this.HtmlContainer = parentComponent
       
    }
    render = () =>{
        this.initHtml();
        this.attachHtml();
    } ;
}
export default ActionAnd
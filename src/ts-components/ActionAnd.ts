import { GroupContenaire } from "../SparnaturalComponents";
import ISettings from "./ISettings"


export class ActionAnd extends GroupContenaire {
    HtmlContainer:GroupContenaire //IMPORTANT unecessary?
    constructor(parentComponent:GroupContenaire,settings:ISettings){
        console.warn("ActionAnd Constructor called!")
        super("ActionAnd",parentComponent)
        this.HtmlContainer = parentComponent
        this.widgetHtml = '<span class="trait-and-bottom"></span><a>'+settings.langSearch.And+'</a>' ;
        this.cssClasses = {
        ActionAnd : true ,
        ShowOnHover : true ,
        Created : false
    }; 
    }
    reload = () =>{
        console.log("reeeeload  called")
        this.init();
    } ;
}
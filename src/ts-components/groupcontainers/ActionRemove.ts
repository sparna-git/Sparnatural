import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider";
import GroupContenaire from "./GroupContenaire";

class ActionRemove extends GroupContenaire {
    constructor(parentComponent:GroupContenaire,specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider){
        super("ActionRemove",parentComponent,specProvider)
        this.cssClasses={
            ActionRemove: true,
            Created: false
        }
        this.widgetHtml = $('<a><span class="unselect"><i class="far fa-times-circle"></i></span></a>');
        this.init()
    }
    reload = () =>{
        this.init();
    } ;

}
export default ActionRemove
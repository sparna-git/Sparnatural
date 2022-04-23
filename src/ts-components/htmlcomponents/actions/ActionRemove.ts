import JsonLdSpecificationProvider from "../../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../../RDFSpecificationProvider";

import HTMLComponent from "../HtmlComponent";
import ActionsGroup from "./ActionsGroup";

class ActionRemove extends HTMLComponent {
    constructor(parentComponent:ActionsGroup,specProvider:JsonLdSpecificationProvider | RDFSpecificationProvider){
        let widgetHtml = $('<a><span class="unselect"><i class="far fa-times-circle"></i></span></a>');
        let cssClasses={
            ActionRemove: true,
            Created: false
        }
        super("ActionRemove",cssClasses,parentComponent,specProvider,widgetHtml)

    }
    render = () =>{
        this.initHtml();
        this.attachHtml();;
    } ;

}
export default ActionRemove
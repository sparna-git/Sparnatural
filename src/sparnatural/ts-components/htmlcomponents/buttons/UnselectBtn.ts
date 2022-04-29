import HTMLComponent from "../HtmlComponent";

class UnselectButton extends HTMLComponent{
    eventListener:(event:JQuery.ClickEvent)=>void
    constructor(ParentComponent:HTMLComponent, eventListner:(event:JQuery.ClickEvent)=>void){
        super("unselect",ParentComponent,null)
        this.eventListener = eventListner
    }
}
export default UnselectButton
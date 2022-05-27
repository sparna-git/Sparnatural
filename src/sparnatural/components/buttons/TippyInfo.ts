import tippy, { Tippy } from "tippy.js";
import HTMLComponent from "../HtmlComponent";

class TippyInfo {
    parentComponent: HTMLComponent;
    constructor(parentComponent:HTMLComponent,infoMessage:string,tippysettings?:any){
        this.parentComponent = parentComponent
        let mergeSettings = {...tippysettings, content:infoMessage};
        this.parentComponent.html ? tippy(this.parentComponent.html[0], tippysettings) : console.warn(`Couldn't find html of parentcomponent${this.parentComponent.baseCssClass} make sure to call super.render() first `)
    }
}

export default TippyInfo
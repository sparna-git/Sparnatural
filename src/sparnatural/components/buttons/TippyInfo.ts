import tippy from "tippy.js";
import HTMLComponent from "../HtmlComponent";
import "tippy.js/dist/tippy.css";

class TippyInfo {
    parentComponent: HTMLComponent;
    constructor(parentComponent:HTMLComponent,infoMessage:string,tippysettings?:any){
        this.parentComponent = parentComponent
        let mergeSettings = {...tippysettings, content:infoMessage};
        this.parentComponent.html ? tippy(this.parentComponent.html[0], mergeSettings) : console.warn(`Couldn't find html of parentcomponent${this.parentComponent.baseCssClass} make sure to call super.render() first `)
    }
}

export default TippyInfo
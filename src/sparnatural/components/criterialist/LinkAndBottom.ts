import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";

class LinkAndBottom extends HTMLComponent{

    constructor(ParentComponent:HTMLComponent){
        let widgetHTML = $(`<span>${getSettings().langSearch.And}</span>`)
        super('link-and-bottom',ParentComponent,widgetHTML)
    }

    render(): this {
        super.render()
        return this
    }

    // Set method from init general event here to compute the height?
}

export default LinkAndBottom
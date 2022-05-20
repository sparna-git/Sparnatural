/*
    This is the green arrow which gets rendered. Pressing the arrow renders the Optional and NotExist component
*/

import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../../HtmlComponent";
import { OptionsGroup } from "../optionsgroup/OptionsGroup";

class OptionalArrow extends HTMLComponent{
    selected = false;
    constructor(ParentComponent:OptionsGroup, callBack:(selected:boolean)=>void){
        let widgetHtml = $(UiuxConfig.COMPONENT_OPTION_ARROW_FRONT)
        super('optionalArrow',ParentComponent,widgetHtml)
        this.widgetHtml.on('click',(e:JQuery.ClickEvent)=>{
            e.stopImmediatePropagation()
            this.selected = this.selected ? false:true
            callBack(this.selected)
        })
    }
    render(): this {
        super.render()
        return this
    }

}
export default OptionalArrow
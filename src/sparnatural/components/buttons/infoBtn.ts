import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";
import TippyInfo from "./TippyInfo";

class InfoBtn extends HTMLComponent{
    infoMessage:string
    constructor(parentComponent:HTMLComponent,infoMessage:string){
        let widgetHtml = $(`${UiuxConfig.ICON_CIRCLE_INFO}`)
        super('circle-info',parentComponent,widgetHtml)
        this.infoMessage = infoMessage
    }
    render(): this {
        super.render()
        new TippyInfo(this,this.infoMessage)
        return this
    }
}
export default InfoBtn
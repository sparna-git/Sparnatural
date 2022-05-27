import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";

class InfoBtn extends HTMLComponent{
    constructor(parentComponent:HTMLComponent,dataTippyInfo:string){
        let widgetHtml = $(`data-tippy-content="${dataTippyInfo}"> ${UiuxConfig.ICON_CIRCLE_INFO}`)
        super('circle-info',parentComponent,widgetHtml)
    }
    render(): this {
        super.render()
        return this
    }
}
export default InfoBtn
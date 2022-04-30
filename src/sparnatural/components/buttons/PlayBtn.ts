import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig"
import HTMLComponent from "../HtmlComponent"

class PlayBtn extends HTMLComponent {
    constructor(ParentComponent:HTMLComponent,callBack:()=>void){
        let widgetHtml = $(`<a class="submitDisable">
        ${UiuxConfig.ICON_PLAY}
        </a>`)
        super("reset-wrapper",ParentComponent,widgetHtml)
        this.html.on('click',(e:JQuery.ClickEvent)=>{
            callBack()
        })
    }

    render(): this {
        super.render()
        return this
    }   
}
export default PlayBtn
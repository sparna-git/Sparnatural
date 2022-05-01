import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig"
import HTMLComponent from "../HtmlComponent"

class PlayBtn extends HTMLComponent {
    constructor(ParentComponent:HTMLComponent,callBack:()=>void){
        //TODO submit enable disable as binary state
        let widgetHtml = $(`<a class="">
        ${UiuxConfig.ICON_PLAY}
        </a>`)
        super("submitSection",ParentComponent,widgetHtml)
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
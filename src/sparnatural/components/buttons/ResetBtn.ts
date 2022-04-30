import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";

class ResetBtn extends HTMLComponent {
    constructor(ParentComponent:HTMLComponent,callBack:()=>void){
        let widgetHtml = $('<p class="reset-form"><a>' +
        UiuxConfig.ICON_RESET +
        "</a></p>")
        super("reset-wrapper",ParentComponent,widgetHtml)
        this.html.on('click',(e:JQuery.ClickEvent)=>{
            callBack()
        })
    }
}
export default ResetBtn
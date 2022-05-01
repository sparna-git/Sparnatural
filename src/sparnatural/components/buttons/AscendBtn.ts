import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";


class AscendBtn extends HTMLComponent{
    selected = false;
    constructor(ParentComponent:HTMLComponent, callBack:()=>void){
        let widgetHtml = $(UiuxConfig.ICON_AZ);
        super("asc",ParentComponent,widgetHtml)
        // add clicklistener
        this.widgetHtml.on('click',(e:JQuery.ClickEvent)=>{
            this.selected = this.selected ? false:true
            this.selected ? this.html.addClass('selected') : this.html.removeClass('selected')
            callBack()
        })
    }

    render(): this {
        super.render()
        return this
    }    
}
export default AscendBtn
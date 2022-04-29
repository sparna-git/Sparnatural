import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../HtmlComponent";

class SelectViewVariableBtn extends HTMLComponent{
    selected:boolean
    constructor(ParentComponent:HTMLComponent,callBack:()=>void){
        let widgetHtml = $(
            '<span class="selectViewVariable">' +
              UiuxConfig.ICON_NOT_SELECTED_VARIABLE +
              "</span>"
          );
        super('selectViewVariable',ParentComponent,widgetHtml)
        this.html.on('click',(e:JQuery.ClickEvent)=>{
            callBack()
        })
    }

        
    render(){
        super.render()
        return this
    }
}
export default SelectViewVariableBtn
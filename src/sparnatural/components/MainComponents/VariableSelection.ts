import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import AscendBtn from "../buttons/AscendBtn";
import DescendBtn from "../buttons/DescendBtn";
import NoOrderBtn from "../buttons/NoOrderBtn";

class VariableSection extends HTMLComponent {
    ascendBtn:AscendBtn
    descendBtn:DescendBtn
    noOrderBtn:NoOrderBtn


    constructor(ParentComponent:HTMLComponent){
        super('variablesSelection',ParentComponent,null)
    }

    render(): this {
        super.render()
        this.ascendBtn = new AscendBtn(this,this.ascendCallBack)
        this.descendBtn = new DescendBtn(this,this.descendCallBack)
        this.noOrderBtn = new NoOrderBtn(this,this.noOrderCallback)
        let linesWrapper = $('<div class="linesWrapper"></div>')
        let otherSelectHtml = $('<div class="variablesOtherSelect"></div>')
        
        linesWrapper
        .append($('<div class="line1"></div>')
            .append($('<div class="variablesFirstSelect"></div>'))
            .append(otherSelectHtml)

        )
        let variablesOptionsSelect = $(
            `<div class="variablesOptionsSelect">
                ${getSettings().langSearch.SwitchVariablesNames}
                <label class="switch">
                    <input type="checkbox">
                    <span class="slider round"></span>
                </label>
            </div>`
        );

        let ordersSelectHtml = $(
            `<div class="variablesOrdersSelect">
                <strong>
                    ${getSettings().langSearch.labelOrderSort}
                </strong>
                ${this.ascendBtn.html}
                ${this.descendBtn.html}
                ${this.noOrderBtn}
            </div>`  
        )

        linesWrapper
            .append( $('<div class="line2"></div>')
                .append($(ordersSelectHtml)
                .append(variablesOptionsSelect)
                )
            )

        this.html.append($(`<div class="variablesOrdersSelect"><strong>
        ${getSettings().langSearch.labelOrderSort}
        </strong>`))
       
        return this
    }
    ascendCallBack = ()=>{
        let sort = "asc"
    }
    descendCallBack = ()=>{
        let sort = "desc"
    }
    noOrderCallback = () =>{
        
    }
}
export default VariableSection
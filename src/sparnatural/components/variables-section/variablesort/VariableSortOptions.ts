import { getSettings } from "../../../../configs/client-configs/settings";
import AscendBtn from "../../buttons/AscendBtn";
import DescendBtn from "../../buttons/DescendBtn";
import NoOrderBtn from "../../buttons/NoOrderBtn";
import VariableOptionsSelectBtn from "../../buttons/VariableOptionsSelectBtn";
import HTMLComponent from "../../HtmlComponent";
import VariableSection from "../VariableSelection";

class VariableSortOption extends HTMLComponent{
    ascendBtn: AscendBtn;
    descendBtn: DescendBtn;
    noOrderBtn: NoOrderBtn;
    variableOptionSelectBtn: VariableOptionsSelectBtn;

    constructor(parentComponent:VariableSection){
        let widgetHtml = $(`<strong>${getSettings().langSearch.labelOrderSort}</strong>`)
        super('variablesOrdersSelect',parentComponent,widgetHtml)
    }

    render(): this {
        this.htmlParent = $(this.ParentComponent.html).find(".line2");
        super.render()
        this.ascendBtn = new AscendBtn(this, this.ascendCallBack).render();
        this.descendBtn = new DescendBtn(this, this.descendCallBack).render();
        this.noOrderBtn = new NoOrderBtn(this, this.noOrderCallback).render();
        this.variableOptionSelectBtn = new VariableOptionsSelectBtn(
          this,
          this.toggleVarNames
        ).render();
        return this
    }

    ascendCallBack = () => {
        this.html[0].dispatchEvent(
          new CustomEvent("changeOrderSort", { bubbles: true, detail: "asc" })
        );
      };
    descendCallBack = () => {
    this.html[0].dispatchEvent(
        new CustomEvent("changeOrderSort", { bubbles: true, detail: "desc" })
    );
    };
    noOrderCallback = () => {
    this.html[0].dispatchEvent(
        new CustomEvent("changeOrderSort", { bubbles: true, detail: "nosort" })
    );
    };
    
    toggleVarNames = (selected: boolean) => {
        this.html[0].dispatchEvent(
            new CustomEvent("toggleVarName", { bubbles: true, detail: selected })
        );
    };

}

export default VariableSortOption
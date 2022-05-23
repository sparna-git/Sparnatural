import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../../../HtmlComponent";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import VariableOrderMenu from "./VariableOrderMenu";
/*
    Single Draggable Component
    It consists of an "drag handle" + icon + name of the variable
    The name of the variable can be edited.
*/
class DraggableComponent extends HTMLComponent {
    icon:any
    varName:string
    constructor(parentComponent:VariableOrderMenu,specProvider:ISpecProvider, selected_val:string,varName:string){
        var icon = specProvider.getIcon(selected_val);
        let widgetHtml = 
        $(`<div class="variableSelected flexWrap" data-variableName="${varName}">
            <span class="variable-handle">
                ${UiuxConfig.COMPONENT_DRAG_HANDLE}
            </span>
            ${icon}
            <div id="editable-${varName}">
                <div contenteditable="true">
                    ${varName.substring(1,varName.length-1)}
                </div>
            </div>
        </div>
        `)
        super('sortableItem',parentComponent,widgetHtml)
    }
    render(): this {
        this.htmlParent = $(this.ParentComponent.html).find('.variablesOtherSelect');
        super.render()
        return this
    }
}

export default DraggableComponent
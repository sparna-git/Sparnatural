import UiuxConfig from "../../IconsConstants";
import { SelectedVal } from "../../../generators/ISparJson";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../HtmlComponent";
import VariableOrderMenu from "./VariableOrderMenu";
/*
    Single Draggable Component
    It consists of an "drag handle" + icon + name of the variable
    The name of the variable can be edited.
*/
class DraggableComponent extends HTMLComponent {
  icon: any;
  varName: string; // without the ?
  selectedVal:SelectedVal
  // listener
  varEdited: (oldName: string, newName: string) => void;

  constructor(
    parentComponent: VariableOrderMenu,
    specProvider: ISparnaturalSpecification,
    selected_val: SelectedVal,
    varEdited: (oldName: string, newName: string) => void
  ) {
    let varName = selected_val.variable.substring(
      1,
      selected_val.variable.length
    );
    var icon = specProvider.getEntity(selected_val.type).getIcon();
    let editVar = $(`
        <input type="text" minlength="1">
        </input>
        `).val(varName);

    let widgetHtml =
      $(`<div class="variableSelected flexWrap" data-variableName="${varName}">
            <span class="variable-handle">
                ${UiuxConfig.COMPONENT_DRAG_HANDLE}
            </span>
            <div class="tmpicon">${icon}</div>
        </div>
        `).append(editVar);
   
    super("sortableItem", parentComponent, widgetHtml);
    this.selectedVal = selected_val
    this.varName = varName;
    this.#resize(editVar, varName);
    this.varEdited = varEdited;
    
    let that = this;
    editVar[0].addEventListener("change", (event) => {
      //variableName got edited by user
      let val = this.#validateInput(event.currentTarget as HTMLInputElement);
      that.onVarNameChange(val);
    });
  }

  render(): this {
    this.htmlParent = $(this.ParentComponent.html).find(
      ".variablesOtherSelect"
    );
    super.render();
    return this;
  }

  onVarNameChange(newName:string) {
    let oldName = this.varName;
    this.varName = newName;
    let editVar = this.widgetHtml.find("input");
    this.#resize(editVar, this.varName);

    // call callback
    this.varEdited(oldName, this.varName);
  }

  setVarName(newName:string) {
    this.onVarNameChange(newName);
    this.widgetHtml.find("input").val(newName);
  }

  #resize(el: JQuery<HTMLElement>, varName: string): void {
    el[0].style.width = 10 + "ch";

    if (varName.length > 10) el[0].style.width = varName.length + "ch";
  }

  #validateInput(inputEl: HTMLInputElement) {
    if (inputEl.value.length < 1) {
      inputEl.value = this.varName; // keep old variable
      return this.varName;
    }
    return inputEl.value;
  }
}

export default DraggableComponent;

import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import { SelectedVal } from "../../../generators/ISparJson";
import ISpecProvider from "../../../spec-providers/ISpecProvider";
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
  constructor(
    parentComponent: VariableOrderMenu,
    specProvider: ISpecProvider,
    selected_val: SelectedVal,
    varEdited: (oldName: string, newName: string) => void
  ) {
    let varName = selected_val.variable.substring(
      1,
      selected_val.variable.length
    );
    var icon = specProvider.getIcon(selected_val.type);
    let editVar = $(`
        <input type="text" minlength="2">
        </input>
        `).val(varName);
    editVar[0].addEventListener("change", (event) => {
      //variableName got edited by user
      let val = this.#validateInput(event.currentTarget as HTMLInputElement);
      let oldName = this.varName;
      this.varName = val;

      this.#resize(editVar, this.varName);
      varEdited(oldName, this.varName);
    });
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
  }
  render(): this {
    this.htmlParent = $(this.ParentComponent.html).find(
      ".variablesOtherSelect"
    );
    super.render();
    this.#addHtmlChangeListener()
    return this;
  }

  // The fa-icon is loaded async. This listener waits till the icon is loaded and then updates the with of SortOption
  #addHtmlChangeListener(){
    this.html[0].getElementsByClassName('tmpicon')[0].addEventListener('DOMSubtreeModified', (e) => {
      e.stopImmediatePropagation()
      this.html[0].dispatchEvent(
        new CustomEvent("updateSortOptionWidth", {
          bubbles: true,
        })
      );
    })
  }

  #resize(el: JQuery<HTMLElement>, varName: string): void {
    el[0].style.width = 10 + "ch";

    if (varName.length > 10) el[0].style.width = varName.length + "ch";
  }
  #validateInput(inputEl: HTMLInputElement) {
    if (inputEl.value.length < 2) {
      inputEl.value = this.varName; // keep old variable
      return this.varName;
    }
    return inputEl.value;
  }
}

export default DraggableComponent;

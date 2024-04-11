import UiuxConfig from "../../IconsConstants";
import { SelectedVal } from "../../../components/SelectedVal";
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
  varNameAggr: string; // without the ?
  selectedVal:SelectedVal;
  selectedAggrFonction: string;
  aggrComponentAction: JQuery<HTMLElement>;
  aggrComponentOptions: JQuery<HTMLElement>;
  aggrComponentInput: JQuery<HTMLElement>;
  aggrComponentBadgeValue: JQuery<HTMLElement>;
  aggrComponentOptionsExtend: JQuery<HTMLElement>;
  ParentComponent: VariableOrderMenu;
  // listener
  varEdited: (oldName: string, newName: string, selectedAggrFonction: string, varNameAggr: string) => void;

  constructor(
    parentComponent: VariableOrderMenu,
    specProvider: ISparnaturalSpecification,
    selected_val: SelectedVal,
    varEdited: (oldName: string, newName: string, selectedAggrFonction: string, varNameAggr: string) => void
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

        let aggrActionIput =  $(`<input type="hidden" name="selectedAggr" />`) ;
        let aggrAction = $(`
        <div class="variableSelectedAggr flexWrap" data-variableName="${varName}">
          <span class="variableAggr-handle">
              ${UiuxConfig.ICON_ARROW_BOTTOM}
          </span>
        </div>`) ;

        let aggrOptions = $(`
          <div class="aggrOptions reducted" style="display: none;">
            <ul>
              <li data-value="" class="reducted-visible">Aucune</li>
              <li data-value="COUNT" data class="reducted-visible">COUNT</li>
              <li data-value="GROUP_CONCAT">GROUP_CONCAT</li>
              <li data-value="MAX">MAX</li>
              <li data-value="MIN">MIN</li>
              <li data-value="SAMPLE">SAMPLE</li>
              <li data-value="SUM">SUM</li>
            </ul>
        </div>`) ;

    let aggrOptionsExtend = $(`
    <div class="aggrOptionsExtend">
      <span class="reducted-action">Voir +</span>
      <span class="extended-action">Voir -</span>
    </div>`) ;

    let widgetHtml =
      $(`<div class="variableSelected flexWrap" data-variableName="${varName}">
            <span class="variable-handle">
                ${UiuxConfig.COMPONENT_DRAG_HANDLE}
            </span>
            <div class="tmpicon">${icon}</div>
        </div>`).append(editVar) ;

    let aggrBadgeValue = $(`<div class="aggrBadgeValue" style="display: none;"></div>
      
  </div>`) ;
    
    $(aggrAction).append(aggrActionIput);
    $(widgetHtml).append(aggrAction);
    $(aggrOptions).append(aggrOptionsExtend);
    $(widgetHtml).append(aggrOptions);
    $(widgetHtml).append(aggrBadgeValue);
    
    super("sortableItem", parentComponent, widgetHtml);
    
    this.selectedVal = selected_val
    this.varName = varName;
    this.#resize(editVar, varName);
    this.varEdited = varEdited;
    this.selectedAggrFonction = '';
    this.varNameAggr = '';
    this.aggrComponentAction = aggrAction ;
    this.aggrComponentOptionsExtend = aggrOptionsExtend ;
    this.aggrComponentOptions = aggrOptions ;
    this.aggrComponentInput = aggrActionIput ;
    this.aggrComponentBadgeValue = aggrBadgeValue ;

    
    let that = this;
    editVar[0].addEventListener("change", (event) => {
      //variableName got edited by user
      let val = this.#validateInput(event.currentTarget as HTMLInputElement);
      that.onVarNameChange(val);
    });
    console.log(this);
    this.initEnventListersAggr() ;
    console.log(this.ParentComponent) ;
    if (parentComponent.aggrOptionsExtend) {
      this.toggleAggrOptionsExtend() ;
    }
    /*if(this.htmlParent != null) {
      $(this.htmlParent[0]).append(aggrOptions);
    }*/
  }

  render(): this {
    this.htmlParent = $(this.ParentComponent.html).find(
      ".variablesOtherSelect"
    );
    super.render();
    return this;
  }

  initEnventListersAggr() {
    //Toggle option menu display
    this.aggrComponentAction[0].addEventListener("click", (event: Event) => {
      this.toggleAggrOption() ;
    });
    // Capture aggregate function selection
    this.aggrComponentOptions[0].querySelectorAll('li').forEach((optionItem) => {
      optionItem.addEventListener("click", (event: Event) => {
        let option = event.currentTarget as HTMLElement ;
        let optionValue = option.getAttribute('data-value');
        this.onAggrOptionSelected(optionValue) ;
      });
    });

    this.aggrComponentOptionsExtend[0].addEventListener("click", (event: Event) => {
      this.toggleAggrOptionsExtend() ;
    });
    


  }

  onVarNameChange(newName:string) {
    let oldName = this.varName;
    this.varName = newName;
    let editVar = this.widgetHtml.find("input");
    this.#resize(editVar, this.varName);
    this.dysplayBadgeValue() ;
    // call callback
    this.varEdited(oldName, this.varName, this.selectedAggrFonction, this.varNameAggr);
  }

  onAggrOptionSelected(option:string) {
    this.aggrComponentOptions[0].querySelectorAll('li').forEach((optionItem) => {
      if(optionItem.getAttribute('data-value') == option) {
        optionItem.classList.add('selected');
      } else {
        optionItem.classList.remove('selected');
      }
    }) ;
    (<HTMLInputElement>this.aggrComponentInput[0]).value = option ;
    this.selectedAggrFonction = option;
    this.closeAggrOptions() ;
    this.dysplayBadgeValue() ;
  }
  toggleAggrOption() {
    if(this.aggrComponentOptions[0].style.display == 'block') {
      return this.closeAggrOptions() ;
    }
    if(this.ParentComponent.aggrOptionsExtend) {
      this.aggrComponentOptions[0].classList.remove('reducted');
      this.aggrComponentOptions[0].classList.add('extended');
    } else {
      this.aggrComponentOptions[0].classList.add('reducted');
      this.aggrComponentOptions[0].classList.remove('extended');
    }
    return this.onpenAggrOptions() ;
  }
  toggleAggrOptionsExtend() {
    if(this.aggrComponentOptions[0].classList.contains('reducted')) {
      this.aggrComponentOptions[0].classList.remove('reducted');
      this.aggrComponentOptions[0].classList.add('extended');
      this.ParentComponent.aggrOptionsExtend = true;
    } else {
      this.aggrComponentOptions[0].classList.add('reducted');
      this.aggrComponentOptions[0].classList.remove('extended');
      this.ParentComponent.aggrOptionsExtend = false;
    }
  }
  onpenAggrOptions() {
    this.aggrComponentOptions[0].style.display = 'block';
  }
  closeAggrOptions() {
    this.aggrComponentOptions[0].style.display = 'none';
  }
  dysplayBadgeValue() {
    if (this.selectedAggrFonction != '') {
      this.aggrComponentBadgeValue[0].style.display = 'block';
      this.aggrComponentBadgeValue[0].innerText = this.selectedAggrFonction+'('+this.varName+')' ;
    } else {
      this.aggrComponentBadgeValue[0].style.display = 'none';
    }
    
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

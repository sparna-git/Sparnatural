import UiuxConfig from "../../IconsConstants";
import { SelectedVal } from "../../../components/SelectedVal";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../HtmlComponent";
import VariableOrderMenu from "./VariableOrderMenu";
import { I18n } from "../../../settings/I18n";
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
  aggregateOn: any;
  aggrComponentAction: JQuery<HTMLElement>;
  aggrComponentOptions: JQuery<HTMLElement>;
  aggrComponentInput: JQuery<HTMLElement>;
  aggrComponentBadgeValue: JQuery<HTMLElement>;
  aggrComponentOptionsExtend: JQuery<HTMLElement>;
  ParentComponent: VariableOrderMenu;
  // listener
  varEdited: (oldName: string, newName: string) => void;
  aggrChanged: (oldName: string, newName: string, selectedAggrFonction: string, aggregateOn: string) => void;

  constructor(
    parentComponent: VariableOrderMenu,
    specProvider: ISparnaturalSpecification,
    selected_val: SelectedVal,
    varEdited: (oldName: string, newName: string) => void,
    aggrChanged: (oldName: string, newName: string, selectedAggrFunction: string, aggregateOn: string) => void
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
              <li data-value="" class="reducted-visible">`+I18n.labels.AggrLabelNone+`</li>
              <li data-value="count" data class="reducted-visible" data-suffix="_count">`+I18n.labels.AggrLabelCount+`</li>
              <li data-value="group_concat" data-suffix="_group_concat">`+I18n.labels.AggrLabelGroupConcat+`</li>
              <li data-value="max" data-suffix="_max" class="revealIf revealIf-num revealIf-time">`+I18n.labels.AggrLabelMax+`</li>
              <li data-value="min" data-suffix="_min" class="revealIf revealIf-num revealIf-time">`+I18n.labels.AggrLabelMin+`</li>
              <li data-value="sample" data-suffix="_sample">`+I18n.labels.AggrLabelSample+`</li>
              <li data-value="sum" data-suffix="_sum" class="revealIf revealIf-num">`+I18n.labels.AggrLabelSum+`</li>
              <li data-value="avg" data-suffix="_avg" class="revealIf revealIf-num">`+I18n.labels.AggrLabelAvg+`</li>
            </ul>
        </div>`) ;

    let aggrOptionsExtend = $(`
    <div class="aggrOptionsExtend">
      <span class="reducted-action">`+I18n.labels.AggrLabelSeeMore+`</span>
      <span class="extended-action">`+I18n.labels.AggrLabelSeeLess+`</span>
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
    this.aggrChanged = aggrChanged;
    this.selectedAggrFonction = '';
    this.varNameAggr = '';
    this.aggregateOn = false ;
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
        let optionValueSuffix = option.getAttribute('data-suffix');
        let newName: string ;
        let oldName: string; 

        oldName =  this.varName ;

        if(!this.aggregateOn) {
          this.aggregateOn = this.varName ;
        }
        if(optionValue == '') {
          newName = this.aggregateOn ;
          this.aggregateOn = false;
        }
        if(this.aggregateOn) {
          newName = this.aggregateOn+optionValueSuffix ;
        } 

        this.onAggrOptionSelected(optionValue) ;
        
        this.aggrChanged(oldName, newName, optionValue, this.aggregateOn);
        //this.setVarName(newName) ;
        this.widgetHtml.find("input").val(newName);
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
    console.log('Sending data varName '+oldName+' '+ this.varName ) ;
    this.varEdited(oldName, this.varName);
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
      this.aggrComponentBadgeValue[0].innerText = this.selectedAggrFonction.toUpperCase()+'('+this.aggregateOn+')' ;
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

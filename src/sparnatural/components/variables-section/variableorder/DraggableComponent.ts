import UiuxConfig from "../../IconsConstants";
import { SelectedVal } from "../../../components/SelectedVal";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../HtmlComponent";
import VariableOrderMenu from "./VariableOrderMenu";
import { I18n } from "../../../settings/I18n";
import { AggregateFunction, VariableExpression, VariableTerm } from "../../../ISparJson";

/*
    Single Draggable Component
    It consists of an "drag handle" + icon + name of the variable
    The name of the variable can be edited.
*/
export class DraggableComponent extends HTMLComponent {
  aggrComponentAction: JQuery<HTMLElement>;
  aggrComponentOptions: JQuery<HTMLElement>;
  aggrComponentInput: JQuery<HTMLElement>;
  aggrComponentBadgeValue: JQuery<HTMLElement>;
  aggrComponentOptionsExtend: JQuery<HTMLElement>;
  parentComponent: VariableOrderMenu;
  
  state: DraggableComponentState;
  
  // listener
  varEdited: (state: DraggableComponentState, previousVarName: SelectedVal) => void;
  aggrChanged: (state: DraggableComponentState) => void;

  constructor(
    parentComponent: VariableOrderMenu,
    specProvider: ISparnaturalSpecification,
    selected_val: SelectedVal,
    varEdited: (state: DraggableComponentState, previousVarName:SelectedVal) => void,
    aggrChanged: (state: DraggableComponentState) => void
  ) {

    let varName = selected_val.variable;
    let icon = specProvider.getEntity(selected_val.type).getIcon();

    let icon_display = `` ;
    if (icon != undefined ) {
      icon_display = `<div class="tmpicon"><span><i class="fa ${icon} fa-fw"></i></span></div>` ;
    }
    
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
          <div class="aggrOptions reducted is-num is-time" style="display: none;">
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
            ${icon_display}
        </div>`).append(editVar) ;

    let aggrBadgeValue = $(`<div class="aggrBadgeValue" style="display: none;"></div>
      
  </div>`) ;
    
    $(aggrAction).append(aggrActionIput);
    $(widgetHtml).append(aggrAction);
    $(aggrOptions).append(aggrOptionsExtend);
    $(widgetHtml).append(aggrOptions);
    $(widgetHtml).append(aggrBadgeValue);
    
    super("sortableItem", parentComponent, widgetHtml);

    
    this.state = {
      // make a COPY of the Selected val
      // otherwise any change to that object is also reflected in the Start/EndClassGroup
      selectedVariable: { ...selected_val }
    } ;

  

    this.#resize(editVar, varName);
    this.varEdited = varEdited;
    this.aggrChanged = aggrChanged;

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
    this.initEventListenersAggr() ;
    if (parentComponent.aggrOptionsExtend) {
      this.toggleAggrOptionsExtend() ;
    }

  }

  /**
   * This is called from QueryLoader when loading query
   */
  loadAggregatedVariable(aggregatedVar:VariableExpression) {
    // need to init aggregate funtion selection
    // set this/state for agregate function context
    this.state.aggregateFunction = this.getAggregateFunctionByValue(aggregatedVar.expression.aggregation) ;
    this.state.originalVariable =  { ...this.state.selectedVariable }
    this.state.selectedVariable.variable = aggregatedVar.variable.value ;

    //Init UI/UX elements
    this.onAggrOptionSelected(this.state.aggregateFunction as string) ;
    this.widgetHtml.find("input").val(this.state.selectedVariable.variable);
    this.#resize(this.widgetHtml.find("input"), this.state.selectedVariable.variable);
  }

  render(): this {
    this.htmlParent = $(this.parentComponent.html).find(
      ".variablesOtherSelect"
    );
    super.render();
    return this;
  }

  initEventListenersAggr() {
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

        if(!this.state.aggregateFunction) {
          // no aggr function was selected, store original variable
          // no NOT simply assign the selected variable to the original variable
          // but create a new object
          this.state.originalVariable = {variable: this.state.selectedVariable.variable, type: this.state.selectedVariable.type} ;
        }

        if(optionValue == '') {
          // no aggr function selected : reset to original var name
          this.state.aggregateFunction = undefined ;
          this.state.selectedVariable = this.state.originalVariable ;
        } else {
          this.state.aggregateFunction = this.getAggregateFunctionByValue(optionValue) ;
        }

        if(this.state.aggregateFunction) {
          // compute new variable name
          this.state.selectedVariable.variable = this.state.originalVariable.variable+optionValueSuffix ;
        } 

        this.onAggrOptionSelected(optionValue) ;

        // notify event
        this.aggrChanged(this.state);

        // set the input value to the new variable name
        this.widgetHtml.find("input").val(this.state.selectedVariable.variable);
        this.#resize(this.widgetHtml.find("input"), this.state.selectedVariable.variable);
      });
    });

    this.aggrComponentOptionsExtend[0].addEventListener("click", (event: Event) => {
      this.toggleAggrOptionsExtend() ;
    });
  }

  onVarNameChange(newName:string) {
    // recreate a new object, otherwise this will get changed too !
    let previousVarName = { ... this.state.selectedVariable };
    this.state.selectedVariable.variable = newName;
    
    let editVar = this.widgetHtml.find("input");
    this.#resize(editVar, newName);
    
    // if there is currently an aggregate function, display badge
    if(this.state.aggregateFunction) {
      this.displayBadgeValue(this.aggrComponentOptions[0].querySelector('li.selected').innerHTML ) ;
    }

    // call callback
    this.varEdited(this.state, previousVarName);
  }

  onAggrOptionSelected(option:string) {
    let optionItemLabel = '' ;
    this.aggrComponentOptions[0].querySelectorAll('li').forEach((optionItem) => {
      if(optionItem.getAttribute('data-value') == option) {
        optionItemLabel = optionItem.innerHTML ;
        optionItem.classList.add('selected');
      } else {
        optionItem.classList.remove('selected');
      }
    }) ;
    (<HTMLInputElement>this.aggrComponentInput[0]).value = option ;
    
    this.closeAggrOptions() ;
    this.displayBadgeValue(optionItemLabel) ;    
  }

  toggleAggrOption() {
    if(this.aggrComponentOptions[0].style.display == 'block') {
      return this.closeAggrOptions() ;
    }
    if(this.parentComponent.aggrOptionsExtend) {
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
      this.parentComponent.aggrOptionsExtend = true;
    } else {
      this.aggrComponentOptions[0].classList.add('reducted');
      this.aggrComponentOptions[0].classList.remove('extended');
      this.parentComponent.aggrOptionsExtend = false;
    }
  }
  onpenAggrOptions() {
    this.aggrComponentOptions[0].style.display = 'block';
  }
  closeAggrOptions() {
    this.aggrComponentOptions[0].style.display = 'none';
  }

  /**
   * Displays the aggregation function badge from the selected option
   */
  displayBadgeValue(option: string) {
    // if there is an aggregation function in the state...
    if (this.state.aggregateFunction) {
      this.aggrComponentBadgeValue[0].style.display = 'block';
      this.aggrComponentBadgeValue[0].innerText = option+'('+this.state.originalVariable.variable+')' ;
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
      let keepValue = this.state.selectedVariable.variable;
      inputEl.value = keepValue; // keep old variable
      return keepValue;
    }

    // if there is an aggregation function
    if (this.state.aggregateFunction) {
      // prevent the varName from being equal to the original varName
      if(inputEl.value == this.state.originalVariable.variable) {
        let keepValue = this.state.selectedVariable.variable;
        inputEl.value = keepValue
        return keepValue;
      }
    }

    return inputEl.value;
  }

  /**
   * @returns the enum value from the string value 
   */
  getAggregateFunctionByValue(value: string) {
    let str: string = value;
    let aggregateFunction:AggregateFunction = str as AggregateFunction;
    return aggregateFunction ;
  }
}

export interface DraggableComponentState {
  /**
   * Name of the variable in the white input field in the middle 
   * (can be the original var name or the var name of the result of the aggreation)
   * Also contains the type (= class)
   */
  selectedVariable:SelectedVal;

  /**
   * Name of the aggregation function
   */
  aggregateFunction?:AggregateFunction;

  /**
   * In case an aggregation function is selected, the name of the original var name
   */
  originalVariable?:SelectedVal;

 }
import UiuxConfig from "../../../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import { getSettings } from "../../../../../../configs/client-configs/settings";
import ArrowComponent from "../../../../arrows/ArrowComponent";
import UnselectBtn from "../../../../buttons/UnselectBtn";
import HTMLComponent from "../../../../HtmlComponent";
import AddWidgetValueBtn from "../../../../buttons/AddWidgetValueBtn";
import { IWidget, SelectAllValue} from "../edit-components/widgets/IWidget";

export class EndClassWidgetGroup extends HTMLComponent {
  ParentComponent: HTMLComponent;
  selectedValues: Array<EndClassWidgetValue> = [];
  selectAllValue: boolean = false;
  specProvider: ISpecProvider;
  addWidgetValueBtn: AddWidgetValueBtn;
  constructor(parentComponent: HTMLComponent, specProvider: ISpecProvider) {
    super("EndClassWidgetGroup", parentComponent, null);
    this.specProvider = specProvider;
  }

  render() {
    super.render()
    this.#addEventListener();
    return this;
  }

  #addEventListener() {
    this.html[0].addEventListener(
      "onRemoveEndClassWidgetValue",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.#onRemoveValue(e);
      }
    );

  }

  // input : the 'key' of the value to be deleted
  #onRemoveValue(e: CustomEvent) {
    let valueToDel: EndClassWidgetValue = e.detail;
    //On all case, selectAllValue will be set to false
    this.selectAllValue = false;

    let unselectedValue: EndClassWidgetValue;
    this.selectedValues = this.selectedValues.filter(
      (val: EndClassWidgetValue) => {
        if (val.value_lbl === valueToDel.value_lbl) {
          unselectedValue = val;
          return false;
        }
        return true;
      }
    );
    if (unselectedValue === undefined)
      throw Error("Unselected val not found in the selectedValues list!");
    unselectedValue.html.remove();

    if(this.selectedValues.length < getSettings().maxOr){
      this.addWidgetValueBtn.html.show;
    }

    if (this.selectedValues.length < 1) {
      //$(this.ParentCriteriaGroup.ComponentHtml).removeClass("completed");

      // reattach eventlistener. it got removed
      this.#addEventListener()
      this.addWidgetValueBtn.html.remove();
      this.html[0].dispatchEvent(
        new CustomEvent("renderWidgetWrapper", { bubbles: true,detail:{NrOfSelValues:this.selectedValues.length} })
      );
    }
    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );
  }

  // user selects a value for example a country from the listwidget
  renderWidgetVal(selectedVal:IWidget['value']) {
    
    
    // check if value already got selected before
    if (this.selectedValues.some((val) => val.value_lbl === selectedVal.label))
      return;
    // if not, then create the EndclassWidgetValue and add it to the list
    this.#renderEndClassWidgetVal(selectedVal)
  }

  #renderEndClassWidgetVal(selectedVal:IWidget["value"]){
    let endClassWidgetVal = new EndClassWidgetValue(this, selectedVal);
    this.selectedValues.push(endClassWidgetVal);

    this.#renderNewSelectedValue(endClassWidgetVal);

    // if selectAllvalues then we don't need a AddWidgetValueBtn
    if(!this.#instanceOfAllValues(selectedVal)){
      // now (re)render the addMoreValuesButton
      this.addWidgetValueBtn?.html
      ? this.addWidgetValueBtn.render()
      : (this.addWidgetValueBtn = new AddWidgetValueBtn(
          this,
          this.#addMoreValues
        ).render());
    }

    //Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
    if (this.selectedValues.length == getSettings().maxOr) {
      this.addWidgetValueBtn.html.hide;
    }

    this.html[0].dispatchEvent(
      new CustomEvent("removeEditComponents", { bubbles: true })
    );

    this.html[0].dispatchEvent(
      new CustomEvent("onGrpInputCompleted", { bubbles: true })
    );

    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );

  }

  // All items which got selected in the widget will be added add the back of the EndClassGroup.
  #renderNewSelectedValue(endClassWidgetVal: EndClassWidgetValue) {
    endClassWidgetVal.render();
  }

  // when more values should be added then render the inputypecomponent again
  #addMoreValues = () => {
    this.html[0].dispatchEvent(
      new CustomEvent("renderWidgetWrapper", { bubbles: true,detail:{NrOfSelValues:this.selectedValues.length} })
    );
    this.#addEventListener();
  };

  getWidgetValue(){
    let vals = this.selectedValues.map((val)=>{
      return val.selectedVal
    })
    return vals
  }
  //TS typeguard
  //https://www.typescriptlang.org/docs/handbook/advanced-types.html
  #instanceOfAllValues(selectedVal: IWidget['value']): selectedVal is SelectAllValue {
    return selectedVal.label == getSettings().langSearch.SelectAllValues;
  }
}

export class EndClassWidgetValue extends HTMLComponent {
  backArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_BACK);
  frontArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_FRONT);
  unselectBtn: UnselectBtn;
  value_lbl: string;
  selectedVal: IWidget['value']
  constructor(ParentComponent: EndClassWidgetGroup,selectedVal:IWidget['value']) {
    super('EndClassWidgetValue', ParentComponent, null);
    // set a tooltip if the label is a bit long
    this.selectedVal = selectedVal
    this.value_lbl = selectedVal.label;
  }

  render(): this {
    super.render();
    this.backArrow.render();
    let valuelbl = `<p><span> ${this.value_lbl} </span></p>`;
    this.html.append($(valuelbl));
    this.frontArrow.render();
    this.unselectBtn = new UnselectBtn(this, () => {
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveEndClassWidgetValue", {
          bubbles: true,
          detail: this,
        })
      );
    }).render();
    return this;
  }
}

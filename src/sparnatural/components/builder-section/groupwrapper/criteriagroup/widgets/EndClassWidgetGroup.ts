import UiuxConfig from "../../../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import { getSettings } from "../../../../../../configs/client-configs/settings";
import ArrowComponent from "../../../../arrows/ArrowComponent";
import UnselectBtn from "../../../../buttons/UnselectBtn";
import HTMLComponent from "../../../../HtmlComponent";
import AddListValueBtn from "../../../../buttons/AddMoreValuesBtn";
import WidgetWrapper from "./WidgetWrapper";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import { IWidget} from "./IWidget";

export class EndClassWidgetGroup extends HTMLComponent {
  ParentComponent: HTMLComponent;
  selectedValues: Array<EndClassWidgetValue> = [];
  selectAllValue: boolean = false;
  specProvider: ISpecProvider;
  addListValueBtn: AddListValueBtn;
  widgetWrapper: WidgetWrapper;
  constructor(parentComponent: HTMLComponent, specProvider: ISpecProvider) {
    super("EndClassWidgetGroup", parentComponent, null);
    this.specProvider = specProvider;
  }

  render() {
    super.render();
    return this;
  }
  /**
   * Called when the property/link between domain and range is selected, to init this.
   **/
  onObjectPropertyGroupSelected(startClassVal:SelectedVal,objectPropVal: SelectedVal, endClassVal:SelectedVal) {
    //if(this.widgetWrapper) return // if already initialized don't do it again
    this.widgetWrapper = new WidgetWrapper(
      this,
      this.specProvider,
      startClassVal,
      objectPropVal,
      endClassVal
    ).render();
    this.#addEventListener();
  }

  #addEventListener() {
    this.html[0].addEventListener(
      "onRemoveEndClassWidgetValue",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.#onRemoveValue(e);
      }
    );
    this.html[0].addEventListener('onChange',(e:CustomEvent)=>{
      e.stopImmediatePropagation()
      if(e.detail == '' || !(e.detail)) throw Error('WidgetValueEvent got called but no widgetValue as payload received')
      this.#onChange(e.detail)
    })
    // binds a selection in an input widget with the display of the value in the line
    this.widgetWrapper.html[0].addEventListener("selectAll", (e:CustomEvent) => {
      e.stopImmediatePropagation()
      this.#onSelectAll();
    });

  }

  // input : the 'key' of the value to be deleted
  #onRemoveValue(e: CustomEvent) {
    let valueToDel: EndClassWidgetValue = e.detail;
    //On all case, selectAllValue will be set to false
    this.selectAllValue = false;

    let unselectedValue: EndClassWidgetValue;
    console.dir(this);
    console.dir(e);
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
    //if jstree remove unselecteds term
    //TODO for the tree widget when there is a deletion then rerender the tree widget without the value
    // OR call method remove on widget
    /*
    if (this.widgetWrapper.widgetType == Config.TREE_PROPERTY) {
      (this.widgetWrapper.widgetComponent as TreeWidget).jsTree.jstree(
        "uncheck_node",
        $(e.currentTarget).attr("value-data")
      );
    }
    //uncheck_node()
    */

    if (this.selectedValues.length < 1) {
      //$(this.ParentCriteriaGroup.ComponentHtml).removeClass("completed");

      // re-init the widget to empty input field
      this.widgetWrapper.render();
      // reattach eventlistener. it got removed
      this.#addEventListener()
      this.addListValueBtn.html.remove();
      this.html[0].dispatchEvent(
        new CustomEvent("renderWhereBtn", { bubbles: true })
      );
    }
    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );
  }

  #onSelectAll() {
    this.selectAllValue = true;
    this.#renderEndClassWidgetVal(getSettings().langSearch.SelectAllValues)
  }

  // user selects a value for example a country from the listwidget
  #onChange(selectedVal:IWidget['value']) {
    // put span around with proper class if coming from a date widget
    if (selectedVal == null) {
      return false;
    }

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
    this.#removeWhereAndWidget();
    //Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
    if (this.selectedValues.length == getSettings().maxOr) {
      this.addListValueBtn.html.hide;
    }

    this.html[0].dispatchEvent(
      new CustomEvent("onGrpInputCompleted", { bubbles: true })
    );

    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );

  }
  // removes the where and WidgetWrapper after a value got chosen
  #removeWhereAndWidget() {
    this.widgetWrapper.html.remove();
    this.html[0].dispatchEvent(
      new CustomEvent("removeWhereBtn", { bubbles: true })
    );
  }

  // All items which got selected in the widget will be added add the back of the EndClassGroup.
  #renderNewSelectedValue(endClassWidgetVal: EndClassWidgetValue) {
    endClassWidgetVal.render();
    if(!this.selectAllValue){
    // now (re)render the addMoreValuesButton
    this.addListValueBtn?.html
    ? this.addListValueBtn.render()
    : (this.addListValueBtn = new AddListValueBtn(
        this,
        this.#addMoreValues
      ).render());
    }
  }

  // when more values should be added then render the inputypecomponent again
  #addMoreValues = () => {
    this.widgetWrapper.render();
    this.#addEventListener();
  };

  getWidgetValue(){
    let vals = this.selectedValues.map((val)=>{
      return val.selectedVal
    })
    return vals
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
    this.html.addClass("EndClassWidgetValue");
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

import UiuxConfig from "../../../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import { getSettings } from "../../../../../../configs/client-configs/settings";
import ArrowComponent from "../../../../arrows/ArrowComponent";
import UnselectBtn from "../../../../buttons/UnselectBtn";
import HTMLComponent from "../../../../HtmlComponent";
import AddListValueBtn from "../../../../buttons/AddMoreValuesBtn";
import WidgetWrapper from "./WidgetWrapper";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import { start } from "@popperjs/core";

export class EndClassWidgetGroup extends HTMLComponent {
  ParentComponent: HTMLComponent;
  selectedValues: Array<EndClassWidgetValue> = [];
  selectAllValue: boolean = false;
  specProvider: ISpecProvider;
  addListValueBtn: AddListValueBtn;
  inputTypeComponent: WidgetWrapper;
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
    //if(this.inputTypeComponent) return // if already initialized don't do it again
    this.inputTypeComponent = new WidgetWrapper(
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

    // binds a selection in an input widget with the display of the value in the line
    this.inputTypeComponent.html.on("change", () => {
      this.#onChange();
    });

    // binds a selection in an input widget with the display of the value in the line
    this.inputTypeComponent.html[0].addEventListener("selectAll", (e:CustomEvent) => {
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
    if (this.inputTypeComponent.widgetType == Config.TREE_PROPERTY) {
      (this.inputTypeComponent.widgetComponent as TreeWidget).jsTree.jstree(
        "uncheck_node",
        $(e.currentTarget).attr("value-data")
      );
    }
    //uncheck_node()
    */

    if (this.selectedValues.length < 1) {
      //$(this.ParentCriteriaGroup.ComponentHtml).removeClass("completed");

      // re-init the widget to empty input field
      this.inputTypeComponent.render();
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
    //allvalues doesn't have an uri
    this.#renderEndClassWidgetVal(getSettings().langSearch.SelectAllValues,'')
  }

  // user selects a value for example a country from the listwidget
  #onChange() {
    var selectedVal: { key: string; label: string; uri: string } =
      this.inputTypeComponent.getValue(); // could be array or single value
    // put span around with proper class if coming from a date widget
    if (selectedVal == null) {
      return false;
    }

    // check if value already got selected before
    if (this.selectedValues.some((val) => val.value_lbl === selectedVal.label))
      return;
    // if not, then create the EndclassWidgetValue and add it to the list
    this.#renderEndClassWidgetVal(selectedVal.label,selectedVal.uri)
  }

  #renderEndClassWidgetVal(lbl:string, uri:string){
    let endClassWidgetVal = new EndClassWidgetValue(this, lbl,uri);
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
    this.inputTypeComponent.html.remove();
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
    this.inputTypeComponent.render();
    this.#addEventListener();
  };
}

export class EndClassWidgetValue extends HTMLComponent {
  backArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_BACK);
  frontArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_FRONT);
  unselectBtn: UnselectBtn;
  value_lbl: string;
  uri: string;

  constructor(ParentComponent: EndClassWidgetGroup, value_lbl: string, uri: string) {
    super(value_lbl, ParentComponent, null);
    // set a tooltip if the label is a bit long
    this.value_lbl = value_lbl;
    this.uri = uri
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

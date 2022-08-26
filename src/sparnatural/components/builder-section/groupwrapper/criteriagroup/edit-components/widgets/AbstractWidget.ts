import { Pattern } from "sparqljs";
import { SelectedVal } from "../../../../../../sparql/ISparJson";
import HTMLComponent from "../../../../../HtmlComponent";

// The ValueType decides wheter a widget has the possibility to choose only one value or multiple values
// example for multiples: List of countries in ListWidget
// example for single: Search string in SearchWidget
export enum ValueType {
  SINGLE, // only one value can be chosen.
  MULTIPLE, // multiple values can be selected like a list of values
}

export interface WidgetValue {
  value: {
    label: string; // that's the human readable string representation shown as a WidgetValue to the user
  };
  valueType: ValueType;
}

export abstract class AbstractWidget extends HTMLComponent {
  protected widgetValues: Array<WidgetValue> = [];
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  protected blockStartTriple = false;
  protected blockObjectPropTriple = false;
  protected blockEndTriple = false;
  constructor(
    baseCssClass: string,
    parentComponent: HTMLComponent,
    widgetHTML: JQuery<HTMLElement>,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super(baseCssClass, parentComponent, widgetHTML);
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
  }
  // Must be implemented by the developper of the widget
  abstract getRdfJsPattern(): Pattern[];

  getSparnaturalRepresentation() {
    let vals = this.widgetValues.map((v) => v.value);
    return JSON.stringify(vals);
  }

  addWidgetValue(widgetValue: WidgetValue) {
    this.widgetValues.push(widgetValue);
  }

  getLastValue() {
    return this.widgetValues[this.widgetValues.length - 1];
  }

  // returns null if valueObject has not been set before
  getwidgetValues(): WidgetValue[] {
    return this.widgetValues;
  }


  // Sparnatural stores the variable name always with the questionmark. 
  // for the DataFactory from "rdfjs" lib we need the variable name without '?'
  getVariableValue(selectedVal: SelectedVal): string {
    return selectedVal.variable.replace("?", "");
  }

  // This method gets called when an selected value gets deleted again.
  // For example: Germany and France are chosen from the list widget and now get deleted
  onRemoveValue(val: WidgetValue) {
    this.widgetValues = this.widgetValues.filter((v) => {
      if (v === val) return false;
      return true;
    });
  }

  // fires the event to render the label of the WidgetValue on the UI
  renderWidgetVal(widgetValue: WidgetValue) {
    this.widgetValues.push(widgetValue);
    this.html[0].dispatchEvent(
      new CustomEvent("renderWidgetVal", { bubbles: true, detail: widgetValue })
    );
  }

  isBlockingStart() {
    return this.blockStartTriple
  }
  isBlockingObjectProp() {
    return this.blockObjectPropTriple
  }
  isBlockingEnd() {
    return this.blockEndTriple
  }
}

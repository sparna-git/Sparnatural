import { BlankTerm, IriTerm, LiteralTerm, Pattern } from "sparqljs";
import { SelectedVal } from "../SelectedVal";
import HTMLComponent from "../HtmlComponent";
import LoadingSpinner from "./LoadingSpinner";
import { DataFactory, Literal } from 'rdf-data-factory';
import { Term } from "@rdfjs/types/data-model";

const factory = new DataFactory();

// The ValueType decides wheter a widget has the possibility to choose only one value or multiple values
// example for multiples: List of countries in ListWidget
// example for single: Search string in SearchWidget
export enum ValueRepetition {
  SINGLE, // only one value can be chosen.
  MULTIPLE, // multiple values can be selected like a list of values
}

export interface WidgetValue {
  value: {
    label: string; // that's the human readable string representation shown as a WidgetValue to the user
  };
  key: ()=>string; // a function that returns the value key as a string.
}

/**
 * Generic RDFTerm value structure, either an IRI or a Literal with lang or datatype
 */
export class RDFTerm {
  type: string;
  value: string;
  "xml:lang"?: string;
  datatype?:string 

  constructor(term:Term) {
    switch(term.termType) {
      case "Literal": this.type = "literal"; break;
      case "BlankNode": this.type = "bnode"; break;
      case "NamedNode": this.type = "uri"; break;
      default : throw new Error("Unsupported termType here "+term.termType)
    };
    this.value = term.value;
    this["xml:lang"] = (term instanceof Literal)?(term as Literal).language:undefined;
    this.datatype = (term instanceof Literal)?(term as Literal).datatype.value:undefined;
  }
}

export class RdfTermValue implements WidgetValue {
  value: {
    label: string;
    rdfTerm: RDFTerm
  };

  key():string {
    return this.value.rdfTerm.value;
  }

  constructor(v:RdfTermValue["value"]) {
    this.value = v;
  }
}

export abstract class AbstractWidget extends HTMLComponent {
  public valueRepetition: ValueRepetition;
  protected widgetValues: Array<WidgetValue> = [];
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  protected blockStartTriple = false;
  protected blockObjectPropTriple = false;
  protected blockEndTriple = false;
  protected spinner = new LoadingSpinner(this).render()

  constructor(
    baseCssClass: string,
    parentComponent: HTMLComponent,
    widgetHTML: JQuery<HTMLElement>,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal,
    valueRepetition: ValueRepetition
  ) {
    super(baseCssClass, parentComponent, widgetHTML);
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
    this.valueRepetition = valueRepetition;
  }

  render(): this {
    super.render()
    this.spinner.render()
    return this
  }

  // Is used to parse the inputs from the ISparnaturalJson e.g "preloaded" queries
  abstract parseInput(value:WidgetValue["value"]):WidgetValue

  addWidgetValue(widgetValue: WidgetValue) {
    this.widgetValues.push(widgetValue);
  }

  // returns null if valueObject has not been set before
  getWidgetValues(): WidgetValue[] {
    return this.widgetValues;
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
  renderWidgetVal(widgetValue: WidgetValue ) {
    if(!this.widgetValues.find(v => v.key() == widgetValue.key())){  // don't add double values
      // store value
      this.widgetValues.push(widgetValue)
      this.html[0].dispatchEvent(
        new CustomEvent("renderWidgetVal", { bubbles: true, detail: widgetValue })
      );
    }
  }

  renderWidgetValues(widgetValues:WidgetValue[]){
    widgetValues.forEach(v=>this.widgetValues.push(v))
    this.html[0].dispatchEvent(
      new CustomEvent("renderWidgetVal", { bubbles: true, detail: widgetValues })
    );
  }

  // toggle spinner component when loading a datasource
  toggleSpinner(message?:string){
    const elements = this.spinner.html[0].getElementsByClassName('load')
    if(elements.length > 0) elements[0].classList.toggle('show')
    if(message != null) this.spinner.renderMessage(message)
  }

}

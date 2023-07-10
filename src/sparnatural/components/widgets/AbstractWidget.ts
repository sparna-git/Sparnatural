import { BlankTerm, IriTerm, LiteralTerm, Pattern } from "sparqljs";
import { SelectedVal } from "../../generators/ISparJson";
import HTMLComponent from "../HtmlComponent";
import LoadingSpinner from "./LoadingSpinner";
import { DataFactory } from 'rdf-data-factory'; ;

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

  // Must be implemented by the developper of the widget
  abstract getRdfJsPattern(): Pattern[];
  // Is used to parse the inputs from the ISparnaturalJson e.g "preloaded" queries
  abstract parseInput(value:WidgetValue["value"]):WidgetValue
  
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
  renderWidgetVal(widgetValue: WidgetValue ) {
    if(!this.widgetValues.find(v => v.key() == widgetValue.key())){  // don't add double values
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

  isBlockingStart() {
    return this.blockStartTriple
  }
  isBlockingObjectProp() {
    return this.blockObjectPropTriple
  }
  isBlockingEnd() {
    return this.blockEndTriple
  }

  /**
   * Translates an IRI, Literal or BNode into the corresponding SPARQL query term
   * to be inserted in a SPARQL query.
   * @returns 
   */
    rdfTermToSparqlQuery(rdfTerm:RDFTerm): IriTerm | BlankTerm | LiteralTerm {
      if(rdfTerm.type == "uri") {
        return factory.namedNode(rdfTerm.value);
      } else if(rdfTerm.type == "literal") {
        if(rdfTerm["xml:lang"]) {
          return factory.literal(rdfTerm.value, rdfTerm["xml:lang"]);
        } else if(rdfTerm.datatype) {
          return factory.literal(rdfTerm.value, rdfTerm.datatype);
        } else {
          return factory.literal(rdfTerm.value);
        }
      } else if(rdfTerm.type == "bnode") {
        // we don't know what to do with this, but don't trigger an error
        return factory.blankNode(rdfTerm.value);
      } else {
        throw new Error("Unexpected rdfTerm type "+rdfTerm.type)
      }
    }
}

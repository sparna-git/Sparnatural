import { SelectedVal } from "../SelectedVal";
import { HTMLComponent } from "../HtmlComponent";
import LoadingSpinner from "./LoadingSpinner";
import { DataFactory, Literal } from "rdf-data-factory";
import { Term } from "@rdfjs/types/data-model";
import { RDFTerm, CriteriaValue } from "../../SparnaturalQueryIfc";

const factory = new DataFactory();

// The ValueType decides wheter a widget has the possibility to choose only one value or multiple values
// example for multiples: List of countries in ListWidget
// example for single: Search string in SearchWidget
export enum ValueRepetition {
  SINGLE, // only one value can be chosen.
  MULTIPLE, // multiple values can be selected like a list of values
}

let RDFTermFactory = (term: Term): RDFTerm => {
  return {
    type: term.termType === "Literal" ? "literal" : term.termType === "BlankNode" ? "bnode" : "uri",
    value: term.value,
    "xml:lang": term instanceof Literal ? (term as Literal).language : undefined,
    datatype: term instanceof Literal ? (term as Literal).datatype.value : undefined, 
  }
}

export abstract class AbstractWidget extends HTMLComponent {
  public valueRepetition: ValueRepetition;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  protected blockStartTriple = false;
  protected blockObjectPropTriple = false;
  protected blockEndTriple = false;
  protected spinner = new LoadingSpinner(this).render();

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
    super.render();
    this.spinner.render();
    return this;
  }

  // Is used to parse the inputs from the ISparnaturalJson e.g "preloaded" queries
  abstract parseInput(value: CriteriaValue): CriteriaValue;

  // fires the event to render the label of the WidgetValue on the UI
  // can take either a single value or an array of values
  triggerRenderWidgetVal(widgetValue: CriteriaValue | CriteriaValue[]) {
    this.html[0].dispatchEvent(
      new CustomEvent("renderWidgetVal", {
        bubbles: true,
        detail: widgetValue,
      })
    );
  }

  // Method to disable the widget
  disableWidget() {
    // Add a 'disabled-widget' class to visually indicate it's disabled
    //this.html[0].classList.add("disabled-widget");

    // Disable all input elements within the widget's HTML container
    const inputs = this.html[0].querySelectorAll(
      "input, button, select, textarea"
    );
    inputs.forEach((element) => {
      element.setAttribute("disabled", "true");
    });
  }

  // Method to enable the widget
  enableWidget() {
    // Remove the 'disabled-widget' class to restore normal appearance
    //this.html[0].classList.remove("disabled-widget");

    // Enable all input elements within the widget's HTML container
    const inputs = this.html[0].querySelectorAll(
      "input, button, select, textarea"
    );
    inputs.forEach((element) => {
      element.removeAttribute("disabled");
    });
  }

  // toggle spinner component when loading a datasource
  toggleSpinner(message?: string) {
    const elements = this.spinner.html[0].getElementsByClassName("load");
    if (elements.length > 0) elements[0].classList.toggle("show");
    if (message != null) this.spinner.renderMessage(message);
  }
}
export { RDFTerm };


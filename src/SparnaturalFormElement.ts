import $ from "jquery";
import "./assets/stylesheets/SparnaturalForm.scss"
import SparnaturalFormComponent from "./sparnatural-form/SparnaturalFormComponent";
import { SparnaturalFormAttributes } from "./SparnaturalFormAttributes";

/*
  This is the sparnatural-form HTMLElement. 
  e.g. Interface to the outside world
*/
export class SparnaturalFormElement extends HTMLElement {
  
  static HTML_ELEMENT_NAME = "sparnatural-form";

  static EVENT_SUBMIT = "submit";
  static EVENT_QUERY_UPDATED = "queryUpdated";
  
  sparnaturalForm:SparnaturalFormComponent;

  // just to avoid name clash with "attributes"
  _attributes: SparnaturalFormAttributes;

  constructor() {
    super();
  }

  /**
   * Call display only in the connectedCallback
   */
  connectedCallback() {
    this.display();
  }

  display() { 
    // read the HTML attributes in sparnatural-form   
    this._attributes = new SparnaturalFormAttributes(this);

    // create the sparnatural-form instance
    this.sparnaturalForm = new SparnaturalFormComponent(this._attributes);

    // empty the HTML content in case we re-display after an attribute change
    $(this).empty();
    // attach the component to this WebComponent
    $(this).append(this.sparnaturalForm.html);

    // render the form
    this.sparnaturalForm.render();
  }
}

customElements.get(SparnaturalFormElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(SparnaturalFormElement.HTML_ELEMENT_NAME, SparnaturalFormElement);
  
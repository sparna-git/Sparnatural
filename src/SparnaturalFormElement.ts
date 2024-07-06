import $ from "jquery";
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
    this._attributes = new SparnaturalFormAttributes(this);

    // render sparnatural 
    this.sparnaturalForm = new SparnaturalFormComponent(this._attributes);

    this.sparnaturalForm.render();
  }
}

customElements.get(SparnaturalFormElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(SparnaturalFormElement.HTML_ELEMENT_NAME, SparnaturalFormElement);
  
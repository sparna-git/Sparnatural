require("./assets/js/jquery-nice-select/jquery.nice-select.js");
import "./assets/stylesheets/mycss.scss"
require("./assets/stylesheets/mycss.scss")
import $ from "jquery";
/*SPARNATURAL*/
import { getSettings, mergeSettings } from "./sparnatural/settings/defaultSettings";
import SparnaturalComponent from "./sparnatural/components/SparnaturalComponent";
import ISpecProvider from "./sparnatural/spec-providers/ISpecProvider";
import { ISparJson } from "./sparnatural/generators/ISparJson";
import { PreLoadQueries } from "./sparnatural/settings/ISettings";
import QueryLoader from "./sparnatural/querypreloading/QueryLoader";
import QueryParser from "./sparnatural/querypreloading/QueryParser";
import { SparnaturalAttributes } from "./SparnaturalAttributes";

/*
  This is the sparnatural HTMLElement. 
  e.g. Interface to the outside world
  Used to configure the Settings and load queries
*/
export class SparnaturalElement extends HTMLElement {
  
  static HTML_ELEMENT_NAME = "spar-natural";

  static EVENT_SUBMIT = "submit";
  static EVENT_QUERY_UPDATED = "queryUpdated";
  static EVENT_RESET = "reset";
  static EVENT_DISPLAY = "display";
  
  // just to avoid name clash with "attributes"
  _attributes: SparnaturalAttributes;
  // for the moment, just keep the handlers in the settings
  // handlers: SparnaturalHandlers;

  Sparnatural:SparnaturalComponent;
  specProvider: ISpecProvider;

  constructor() {
    super();
  }

  /**
   * Call display only in the connectedCallback
   */
  connectedCallback() {
    this.display();
  }

  set autocomplete(autocomplete: any) {
    getSettings().autocomplete = autocomplete;
  }

  set list(list: any) {
    getSettings().list = list;
  }

  set dates(dates: any) {
    getSettings().dates = dates;
  }

  get autocomplete() {
    return getSettings().autocomplete;
  }

  get list() {
    return getSettings().list;
  }

  get dates() {
    return getSettings().dates;
  }

  display() {
    // render sparnatural 
    this.Sparnatural = new SparnaturalComponent();
    // empty the content in case we re-display after an attribut change
    $(this).empty();
    $(this).append(this.Sparnatural.html);
    // parse all attributes in the HTML element
    this._attributes = new SparnaturalAttributes(this);
    // TODO : migrate handlers outside of settings
    // this.handlers = new SparnaturalHandlers();

    // just set the settings with this
    // TODO : re-enginer the global settings variable to something more OO
    mergeSettings(this._attributes); 
    this.Sparnatural.render();
    this.dispatchEvent(new CustomEvent(SparnaturalElement.EVENT_DISPLAY, {
      bubbles: true,
      detail: {
        sparnatural: this
      }
    }));
  }

  static get observedAttributes() {
    return ["src", "lang", "endpoint"];
  }
  attributeChangedCallback(name: string, oldValue:string|null, newValue:string|null) {
    if (oldValue === newValue) {
     return;
   }
   
   // prevents callback to be called on initial creation
   if(oldValue != null) {  
    if(getSettings().debug) {
      console.log(`${name}'s value has been changed from ${oldValue} to ${newValue}`);
    }  

    if(name == "src") {
      getSettings().config = newValue;
    }
    if(name == "lang") {
      getSettings().language = newValue;
    }
    if(name == "endpoint") {
      getSettings().defaultEndpoint = newValue;
    }

    // then display
    this.display();
   }
  }

  /**
   * Enable the play button when a query has finished executing
   * Can be called from the outside. Removes the loading spinner on the btn
   */
  enablePlayBtn(){
    this.Sparnatural.enablePlayBtn()
  }

  /**
   * Disable the play button when query is triggered
   * Can be called from the outside
   */
  disablePlayBtn(){
    this.Sparnatural.disablePlayBtn()
  }

  /**
   * Load a saved/predefined query in the visual query builder
   * Can be called from the outside
   * @param query 
   */
  loadQuery(query:ISparJson){
    QueryLoader.setSparnatural(this.Sparnatural)
    QueryLoader.loadQuery(query)
  }

  /**
   * Expands the SPARQL query according to the configuration.
   * Can be called from the outside
   * @returns 
   */
  expandSparql(query:string) {
    return this.Sparnatural.specProvider.expandSparql(query, this.Sparnatural.settings.sparqlPrefixes);
  }

  /**
   * Clears the current query.
   * Can be called from the outside
   */
  clear() {
    this.Sparnatural.BgWrapper.resetCallback();
  }

  /**
   * TODO : should be removed
   */
  parseQueries(queries:PreLoadQueries){
    return QueryParser.parseQueries(queries)
  }
}

customElements.get(SparnaturalElement.HTML_ELEMENT_NAME) ||
  window.customElements.define(SparnaturalElement.HTML_ELEMENT_NAME, SparnaturalElement);
  
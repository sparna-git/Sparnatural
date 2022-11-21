require("./assets/js/jquery-nice-select/jquery.nice-select.js");
require("./assets/stylesheets/sparnatural.scss");
import $ from "jquery";
/* FONT AWESOME*/
require("@fortawesome/fontawesome-free");
import { IconPack, library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
library.add(fas);
library.add(far as IconPack);
/*SPARNATURAL*/
import { getSettings, mergeSettings } from "./sparnatural/settings/defaultSettings";
import Sparnatural from "./sparnatural/components/SparnaturalComponent";
import ISpecProvider from "./sparnatural/spec-providers/ISpecProvider";
import { ISparJson } from "./sparnatural/generators/ISparJson";
import { PreLoadQueries } from "./sparnatural/settings/ISettings";
import QueryLoader from "./sparnatural/querypreloading/QueryLoader";
import QueryParser from "./sparnatural/querypreloading/QueryParser";

/*
  This is the sparnatural HTMLElement. 
  e.g. Interface to the outside world
  Used to configure the Settings and load queries
*/
class SparNatural extends HTMLElement {
  Sparnatural = new Sparnatural();
  specProvider: ISpecProvider;
  static get observedAttributes() {
    return ["settings"];
  }
  constructor() {
    super();
  }

  //gets called when the component was rendered
  connectedCallback() {
    this.dispatchEvent(new CustomEvent("componentLoaded", { bubbles: true }));
  }

  // Used by calling Calling component to set or get the settings.
  // e.g index.html can overwride default settings
  get settings() {
    return getSettings();
  }

  set settings(options: any) {
    mergeSettings(options);
    if (getSettings().config === null)
      throw Error(
        "No config provided for sparnatural! Please provide config file. see Documentation: https://github.com/sparna-git/Sparnatural"
      );
    this.initSparnatural();
  }

  initSparnatural() {
    $(this).append(this.Sparnatural.html);
    this.Sparnatural.render();
  }

  /**
   * Enable the play button when a query has finished executing
   */
  enablePlayBtn(){
    this.Sparnatural.enablePlayBtn()
  }

  /**
   * Disable the play button when query is triggered
   */
  disablePlayBtn(){
    this.Sparnatural.disablePlayBtn()
  }

  parseQueries(queries:PreLoadQueries){
    return QueryParser.parseQueries(queries)
  }

  /**
   * Load a saved/predefined query in the visual query builder
   * @param query 
   */
  loadQuery(query:ISparJson){
    QueryLoader.setSparnatural(this.Sparnatural)
    QueryLoader.loadQuery(query)
  }

  expandSparql(query:string) {
    return this.Sparnatural.specProvider.expandSparql(query);
  }
}

customElements.get("spar-natural") ||
  window.customElements.define("spar-natural", SparNatural);

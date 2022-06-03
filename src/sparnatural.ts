require("jstree/dist/themes/default/style.min.css");

require("easy-autocomplete");

require("./assets/js/jquery-nice-select/jquery.nice-select.js");

require("./assets/stylesheets/sparnatural.scss");

import $ from 'jquery'
import { getSettings, mergeSettings } from "./configs/client-configs/settings";
import Sparnatural from "./sparnatural/components/Sparnatural";


/*
  This is the SparNatural HTMLElement. 
  e.g. Interface to the outside world
  Used to configure the Settings
*/
import config from '../static/config'
import ISettings from './configs/client-configs/ISettings';

import { queries } from './sparnatural/preloadedqueries';
export class SparNatural extends HTMLElement {
  Sparnatural = new Sparnatural();
  specProvider: any;
  // all the components in Sparnatural
  components: any = [];
  constructor() {
    super();
    this.setSettings({config:config,language:'en',preLoadedQueries:queries})
  }
  //gets called when the component was rendered
  connectedCallback(){
    this.initSparnatural()
  }
  // Used by calling Calling component to set or get the settings.
  // e.g index.html can overwride default settings
  getSettings() {
    return getSettings();
  }

  setSettings(options: ISettings) {
    mergeSettings(options);
  }

  initSparnatural() {
    $(this).append(this.Sparnatural.html);
    this.Sparnatural.render();
  }
}

customElements.get("spar-natural") ||
  window.customElements.define("spar-natural", SparNatural);

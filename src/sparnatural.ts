require("jstree/dist/themes/default/style.min.css");

require("./assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");

require("./assets/js/jquery-nice-select/jquery.nice-select.js");

require("tippy.js/dist/tippy.css");

import { getSettings, mergeSettings } from "./configs/client-configs/settings";
import Sparnatural from "./sparnatural/components/Sparnatural";

/*
  This is the SparNatural HTMLElement. 
  e.g. Interface to the outside world
  Used to configure the Settings
*/
export class SparNatural extends HTMLElement {
  Sparnatural = new Sparnatural();
  specProvider: any;
  // all the components in Sparnatural
  components: any = [];
  constructor() {
    super();
  }
  // Used by calling Calling component to set or get the settings.
  // e.g index.html can overwride default settings
  getSettings() {
    return getSettings();
  }

  setSettings(options: any) {
    mergeSettings(options);
  }

  initSparnatural() {
    $(this).append(this.Sparnatural.html);
    this.Sparnatural.render();
  }
}

customElements.get("spar-natural") ||
  window.customElements.define("spar-natural", SparNatural);

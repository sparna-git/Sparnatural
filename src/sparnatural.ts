require("jstree/dist/themes/default/style.min.css");

require("../assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");

require("../assets/js/jquery-nice-select/jquery.nice-select.js");

require("tippy.js/dist/tippy.css");

import { getSettings, mergeSettings } from "./configs/client-configs/settings";

/*
  This is the SparNatural HTMLElement. 
  e.g. Interface to the outside world
  Used to configure the Settings
*/
export class SparNatural extends HTMLElement {
  Sparnatural = new SparNatural()
  specProvider: any;
  // all the components in Sparnatural
  components: any = [];
  constructor() {
    super();
    $(this).addClass("Sparnatural");
  }
  // Used by calling Calling component to set or get the settings.
  // e.g index.html can overwride default settings
  getSettings() {
    return getSettings();
  }

  setSettings(options: any) {
    mergeSettings(options);
  }
}

customElements.get("spar-natural") ||
  window.customElements.define("spar-natural", SparNatural);

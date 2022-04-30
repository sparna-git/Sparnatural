require("jstree/dist/themes/default/style.min.css");

require("../assets/stylesheets/sparnatural.scss");

require("easy-autocomplete");
//

// removed to avoid x2 bundle size
// the dependency needs to be manually inserted in HTML pages
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chenfengyuan/datepicker@1.0.9/dist/datepicker.min.css">
// <script src="https://cdn.jsdelivr.net/npm/@chenfengyuan/datepicker@1.0.9/dist/datepicker.min.js"></script>
//
// const datepicker = require("@chenfengyuan/datepicker") ;
// const $$ = require('jquery');

require("../assets/js/jquery-nice-select/jquery.nice-select.js");
// WARNING : if you use ES6 syntax (like import instead of require),
// webpack will automatically add "use strict" as all ES6 modules
// are expected to be strict mode code.

// This is ugly, should use i18n features instead
const i18nLabels = {
  en: require("../assets/lang/en.json"),
  fr: require("../assets/lang/fr.json"),
};

require("tippy.js/dist/tippy.css");

import { getSettings, mergeSettings } from "../configs/client-configs/settings";


/*
  This is the SparNatural HTMLElement. 
  e.g. Interface to the outside world
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
} // end of Sparnatural class

customElements.get("spar-natural") ||
  window.customElements.define("spar-natural", SparNatural);

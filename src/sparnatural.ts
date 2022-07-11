import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";

require("./assets/js/jquery-nice-select/jquery.nice-select.js");

require("./assets/stylesheets/sparnatural.scss");

import $ from "jquery";

/* FONT AWESOME*/
require("@fortawesome/fontawesome-free");
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

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
  static get observedAttributes() {
    return ["settings"];
  }
  constructor() {
    super();
  }

  //gets called when the component was rendered
  connectedCallback() {
    console.warn("componentloaded firing");
    this.dispatchEvent(new CustomEvent("componentLoaded", { bubbles: true }));
    console.warn("event fired");
  }

  // Used by calling Calling component to set or get the settings.
  // e.g index.html can overwride default settings
  get settings() {
    return getSettings();
  }

  set settings(options: any) {
    console.warn("setting settings");
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
}

customElements.get("spar-natural") ||
  window.customElements.define("spar-natural", SparNatural);

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css';




require("jstree/dist/themes/default/style.min.css");

require("easy-autocomplete");

require("./assets/js/jquery-nice-select/jquery.nice-select.js");

require("./assets/stylesheets/sparnatural.scss");

import $ from 'jquery'

/* FONT AWESOME*/
require('@fortawesome/fontawesome-free')
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas)


import { getSettings, mergeSettings } from "./configs/client-configs/settings";
import Sparnatural from "./sparnatural/components/Sparnatural";


/*
  This is the SparNatural HTMLElement. 
  e.g. Interface to the outside world
  Used to configure the Settings
*/
import {rdfconfig} from '../static/config'

import { queries } from './sparnatural/preloadedqueries';
export class SparNatural extends HTMLElement {
  Sparnatural = new Sparnatural();
  specProvider: any;
  // all the components in Sparnatural
  components: any = [];
  static get observedAttributes() {
    return ['settings'];
  }
  constructor() {
    super();
    mergeSettings({config:rdfconfig,language:'en',preLoadedQueries:queries})
  }
  //gets called when the component was rendered
  connectedCallback(){
    this.dispatchEvent(new CustomEvent('componentLoaded',{bubbles:true}))
    this.initSparnatural()
  }
  // Used by calling Calling component to set or get the settings.
  // e.g index.html can overwride default settings
  get settings() {
    return getSettings();
  }

  set settings(options: any) {
    mergeSettings(options);
  }

  initSparnatural() {
    $(this).append(this.Sparnatural.html);
    this.Sparnatural.render();
  }
}

customElements.get("spar-natural") ||
  window.customElements.define("spar-natural", SparNatural);

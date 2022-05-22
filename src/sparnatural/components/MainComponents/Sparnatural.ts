import { getSettings } from "../../../configs/client-configs/settings";

import ISpecProvider from "../../spec-providers/ISpecProviders";
import HTMLComponent from "../../HtmlComponent";
import BgWrapper from "./BgWrapper";
import SubmitSection from "./SubmitSection";
import SpecificationProviderFactory from "../../spec-providers/SpecificationProviderFactory";
import ActionStore from "../../statehandling/ActionStore";
import VariableSection from "../variablesmenu/VariableSelection";

// This is ugly, should use i18n features instead
const i18nLabels = {
  en: require("../../../assets/lang/en.json"),
  fr: require("../../../assets/lang/fr.json"),
};

class Sparnatural extends HTMLComponent {
  specProvider: ISpecProvider;
  submitOpened = true; // is responsible if the generateQuery button works or not
  actionStore: ActionStore;
  BgWrapper: BgWrapper;
  SubmitSection:SubmitSection
  VariableSelection:VariableSection
  filter = $(
    '<svg data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" style="width:0;height:0;display:block"><defs><filter style="color-interpolation-filters:sRGB;" inkscape:label="Drop Shadow" id="filter19278" x="-0.15483875" y="-0.11428573" width="1.3096775" height="1.2714286"><feFlood flood-opacity="0.811765" flood-color="rgb(120,120,120)" result="flood" id="feFlood19268" /><feComposite in="flood" in2="SourceGraphic" operator="out" result="composite1" id="feComposite19270" /><feGaussianBlur in="composite1" stdDeviation="2" result="blur" id="feGaussianBlur19272" /><feOffset dx="3.60822e-16" dy="1.8" result="offset" id="feOffset19274" /><feComposite in="offset" in2="SourceGraphic" operator="atop" result="composite2" id="feComposite19276" /></filter></defs></svg>'
  );
  constructor() {
    //Sparnatural: Does not have a ParentComponent!
    super("Sparnatural", null, null);
    getSettings().langSearch = i18nLabels["en"];
  }

  render(): this {
    //super.render()
    this.initSparnatural();
    this.BgWrapper = new BgWrapper(this, this.specProvider).render();
    this.SubmitSection = new SubmitSection(this).render();
    this.VariableSelection = new VariableSection(this,this.specProvider).render()
    this.html.append(this.filter);
    //BGWrapper must be rendered first
    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );
    this.actionStore = new ActionStore(this, this.specProvider);
    return this;
  }

  initSparnatural() {
    let settings = getSettings();
    let specProviderFactory = new SpecificationProviderFactory();
    specProviderFactory.build(settings.config, settings.language, (sp: any) => {
      this.specProvider = sp;
    });

    // uncomment to trigger gathering of statistics
    // initStatistics(specProvider);
  }

  loadQueryInterface(json: any) {
    var jsonWithLinks = this.preprocess(json);

    this.doLoadQuery(jsonWithLinks);
  }

  // global function
  doLoadQuery(json: any) {
    // stores the JSON to be preloaded
    this.actionStore //.Form.preLoad = json;

    this.loadQuery();

    // And now, generateQuery form
    this.html[0].dispatchEvent(new CustomEvent("generateQuery", { bubbles: true }));
    // clear the jsonQueryBranch copied on every component, otherwise they always stay here
    // and we get the same criterias over and over when removing and re-editing
  }

  clear() {
    this.actionStore = new ActionStore(this, this.specProvider);
  }

  /**
   * Preprocess JSON query to add parent and nextSibling links
   **/
  preprocess(jsonQuery: any) {
    for (var i = 0; i < jsonQuery.branches.length; i++) {
      var branch = jsonQuery.branches[i];
      var next = null;
      if (jsonQuery.branches.length > i + 1) {
        next = jsonQuery.branches[i + 1];
      }
      this.preprocessRec(branch, null, next, jsonQuery);
    }
    return jsonQuery;
  }

  preprocessRec(branch: any, parent: any, nextSibling: any, jsonQuery: any) {
    branch.parent = parent;
    branch.nextSibling = nextSibling;
    // set flags ot indicate if the eye is open by testing the selected variables
    if (jsonQuery.variables.includes(branch.line.s)) {
      branch.line.sSelected = true;
    }
    if (jsonQuery.variables.includes(branch.line.o)) {
      branch.line.oSelected = true;
    }
    for (var i = 0; i < branch.children.length; i++) {
      var child = branch.children[i];
      var next = null;
      if (branch.children.length > i + 1) {
        next = branch.children[i + 1];
      }
      this.preprocessRec(child, branch, next, jsonQuery);
    }
  }
  //used to be form.spar
  loadQuery = function () {
    this.submitOpened = false;
    for (var i = 0; i < this.form.preLoad.variables.length; i++) {
      var variableName = this.form.preLoad.variables[i];
      for (var x = 0; x < this.form.sparnatural.components.length; x++) {
        var critere = this.form.sparnatural.components[x].CriteriaGroup;
        if (critere.StartClassGroup.variableNamePreload == variableName) {
          critere.StartClassGroup.onchangeViewVariable();
          break; // une variable ne doit être trouvé q'une seule fois et seulement la première
        }
        if (critere.EndClassGroup.variableNamePreload == variableName) {
          critere.EndClassGroup.onchangeViewVariable();
          break; // une variable ne doit être trouvé q'une seule fois et seulement la première
        }
      }
      x = 0;
    }
    this.submitOpened = true;
  };
}
export default Sparnatural;

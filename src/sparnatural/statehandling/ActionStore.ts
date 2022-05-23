import ISpecProvider from "../spec-providers/ISpecProviders";
import Sparnatural from "../components/MainComponents/Sparnatural";
import initGeneralevent from "./actions/initGeneralEvent";
import toggleVarNames from "./actions/toggleVarNames";
import generateQuery from "./actions/submitAction";
import deleteGrpWrapper from "./actions/deleteGrpWrapper";
// This is ugly, should use i18n features instead
const i18nLabels = {
  en: require("../../assets/lang/en.json"),
  fr: require("../../assets/lang/fr.json"),
};
/*
    The ActionStore is responsible of the statehandling.
    It is inspired by redux where Events are dispatched and then caught 
    by the Eventlisteners. They then change the state and trigger the right actions in the UI
*/
class ActionStore {
  sparnatural: Sparnatural;
  specProvider: any;
  orderSort: string;
  //submitOpened = false still implement
  constructor(sparnatural: Sparnatural, specProvider: ISpecProvider) {
    this.specProvider = specProvider;
    this.sparnatural = sparnatural;
    this.#addCustomEventListners();
  }
  // register the event listeners to listen for event from the components
  #addCustomEventListners() {
    this.sparnatural.html[0].addEventListener(
      "generateQuery",
      (event: CustomEvent) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "displayVarName",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
      }
    );
    // executed by VariableSelection, Start-EndclassGroup & VariableSelector
    this.sparnatural.html[0].addEventListener("onSelectViewVar", (e) => {
      e.stopImmediatePropagation();
    });

    this.sparnatural.html[0].addEventListener("onSubmit", (e) => {
      e.stopImmediatePropagation();
    });

    // Switch which toggles if the Start and Endvalues are shown as their Var name. e.g Country_1
    this.sparnatural.html[0].addEventListener("toggleVarNames", (e) => {
      e.stopImmediatePropagation();
      toggleVarNames(this);
    });
    // maxvarindex shows the index for the sparql variables. e.g Country_1
    let maxVarIndex = 0;
    this.sparnatural.html[0].addEventListener(
      "getMaxVarIndex",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        maxVarIndex++;
        // return the index in callback
        e.detail(maxVarIndex);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "changeOrderSort",
      (e: CustomEvent) => {
        this.orderSort = e.detail;
      }
    );

    this.sparnatural.html[0].addEventListener("initGeneralEvent", (e) => {
      e.stopImmediatePropagation()
      initGeneralevent(this);
    });
    this.sparnatural.html[0].addEventListener(
      "deleteGrpWrapper",
      (e: CustomEvent) => {
        deleteGrpWrapper(this, e);
      }
    );
  }
}

export default ActionStore;

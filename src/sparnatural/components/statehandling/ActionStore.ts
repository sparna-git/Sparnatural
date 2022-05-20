import { getSettings } from "../../../configs/client-configs/settings";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import GroupWrapper from "../criterialist/GroupWrapper";
import Sparnatural from "../MainComponents/Sparnatural";
import initGeneralevent from "./actions/initGeneralEvent";
import toggleVarNames from "./actions/toggleVarNames";
import submit from "./actions/submitAction";
// This is ugly, should use i18n features instead
const i18nLabels = {
  en: require("../../../assets/lang/en.json"),
  fr: require("../../../assets/lang/fr.json"),
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
  Form: {
    distinct: any;
    displayVariableList: Array<string>;
    firstInit: boolean;
    preLoad: any;
    langSearch: any;
  } = {
    distinct: getSettings().addDistinct,
    displayVariableList: ["?this"],
    firstInit: false,
    // JSON of the query to be loaded
    preLoad: null,
    langSearch: i18nLabels["en"],
  };

  // register the event listeners to listen for event from the components
  #addCustomEventListners() {
    this.sparnatural.html[0].addEventListener(
      "submit",
      (event: CustomEvent) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        submit(this);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "displayVarName",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();

      }
    );
    // executed by VariableSelection, Start-EndclassGroup & VariableSelector
    this.sparnatural.html[0].addEventListener("updateVariableList", (e) => {
      console.log("updateVariableList event caught");
      e.stopImmediatePropagation();
    });

    this.sparnatural.html[0].addEventListener("onSubmit", (e) => {
      console.log("onSubmit even caught");
      e.stopImmediatePropagation();
    });

    // Switch which toggles if the Start and Endvalues are shown as their Var name. e.g Country_1
    this.sparnatural.html[0].addEventListener("toggleVarNames", (e) => {
      e.stopImmediatePropagation();
      toggleVarNames(this)

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
    // refactor this away
    this.sparnatural.html[0].addEventListener("initGeneralEvent", () => {
      initGeneralevent(this);
    });
  }
}

export default ActionStore;

import ISpecProvider from "../spec-providers/ISpecProviders";
import Sparnatural from "../components/Sparnatural";
import initGeneralevent from "./actions/InitGeneralEvent";
import toggleVarNames from "./actions/ToggleVarNames";
import deleteGrpWrapper from "./actions/DeleteGrpWrapper";
import { Language, Order, SelectedVal } from "../sparql/ISparJson";
import generateQuery from "./actions/GenerateQuery";
import updateVarName from "./actions/UpdateVarName";
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
  order: Order;
  variables: Array<SelectedVal>
  distinct = true // default
  language = Language.EN //default
  
  sparqlVarID = 0  // sparqlVarId shows the index for the sparql variables. e.g Country_1 where '1' is the id

  maxVarIndex = 0; //maxVarIndex indicates how many AND and WHERE siblings are allowed to be added
  
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
    this.sparnatural.html[0].addEventListener("onSelectViewVar", (e:CustomEvent) => {
      if(!('type' in e.detail && 'variable' in e.detail)) throw Error('onSelectViewVar expects value of type SelectedVal')
      e.stopImmediatePropagation();
      this.sparnatural.VariableSelection.variableOrderMenu.addDraggableComponent(e.detail)
    });

    this.sparnatural.html[0].addEventListener("onSubmit", (e) => {
      e.stopImmediatePropagation();
    });

    // Switch which toggles if the Start and Endvalues are shown as their Var name. e.g Country_1
    this.sparnatural.html[0].addEventListener("toggleVarNames", (e) => {
      e.stopImmediatePropagation();
      toggleVarNames(this);
    });
   
    this.sparnatural.html[0].addEventListener(
      "getMaxVarIndex",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.maxVarIndex++;
        // return the index in callback
        e.detail(this.maxVarIndex);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "getSparqlVarId",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.sparqlVarID++;
        // return the index in callback
        e.detail(this.sparqlVarID);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "resetVarIds",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.sparqlVarID = 0
      }
    );

    this.sparnatural.html[0].addEventListener(
      "changeOrderSort",
      (e: CustomEvent) => {
        switch(e.detail){
          case 'asc':
            this.order = Order.ASC
            break;
          case 'desc':
            this.order = Order.DESC
            break;
          case 'noorder':
            this.order = Order.NOORDER
            break;
        }
        this.order = e.detail;
      }
    );

    
    this.sparnatural.html[0].addEventListener('updateVarName',(e:CustomEvent)=>{
      let payload = e.detail
      if(!('oldName' in payload && 'newName' in payload)) throw Error('updateVarName event requires an object of {oldName:string,newName:string}')
      updateVarName(this,payload.oldName,payload.newName)
    })

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

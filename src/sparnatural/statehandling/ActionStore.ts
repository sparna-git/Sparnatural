import ISpecProvider from "../spec-providers/ISpecProvider";
import Sparnatural from "../components/SparnaturalComponent";
import { ISparJson, Order } from "../generators/ISparJson";
import generateQuery from "./actions/GenerateQuery";
import toggleVarNames from "./actions/ToggleVarNames";
import updateVarName from "./actions/UpdateVarName";
import initGeneralevent from "./actions/InitGeneralEvent";
import deleteGrpWrapper from "./actions/DeleteGrpWrapper";
import { updateVarList } from "./actions/UpdateVarList";
import { selectViewVar } from "./actions/SelectViewVar";
import { readVariablesFromUI } from "./actions/SelectViewVar";
import { SelectQuery } from "sparqljs";

export enum MaxVarAction {
  INCREASE,
  DECREASE,
  RESET
}

/*
    The ActionStore is responsible of the statehandling.
    It is inspired by redux where Events are dispatched and then caught 
    by the Eventlisteners. They then change the state and trigger the right actions in the UI
*/
class ActionStore {
  sparnatural: Sparnatural;
  specProvider: any;
  order: Order = Order.NOORDER; //default no order
  variables: Array<string> = []; // example ?museum
  distinct = true; // default
  language = "en"; //default
  sparqlVarID = 0; // sparqlVarId shows the index for the sparql variables. e.g Country_1 where '1' is the id
  maxVarIndex = 0; //maxVarIndex indicates how many AND and WHERE siblings are allowed to be added
  showVariableNames = true //variable decides whether the variableNames (?Musee_1) or the label name (museum) is shown
  sparnaturalJSON:ISparJson;
  sparqlString:string;
  rdfjsSelect:SelectQuery;
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

    // executed by VariableSelection, Start-EndclassGroup & VariableSelector
    // called by click on "Eye" btn
    this.sparnatural.html[0].addEventListener(
      "onSelectViewVar",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        if (!("val" in e.detail && "selected" in e.detail))
          throw Error(
            "onSelectViewVar expects object of type {val:SelectedVal,selected:boolean}"
          );
        // add variable to selected variables
        selectViewVar(this, e.detail,e.target);
        // trigger query generation
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener("onSubmit", (e) => {
      e.stopImmediatePropagation();
      if(this.sparnatural.settings.onSubmit) {
        this.sparnatural.settings.onSubmit(this.sparnatural);
      }
    });

    // Switch which toggles if the Start and Endvalues are shown as their Var name. e.g Country_1
    this.sparnatural.html[0].addEventListener("toggleVarNames", (e) => {
      e.stopImmediatePropagation();
      toggleVarNames(this,this.showVariableNames);
      this.showVariableNames? this.showVariableNames = false : this.showVariableNames = true
    });

    this.sparnatural.html[0].addEventListener("getSelectedVariables",(e:CustomEvent)=>{

    })

    this.sparnatural.html[0].addEventListener(
      "getMaxVarIndex",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        // return the index in callback
        e.detail(this.maxVarIndex);
      }
    );

    this.sparnatural.html[0].addEventListener("updateVarList", (e) => {
      e.stopImmediatePropagation();
      updateVarList(this);
    });

    this.sparnatural.html[0].addEventListener(
      "changeMaxChildIndex",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        if (e.detail === MaxVarAction.DECREASE) this.maxVarIndex--;
        if (e.detail === MaxVarAction.INCREASE) this.maxVarIndex++;
        if(e.detail === MaxVarAction.RESET) this.maxVarIndex = 0;
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
      "getSelectedVarLength",
      (e:CustomEvent)=>{
        e.stopImmediatePropagation();
        e.detail(this.variables.length)
    })

    this.sparnatural.html[0].addEventListener("resetVars", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.sparqlVarID = 0;
      this.variables = [];
      this.maxVarIndex = 0;
      this.sparnatural.variableSection.html.remove();
      this.sparnatural.variableSection.render();
      generateQuery(this)
    });

    this.sparnatural.html[0].addEventListener(
      "changeSortOrder",
      (e: CustomEvent) => {
        if (!Object.values(Order).includes(e.detail))
          throw Error("changeSortOrder expects a payload of Order enum");
        this.order = e.detail;
        // trigger query generation
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "updateVariablesOrder",
      (e: CustomEvent) => {
        // update/reset variable names in the state
        readVariablesFromUI(this);
        // trigger query generation
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "updateVarName",
      (e: CustomEvent) => {
        let payload = e.detail;
        if (!("oldName" in payload && "newName" in payload))
          throw Error(
            "updateVarName event requires an object of {oldName:string,newName:string}"
          );
        updateVarName(this, payload.oldName, payload.newName);
        // trigger query generation
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener("initGeneralEvent", (e) => {
      e.stopImmediatePropagation();
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

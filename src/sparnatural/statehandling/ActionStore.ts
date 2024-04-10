import ISparnaturalSpecification from "../spec-providers/ISparnaturalSpecification";
import SparnaturalComponent from "../components/SparnaturalComponent";
import { ISparJson, Order } from "../generators/ISparJson";
import generateQuery from "./actions/GenerateQuery";
import toggleVarNames from "./actions/ToggleVarNames";
import updateVarName from "./actions/UpdateVarName";
import redrawBackgroundAndLinks from "./actions/InitGeneralEvent";
import deleteGrpWrapper from "./actions/DeleteGrpWrapper";
import { updateVarList } from "./actions/UpdateVarList";
import { selectViewVar } from "./actions/SelectViewVar";
import { readVariablesFromUI } from "./actions/SelectViewVar";
import { SelectQuery } from "sparqljs";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { SparnaturalElement } from "../../SparnaturalElement";
import { getSettings } from "../settings/defaultSettings";

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
  sparnatural: SparnaturalComponent;
  specProvider: any;
  order: Order = Order.NOORDER; //default no order
  variables: Array<string> = []; // example ?museum
  language = "en"; //default
  sparqlVarID = 0; // sparqlVarId shows the index for the sparql variables. e.g Country_1 where '1' is the id
  showVariableNames = true //variable decides whether the variableNames (?Musee_1) or the label name (museum) is shown
  sparnaturalJSON:ISparJson;
  sparqlString:string;
  rdfjsSelect:SelectQuery;
  //submitOpened = false still implement
  
  // when quiet, don't emit onQueryUpdated events
  // this is set when a query is loaded
  quiet = false;
  
  constructor(sparnatural: SparnaturalComponent, specProvider: ISparnaturalSpecification) {
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
        // trigger query generation + re-enable submit button
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
        // trigger query generation + re-enable submit button
        generateQuery(this);
      }
    );

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
        var maxDepth = 1;
        this.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePostOrder((grpWrapper: GroupWrapper) => {
          if(grpWrapper.depth > maxDepth) {
            maxDepth = grpWrapper.depth;
          }
        });

        // return the index in callback
        e.detail(maxDepth);
      }
    );

    this.sparnatural.html[0].addEventListener("updateVarList", (e) => {
      e.stopImmediatePropagation();
      updateVarList(this);
    });

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
      this.sparnatural.variableSection.html.remove();
      this.sparnatural.variableSection.render();
      // not sure we should regenerate the query here
      generateQuery(this)
    });

    this.sparnatural.html[0].addEventListener(
      "changeSortOrder",
      (e: CustomEvent) => {
        if (!Object.values(Order).includes(e.detail))
          throw Error("changeSortOrder expects a payload of Order enum");
        this.order = e.detail;
        // trigger query generation + re-enable submit button
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "updateVariablesOrder",
      (e: CustomEvent) => {
        // update/reset variable names in the state
        readVariablesFromUI(this);
        // trigger query generation + re-enable submit button
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "updateVarName",
      (e: CustomEvent) => {
        let payload = e.detail;
        if (!("oldName" in payload && "newName" in payload && "selectedAggrFonction" in payload && "varNameAggr" in payload))
          throw Error(
            "updateVarName event requires an object of {oldName: string, newName: string, selectedAggrFonction: string, varNameAggr: string}"
          );
        
        updateVarName(this, payload.oldName, payload.newName, payload.selectedAggrFonction, payload.varNameAggr);
        
        // trigger query generation + re-enable submit button
        generateQuery(this);
      }
    );

    this.sparnatural.html[0].addEventListener("redrawBackgroundAndLinks", (e) => {
      e.stopImmediatePropagation();
      redrawBackgroundAndLinks(this);
    });

    this.sparnatural.html[0].addEventListener(
      "deleteGrpWrapper",
      (e: CustomEvent) => {
        deleteGrpWrapper(this, e);
      }
    );

    // called by RemoveEndClass to adjust the sparqlVarID after a CriteriaGroup deletion and recreation
    this.sparnatural.html[0].addEventListener(
      "adjustSparqlVarID",
      (e: CustomEvent) => {
        let payload = e.detail;
        this.sparqlVarID += payload;
      }
    );
  }
}

export default ActionStore;

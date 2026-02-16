import { ISparnaturalSpecification } from "../spec-providers/ISparnaturalSpecification";
import SparnaturalComponent from "../components/SparnaturalComponent";
import { Order } from "../SparnaturalQueryIfc";
import toggleVarNames from "./actions/ToggleVarNames";
import updateVarName from "./actions/UpdateVarName";
import redrawBackgroundAndLinks from "./actions/RedrawBackgroundAndLinks";
import deleteGrpWrapper from "./actions/DeleteGrpWrapper";
import { updateVarList } from "./actions/UpdateVarList";
import { selectViewVar } from "./actions/SelectViewVar";
import { SelectQuery } from "sparqljs";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { QueryGenerator } from "./actions/GenerateQuery";
import { Model } from "rdf-shacl-commons";

export enum MaxVarAction {
  INCREASE,
  DECREASE,
  RESET,
}

/*
    The ActionStore is responsible of the statehandling.
    It is inspired by redux where Events are dispatched and then caught 
    by the Eventlisteners. They then change the state and trigger the right actions in the UI
*/
class ActionStore {
  sparnatural: SparnaturalComponent;
  specProvider: any;
  language = "en"; //default
  showVariableNames = true; //variable decides whether the variableNames (?Musee_1) or the label name (museum) is shown

  // when quiet, don't emit onQueryUpdated events
  // this is set when a query is loaded
  quiet = false;

  constructor(
    sparnatural: SparnaturalComponent,
    specProvider: ISparnaturalSpecification
  ) {
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
        new QueryGenerator(this).generateQuery();
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
        selectViewVar(this, e.detail, e.target);
        // trigger query generation + re-enable submit button
        new QueryGenerator(this).generateQuery();
      }
    );

    // Switch which toggles if the Start and Endvalues are shown as their Var name. e.g Country_1
    this.sparnatural.html[0].addEventListener("toggleVarNames", (e) => {
      e.stopImmediatePropagation();
      toggleVarNames(this.sparnatural, this.showVariableNames);
      this.showVariableNames
        ? (this.showVariableNames = false)
        : (this.showVariableNames = true);
    });

    this.sparnatural.html[0].addEventListener(
      "getSelectedVariables",
      (e: CustomEvent) => {}
    );

    this.sparnatural.html[0].addEventListener(
      "getMaxDepth",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        var maxDepth = 1;
        this.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePostOrder(
          (grpWrapper: GroupWrapper) => {
            if (grpWrapper.depth > maxDepth) {
              maxDepth = grpWrapper.depth;
            }
          }
        );

        // return the index in callback
        e.detail(maxDepth);
      }
    );

    this.sparnatural.html[0].addEventListener("updateVarList", (e) => {
      e.stopImmediatePropagation();
      updateVarList(this);
    });

    this.sparnatural.html[0].addEventListener(
      "getSparqlVar",
      (e: CustomEvent) => {
        let payload = e.detail;
        if (!("type" in payload))
          throw Error(
            "getSparqlVar event requires an object of { type: string }"
          );
        
        e.stopImmediatePropagation();

        let maxVariableIndexPerTypes = this.sparnatural.getMaxVariableIndexByTypes();
        let currentTypeIndex = maxVariableIndexPerTypes.get(payload.type) || 0;

        // return the variable name in callback
        if(currentTypeIndex === 0) {
          // if first variable of this type don't add the index to have more readable variable names when there's only one of each type,
          // e.g ?Country instead of ?Country_1
          payload.callback(`${Model.getSparqlVariableNameFromUri(payload.type)}`);
        } else {
          payload.callback(`${Model.getSparqlVariableNameFromUri(payload.type)}_${currentTypeIndex + 1}`);
        }
        
      }
    );


    this.sparnatural.html[0].addEventListener(
      "getSelectedVarLength",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        e.detail(this.sparnatural.variableSection.listVariables().length);
      }
    );

    this.sparnatural.html[0].addEventListener("resetVars", (e: CustomEvent) => {
      e.stopImmediatePropagation();

      this.sparnatural.variableSection.html.remove();
      this.sparnatural.variableSection.render();
      // not sure we should regenerate the query here
      new QueryGenerator(this).generateQuery();
    });

    this.sparnatural.html[0].addEventListener(
      "changeSortOrder",
      (e: CustomEvent) => {
        if (!Object.values(Order).includes(e.detail))
          throw Error("changeSortOrder expects a payload of Order enum");
        // this.order = e.detail;
        // trigger query generation + re-enable submit button
        new QueryGenerator(this).generateQuery();
      }
    );

    this.sparnatural.html[0].addEventListener(
      "updateVariablesOrder",
      (e: CustomEvent) => {
        // update/reset variable names in the state
        // readVariablesFromUI(this);
        // trigger query generation + re-enable submit button
        new QueryGenerator(this).generateQuery();
      }
    );

    this.sparnatural.html[0].addEventListener(
      "updateVarName",
      (e: CustomEvent) => {
        let payload = e.detail;
        if (!("state" in payload))
          throw Error(
            "updateVarName event requires an object of { state: { } }"
          );

        updateVarName(this, payload.state, payload.previousVarName);

        // trigger query generation + re-enable submit button
        new QueryGenerator(this).generateQuery();
      }
    );

    this.sparnatural.html[0].addEventListener(
      "updateAggr",
      (e: CustomEvent) => {
        // trigger query generation + re-enable submit button
        new QueryGenerator(this).generateQuery();
      }
    );

    this.sparnatural.html[0].addEventListener(
      "redrawBackgroundAndLinks",
      (e) => {
        e.stopImmediatePropagation();
        redrawBackgroundAndLinks(this.sparnatural);
      }
    );

    this.sparnatural.html[0].addEventListener(
      "deleteGrpWrapper",
      (e: CustomEvent) => {
        deleteGrpWrapper(this.sparnatural, e);
      }
    );
  }
}

export default ActionStore;

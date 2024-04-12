import { SelectedVal } from "../../components/SelectedVal";
import { DraggableComponent } from "../../components/variables-section/variableorder/DraggableComponent";
import ActionStore from "../ActionStore";

// This Action gets called when an SelctViewVar ("eye") Button is clicked
// Is also always called for the first variable added
export function selectViewVar(
  actionStore: ActionStore,
  payload: { val: SelectedVal; selected: boolean, defaultLbl:SelectedVal },
  target:EventTarget
) {
    // delete if unselected OR add if variable was selected
    if(!payload.selected) deleteVariable(actionStore,payload.val)
    if(payload.selected) addVariable(actionStore, payload.val)
}


// export function readVariablesFromUI(actionStore: ActionStore) {
  //update the varnames
  /*
  actionStore.variables =
    actionStore.sparnatural.variableSection.variableOrderMenu.draggables.map(
      (d: DraggableComponent) => {
        return d.varName;
      }
    );
    */
// }

function addVariable(actionStore: ActionStore, val: SelectedVal) {
  if(actionStore.sparnatural.variableSection.variableOrderMenu.draggables.find((d:DraggableComponent)=>{
    return d.state.varName === val.variable.replace('?','')
  })) return // draggable already exists
  //add a draggable
  actionStore.sparnatural.variableSection.variableOrderMenu.addDraggableComponent(
    val
  );
  //update stateobject
  // actionStore.variables.push(val.variable.replace('?',''))
  //update the varnames
  // readVariablesFromUI(actionStore);
}

function deleteVariable(actionStore: ActionStore, val: SelectedVal) {
  //remove a draggable
  actionStore.sparnatural.variableSection.variableOrderMenu.removeDraggableByVarName(
    val.variable
  );
  //update the varnames
  // readVariablesFromUI(actionStore);
  //update the variables in the state
  // actionStore.variables.filter((v)=> v!=val.variable.replace('?',''))
}

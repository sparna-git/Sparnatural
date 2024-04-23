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


function addVariable(actionStore: ActionStore, val: SelectedVal) {
  if(actionStore.sparnatural.variableSection.variableOrderMenu.draggables.find((d:DraggableComponent)=>{
    return d.state.selectedVariable.variable === val.variable
  })) return // draggable already exists
  
  //add a draggable
  actionStore.sparnatural.variableSection.variableOrderMenu.addDraggableComponent(
    val
  );

}

function deleteVariable(actionStore: ActionStore, val: SelectedVal) {
  //remove a draggable
  actionStore.sparnatural.variableSection.variableOrderMenu.removeDraggableByVarName(
    val.variable
  );
}

import DraggableComponent from "../../components/variables-section/variableorder/DraggableComponent";
import { SelectedVal } from "../../sparql/ISparJson";
import ActionStore from "../ActionStore";


// This Action gets called when an SelctViewVar ("eye") Button is clicked
export function selectViewVar(
  actionStore: ActionStore,
  payload: { val: SelectedVal; selected: boolean, defaultLbl:SelectedVal },
  target:EventTarget
) {
  
  if( // If there is only one variable left then don't allow to deselect it.
    actionStore.sparnatural.VariableSelection.variableOrderMenu.draggables.length <= 1
    && !payload.selected
    ) {
      //delete Var since with the blockAction (click Event) it will be reselected
      deleteVariable(actionStore,payload.val)
      blockAction(target)
      return
    } 

  if(payload.selected){
    addVariable(actionStore, payload.val)
    if(payload.defaultLbl?.variable) addVariable(actionStore,payload.defaultLbl)
  } else {
    deleteVariable(actionStore, payload.val);
    if(payload.defaultLbl?.variable) deleteVariable(actionStore, payload.defaultLbl);
  }
  
}


export function readVariablesFromUI(actionStore: ActionStore) {
  //update the varnames
  actionStore.variables =
    actionStore.sparnatural.VariableSelection.variableOrderMenu.draggables.map(
      (d: DraggableComponent) => {
        return d.varName;
      }
    );
}

function blockAction(target:EventTarget){
 target.dispatchEvent(new Event('click'))
}

function addVariable(actionStore: ActionStore, val: SelectedVal) {
  if(actionStore.sparnatural.VariableSelection.variableOrderMenu.draggables.find((d:DraggableComponent)=>{
    return d.varName === val.variable.replace('?','')
  })) return // draggable already exists
  //add a draggable
  actionStore.sparnatural.VariableSelection.variableOrderMenu.addDraggableComponent(
    val
  );
  //update stateobject
  actionStore.variables.push(val.variable.replace('?',''))
  //update the varnames
  readVariablesFromUI(actionStore);
}

function deleteVariable(actionStore: ActionStore, val: SelectedVal) {
  //add a draggable
  actionStore.sparnatural.VariableSelection.variableOrderMenu.removeDraggableComponent(
    val
  );
  // look for the defaultLabelProperty as well
  // see: https://docs.sparnatural.eu/OWL-based-configuration#classes-configuration-reference
  actionStore.sparnatural.VariableSelection.variableOrderMenu.removeDraggableComponent({type:"-",variable:`${val.variable}_lbl`})
  //update the varnames
  readVariablesFromUI(actionStore);
  //update the variables in the state
  actionStore.variables.filter((v)=> v!=val.variable.replace('?',''))
}



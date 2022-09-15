import DraggableComponent from "../../components/variables-section/variableorder/DraggableComponent";
import { SelectedVal } from "../../sparql/ISparJson";
import ActionStore from "../ActionStore";


// This Action gets called when an SelctViewVar ("eye") Button is clicked
export function selectViewVar(
  actionStore: ActionStore,
  payload: { val: SelectedVal; selected: boolean, defaultLbl:SelectedVal },
  target:EventTarget
) {
  
  if( // If there is only one variable left (or one var and its default label) then don't allow to deselect it.
    actionStore.sparnatural.VariableSelection.variableOrderMenu.draggables.length <= 2
    && !payload.selected
    ) {
      //delete Var since with the blockAction (click Event) it will be reselected
      deleteVariable(actionStore,payload.val)
      deleteVariable(actionStore,payload.defaultLbl)
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
  actionStore.sparnatural.VariableSelection.variableOrderMenu.removeDraggableByVarName(
    val.variable
  );
  //update the varnames
  readVariablesFromUI(actionStore);
  //update the variables in the state
  actionStore.variables.filter((v)=> v!=val.variable.replace('?',''))
}



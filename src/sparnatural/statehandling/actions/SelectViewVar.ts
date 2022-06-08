import DraggableComponent from "../../components/variables-section/variableorder/DraggableComponent";
import { SelectedVal } from "../../sparql/ISparJson";
import ActionStore from "../ActionStore";

export function selectViewVar(actionStore:ActionStore,payload:{val: SelectedVal, selected:boolean}){
    payload.selected ? addVariable(actionStore,payload.val) : deleteVariable(actionStore,payload.val)
     
}

function addVariable(actionStore:ActionStore,val:SelectedVal){
     //add a draggable
     actionStore.sparnatural.VariableSelection.variableOrderMenu.addDraggableComponent(val)
     //update the varnames
     actionStore.variables = actionStore.sparnatural.VariableSelection.variableOrderMenu.draggables.map((d:DraggableComponent)=>{
       return d.varName
     })
}

function deleteVariable(actionStore:ActionStore,val:SelectedVal){
    //add a draggable
    actionStore.sparnatural.VariableSelection.variableOrderMenu.removeDraggableComponent(val)
    //update the varnames
    actionStore.variables = actionStore.sparnatural.VariableSelection.variableOrderMenu.draggables.map((d:DraggableComponent)=>{
    return d.varName
    })
}
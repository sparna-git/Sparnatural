import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import DraggableComponent from "../../components/variables-section/variableorder/DraggableComponent";
import ActionStore from "../ActionStore";


/*
    Traversing trough the building section and read out all the variables.
    Delete all variables (Draggables) in the variables-section which are not present
    Can be used when a GrpWrapper got deleted and the variable list needs to be updated
*/
export function updateVarList(actionStore:ActionStore){
    // using a set so we don't have double values in it
    let varNames = new Set<string>()
    actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
        (grpWrapper:GroupWrapper) => {
          let startGrp = grpWrapper.CriteriaGroup.StartClassGroup
          let endGrp = grpWrapper.CriteriaGroup.EndClassGroup
          varNames.add(startGrp.getVarName()) 
          varNames.add(endGrp.getVarName())
        }
    );
    updateDraggables(actionStore,varNames)
    actionStore.variables = [...varNames]
}

function updateDraggables(actionStore:ActionStore,varNames:Set<string>){
    let draggables = actionStore.sparnatural.VariableSelection.variableOrderMenu.draggables
    // filter out the variables which don't exist anymore
    draggables = draggables.filter((d:DraggableComponent)=>{
        if(varNames.has(d.varName)) return d
    })
}
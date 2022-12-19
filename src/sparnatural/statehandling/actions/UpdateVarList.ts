import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import DraggableComponent from "../../components/variables-section/variableorder/DraggableComponent";
import ActionStore from "../ActionStore";

/*
    Traversing trough the building section and read out all the variables.
    Delete all variables (Draggables) in the variables-section which are not present
    Can be used when a GrpWrapper got deleted and the variable list needs to be updated
*/
export function updateVarList(actionStore: ActionStore) {
  // using a set so we don't have double values in it
  let varNames = new Set<string>();
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      let startGrp = grpWrapper.CriteriaGroup.SubjectSelector;
      let endGrp = grpWrapper.CriteriaGroup.ObjectSelector;
      //always remove the '?' as the first char
      if(startGrp.getVarName()) varNames.add(startGrp.getVarName()?.slice(1));
      if(endGrp.getVarName()) varNames.add(endGrp.getVarName()?.slice(1));      
    }
  );
  updateDraggables(actionStore, varNames);
  actionStore.variables = [...varNames];
}

function updateDraggables(actionStore: ActionStore, varNames: Set<string>) {
  let draggables =
    actionStore.sparnatural.variableSection.variableOrderMenu.draggables;
  // filter out the variables which don't exist anymore
  draggables = draggables.filter((d: DraggableComponent) => {
    if (varNames.has(d.varName)) {
      //keep draggable
      return d;
    } else {
      //delete it
      d.html.remove();
    }
  });
}

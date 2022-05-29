import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";

/*
    Fired when a variable name got changed in the Draggable Component
*/
export default function updateVarName(
    actionStore: ActionStore,
    oldName:string,
    newName:string,
  ) {
    // traversePreOrder through components and calculate background / linkAndBottoms /  for them
    actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
      (grpWrapper: GroupWrapper) => {
        let startGrp = grpWrapper.CriteriaGroup.StartClassGroup
        let endGrp = grpWrapper.CriteriaGroup.EndClassGroup
        if(startGrp.getVarName() === oldName) startGrp.setVarName(newName)
        if(endGrp.getVarName() === oldName) endGrp.setVarName(newName)
      }
    );
    actionStore.sparnatural.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent")
    );
  }
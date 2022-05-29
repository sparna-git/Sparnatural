import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";

export default function toggleVarNames(actionsStore: ActionStore) {
  actionsStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper:GroupWrapper) => {
      let startGrp = grpWrapper.CriteriaGroup.StartClassGroup
      let endGrp = grpWrapper.CriteriaGroup.EndClassGroup
      startGrp.inputTypeComponent.toggleVarName()
      endGrp.inputTypeComponent.toggleVarName()
    }
  );
}

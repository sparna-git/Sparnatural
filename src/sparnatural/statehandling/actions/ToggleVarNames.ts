import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";

export default function toggleVarNames(actionsStore: ActionStore,showVarNames:boolean) {
  actionsStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      let startGrp = grpWrapper.CriteriaGroup.SubjectSelector;
      let endGrp = grpWrapper.CriteriaGroup.ObjectSelector;
      if(showVarNames){
        startGrp.inputTypeComponent.showVarName()
        endGrp.inputTypeComponent.showVarName()
      } else {
        startGrp.inputTypeComponent.showTypeName()
        endGrp.inputTypeComponent.showTypeName()
      }
    }
  );
  actionsStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks")
  );
}

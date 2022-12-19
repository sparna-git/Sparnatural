import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";

export default function toggleVarNames(actionsStore: ActionStore,showVarNames:boolean) {
  actionsStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      let SubjectSlct = grpWrapper.CriteriaGroup.SubjectSelector;
      let objectSlct = grpWrapper.CriteriaGroup.ObjectSelector;
      if(showVarNames){
        SubjectSlct.inputTypeComponent.showVarName()
        objectSlct.inputTypeComponent.showVarName()
      } else {
        SubjectSlct.inputTypeComponent.showTypeName()
        objectSlct.inputTypeComponent.showTypeName()
      }
    }
  );
  actionsStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks")
  );
}

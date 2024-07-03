import SparnaturalComponent from "../../components/SparnaturalComponent";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";

export default function toggleVarNames(sparnatural:SparnaturalComponent,showVarNames:boolean) {
  sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      let startGrp = grpWrapper.CriteriaGroup.StartClassGroup;
      let endGrp = grpWrapper.CriteriaGroup.EndClassGroup;
      if(showVarNames){
        startGrp.inputSelector.showVarName()
        endGrp.inputSelector.showVarName()
      } else {
        startGrp.inputSelector.showTypeName()
        endGrp.inputSelector.showTypeName()
      }
    }
  );

  sparnatural.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks")
  );
}

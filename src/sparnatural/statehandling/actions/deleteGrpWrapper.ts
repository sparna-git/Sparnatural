import GroupWrapper from "../../components/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";
/*
  A general Event is either an addSiblingComponen/addWhereChild OR a onRemoveGrpWrapper
*/
export default function deleteGrpWrapper(
  actionStore: ActionStore,
  e: CustomEvent
) {
  let elToDel = e.detail as GroupWrapper;
  let deleteIt = (el: GroupWrapper) => {
    el.html.empty();
    el.html.remove();
  };
  // traverse through components and calculate background / linkAndBottoms /  for them
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse(
    (grpWrapper: GroupWrapper) => {
      if (grpWrapper === elToDel) {
        //grpWrapper is the root groupwrapper
        grpWrapper.html.empty();
        grpWrapper.html.remove();
        deleteIt(grpWrapper);
      }
      if (grpWrapper.andSibling === elToDel) {
        grpWrapper.linkAndBottom.html.empty().remove();
        grpWrapper.linkAndBottom = null;
        deleteIt(grpWrapper.andSibling);
        grpWrapper.andSibling = null;
        grpWrapper.setObjectPropertySelectedState();
        //grpWrapper.CriteriaGroup.ActionsGroup.onObjectPropertyGroupSelected()
      }
      if (grpWrapper.whereChild === elToDel) {
        grpWrapper.linkWhereBottom.html.empty().remove();
        grpWrapper.linkWhereBottom = null;
        deleteIt(grpWrapper.whereChild);
        grpWrapper.whereChild = null;
        grpWrapper.setObjectPropertySelectedState();
      }
    }
  );
  actionStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent")
  );
}

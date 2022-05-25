import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
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
    el?.linkWhereBottom?.html?.empty()?.remove()
    el?.linkAndBottom?.html?.empty()?.remove()
    el.html.empty();
    el.html.remove();
  };
  // traversePreOrder through components and calculate background / linkAndBottoms /  for them
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      if(grpWrapper === elToDel){
        //grpWrapper is root node. call resetCallBack like resetBtn would have been clicked
        actionStore.sparnatural.BgWrapper.resetCallback()
      }
      if(grpWrapper.andSibling === elToDel){
        grpWrapper.andSibling.traversePostOrder((grpWrapper:GroupWrapper)=>{
          deleteIt(grpWrapper)
        })
        grpWrapper.andSibling = null
        grpWrapper.linkAndBottom.html.empty().remove()
        grpWrapper.setObjectPropertySelectedState()
      }
      if (grpWrapper.whereChild === elToDel) {
        grpWrapper.whereChild.traversePostOrder((grpWrapper:GroupWrapper)=>{
          deleteIt(grpWrapper)
        })
        grpWrapper.whereChild = null
        grpWrapper.linkWhereBottom.html.empty().remove()
        grpWrapper.setObjectPropertySelectedState()
      }

    }
  );
  actionStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent")
  );
}

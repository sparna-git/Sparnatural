import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import ActionStore, { MaxVarAction } from "../ActionStore";
/*
  This method traverses first preorder through the tree and looks for the child component to delete.
  It then traverses postorder through the descendants of the element to delete and deletes them all
*/
export default function deleteGrpWrapper(
  actionStore: ActionStore,
  e: CustomEvent
) {
  let elToDel = e.detail as GroupWrapper;
  // utility function
  let deleteIt = (el: GroupWrapper) => {
    el?.linkWhereBottom?.html?.empty()?.remove();
    el?.linkAndBottom?.html?.empty()?.remove();
    el.html.empty();
    el.html.remove();
  };
  // traversePreOrder through components and calculate background / linkAndBottoms /  for them
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      if (grpWrapper === elToDel) {
        //grpWrapper is root node. call resetCallBack like resetBtn would have been clicked
        actionStore.sparnatural.BgWrapper.resetCallback();
        actionStore.sparnatural.html[0].dispatchEvent(
          new CustomEvent("changeMaxChildIndex", {
            detail: MaxVarAction.DECREASE,
          })
        );
      }
      if (grpWrapper.andSibling === elToDel) {
        grpWrapper.andSibling.traversePostOrder((grpWrapper: GroupWrapper) => {
          deleteIt(grpWrapper);
          actionStore.sparnatural.html[0].dispatchEvent(
            new CustomEvent("changeMaxChildIndex", {
              detail: MaxVarAction.DECREASE,
            })
          );
        });
        grpWrapper.andSibling = null;
        grpWrapper.linkAndBottom.html.empty().remove();
        grpWrapper.setObjectPropertySelectedState();
      }
      if (grpWrapper.whereChild === elToDel) {
        grpWrapper.whereChild.traversePostOrder((grpWrapper: GroupWrapper) => {
          deleteIt(grpWrapper);
          actionStore.sparnatural.html[0].dispatchEvent(
            new CustomEvent("changeMaxChildIndex", {
              detail: MaxVarAction.DECREASE,
            })
          );
        });
        grpWrapper.whereChild = null;
        grpWrapper.linkWhereBottom.html.empty().remove();
        grpWrapper.setObjectPropertySelectedState();
        // remove completed class so that it returns to its original height
        grpWrapper.html[0].classList.remove("completed");
      }
    }
  );
  actionStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks")
  );
  // there might have been variables in the variable section which now got deleted
  actionStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("updateVarList")
  );
  // update the query
  actionStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
}

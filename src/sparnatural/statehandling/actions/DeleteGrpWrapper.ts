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
  // element to delete
  let elToDel = e.detail as GroupWrapper;
  // utility function
  let deleteIt = (el: GroupWrapper) => {
    el?.linkWhereBottom?.html?.empty()?.remove();
    el?.linkAndBottom?.html?.empty()?.remove();
    el.html.empty();
    el.html.remove();
  }; 
  const deleteWhereChilds = (grpWrapper:GroupWrapper) => {
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
  }

  // traversePreOrder through components and calculate background / linkAndBottoms /  for them
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      if(grpWrapper === elToDel && grpWrapper.isRootGrpWrapper()) {
        if (elToDel.whereChild) deleteWhereChilds(elToDel)
        if(elToDel.andSibling) {
          grpWrapper.whereChild = elToDel.andSibling
          deleteIt(elToDel)
        } else {
          actionStore.sparnatural.BgWrapper.resetCallback();
        }
        return // we are done here   
      }

      if(grpWrapper.whereChild === elToDel) {
        grpWrapper.whereChild = elToDel.andSibling
        if(!grpWrapper.whereChild){
          grpWrapper.linkWhereBottom.html.empty().remove();
          // remove completed class so that it returns to its original height
          grpWrapper.html[0].classList.remove("completed");
        } 
      }
      if(grpWrapper.andSibling === elToDel) {
        grpWrapper.andSibling = elToDel.andSibling
        if (!grpWrapper.andSibling) grpWrapper.linkAndBottom.html.empty().remove();
      }
      // whether grpWrapper.andSibling | grpWrapper.whereChild, do the following
      if (elToDel.whereChild) deleteWhereChilds(elToDel)
      deleteIt(elToDel)
      grpWrapper.setObjectPropertySelectedState();
      actionStore.sparnatural.html[0].dispatchEvent(
        new CustomEvent("changeMaxChildIndex", {
          detail: MaxVarAction.DECREASE,
        })
      );
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

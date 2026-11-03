import SparnaturalComponent from "../../components/SparnaturalComponent";
import ComponentsList from "../../components/builder-section/ComponentsList";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import { HTMLComponent } from "../../components/HtmlComponent";
import { I18n } from "../../settings/I18n";

/*
  This method traverses first preorder through the tree and looks for the child component to delete.
  It then traverses postorder through the descendants of the element to delete and deletes them all
*/
export default function deleteGrpWrapper(
  sparnatural: SparnaturalComponent,
  e: CustomEvent
) {
  // element to delete
  let elToDel = e.detail as GroupWrapper;
  // read before the lines get renumbered
  const removedLineNumber = elToDel.lineNumber;
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
    });
    grpWrapper.whereChild = null;
    grpWrapper.linkWhereBottom?.html.empty().remove();
    grpWrapper.setObjectPropertySelectedState();
  }

  // traversePreOrder through components and calculate background / linkAndBottoms /  for them
  sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      if(grpWrapper === elToDel && grpWrapper.isRootGrpWrapper()) {
        if(elToDel.whereChild) deleteWhereChilds(elToDel)
        if(elToDel.andSibling) {
          // We are making the andSibling the root grpWrapper
          (grpWrapper.parentComponent as ComponentsList).attachNewRoot(elToDel.andSibling);
          deleteIt(elToDel)
        } else {
          sparnatural.BgWrapper.resetCallback();
        }
        return // we are done here   
      }

      if(grpWrapper.whereChild === elToDel) {
        grpWrapper.whereChild = elToDel.andSibling
        if(!grpWrapper.whereChild){
          grpWrapper.linkWhereBottom?.html.empty().remove();
          grpWrapper.setObjectPropertySelectedState();
          // remove completed class so that it returns to its original height
          grpWrapper.html[0].classList.remove("completed");
        } 
      }
      if(grpWrapper.andSibling === elToDel) {
        grpWrapper.andSibling = elToDel.andSibling
        if (!grpWrapper.andSibling){
          grpWrapper.linkAndBottom?.html.empty().remove();
          grpWrapper.setObjectPropertySelectedState();
        }
      } 
      // whether grpWrapper.andSibling | grpWrapper.whereChild, do the following
      if (elToDel.whereChild) deleteWhereChilds(elToDel)
      deleteIt(elToDel)
    }
  );

  sparnatural.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks")
  );
  HTMLComponent.announce(
    sparnatural.html[0],
    I18n.format("Announce.lineRemoved", { n: removedLineNumber })
  );
  // there might have been variables in the variable section which now got deleted
  sparnatural.html[0].dispatchEvent(
    new CustomEvent("updateVarList")
  );
  // update the query
  sparnatural.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
}

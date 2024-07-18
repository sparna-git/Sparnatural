import { SelectedVal } from "../../../../SelectedVal";
import GroupWrapper from "../../GroupWrapper";
import LinkWhereBottom from "../../LinkWhereBottom";

let removeEditComponents = (grpWrapper: GroupWrapper) => {
  grpWrapper.CriteriaGroup.EndClassGroup.html[0].dispatchEvent(
    new CustomEvent("removeEditComponents", {bubbles:true})
  );
  grpWrapper.CriteriaGroup.EndClassGroup.editComponents = null;
};

//give it additional class childsList
export function addWhereComponent(
  grpWrapper: GroupWrapper,
  endClassVal: SelectedVal
) {
  removeEditComponents(grpWrapper);
  //provide endclassval as startvalue for the new group
  grpWrapper.whereChild = new GroupWrapper(
    grpWrapper,
    grpWrapper.specProvider,
    // depth = parent depth + 1
    grpWrapper.depth + 1,
    endClassVal
  ).render();

  //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
  let inputSelector =
    grpWrapper.whereChild.CriteriaGroup.StartClassGroup.inputSelector;
  
    inputSelector.oldWidget.val(endClassVal.type).niceSelect("update");
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  inputSelector.html[0].children[1].classList.add("disabled");
  // render the link where
  grpWrapper.linkWhereBottom = new LinkWhereBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
}

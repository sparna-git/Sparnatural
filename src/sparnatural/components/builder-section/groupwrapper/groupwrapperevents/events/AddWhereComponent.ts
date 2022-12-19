import { SelectedVal } from "../../../../../generators/ISparJson";
import { MaxVarAction } from "../../../../../statehandling/ActionStore";
import GroupWrapper from "../../GroupWrapper";
import LinkWhereBottom from "../../LinkWhereBottom";

let removeEditComponents = (grpWrapper: GroupWrapper) => {
  grpWrapper.CriteriaGroup.ObjectSelector.html[0].dispatchEvent(
    new CustomEvent("removeEditComponents", {bubbles:true})
  );
  grpWrapper.CriteriaGroup.ObjectSelector.editComponents = null;
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

  /*
  // Insert ul Tag so that the whereChild <li> tag gets rendered into an <ul> tag
  const ulTag = $('<ul/>')
  grpWrapper.html.append(ulTag)
  grpWrapper.whereChild.htmlParent = ulTag
  grpWrapper.whereChild.render();
  */

  //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
  let inputTypeComponent =
    grpWrapper.whereChild.CriteriaGroup.SubjectSelector.inputTypeComponent;
  inputTypeComponent.oldWidget.val(endClassVal.type).niceSelect("update");
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  inputTypeComponent.html[0].children[1].classList.add("disabled");
  // render the link where
  grpWrapper.linkWhereBottom = new LinkWhereBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
}

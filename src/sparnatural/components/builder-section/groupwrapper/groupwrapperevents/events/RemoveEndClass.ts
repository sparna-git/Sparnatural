import CriteriaGroup from "../../criteriagroup/CriteriaGroup";
import GroupWrapper from "../../GroupWrapper";

// Remove the EndClass and rerender from the point where the subjectVal got selected
export function removeEndClass(grpWrapper: GroupWrapper) {
  // first delete the whereChild classes
  if (grpWrapper.whereChild)
    grpWrapper.whereChild.html[0].dispatchEvent(new CustomEvent("onRemoveGrp"));

  let startVal = grpWrapper.CriteriaGroup.SubjectSelector.subjectVal;
  grpWrapper.CriteriaGroup.html.empty();
  grpWrapper.CriteriaGroup.html.remove();
  grpWrapper.CriteriaGroup = new CriteriaGroup(
    grpWrapper,
    grpWrapper.specProvider,
    undefined,
    grpWrapper.isRootGrpWrapper()
  ).render();

  // set StartClassVal
  let inputTypeComponent =
    grpWrapper.CriteriaGroup.SubjectSelector.inputTypeComponent;
  inputTypeComponent.oldWidget.val(startVal.type).niceSelect("update");
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  inputTypeComponent.html[0].children[1].classList.add("disabled");

  // there might have been variables in the variable section which now got deleted
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("updateVarList", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
}

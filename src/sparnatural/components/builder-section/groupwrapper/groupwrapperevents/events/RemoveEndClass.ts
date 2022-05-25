import CriteriaGroup from "../../criteriagroup/CriteriaGroup";
import GroupWrapper from "../../GroupWrapper";

  // Remove the EndClass and rerender from the point where the startClassVal got selected
export function removeEndClass(grpWrapper:GroupWrapper) {
  // first delete the whereChild classes
  if(grpWrapper.whereChild) grpWrapper.whereChild.html[0].dispatchEvent(new CustomEvent('onRemoveGrp'))

  let startVal = grpWrapper.CriteriaGroup.StartClassGroup.startClassVal;
  grpWrapper.CriteriaGroup.html.empty();
  grpWrapper.CriteriaGroup.html.remove();
  grpWrapper.CriteriaGroup = new CriteriaGroup(grpWrapper, grpWrapper.specProvider).render();
  grpWrapper.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
    .val(startVal.type)
    .niceSelect("update");
}
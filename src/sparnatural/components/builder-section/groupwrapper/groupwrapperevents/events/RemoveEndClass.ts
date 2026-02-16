import CriteriaGroup from "../../criteriagroup/CriteriaGroup";
import { OptionTypes } from "../../criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../GroupWrapper";

// Remove the EndClass and rerender from the point where the startClassVal got selected
export function removeEndClass(grpWrapper: GroupWrapper) {
  // first delete the whereChild classes
  if (grpWrapper.whereChild)
    grpWrapper.whereChild.html[0].dispatchEvent(new CustomEvent("onRemoveGrp"));

  // notify it is incomplete - it will become higher and remove the "completed" class
  grpWrapper.CriteriaGroup.EndClassGroup.html[0].dispatchEvent(
    new CustomEvent("onGrpInputNotCompleted", { bubbles: true })
  );

  let startVal = grpWrapper.CriteriaGroup.StartClassGroup.startClassVal;
  grpWrapper.CriteriaGroup.html.empty();
  grpWrapper.CriteriaGroup.html.remove();
  grpWrapper.CriteriaGroup = new CriteriaGroup(
    grpWrapper,
    grpWrapper.specProvider,
    startVal,
    grpWrapper.isRootGrpWrapper()
  ).render();
  // Set state back to NONE
  grpWrapper.optionState = OptionTypes.NONE
  // set StartClassVal back to its original value
  grpWrapper.CriteriaGroup.StartClassGroup.startClassVal = startVal;
  let inputSelector = grpWrapper.CriteriaGroup.StartClassGroup.inputSelector;
  inputSelector.submitSelected() ;
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  //inputSelector.html[0].children[1].classList.add("disabled");

  // there might have been variables in the variable section which now got deleted
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("updateVarList", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
}

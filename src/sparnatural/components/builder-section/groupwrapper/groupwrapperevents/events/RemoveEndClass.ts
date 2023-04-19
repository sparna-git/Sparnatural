import CriteriaGroup from "../../criteriagroup/CriteriaGroup";
import { OptionTypes } from "../../criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../GroupWrapper";

// Remove the EndClass and rerender from the point where the startClassVal got selected
export function removeEndClass(grpWrapper: GroupWrapper) {
  // first delete the whereChild classes
  if (grpWrapper.whereChild)
    grpWrapper.whereChild.html[0].dispatchEvent(new CustomEvent("onRemoveGrp"));

  let startVal = grpWrapper.CriteriaGroup.StartClassGroup.startClassVal;
  grpWrapper.CriteriaGroup.html.empty();
  grpWrapper.CriteriaGroup.html.remove();
  grpWrapper.CriteriaGroup = new CriteriaGroup(
    grpWrapper,
    grpWrapper.specProvider,
    undefined,
    grpWrapper.isRootGrpWrapper()
  ).render();
  // Set state back to NONE
  grpWrapper.optionState = OptionTypes.NONE
  // set StartClassVal back to its original value
  grpWrapper.CriteriaGroup.StartClassGroup.startClassVal = startVal;
  let inputTypeComponent =
    grpWrapper.CriteriaGroup.StartClassGroup.inputSelector;
  inputTypeComponent.oldWidget.val(startVal.type).niceSelect("update");
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  inputTypeComponent.html[0].children[1].classList.add("disabled");

  // decrease the SPARQL var counter by 2 : one for the previous EndClassGroup, one for the new StartClassGroup
  // that gets its original value back
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("adjustSparqlVarID", { bubbles: true, detail: -2 })
  );

  // there might have been variables in the variable section which now got deleted
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("updateVarList", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
}

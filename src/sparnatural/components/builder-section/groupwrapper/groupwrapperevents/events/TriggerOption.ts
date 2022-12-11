import { OptionTypes } from "../../criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../GroupWrapper";

/*
  This event gets fired when the Optional or notExists option btn (arrow) gets clicked.
  It set's the css border around the grpwrapper and it's wherechilds.
  It blocks the optional arrow
*/
export function triggerOption(
  grpWrapper: GroupWrapper,
  newOptionState: OptionTypes
) {
  if (grpWrapper.optionState == newOptionState)
    newOptionState = OptionTypes.NONE; //btn with already active state got clicked again. switch back to normal
  //set css on linkWhereBottom
  if (grpWrapper.whereChild)
    switchState(
      grpWrapper.linkWhereBottom.html[0],
      grpWrapper.optionState,
      newOptionState
    );
  //set css on grpwrapper itself
  switchState(
    grpWrapper.CriteriaGroup.html[0],
    grpWrapper.optionState,
    newOptionState
  );
  setArrowCss(grpWrapper, newOptionState);
  // set new optionstate as classvariable
  grpWrapper.optionState = newOptionState;

  setOptnTypeToDescendants(grpWrapper, newOptionState);
}

let setOptnTypeToDescendants = (
  grpWrapper: GroupWrapper,
  newOptionState: OptionTypes
) => {
  //if there is a wherChild, then set the same optionState to all its descendants
  if (grpWrapper.whereChild)
    grpWrapper.whereChild.traversePreOrder((grpWrapper: GroupWrapper) => {
      setOptionCss(grpWrapper, grpWrapper.optionState, newOptionState);
      grpWrapper.optionState = newOptionState;
    });
};

let setOptionCss = (
  grpWrapper: GroupWrapper,
  oldState: OptionTypes,
  newState: OptionTypes
) => {
  switchState(grpWrapper.CriteriaGroup.html[0], oldState, newState);
  if (grpWrapper.whereChild)
    switchState(grpWrapper.linkWhereBottom.html[0], oldState, newState);
  if (grpWrapper.andSibling)
    switchState(grpWrapper.linkAndBottom.html[0], oldState, newState);

  //remove the optional possibilities for child groups if they have an optional arrow
  if (grpWrapper.CriteriaGroup.OptionsGroup?.optionalArrow?.html) {
    if (newState == OptionTypes.NONE) {
      grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.render();
    }
    if (newState == OptionTypes.NOTEXISTS || newState == OptionTypes.OPTIONAL) {
      grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.html.remove();
      grpWrapper.CriteriaGroup.OptionsGroup.OptionalComponent.html.remove();
      grpWrapper.CriteriaGroup.OptionsGroup.NotExistsComponent.html.remove();
    }
  }
};

let switchState = (
  el: HTMLElement,
  oldState: OptionTypes,
  newState: OptionTypes
) => {
  el.classList.remove(oldState);
  el.classList.add(newState);
};

// the selected arrow needs to have css class .Enabled (green dark)
function setArrowCss(grWrapper: GroupWrapper, newState: OptionTypes) {
  let notExistsEl =
    grWrapper.CriteriaGroup.OptionsGroup.NotExistsComponent.html[0];
  let optionalEl =
    grWrapper.CriteriaGroup.OptionsGroup.OptionalComponent.html[0];
  if (newState == OptionTypes.NONE) {
    notExistsEl.classList.remove("Enabled");
    optionalEl.classList.remove("Enabled");
  }
  if (newState == OptionTypes.NOTEXISTS) {
    notExistsEl.classList.add("Enabled");
    optionalEl.classList.remove("Enabled");
  }
  if (newState == OptionTypes.OPTIONAL) {
    notExistsEl.classList.remove("Enabled");
    optionalEl.classList.add("Enabled");
  }
}

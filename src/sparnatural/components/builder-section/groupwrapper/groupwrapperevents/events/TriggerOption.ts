import toggleVarNames from "../../../../../statehandling/actions/ToggleVarNames";
import { OptionTypes } from "../../criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../GroupWrapper";


/*
  This event gets fired when the Optional or notExists option btn (arrow) gets clicked.
  It set's the css border around the grpwrapper and it's wherechilds.
  It blocks the optional arrow
*/
export function triggerOption(grpWrapper:GroupWrapper,newOptionState:OptionTypes){
    if(grpWrapper.optionState == newOptionState) newOptionState = OptionTypes.NONE  //btn with already active state got clicked again. switch back to normal 


    //set css on linkWhereBottom
    if(grpWrapper.whereChild) switchState(grpWrapper.linkWhereBottom.html[0],grpWrapper.optionState,newOptionState)
    //switch to new state
    switchState(grpWrapper.CriteriaGroup.html[0],grpWrapper.optionState,newOptionState)
    // set new optionstate as classvariable
    grpWrapper.optionState = newOptionState
    setOptnTypeToDescendants(grpWrapper,newOptionState)
}

let setOptnTypeToDescendants = (grpWrapper:GroupWrapper,newOptionState: OptionTypes) =>{
    //if there is a wherChild, then set the same optionState to all its descendants
    if(grpWrapper.whereChild) grpWrapper.whereChild.traversePreOrder((grpWrapper: GroupWrapper) => {
      setOptionCss(grpWrapper,grpWrapper.optionState,newOptionState)
      grpWrapper.optionState = newOptionState
      //remove the optional possibilities for child groups
      grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow?.html?.toggle();
      grpWrapper.CriteriaGroup.OptionsGroup?.OptionalComponent?.html?.toggle()
      grpWrapper.CriteriaGroup.OptionsGroup?.NotExistsComponent?.html?.toggle()
      if(grpWrapper.andSibling) switchState(grpWrapper.linkAndBottom.html[0],grpWrapper.optionState,newOptionState)
    });
  }
  
let setOptionCss = (grpWrapper:GroupWrapper,oldState:OptionTypes, newState:OptionTypes)=>{
switchState(grpWrapper.CriteriaGroup.html[0],oldState,newState)
if(grpWrapper.whereChild) switchState(grpWrapper.linkWhereBottom.html[0],oldState,newState)
if(grpWrapper.andSibling) switchState(grpWrapper.linkAndBottom.html[0],oldState,newState)
}

let switchState = (el:HTMLElement,oldState:OptionTypes, newState:OptionTypes) =>{
el.classList.remove(oldState)
el.classList.add(newState)
}


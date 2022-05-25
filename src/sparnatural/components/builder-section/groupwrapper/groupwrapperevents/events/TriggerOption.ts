import { OptionTypes } from "../../criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../GroupWrapper";

export function triggerOption(grpWrapper:GroupWrapper,newOptionState:OptionTypes){
    if(grpWrapper.optionState == newOptionState) newOptionState = OptionTypes.NONE
    switchState(grpWrapper.CriteriaGroup.html[0],grpWrapper.optionState,newOptionState)
    if(grpWrapper.whereChild) switchState(grpWrapper.linkWhereBottom.html[0],grpWrapper.optionState,newOptionState)
    grpWrapper.optionState = newOptionState
    setOptnTypeToDescendants(grpWrapper,newOptionState)
}

let setOptnTypeToDescendants = (grpWrapper:GroupWrapper,newOptionState: OptionTypes) =>{
    //if there is a wherChild, then set the same optionState
    if(grpWrapper.whereChild) grpWrapper.whereChild.traversePreOrder((grpWrapper: GroupWrapper) => {
      setOptionCss(grpWrapper,grpWrapper.optionState,newOptionState)
      grpWrapper.optionState = newOptionState
      //remove the optional possibilities for child groups
      grpWrapper.CriteriaGroup.OptionsGroup.backArrow?.html?.toggle();
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


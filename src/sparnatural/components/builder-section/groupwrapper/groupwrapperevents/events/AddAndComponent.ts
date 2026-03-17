import { SelectedVal } from "../../../..//SelectedVal";
import GroupWrapper from "../../GroupWrapper";
import LinkAndBottom from "../../LinkAndBottom";

//add GroupWrapper as a Sibling
export function addAndComponent(
  grpWrapper: GroupWrapper,
  startClassVal: SelectedVal
) {

  grpWrapper.andSibling = new GroupWrapper(
    grpWrapper.parentGroupWrapper,
    grpWrapper.parentComponent,
    grpWrapper.specProvider,
    // same depth
    grpWrapper.depth,
    // increment order,
    grpWrapper.order + 1,
    startClassVal
  ).render();

  // inherit the option state if it was also inherited by the parent
  // that is if it was not on the parent that the option was set
  if(grpWrapper.currentOptionState != grpWrapper.explicitOptionState) {
    grpWrapper.andSibling.setCurrentOptionState(grpWrapper.currentOptionState);
  }
  

  //set state to startClassValSelected and trigger change
  let inputSelector = grpWrapper.andSibling.criteriaGroup.startClassGroup.inputSelector;
  inputSelector.submitSelected() ;

  // draw the AND link
  grpWrapper.linkAndBottom = new LinkAndBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );

  // disable the AND on this line
  grpWrapper.disableActionAnd();
}


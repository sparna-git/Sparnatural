import { SelectedVal } from "../../../..//SelectedVal";
import GroupWrapper from "../../GroupWrapper";
import LinkAndBottom from "../../LinkAndBottom";
import { HTMLComponent } from "../../../../HtmlComponent";
import { I18n } from "../../../../../settings/I18n";

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
  // the line number is known once redrawn
  HTMLComponent.announce(
    grpWrapper.html[0],
    I18n.format("Announce.lineAdded", { n: grpWrapper.andSibling.lineNumber }),
    // true : with the keyboard, the focus goes to the list of the new line
    true
  );

  // disable the AND on this line
  grpWrapper.disableActionAnd();
}


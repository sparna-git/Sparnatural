import { SelectedVal } from "../../../../../generators/ISparJson";
import GroupWrapper from "../../GroupWrapper";
import LinkAndBottom from "../../LinkAndBottom";

//add GroupWrapper as a Sibling
export function addAndComponent(
  grpWrapper: GroupWrapper,
  startClassVal: SelectedVal
) {
  grpWrapper.andSibling = new GroupWrapper(
    grpWrapper.ParentComponent,
    grpWrapper.specProvider,
    // same depth
    grpWrapper.depth,
    startClassVal
  ).render();
  //set state to startClassValSelected and trigger change
  let inputTypeComponent =
    grpWrapper.andSibling.CriteriaGroup.StartClassGroup.inputTypeComponent;
  inputTypeComponent.oldWidget.val(startClassVal.type).niceSelect("update");
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  inputTypeComponent.html[0].children[1].classList.add("disabled");

  // draw the AND link
  grpWrapper.linkAndBottom = new LinkAndBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
  removeActionAnd(grpWrapper);
}

function removeActionAnd(grpWarpper: GroupWrapper) {
  // deactivate onHover function and remove it. Could also make it invisible?
  let remCss =
    grpWarpper.CriteriaGroup.ActionsGroup.actions.ActionAnd.widgetHtml.remove();
  if (remCss.length == 0)
    throw Error(
      `Didn't find ActionAnd Component. ActionAnd.html:${this.actions.ActionAnd.html}`
    );
}

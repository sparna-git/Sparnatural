import { SelectedVal } from "../../../../../sparql/ISparJson";
import { MaxVarAction } from "../../../../../statehandling/ActionStore";
import GroupWrapper from "../../GroupWrapper";
import LinkWhereBottom from "../../LinkWhereBottom";

let removeEditComponents = (grpWrapper: GroupWrapper) => {
  grpWrapper.CriteriaGroup.EndClassGroup.html[0].dispatchEvent(
    new CustomEvent("removeEditComponents", {bubbles:true})
  );
  grpWrapper.CriteriaGroup.EndClassGroup.editComponents = null;
};

//give it additional class childsList
export function addWhereComponent(
  grpWrapper: GroupWrapper,
  endClassVal: SelectedVal
) {
  removeEditComponents(grpWrapper);
  //provide endclassval as startvalue for the new group
  grpWrapper.whereChild = new GroupWrapper(
    grpWrapper,
    grpWrapper.specProvider,
    endClassVal
  ).render();

  //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
  let inputTypeComponent =
    grpWrapper.whereChild.CriteriaGroup.StartClassGroup.inputTypeComponent;
  inputTypeComponent.oldWidget.val(endClassVal.type).niceSelect("update");
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  inputTypeComponent.html[0].children[2].classList.add("disabled");
  // render the link where
  grpWrapper.linkWhereBottom = new LinkWhereBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("changeMaxVarIndex", {
      bubbles: true,
      detail: MaxVarAction.INCREASE,
    })
  );
}

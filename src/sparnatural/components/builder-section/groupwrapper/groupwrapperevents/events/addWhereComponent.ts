import GroupWrapper from "../../GroupWrapper";
import LinkWhereBottom from "../../LinkWhereBottom";


let removeEditComponents = (grpWrapper:GroupWrapper) =>{
    grpWrapper.CriteriaGroup.EndClassGroup.actionWhere.html.remove();
    grpWrapper.CriteriaGroup.EndClassGroup.actionWhere = null;
    grpWrapper.CriteriaGroup.EndClassGroup.endClassWidgetGroup.inputTypeComponent.html.remove();
    grpWrapper.CriteriaGroup.EndClassGroup.endClassWidgetGroup.inputTypeComponent =
      null;
}

//give it additional class childsList
export function addWhereComponent(grpWrapper:GroupWrapper,endClassVal: string) {
  removeEditComponents(grpWrapper);
  grpWrapper.whereChild = new GroupWrapper(grpWrapper, grpWrapper.specProvider).render();

  //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
  grpWrapper.whereChild.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
    .val(endClassVal)
    .niceSelect("update");
  grpWrapper.linkWhereBottom = new LinkWhereBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent", { bubbles: true })
  );
}
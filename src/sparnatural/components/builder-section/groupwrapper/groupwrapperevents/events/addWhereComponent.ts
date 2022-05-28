import { SelectedVal } from "../../../../../sparql/ISparJson";
import GroupWrapper from "../../GroupWrapper";
import LinkWhereBottom from "../../LinkWhereBottom";


let removeEditComponents = (grpWrapper:GroupWrapper) =>{
    grpWrapper.CriteriaGroup.EndClassGroup.html[0].dispatchEvent(new CustomEvent('removeEditComponents'))
}

//give it additional class childsList
export function addWhereComponent(grpWrapper:GroupWrapper,endClassVal: SelectedVal) {
  removeEditComponents(grpWrapper);
  grpWrapper.whereChild = new GroupWrapper(grpWrapper, grpWrapper.specProvider,endClassVal).render();

  //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
  grpWrapper.whereChild.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
    .val(endClassVal.type)
    .niceSelect("update");
  grpWrapper.linkWhereBottom = new LinkWhereBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent", { bubbles: true })
  );
}
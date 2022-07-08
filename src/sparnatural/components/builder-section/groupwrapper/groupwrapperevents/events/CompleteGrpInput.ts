import GroupWrapper from "../../GroupWrapper"

   //Input is completed by either choosing widgetvalue or adding a whereChild
export function completeGrpInput(grpWrapper:GroupWrapper){
  

  grpWrapper.CriteriaGroup.EndClassGroup.renderSelectViewVar()
  grpWrapper.CriteriaGroup.StartClassGroup.inputTypeComponent.html[0].classList.add("Highlited")
  grpWrapper.CriteriaGroup.EndClassGroup.inputTypeComponent.html[0].classList.add('Highlited')
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent", { bubbles: true })
  );
}
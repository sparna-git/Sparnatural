import GroupWrapper from "../../GroupWrapper";

//Input is completed by either choosing widgetvalue or adding a whereChild
export function completeGrpInput(grpWrapper: GroupWrapper) {
  grpWrapper.CriteriaGroup.EndClassGroup.renderSelectViewVar();

  if(grpWrapper.CriteriaGroup.StartClassGroup.renderEyeBtn){
    // only highlite when eye Btn is rendered.
    grpWrapper.CriteriaGroup.StartClassGroup.inputTypeComponent.html[0].classList.add(
      "Highlited"
    );
  }

  grpWrapper.html[0].classList.add("completed");
  grpWrapper.CriteriaGroup.EndClassGroup.inputTypeComponent.html[0].classList.add(
    "Highlited"
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent", { bubbles: true })
  );
}

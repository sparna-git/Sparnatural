import GroupWrapper from "../../GroupWrapper";

//Input is completed by either choosing widgetvalue or adding a whereChild
export function completeGrpInput(grpWrapper: GroupWrapper) {
  grpWrapper.criteriaGroup.endClassGroup.renderSelectViewVar();

  if(grpWrapper.criteriaGroup.startClassGroup.renderEyeBtn){
    // only highlite when eye Btn is rendered.
    grpWrapper.criteriaGroup.startClassGroup.inputSelector.html[0].classList.add(
      "Highlited"
    );
  }

  grpWrapper.html[0].classList.add("completed");
  grpWrapper.criteriaGroup.endClassGroup.inputSelector.html[0].classList.add(
    "Highlited"
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
}

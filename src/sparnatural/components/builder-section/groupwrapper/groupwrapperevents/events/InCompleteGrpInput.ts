import GroupWrapper from "../../GroupWrapper";

//Input is incompleted
export function inCompleteGrpInput(grpWrapper: GroupWrapper) {
  grpWrapper.criteriaGroup.endClassGroup.renderSelectViewVar();
  if(grpWrapper.criteriaGroup.startClassGroup.renderEyeBtn){
    // is only highlited when "eye" btn is rendered
    grpWrapper.criteriaGroup.startClassGroup.inputSelector.html[0].classList.remove(
      "Highlited"
    );
  }

  grpWrapper.html[0].classList.remove("completed");
  grpWrapper.criteriaGroup.endClassGroup.inputSelector.html[0].classList.remove(
    "Highlited"
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
}

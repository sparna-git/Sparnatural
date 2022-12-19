import GroupWrapper from "../../GroupWrapper";

//Input is incompleted
export function inCompleteGrpInput(grpWrapper: GroupWrapper) {
  grpWrapper.CriteriaGroup.ObjectSelector.renderSelectViewVar();
  if(grpWrapper.CriteriaGroup.SubjectSelector.renderEyeBtn){
    // is only highlited when "eye" btn is rendered
    grpWrapper.CriteriaGroup.SubjectSelector.inputTypeComponent.html[0].classList.remove(
      "Highlited"
    );
  }

  grpWrapper.html[0].classList.remove("completed");
  grpWrapper.CriteriaGroup.ObjectSelector.inputTypeComponent.html[0].classList.remove(
    "Highlited"
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
}

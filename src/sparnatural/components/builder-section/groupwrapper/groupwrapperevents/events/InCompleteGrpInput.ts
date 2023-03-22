import GroupWrapper from "../../GroupWrapper";

//Input is incompleted
export function inCompleteGrpInput(grpWrapper: GroupWrapper) {
  grpWrapper.CriteriaGroup.EndClassGroup.renderSelectViewVar();
  if(grpWrapper.CriteriaGroup.StartClassGroup.renderEyeBtn){
    // is only highlited when "eye" btn is rendered
    grpWrapper.CriteriaGroup.StartClassGroup.inputSelector.html[0].classList.remove(
      "Highlited"
    );
  }

  grpWrapper.html[0].classList.remove("completed");
  grpWrapper.CriteriaGroup.EndClassGroup.inputSelector.html[0].classList.remove(
    "Highlited"
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("generateQuery", { bubbles: true })
  );
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
}

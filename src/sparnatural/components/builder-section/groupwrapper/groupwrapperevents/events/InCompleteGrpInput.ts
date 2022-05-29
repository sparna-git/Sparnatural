import GroupWrapper from "../../GroupWrapper";

//Input is incompleted
export function inCompleteGrpInput(grpWrapper:GroupWrapper){
    grpWrapper.CriteriaGroup.EndClassGroup.renderSelectViewVar()
    grpWrapper.CriteriaGroup.StartClassGroup.inputTypeComponent.html[0].classList.remove("Highlited")
    grpWrapper.CriteriaGroup.EndClassGroup.inputTypeComponent.html[0].classList.remove('Highlited')
    grpWrapper.html[0].dispatchEvent(
        new CustomEvent("generateQuery", { bubbles: true })
    );
}


import { SelectedVal } from "../../../../../sparql/ISparJson";
import GroupWrapper from "../../GroupWrapper";
import LinkAndBottom from "../../LinkAndBottom";

//add GroupWrapper as a Sibling
export function addAndComponent(grpWrapper:GroupWrapper,startClassVal: SelectedVal) {
grpWrapper.andSibling = new GroupWrapper(
    grpWrapper.ParentComponent,
    grpWrapper.specProvider,
    startClassVal
).render();
//set state to startClassValSelected and trigger change
grpWrapper.andSibling.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
    .val(startClassVal.type)
    .niceSelect("update");
grpWrapper.linkAndBottom = new LinkAndBottom(grpWrapper).render();
grpWrapper.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent", { bubbles: true })
);
}


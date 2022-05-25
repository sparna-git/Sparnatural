

import GroupWrapper from "../../GroupWrapper";
import LinkAndBottom from "../../LinkAndBottom";

//add GroupWrapper as a Sibling
export function addAndComponent(grpWrapper:GroupWrapper,startClassVal: string) {
grpWrapper.andSibling = new GroupWrapper(
    grpWrapper.ParentComponent,
    grpWrapper.specProvider
).render();
//set state to startClassValSelected and trigger change
grpWrapper.andSibling.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
    .val(startClassVal)
    .niceSelect("update");
grpWrapper.linkAndBottom = new LinkAndBottom(grpWrapper).render();
grpWrapper.html[0].dispatchEvent(
    new CustomEvent("initGeneralEvent", { bubbles: true })
);
}


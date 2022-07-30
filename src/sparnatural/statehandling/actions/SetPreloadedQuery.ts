import ObjectPropertyGroup from "../../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { OptionTypes } from "../../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import EndClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import StartClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import { Branch, ISparJson } from "../../sparql/ISparJson";
import ActionStore from "../ActionStore";
/*
    This Event gets fired when a user selects a preloaded query from the dropdown list
*/
export function setPreloadedQuery(actionStore: ActionStore, query: ISparJson) {
  // set state and variables
  actionStore.variables = query.variables;
  actionStore.order = query.order;
  actionStore.distinct = query.distinct;
  actionStore.language = query.lang;
  // first reset the current query
  resetSparnatural(actionStore);
  // build Sparnatural query
  buildSparnatural(actionStore, query.branches);
}

function buildSparnatural(actionStore: ActionStore, branches: Array<Branch>) {
  // first build the rootGroupWrapper
  let rootGrpWrapper =
    actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper;
  // build the root groupwrapper and remove from branches array
  let rootBranch = branches.shift();
  buildCriteriaGroup(rootGrpWrapper, rootBranch);
  let parent = rootGrpWrapper;
  let every = branches.forEach((b) => {
    clickOn(parent.CriteriaGroup.ActionsGroup.actions.ActionAnd.btn);
    buildCriteriaGroup(parent.andSibling, b);
    parent = parent.andSibling;
  });
}

function buildCriteriaGroup(grpWarpper: GroupWrapper, branch: Branch) {
  // set StartClassVal only if there wasn't one set by the parent (e.g whereChild andSibling have it already set)
  if (!grpWarpper.CriteriaGroup.StartClassGroup.startClassVal.type) {
    //set StartClassGroup
    let startClassVal = { type: branch.line.sType, variable: branch.line.s };
    setSelectedValue(
      grpWarpper.CriteriaGroup.StartClassGroup,
      startClassVal.type
    );
  }

  // set EndClassGroup
  let endClassVal = { type: branch.line.oType, variable: branch.line.o };
  setSelectedValue(grpWarpper.CriteriaGroup.EndClassGroup, endClassVal.type);

  //set ObjectPropertyGroup
  let objectPropVal = { type: branch.line.pType, variable: branch.line.p };
  setSelectedValue(
    grpWarpper.CriteriaGroup.ObjectPropertyGroup,
    objectPropVal.type
  );

  // set WidgetValues
  branch.line.values.forEach((v) => {
    grpWarpper.CriteriaGroup.endClassWidgetGroup.renderWidgetVal(
      v
    );
  });

  // trigger option state
  triggerOptions(grpWarpper, branch);

  if (branch.children.length > 0) {
    clickOn(
      grpWarpper.CriteriaGroup.EndClassGroup.editComponents.actionWhere.btn
    );
    buildCriteriaGroup(grpWarpper.whereChild, branch.children.shift());
    // the rest of the children are AND connected
    let parent = grpWarpper.whereChild;
    branch.children.forEach((c) => {
      clickOn(parent.CriteriaGroup.ActionsGroup.actions.ActionAnd.btn);
      buildCriteriaGroup(parent.andSibling, c);
      parent = parent.andSibling;
    });
  }
}

function triggerOptions(grpWrapper: GroupWrapper, branch: Branch) {
  if (branch.notExists && grpWrapper.optionState != OptionTypes.NOTEXISTS) {
    clickOn(grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.widgetHtml);
    clickOn(grpWrapper.CriteriaGroup.OptionsGroup.NotExistsComponent.html);
  }
  if (branch.optional && grpWrapper.optionState != OptionTypes.OPTIONAL) {
    clickOn(grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.widgetHtml);
    clickOn(grpWrapper.CriteriaGroup.OptionsGroup.OptionalComponent.html);
  }
}

// set the value for an inputTypeComponent and trigger the corresponding event
function setSelectedValue(
  component: StartClassGroup | EndClassGroup | ObjectPropertyGroup,
  value: string
) {
  component.inputTypeComponent.oldWidget.val(value).niceSelect("update");
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  component.inputTypeComponent.html[0].children[2].classList.add("disabled");
}

function clickOn(el: JQuery<HTMLElement>) {
  el[0].dispatchEvent(new Event("click"));
}

function resetSparnatural(actionStore: ActionStore) {
  actionStore.sparnatural.BgWrapper.resetCallback();
}

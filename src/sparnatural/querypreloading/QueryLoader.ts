import ObjectPropertyGroup from "../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import EndClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import StartClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import Sparnatural from "../components/SparnaturalComponent";
import { Branch, ISparJson } from "../sparql/ISparJson";

export default class QueryLoader{
    static sparnatural: Sparnatural;

    static loadQuery(query:ISparJson){
        // first reset the current query
        this.sparnatural.BgWrapper.resetCallback();
        // build Sparnatural query
        this.#buildSparnatural(this.sparnatural, query.branches);
        // trigger query generation
        this.sparnatural.html[0].dispatchEvent(
        new CustomEvent("initGeneralEvent")
        );
    }
    
    static #buildSparnatural(sparnatural: Sparnatural, branches: Array<Branch>) {
        // first build the rootGroupWrapper
        let rootGrpWrapper =
        sparnatural.BgWrapper.componentsList.rootGroupWrapper;
        // build the root groupwrapper and remove from branches array
        let rootBranch = branches.shift();
        this.#buildCriteriaGroup(rootGrpWrapper, rootBranch);
        let parent = rootGrpWrapper;
        branches.forEach((b) => {
        this.#clickOn(parent.CriteriaGroup.ActionsGroup.actions.ActionAnd.btn);
        this.#buildCriteriaGroup(parent.andSibling, b);
        parent = parent.andSibling;
        });
    }
  
    static #buildCriteriaGroup(grpWarpper: GroupWrapper, branch: Branch) {
        // set StartClassVal only if there wasn't one set by the parent (e.g whereChild andSibling have it already set)
        if (!grpWarpper.CriteriaGroup.StartClassGroup.startClassVal.type) {
        //set StartClassGroup
        let startClassVal = { type: branch.line.sType, variable: branch.line.s };
        this.#setSelectedValue(
            grpWarpper.CriteriaGroup.StartClassGroup,
            startClassVal.type
        );
        }
  
    // set EndClassGroup
    let endClassVal = { type: branch.line.oType, variable: branch.line.o };
    this.#setSelectedValue(grpWarpper.CriteriaGroup.EndClassGroup, endClassVal.type);
  
    //set ObjectPropertyGroup
    let objectPropVal = { type: branch.line.pType, variable: branch.line.p };
    this.#setSelectedValue(
      grpWarpper.CriteriaGroup.ObjectPropertyGroup,
      objectPropVal.type
    );
  
    // set WidgetValues
    branch.line.values.forEach((v) => {
      const parsedVal = grpWarpper.CriteriaGroup.EndClassGroup.editComponents.widgetWrapper.widgetComponent.parseInput(v)
      grpWarpper.CriteriaGroup.EndClassGroup.editComponents.widgetWrapper.widgetComponent.renderWidgetVal(parsedVal)
    });
  
    // trigger option state
    this.#triggerOptions(grpWarpper, branch);
  
    if (branch.children.length > 0) {
      this.#clickOn(
        grpWarpper.CriteriaGroup.EndClassGroup.editComponents.actionWhere.btn
      );
      this.#buildCriteriaGroup(grpWarpper.whereChild, branch.children.shift());
      // the rest of the children are AND connected
      let parent = grpWarpper.whereChild;
      branch.children.forEach((c) => {
        this.#clickOn(parent.CriteriaGroup.ActionsGroup.actions.ActionAnd.btn);
        this.#buildCriteriaGroup(parent.andSibling, c);
        parent = parent.andSibling;
      });
    }
  }
  
  static #triggerOptions(grpWrapper: GroupWrapper, branch: Branch) {
    if (branch.notExists && grpWrapper.optionState != OptionTypes.NOTEXISTS) {
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.widgetHtml);
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.NotExistsComponent.html);
    }
    if (branch.optional && grpWrapper.optionState != OptionTypes.OPTIONAL) {
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.widgetHtml);
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.OptionalComponent.html);
    }
  }
  
  // set the value for an inputTypeComponent and trigger the corresponding event
  static #setSelectedValue(
    component: StartClassGroup | EndClassGroup | ObjectPropertyGroup,
    value: string
  ) {
    component.inputTypeComponent.oldWidget.val(value).niceSelect("update");
    let niceSelect = component.inputTypeComponent.html[0].querySelectorAll('.nice-select')
    if (niceSelect.length > 1) console.warn('More than one nice-select found!')
    niceSelect[0].classList.add("disabled")
  }
  
  static #clickOn(el: JQuery<HTMLElement>) {
    el[0].dispatchEvent(new Event("click"));
  }

  static setSparnatural(sparnatural:Sparnatural){
    this.sparnatural = sparnatural
  }

}
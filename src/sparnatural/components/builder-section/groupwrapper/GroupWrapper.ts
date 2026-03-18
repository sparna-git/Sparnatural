import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import LinkAndBottom from "./LinkAndBottom";
import LinkWhereBottom from "./LinkWhereBottom";
import CriteriaGroup from "./criteriagroup/CriteriaGroup";
import { HTMLComponent } from "../../HtmlComponent";
import { OptionTypes } from "./criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapperEventStore from "./groupwrapperevents/GroupWrapperEventStore";
import ComponentsList from "../ComponentsList";
import { SelectedVal } from "../../SelectedVal";

/*
  GroupWrapper class represents a row in Sparnatural. It is the WrapperClass for the CriteriaGroup
*/
class GroupWrapper extends HTMLComponent {
  whereChild?: GroupWrapper;
  andSibling?: GroupWrapper;
  parentGroupWrapper?: GroupWrapper;

  // the current option state, either set directly at this level, or inherited from a parent group wrapper
  currentOptionState = OptionTypes.NONE;
  // this is only set when the user explicitly chooses an option at this level, not when it is inherited from a parent group wrapper
  explicitOptionState?: OptionTypes; 

  linkAndBottom?: LinkAndBottom; // connection line drawn from this CriteriaList with hasAnd CriteriaList
  linkWhereBottom?: LinkWhereBottom;
  criteriaGroup: CriteriaGroup;
  specProvider: ISparnaturalSpecification;
  groupWrapperEventStore: GroupWrapperEventStore;
  // depth in the query tree
  depth: number;
  // order among siblings (used to determine whether it is the first line)
  order: number;

  constructor(
    parentGroupWrapper: GroupWrapper,
    parentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification,
    depth:number,
    order:number,
    startOrEndClassVal?: SelectedVal,
    renderEyeButtonOnStartClassGroup?: boolean
  ) {
    super("groupe", parentComponent, null);
    this.parentGroupWrapper = parentGroupWrapper;
    this.specProvider = specProvider;
    this.criteriaGroup = new CriteriaGroup(
      this,
      this.specProvider,
      startOrEndClassVal,
      renderEyeButtonOnStartClassGroup
    );
    this.depth = depth;
    this.order = order;
  }

  render(): this {
    super.render();
    this.groupWrapperEventStore = new GroupWrapperEventStore(this);
    this.criteriaGroup = this.criteriaGroup.render();
    return this;
  }

  isRootGrpWrapper(): boolean{
    return (this.parentGroupWrapper === null)
  }

  // set back state to when objectproperty was selected
  setObjectPropertySelectedState() {
    let opVal = this.criteriaGroup.objectPropertyGroup.objectPropVal;
    //if opVal is null, then temporary lbl is shown an no endclassgroup has been selected
    if (!opVal) return;
    this.criteriaGroup.html[0].dispatchEvent(
      new CustomEvent("onObjectPropertyGroupSelected", { detail: opVal })
    );
  }

  triggerOption(
    newOptionState: OptionTypes
  ) {
    //If there is a service endpoint and newOptionState is NONE, then set it to SERVICE
    if(this.hasServiceEndpoint() && newOptionState === OptionTypes.NONE) {
      newOptionState = OptionTypes.SERVICE
    }

    //set css on linkWhereBottom
    if (this.whereChild) {
      this.linkWhereBottom.setCurrentOptionState(newOptionState);
    }

    this.setCurrentOptionState(newOptionState);
    this.explicitOptionState = newOptionState;

    // set the same optionState to all its descendants
    this.whereChild?.traversePreOrder((grpWrapper: GroupWrapper) => {
      grpWrapper.inheritOptionState(newOptionState);
    });

    this.criteriaGroup.optionsGroup?.setNewState(newOptionState);
  }

  setCurrentOptionState(newState: OptionTypes) {
    // set css on grpwrapper itself
    HTMLComponent.switchState(this.criteriaGroup.html[0], this.currentOptionState, newState);
    // store the new state in the class variable
    this.currentOptionState = newState;
 
    // disable the eye button on the descendants, or re-enable it
    // NOTE : as this function may be called to inherit the optional state while the criteria is not yet complete,
    // the end class group may not be known, so we add '?' at every step
    if (newState == OptionTypes.NOTEXISTS) {      
      // remove the variable selection if it was selected
      if(this.criteriaGroup.endClassGroup?.inputSelector?.selectViewVariableBtn?.selected) {
        this.criteriaGroup.endClassGroup?.inputSelector?.selectViewVariableBtn?.widgetHtml[0].dispatchEvent(new Event("click"));
      }
      this.criteriaGroup.endClassGroup?.inputSelector?.selectViewVariableBtn?.disable();
    } else {
      this.criteriaGroup.endClassGroup?.inputSelector?.selectViewVariableBtn?.enable();
    }
  }

  hasServiceEndpoint() {
    return this.specProvider.getProperty(this.criteriaGroup.objectPropertyGroup.objectPropVal?.type)?.getServiceEndpoint();
  }

  getDebugId():string {
    return ( (!this.isRootGrpWrapper())?(this.parentGroupWrapper.getDebugId()+"."+this.order):""+this.order) + " (?" + this.criteriaGroup.startClassGroup?.startClassVal.variable+")";
  }

  disableActionAnd() {
    // deactivate onHover function and remove it. Could also make it invisible?
    let removedElements = this.criteriaGroup.actionsGroup.actions.actionAnd.widgetHtml.remove();

    if (removedElements.length == 0)
      throw Error(
        `Didn't find ActionAnd Component. ActionAnd.widgetHtml:${this.criteriaGroup.actionsGroup.actions.actionAnd.widgetHtml}`
      );
  }

  enableActionAnd() {
    this.criteriaGroup.actionsGroup.onObjectPropertyGroupSelected();
  }

  /**
   * Inherits the option state from a parent group wrapper.
   * @param newState 
   */
  inheritOptionState (
    newState: OptionTypes
  ) {
    this.setCurrentOptionState(newState);  

    //remove the optional possibilities for child groups if they have an optional arrow
    if (newState == OptionTypes.NONE) {
      this.criteriaGroup.optionsGroup.enable();
    }
    if (newState == OptionTypes.NOTEXISTS || newState == OptionTypes.OPTIONAL) {
      this.criteriaGroup.optionsGroup.disable();
    }
  };

  traversePreOrder(callBack: (grpWarpper: GroupWrapper) => void) {
    callBack(this);
    if (this.whereChild) this.whereChild.traversePreOrder(callBack);
    if (this.andSibling) this.andSibling.traversePreOrder(callBack);
    return;
  }
  traversePostOrder(callBack: (grpWarpper: GroupWrapper) => void) {
    if (this.whereChild) this.whereChild.traversePostOrder(callBack);
    if (this.andSibling) this.andSibling.traversePostOrder(callBack);
    callBack(this);
    return;
  }

}
export default GroupWrapper;

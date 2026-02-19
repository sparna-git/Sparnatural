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

  // the current option state, either set directly at this level, or inherited from a parent group wrapper
  currentOptionState = OptionTypes.NONE;
  // this is only set when the user explicitly chooses an option at this level, not when it is inherited from a parent group wrapper
  explicitOptionState?: OptionTypes; 

  linkAndBottom?: LinkAndBottom; // connection line drawn from this CriteriaList with hasAnd CriteriaList
  linkWhereBottom?: LinkWhereBottom;
  CriteriaGroup: CriteriaGroup;
  specProvider: ISparnaturalSpecification;
  groupWrapperEventStore: GroupWrapperEventStore;
  // depth in the query tree
  depth: number;
  // order among siblings (used to determine whether it is the first line)
  order: number;

  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification,
    depth:number,
    order:number,
    startOrEndClassVal?: SelectedVal,
    renderEyeButtonOnStartClassGroup?: boolean
  ) {
    super("groupe", ParentComponent, null);
    this.specProvider = specProvider;
    this.CriteriaGroup = new CriteriaGroup(
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
    this.CriteriaGroup = this.CriteriaGroup.render();
    return this;
  }

  isRootGrpWrapper(): boolean{
    return (
      (this.parentComponent instanceof ComponentsList)
      &&
      ((this.parentComponent as ComponentsList).rootGroupWrapper == this)
    );
  }

  // set back state to when objectproperty was selected
  setObjectPropertySelectedState() {
    let opVal = this.CriteriaGroup.ObjectPropertyGroup.objectPropVal;
    //if opVal is null, then temporary lbl is shown an no endclassgroup has been selected
    if (!opVal) return;
    this.CriteriaGroup.html[0].dispatchEvent(
      new CustomEvent("onObjectPropertyGroupSelected", { detail: opVal })
    );
  }

  triggerOption(
    newOptionState: OptionTypes
  ) {
    if (this.explicitOptionState == newOptionState) {
      //btn with already active state got clicked again. switch back to normal
      newOptionState = OptionTypes.NONE; 
    }

    //If there is a service endpoint and newOptionState is NONE, then set it to SERVICE
    if(this.hasServiceEndpoint() && newOptionState === OptionTypes.NONE) {
      newOptionState = OptionTypes.SERVICE
    }

    //set css on linkWhereBottom
    if (this.whereChild) {
      HTMLComponent.switchState(this.linkWhereBottom.html[0],this.explicitOptionState,newOptionState);
    }

    this.setCurrentOptionState(newOptionState);
    this.explicitOptionState = newOptionState;

    // set the same optionState to all its descendants
    this.whereChild?.traversePreOrder((grpWrapper: GroupWrapper) => {
      grpWrapper.inheritOptionState(newOptionState);
    });

    this.CriteriaGroup.OptionsGroup?.setNewState(newOptionState);
  }

  setCurrentOptionState(newState: OptionTypes) {
    // set css on grpwrapper itself
    HTMLComponent.switchState(this.CriteriaGroup.html[0], this.currentOptionState, newState);
    // store the new state in the class variable
    this.currentOptionState = newState;
 
    // disable the eye button on the descendants, or re-enable it
    if (newState == OptionTypes.NOTEXISTS) {      
      // remove the variable selection if it was selected
      if(this.CriteriaGroup.EndClassGroup.inputSelector.selectViewVariableBtn.selected) {
        this.CriteriaGroup.EndClassGroup.inputSelector.selectViewVariableBtn.widgetHtml[0].dispatchEvent(new Event("click"));
      }
      this.CriteriaGroup.EndClassGroup.inputSelector.selectViewVariableBtn.disable();
    } else {
      this.CriteriaGroup.EndClassGroup.inputSelector.selectViewVariableBtn.enable();
    }
  }

  hasServiceEndpoint() {
    return this.specProvider.getProperty(this.CriteriaGroup.ObjectPropertyGroup.objectPropVal?.type)?.getServiceEndpoint();
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
      this.CriteriaGroup.OptionsGroup.enable();
    }
    if (newState == OptionTypes.NOTEXISTS || newState == OptionTypes.OPTIONAL) {
      this.CriteriaGroup.OptionsGroup.disable();
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

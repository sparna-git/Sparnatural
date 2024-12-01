import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import LinkAndBottom from "./LinkAndBottom";
import LinkWhereBottom from "./LinkWhereBottom";
import CriteriaGroup from "./criteriagroup/CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";
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
  optionState = OptionTypes.NONE;
  #isRoot = false // Wether this GrpWrapper is the root (first) GrpWrapper
  linkAndBottom?: LinkAndBottom; // connection line drawn from this CriteriaList with hasAnd CriteriaList
  linkWhereBottom?: LinkWhereBottom;
  CriteriaGroup: CriteriaGroup;
  specProvider: ISparnaturalSpecification;
  groupWrapperEventStore: GroupWrapperEventStore;
  depth: number;

  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification,
    depth:number,
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

import ISpecProvider from "../../../spec-providers/ISpecProviders";
import LinkAndBottom from "./LinkAndBottom";
import LinkWhereBottom from "./LinkWhereBottom";
import CriteriaGroup from "./criteriagroup/CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";
import { OptionTypes } from "./criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapperEventStore from "./groupwrapperevents/GroupWrapperEventStore";
import { SelectedVal } from "../../../sparql/ISparJson";

/*
  GroupWrapper class represents a row in Sparnatural. It is the WrapperClass for the CriteriaGroup
*/
class GroupWrapper extends HTMLComponent {
  whereChild: GroupWrapper = null;
  andSibling: GroupWrapper = null;
  optionState = OptionTypes.NONE;
  linkAndBottom: LinkAndBottom; // connection line drawn from this CriteriaList with hasAnd CriteriaList
  linkWhereBottom: LinkWhereBottom;
  CriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  groupWrapperEventStore: GroupWrapperEventStore;
  // ParentComponent: ComponentsList | GroupWrapper
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISpecProvider,
    startOrEndClassVal?: SelectedVal
  ) {
    super("groupe", ParentComponent, null);
    this.specProvider = specProvider;
    this.CriteriaGroup = new CriteriaGroup(
      this,
      this.specProvider,
      startOrEndClassVal
    );
  }

  render(): this {
    super.render();
    this.groupWrapperEventStore = new GroupWrapperEventStore(this);
    this.CriteriaGroup = this.CriteriaGroup.render();
    return this;
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

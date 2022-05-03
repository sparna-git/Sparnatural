import ActionsGroup from "../actions/ActionsGroup";
import StartClassGroup from "../startendclassgroup/StartClassGroup";
import { OptionsGroup } from "../optionsgroup/OptionsGroup";

import EndClassGroup from "../startendclassgroup/EndClassGroup";
import EndClassWidgetGroup from "../widgets/EndClassWidgetGroup";
import HTMLComponent from "../../HtmlComponent";
import ObjectPropertyGroup from "../objectpropertygroup/ObjectPropertyGroup";
import GroupWrapper from "./GroupWrapper";
import { getSettings } from "../../../configs/client-configs/settings";

/**
 * A single line/criteria
 **/

class CriteriaGroup extends HTMLComponent {

  settings: any;
  // JSON query line from which this line needs to be initialized
  jsonQueryBranch: any;
  // create all the elements of the criteria
  StartClassGroup: any;
  OptionsGroup: any;
  ObjectPropertyGroup: any;
  EndClassGroup: any;
  EndClassWidgetGroup: any;
  ActionsGroup: any;
  specProvider: any;
  ParentGroupWrapper: GroupWrapper;
  startClassValue: any;

  constructor(
    ParentComponent: GroupWrapper,
    specProvider: any,
    jsonQueryBranch: any,
    startClassValue?:any
  ) {
    super("CriteriaGroup", ParentComponent, null);
    this.startClassValue = startClassValue
    this.jsonQueryBranch = jsonQueryBranch;
    this.ParentGroupWrapper = ParentComponent

  }

  render(): this {
    super.render()
    this.#renderChildComponents()
    return this
  }

  #renderChildComponents(){
    // create all the elements of the criteria
    this.StartClassGroup = new StartClassGroup(this, this.specProvider,this.startClassValue).render();
    this.OptionsGroup = new OptionsGroup(this, this.specProvider).render();
    this.ObjectPropertyGroup = new ObjectPropertyGroup(
      this,
      this.specProvider,
      getSettings().langSearch.ObjectPropertyTemporaryLabel
    ).render();
    this.EndClassGroup = new EndClassGroup(this, this.specProvider).render();
    this.EndClassWidgetGroup = new EndClassWidgetGroup(
      this,
      this.specProvider
    ).render();
    this.ActionsGroup = new ActionsGroup(this, this.specProvider).render();
    this.#assembleComponents();
  }

  #assembleComponents = () => {
    // hook all components together
    $(this).on("StartClassGroupSelected", function () {
      this.ObjectPropertyGroup.onStartClassGroupSelected();
    });
    $(this).on("StartClassGroupSelected", function () {
      this.EndClassGroup.onStartClassGroupSelected();
    });
    $(this).on("Created", function () {
      this.StartClassGroup.onCreated();
    });
    $(this).on("EndClassGroupSelected", function () {
      this.ObjectPropertyGroup.onEndClassGroupSelected();
    });
    $(this).on("ObjectPropertyGroupSelected", function () {
      this.EndClassWidgetGroup.onObjectPropertyGroupSelected();
    });
    $(this).on("ObjectPropertyGroupSelected", function () {
      this.OptionsGroup.onObjectPropertyGroupSelected();
    });
    $(this).on("Created", function () {
      this.ActionsGroup.onCreated();
    });
    $(this).on("ObjectPropertyGroupSelected", function () {
      this.ActionsGroup.onObjectPropertyGroupSelected();
    });
  };

  //set css completed class on GroupWrapper
  
  initCompleted(){
    this.ParentGroupWrapper.html.addClass("completed")
  };
}
export default CriteriaGroup;

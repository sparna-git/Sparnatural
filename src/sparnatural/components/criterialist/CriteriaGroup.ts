import ActionsGroup from "../actions/ActionsGroup";
import StartClassGroup from "../startendclassgroup/StartClassGroup";
import { OptionsGroup } from "../optionsgroup/OptionsGroup";

import EndClassGroup from "../startendclassgroup/EndClassGroup";
import EndClassWidgetGroup from "../widgets/EndClassWidgetGroup";
import HTMLComponent from "../../HtmlComponent";
import ObjectPropertyGroup from "../objectpropertygroup/ObjectPropertyGroup";
import GroupWrapper from "./GroupWrapper";
import { getSettings } from "../../../configs/client-configs/settings";
import UnselectBtn from "../buttons/UnselectBtn";

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
  unselectBtn: UnselectBtn

  constructor(
    ParentComponent: GroupWrapper,
    specProvider: any,
    jsonQueryBranch: any,
    startClassValue?:any
  ) {
    super("CriteriaGroup", ParentComponent, null);
    this.specProvider = specProvider
    this.startClassValue = startClassValue
    this.jsonQueryBranch = jsonQueryBranch;
    this.ParentGroupWrapper = ParentComponent

  }

  render(): this {
    super.render()
    this.#renderChildComponents()
    this.unselectBtn = new UnselectBtn(this,()=>{
      // caught in Parentcomponent
      this.html[0].dispatchEvent(new CustomEvent('onRemoveCriteria',{bubbles:true}))
    }).render()
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
    this.html[0].addEventListener("EndClassGroupSelected",(e)=>{
      e.stopImmediatePropagation()
      this.ObjectPropertyGroup.onEndClassGroupSelected();
    })
    this.html[0].addEventListener("StartClassGroupSelected",(e)=>{
      e.stopImmediatePropagation()
      this.EndClassGroup.onStartClassGroupSelected();
      this.ObjectPropertyGroup.onStartClassGroupSelected()
    })

    this.html[0].addEventListener("ObjectPropertyGroupSelected",(e)=>{
      e.stopImmediatePropagation()
      this.EndClassWidgetGroup.onObjectPropertyGroupSelected();
      this.OptionsGroup.onObjectPropertyGroupSelected();
      this.ActionsGroup.onObjectPropertyGroupSelected();
    })

    $(this).on("Created", function () {
      this.ActionsGroup.onCreated();
    });

  };

  //set css completed class on GroupWrapper
  
  initCompleted(){
    this.ParentGroupWrapper.html.addClass("completed")
  };
}
export default CriteriaGroup;

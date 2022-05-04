import ClassTypeId from "./ClassTypeId";
import { localName } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import tippy from "tippy.js";
import UnselectBtn from "../buttons/UnselectBtn";
import SelectViewVariableBtn from "../buttons/SelectViewVariableBtn";
import HTMLComponent from "../../HtmlComponent";
import { OptionsGroup } from "../optionsgroup/OptionsGroup";
import ObjectPropertyGroup from "../objectpropertygroup/ObjectPropertyGroup";
import { getSettings } from "../../../configs/client-configs/settings";
import EndClassWidgetGroup from "../widgets/EndClassWidgetGroup";
import ActionsGroup from "../actions/ActionsGroup";

/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
class EndClassGroup extends HTMLComponent {
  varName: any; //IMPORTANT varName is only present at EndClassGroup and StartClassGroup. Refactor on selectedValue method from upper class
  variableSelector: any;
  selectViewVariable: JQuery<HTMLElement>;
  value_selected: any;
  notSelectForview: boolean;
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  UnselectButton:UnselectBtn
  SelectViewVariableBtn:SelectViewVariableBtn
  
  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider: ISpecProvider,
  ) {
    super("EndClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider
    this.inputTypeComponent = new ClassTypeId(this, specProvider);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup; // must be above varName declaration
  }

  render(){
    super.render()
    // contains the name of the SPARQL variable associated to this component
    this.varName = this.ParentCriteriaGroup.jsonQueryBranch
    ? this.ParentCriteriaGroup.jsonQueryBranch.line.o
    : null;
    console.log(`VARNAME: ${this.varName}`)
    this.variableSelector = null;
    this.value_selected = null
    this.#addEventListener()
    return this
  }

  #addEventListener(){
    this.html[0].addEventListener('classTypeValueSelected',(e:CustomEvent)=>{
      if((e.detail === '') || (!e.detail)) throw Error('No value received on "classTypeValueSelected"')
      e.stopImmediatePropagation()
      this.value_selected = e.detail
      this.#valueWasSelected()
    })
  }


  // triggered when the subject/domain is selected
  onStartClassGroupSelected() {
    console.log('endlclassgrp startgrp selected')
    // render the inputComponent for a user to select an Object
    this.inputTypeComponent.render()
    $(this.html).append('<div class="EditComponents"></div>');
  }

    // Make arrow function to bind the this lexically
    // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
    onRemoveSelected = () =>{
      let optionsGrp = this.ParentCriteriaGroup.OptionsGroup.html
      this.#removeComponent(optionsGrp)
  
      let objectPropertyGrp = this.ParentCriteriaGroup.html
      this.#removeComponent(objectPropertyGrp)
  
      let endClassGrp = this.ParentCriteriaGroup.html
      this.#removeComponent(endClassGrp)
  
      let endClassWgtGrp = this.ParentCriteriaGroup.html
      this.#removeComponent(endClassWgtGrp)
  
      let actionsGrp = this.ParentCriteriaGroup.html
      this.#removeComponent(actionsGrp)
  
      //Now rerender all of them
      this.ParentCriteriaGroup.OptionsGroup = new OptionsGroup(this.ParentCriteriaGroup,this.specProvider).render()
      this.ParentCriteriaGroup.ObjectPropertyGroup = new ObjectPropertyGroup(this.ParentCriteriaGroup,this.specProvider,getSettings().langSearch.ObjectPropertyTemporaryLabel).render()
      this.ParentCriteriaGroup.EndClassGroup = new EndClassGroup(this.ParentCriteriaGroup,this.specProvider).render()
      this.ParentCriteriaGroup.EndClassWidgetGroup = new EndClassWidgetGroup(this.ParentCriteriaGroup,this.specProvider).render()
      this.ParentCriteriaGroup.ActionsGroup = new ActionsGroup(this.ParentCriteriaGroup,this.specProvider).render()
  
      // set the state back
      $(this.ParentCriteriaGroup).trigger("StartClassGroupSelected")
  
    }
  // Make arrow function to bind the this lexically
  // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
  onchangeViewVariable = ()=> {
    console.warn("endclassgrp onChangeViewVar")
    this.html[0].dispatchEvent(new CustomEvent('updateVariableList',{bubbles:true,detail:"test"}))
  }

  /*
		onChange gets called when a Endclassgroup was selected. For example choosing Musuem relatedTo Countr
		When Country got selected this events fires
	*/
  #valueWasSelected() {
    console.warn("endclassgrp onChange")
    this.#renderUnselectBtn()
    this.#renderSelectViewVariableBtn()

    this.value_selected = this.#getSelectedValue();
    //Set the variable name for Sparql
    if (this.varName == null) {
      // dispatch event and get maxVarIndex via callback
      this.html[0].dispatchEvent(new CustomEvent('getMaxVarIndex',{bubbles:true,detail:(index:number)=>{
        //getting the value Sparnatural
        this.varName =
        "?" +
        localName(this.value_selected) +
        "_" +
        (index);
      }}))
    }
    this.#disableSelectionPossibility();
    //add varName on curent selection display
    //this.onSelectValue(this.varName) ;

    if (this.specProvider.hasConnectedClasses(this.value_selected)) {
      $(this.ParentCriteriaGroup.html)
        .parent("li")
        .removeClass("WhereImpossible");
    } else {
      $(this.ParentCriteriaGroup.html).parent("li").addClass("WhereImpossible");
    }
    // since this component was already created only the css classes are updated
    this.html.addClass('HasInputsCompleted')
    this.html.addClass('IsOnEdit')
    // show and init the property selection
    this.ParentCriteriaGroup.ObjectPropertyGroup.cssClasses.Invisible = false;


    // trigger the event that will call the ObjectPropertyGroup
    $(this.ParentCriteriaGroup).trigger("EndClassGroupSelected");

    var desc = this.specProvider.getTooltip(this.value_selected);
    if (desc) {
      $(this.ParentCriteriaGroup.EndClassGroup.html)
        .find(".ClassTypeId")
        .attr("data-tippy-content", desc);
      // tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
      var tippySettings = Object.assign({}, getSettings()?.tooltipConfig);
      tippySettings.placement = "top-start";
      tippy(".EndClassGroup .ClassTypeId[data-tippy-content]", tippySettings);
    } else {
      $(this.ParentCriteriaGroup.EndClassGroup.html).removeAttr(
        "data-tippy-content"
      );
    }
  }

  // after an Object is chosen, disable the inputs
  #disableSelectionPossibility() {
    $(this.ParentCriteriaGroup.EndClassGroup.html)
      .find(".input-val")
      .attr("disabled", "disabled")
      .niceSelect("update");
  }

  // gathers the selected Object chosen
  #getSelectedValue() {
    return $(this.html).find("select.input-val").val();
  }

  // is this little crossed eye button at the end of EndclassGroup component
  #renderSelectViewVariableBtn(){
    this.SelectViewVariableBtn = new SelectViewVariableBtn(this,this.onchangeViewVariable)
  }

  #renderUnselectBtn(){
    this.UnselectButton = new UnselectBtn(this,this.onRemoveSelected).render() 
  }

  #removeComponent(component:JQuery<HTMLElement>){
    component.empty()
    component.remove()
  }

  getVarName() {
    return this.varName;
  }
}
export default EndClassGroup;

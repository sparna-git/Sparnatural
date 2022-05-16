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
import ActionWhere from "../actions/actioncomponents/ActionWhere";

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
  endClassWidgetGroup:EndClassWidgetGroup
  actionWhere:ActionWhere
  
  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider: ISpecProvider,
  ) {
    super("EndClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider
    this.inputTypeComponent = new ClassTypeId(this, specProvider);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    this.endClassWidgetGroup = new EndClassWidgetGroup(this,this.specProvider)
    this.actionWhere = new ActionWhere(this,this.specProvider,this.#onAddWhere)
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

  #onAddWhere() {
    this.html[0].dispatchEvent(new CustomEvent('addWhereComponent',{bubbles:true}))  
  }

  #addEventListener(){
    this.html[0].addEventListener('classTypeValueSelected',(e:CustomEvent)=>{
      if((e.detail === '') || (!e.detail)) throw Error('No value received on "classTypeValueSelected"')
      e.stopImmediatePropagation()
      this.value_selected = e.detail
      this.#valueWasSelected()
    })

    // when inputgot selected then we remove the where btn
    this.html[0].addEventListener('removeWhereBtn',(e:CustomEvent)=>{
      e.stopImmediatePropagation()
      this.actionWhere.html.remove()
    })

    // rerenderWhereBtn
    this.html[0].addEventListener('renderWhereBtn',(e:CustomEvent)=>{
      e.stopImmediatePropagation()
      this.actionWhere.render()
    })
  }


  // triggered when the subject/domain is selected
  onStartClassGroupSelected() {
    // render the inputComponent for a user to select an Object
    this.inputTypeComponent.render()
    $(this.html).append('<div class="EditComponents"></div>'); // this is important!
  }

    // Make arrow function to bind the this lexically
    // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
    onRemoveSelected = () =>{

      //TODO: this has to be done in the CriteriaGroup (ParentComponent)
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
      this.endClassWidgetGroup = new EndClassWidgetGroup(this.ParentCriteriaGroup,this.specProvider).render()
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

  onObjectPropertyGroupSelected(input: string){
    this.endClassWidgetGroup.onObjectPropertyGroupSelected(input)
    this.actionWhere.render() // first render endClassWidgetGroup then actionWhere
  }

  /*
		onChange gets called when a Endclassgroup was selected. For example choosing Musuem relatedTo Country
		When Country got selected this events fires
	*/
  #valueWasSelected() {
    this.#renderUnselectBtn()
    this.#renderSelectViewVariableBtn()
    this.endClassWidgetGroup.render()
    //Set the variable name for Sparql
    if (this.varName == null) {
      // dispatch event and get maxVarIndex via callback
      // can i refactor this so that traversing the components will set the varindex?
      this.html[0].dispatchEvent(new CustomEvent('getMaxVarIndex',{bubbles:true,detail:(index:number)=>{
        //getting the value Sparnatural
        this.varName =
        "?" +
        localName(this.value_selected) +
        "_" +
        (index);
      }}))
    }

    if (this.specProvider.hasConnectedClasses(this.value_selected)) {
      console.warn('EndClassgroup. specprovider hasConnectedClasses')
      $(this.ParentCriteriaGroup.html)
        .parent("li")
        .removeClass("WhereImpossible");
    } else {
      $(this.ParentCriteriaGroup.html).parent("li").addClass("WhereImpossible");
    }
    // trigger the event that will call the ObjectPropertyGroup
    this.html[0].dispatchEvent(new CustomEvent('EndClassGroupSelected',{bubbles:true}))

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

import ClassTypeId from "./ClassTypeId";
import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import ISettings from "../../../configs/client-configs/ISettings";
import { eventProxiCriteria, localName } from "../../globals/globalfunctions";
import VariableSelector from "./VariableSelector";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import CriteriaGroup from "../criteriaGroup/CriteriaGroup";
import tippy from "tippy.js";
import UnselectBtn from "../buttons/UnselectBtn";
import SelectViewVariableBtn from "../buttons/SelectViewVariableBtn";
import HTMLComponent from "../HtmlComponent";

/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
class EndClassGroup extends HTMLComponent {
  varName: any; //IMPORTANT varName is only present at EndClassGroup and StartClassGroup. Refactor on selectedValue method from upper class
  settings: ISettings;
  variableSelector: any;
  selectViewVariable: JQuery<HTMLElement>;
  value_selected: any;
  notSelectForview: boolean;
  inputTypeComponent: ClassTypeId;
  variableNamePreload: string;
  variableViewPreload: string;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  UnselectButton:UnselectBtn
  SelectViewVariableBtn:SelectViewVariableBtn
  
  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider: ISpecProvider,
    settings: ISettings
  ) {
    super("EndClassGroup", ParentCriteriaGroup, null);
    this.settings = settings;
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
    return this
  }

  // triggered when the subject/domain is selected
  onStartClassGroupSelected() {
    console.log('endlclassgrp startgrp selected')
    // render the inputComponent for a user to select an Object
    this.inputTypeComponent.render()
    $(this.html).append('<div class="EditComponents"></div>');

    $(this.html).find("select.input-val").niceSelect();
    if (this.inputTypeComponent.needTriggerClick == false) {
      $(this.html).find(".nice-select:not(.disabled)").trigger("click");
    }
    console.log("binding on change to ")
    console.dir($(this.html).find("select.input-val"))
    $(this.html)
      .find("select.input-val")
      .on("change", { arg1: this, arg2: "onChange" }, eventProxiCriteria);
   
    if (this.inputTypeComponent.needTriggerClick == true) {
      // Ne pas selectionner pour les résultats si chargement en cours
      this.notSelectForview = true;
      //$(this.html).find('.nice-select').trigger('click') ;
      $(this.html).find("select.input-val").trigger("change");
      this.inputTypeComponent.needTriggerClick = false;
      this.notSelectForview = false;
      //$(this.ParentCriteriaGroup.thisForm.sparnatural).trigger( {type:"submit" } ) ;
    }
  }

    // Make arrow function to bind the this lexically
    // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
    onRemoveSelected = () =>{
      console.warn('endclassgroup onRemoveSelected')
      console.dir(this)
      console.dir(this.html)
      let optionsGrp = $(this.ParentCriteriaGroup.html).find('.OptionsGroup')
      this.#removeComponent(optionsGrp)
  
      let objectPropertyGrp = $(this.ParentCriteriaGroup.html).find('.ObjectPropertyGroup')
      this.#removeComponent(objectPropertyGrp)
  
      let endClassGrp = $(this.ParentCriteriaGroup.html).find('.EndClassGroup')
      this.#removeComponent(endClassGrp)
  
      let endClassWgtGrp = $(this.ParentCriteriaGroup.html).find('.EndClassWidgetGroup')
      this.#removeComponent(endClassWgtGrp)
  
      let actionsGrp = $(this.ParentCriteriaGroup.html).find('.ActionsGroup')
      this.#removeComponent(actionsGrp)
  
      //Now rerender all of them
      this.ParentCriteriaGroup.OptionsGroup.render()
      this.ParentCriteriaGroup.ObjectPropertyGroup.render()
      this.ParentCriteriaGroup.EndClassGroup.render()
      this.ParentCriteriaGroup.EndClassWidgetGroup.render()
      this.ParentCriteriaGroup.ActionsGroup.render()
  
      // set the state back
      $(this.ParentCriteriaGroup).trigger("StartClassGroupSelected")
  
    }
  // Make arrow function to bind the this lexically
  // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
  onchangeViewVariable = ()=> {
    console.warn("endclassgrp onChangeViewVar")
    if (this.variableSelector === null) {
      //Add varableSelector on variableSelector list ;
      this.variableSelector = new VariableSelector(this, this.specProvider);
      $(this.selectViewVariable).html(UiuxConfig.ICON_SELECTED_VARIABLE);
      $(this.html).addClass("VariableSelected");
    } else {
      if (this.variableSelector.canRemove()) {
        this.variableSelector.remove();
        this.variableSelector = null;
        $(this.selectViewVariable).html(UiuxConfig.ICON_NOT_SELECTED_VARIABLE);
        $(this.html).removeClass("VariableSelected");
      }
    }
    this.ParentCriteriaGroup.thisForm_.sparnatural.variablesSelector.updateVariableList();
  }

  /*
		onChange gets called when a Endclassgroup was selected. For example choosing Musuem relatedTo Countr
		When Country got selected this events fires
	*/
  onChange() {
    console.warn("endclassgrp onChange")
    this.#renderUnselectBtn()
    this.#renderSelectViewVariableBtn()
    console.warn('endclassgroup.onchange')
    this.value_selected = this.#getSelectedValue();
    //Set the variable name for Sparql
    if (this.varName == null) {
      this.varName =
        "?" +
        localName(this.value_selected) +
        "_" +
        (this.ParentCriteriaGroup.thisForm_.sparnatural.getMaxVarIndex() + 1);
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
    this.cssClasses.HasInputsCompleted = true;
    this.cssClasses.IsOnEdit = false;
    this.update()
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
      var tippySettings = Object.assign({}, this.settings?.tooltipConfig);
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
    this.#isExactlyOne(component)
    component.empty()
    component.remove()
  }

  // check if the Jquery find method found exactly one child element
  #isExactlyOne(el:JQuery<HTMLElement>){
    if(el.length > 1) throw Error(`More than one ${el[0]} found. Criteriagroup ${this.ParentCriteriaGroup.html} has more than one ${el[0]} as child`)
    // if no el found then length is zero
    if(!el.length) throw Error(`No HTMLElement found. Criteriagroup id: ${this.ParentCriteriaGroup.id} doesn't contain the HTMLElement`)
  }

  getVarName() {
    return this.varName;
  }
}
export default EndClassGroup;

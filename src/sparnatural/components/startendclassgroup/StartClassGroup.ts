import tippy from "tippy.js";
import {
  eventProxiCriteria,
} from "../../globals/globalfunctions";
import ClassTypeId from "./ClassTypeId";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import HTMLComponent from "../../HtmlComponent";
import SelectViewVariableBtn from "../buttons/SelectViewVariableBtn";

/**
 * Selection of the start class in a criteria/line
 **/
class StartClassGroup extends HTMLComponent {
  startClassValue:any
  varName: any;
  selectViewVariable: JQuery<HTMLElement>;
  notSelectForview: boolean;
  value_selected: any;
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  selectViewVariableBtn: SelectViewVariableBtn
  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider: ISpecProvider,
    startClassValue:any
  ) {
    super("StartClassGroup", ParentCriteriaGroup, null);
    console.log('specprovider')
    console.dir(specProvider)
    this.startClassValue = startClassValue
    this.specProvider = specProvider
    this.inputTypeComponent = new ClassTypeId(this, this.specProvider,startClassValue);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup; // must be before varName declaration
    // contains the name of the SPARQL variable associated to this component
    this.varName = this.ParentCriteriaGroup.jsonQueryBranch
      ? this.ParentCriteriaGroup.jsonQueryBranch.line.s
      : null;
    this.notSelectForview = false;
   
  }

  render(){
    super.render()
    this.inputTypeComponent.render()
    return this
  }

  // triggered when a criteria starts
  onCreated() {
    $(this.html).find(".input-val").unbind("change");
    this.inputTypeComponent.render(); //ClassTypeId contains class html input val so init first then we can find it
    var select = $(this.html).find(".input-val")[0];
    $(select).niceSelect();

    $(this.html)
      .find("select.input-val")
      .on("change", { arg1: this, arg2: "onChange" }, eventProxiCriteria);
    if (this.inputTypeComponent.needTriggerClick == true) {
      // Ne pas selectionner pour les résultats si chargement en cours
      this.notSelectForview = true;
      $(this.html).find("select.input-val").trigger("change");
      this.inputTypeComponent.needTriggerClick = false;
      this.notSelectForview = false;
    }
  }

  onchangeViewVariable = ()=> {
    // emit custom event. getting cought in SparnaturalComponent
    let ev = new CustomEvent('updateVariableList',{bubbles:true})
    this.html[0].dispatchEvent(ev)
  }

  onChange() {
    $(this.html).addClass("VariableSelected");
    this.#renderSelectViewVariableBtn()
    //this.niceslect.niceSelect('update') ;
    this.value_selected = $(this.html).find("select.input-val").val();
    //Sets the SPARQL variable name if not initialized from loaded query

    //pass down the varname instead of getting it from the parent or sibling
      /*
    if (this.varName == null) {
      if (parentOrSibling && parentOrSibling.type == "parent") {
        this.varName = parentOrSibling.element.EndClassGroup.getVarName();
      } else if (parentOrSibling && parentOrSibling.type == "sibling") {
        this.varName = parentOrSibling.element.StartClassGroup.getVarName();
      } else {
        this.varName = "?this";
      }
    }*/

    this.html
      .find(".input-val")
      .attr("disabled", "disabled")
      .niceSelect("update");
    //add varName on curent selection display
    //this.onSelectValue(this.varName) ;
    // trigger event on the whole line/criteria
    $(this.ParentCriteriaGroup).trigger("StartClassGroupSelected");

    this.html[0].dispatchEvent(new CustomEvent('submit',{bubbles:true}))

    var desc = this.specProvider.getTooltip(this.value_selected);
    if (desc) {
      $(this.ParentCriteriaGroup.StartClassGroup.html)
        .find(".ClassTypeId")
        .attr("data-tippy-content", desc);
      // tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
      var tippySettings = Object.assign({}, this.settings.tooltipConfig);
      tippySettings.placement = "top-start";
      tippy(".StartClassGroup .ClassTypeId[data-tippy-content]", tippySettings);
    } else {
      $(this.ParentCriteriaGroup.StartClassGroup.html).removeAttr(
        "data-tippy-content"
      );
    }

  }

  #renderSelectViewVariableBtn(){
    this.selectViewVariableBtn = new SelectViewVariableBtn(this,this.onchangeViewVariable)
  }
  getVarName() {
    return this.varName;
  }
  // TODO refactor away. only endclassgroup and startclassgroup are using this
  /*
	onSelectValue(varName:any) {
		var current = $(this.html).find('.nice-select .current').first() ;
		var varNameForDisplay = '<span class="variableName">'+varName.replace('?', '')+'</span>' ;
		$(varNameForDisplay).insertAfter($(current).find('.label').first()) ;

	}*/
}
export default StartClassGroup;

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

  onchangeViewVariable = ()=> {
    // emit custom event. getting cought in SparnaturalComponent
    let ev = new CustomEvent('updateVariableList',{bubbles:true})
    this.html[0].dispatchEvent(ev)
  }

  #valueWasSelected() {
    $(this.html).addClass("VariableSelected");
    this.#renderSelectViewVariableBtn()

    $(this.ParentCriteriaGroup).trigger("StartClassGroupSelected");

    this.html[0].dispatchEvent(new CustomEvent('submit',{bubbles:true}))

    var desc = this.specProvider.getTooltip(this.value_selected);
    
    /*
      Not sure what the following code does
    */

    if (desc) {
      console.warn('StartClassGroup.valueSelected desc hapene!')
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

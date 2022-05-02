import tippy from "tippy.js";
import {
  eventProxiCriteria,
  findParentOrSiblingCriteria,
} from "../../globals/globalfunctions";
import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import ClassTypeId from "./ClassTypeId";
import VariableSelector from "./VariableSelector";
import ISettings from "../../../configs/client-configs/ISettings";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import HTMLComponent from "../../HtmlComponent";
import SelectViewVariableBtn from "../buttons/SelectViewVariableBtn";

/**
 * Selection of the start class in a criteria/line
 **/
class StartClassGroup extends HTMLComponent {
  varName: any;
  settings: ISettings;
  variableSelector: VariableSelector;
  selectViewVariable: JQuery<HTMLElement>;
  notSelectForview: boolean;
  value_selected: any;
  inputTypeComponent: ClassTypeId;
  variableViewPreload: string = "";
  variableNamePreload: string;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  selectViewVariableBtn: SelectViewVariableBtn
  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider: ISpecProvider,
    settings: ISettings
  ) {
    super("StartClassGroup", ParentCriteriaGroup, null);
    this.settings = settings;
    this.specProvider = specProvider
    console.log('specprovider in startclass')
    console.dir(specProvider)
    this.inputTypeComponent = new ClassTypeId(this, specProvider);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup; // must be before varName declaration
    // contains the name of the SPARQL variable associated to this component
    this.varName = this.ParentCriteriaGroup.jsonQueryBranch
      ? this.ParentCriteriaGroup.jsonQueryBranch.line.s
      : null;
    this.variableSelector = null;
    this.notSelectForview = false;
   
  }

  render(){
    super.render()
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
    if (this.variableSelector === null) {
      //Add varableSelector on variableSelector list ;
      this.variableSelector = new VariableSelector(this, this.specProvider);
    } else {
      if (this.variableSelector.canRemove()) {
        this.variableSelector.remove();
        this.variableSelector = null;
      }
    }
    // emit custom event. getting cought in SparnaturalComponent
    let ev = new CustomEvent('updateVariableList',{bubbles:true})
    this.html[0].dispatchEvent(ev)
  }

  onChange() {
    this.#renderSelectViewVariableBtn()
    //this.niceslect.niceSelect('update') ;
    this.value_selected = $(this.html).find("select.input-val").val();
    //Sets the SPARQL variable name if not initialized from loaded query
    var parentOrSibling = findParentOrSiblingCriteria.call(
      this,
      this.ParentCriteriaGroup.thisForm_,
      this.ParentCriteriaGroup.id
    );
    if (this.varName == null) {
      if (parentOrSibling && parentOrSibling.type == "parent") {
        this.varName = parentOrSibling.element.EndClassGroup.getVarName();
      } else if (parentOrSibling && parentOrSibling.type == "sibling") {
        this.varName = parentOrSibling.element.StartClassGroup.getVarName();
      } else {
        this.varName = "?this";
      }
    }

    if (this.varName == "?this" && parentOrSibling === null) {
      //Si une requete est en chargement pas d'obligation d'aficher la première variable
      if (!this.notSelectForview) {
        // Pas de requete à charger, oeil actif
        this.selectViewVariable = $(
          '<span class="selectViewVariable">' +
            UiuxConfig.ICON_SELECTED_VARIABLE +
            "</span>"
        );
        $(this.html).append(this.selectViewVariable);
        $(this.html)
          .find("span.selectViewVariable")
          .on(
            "click",
            { arg1: this, arg2: "onchangeViewVariable" },
            eventProxiCriteria
          );
        //Add varableSelector on variableSelector list ;
        this.variableSelector = new VariableSelector(this, this.specProvider);
        $(this.html).addClass("VariableSelected");
      } else {
        //Pour le chargement d'une requête, par défaul l'oeil est barré.
        this.selectViewVariable = $(
          '<span class="selectViewVariable">' +
            UiuxConfig.ICON_NOT_SELECTED_VARIABLE +
            "</span>"
        );
        $(this.html).append(this.selectViewVariable);
        $(this.html)
          .find("span.selectViewVariable")
          .on(
            "click",
            { arg1: this, arg2: "onchangeViewVariable" },
            eventProxiCriteria
          );
      }
    }

    $(this.ParentCriteriaGroup.StartClassGroup.html)
      .find(".input-val")
      .attr("disabled", "disabled")
      .niceSelect("update");
    //add varName on curent selection display
    //this.onSelectValue(this.varName) ;
    // trigger event on the whole line/criteria
    $(this.ParentCriteriaGroup).trigger("StartClassGroupSelected");

    if (this.settings.sendQueryOnFirstClassSelected) {
      $(this.ParentCriteriaGroup.thisForm_.sparnatural).trigger("submit");
    }

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

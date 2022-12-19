import ClassTypeId from "./ClassTypeId";
import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import tippy from "tippy.js";
import { getSettings, TOOLTIP_CONFIG } from "../../../../../settings/defaultSettings";
import { SelectedVal } from "../../../../../generators/ISparJson";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";
import EditComponents from "../edit-components/EditComponents";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";

/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
class ObjectSelector extends HTMLComponent {
  variableSelector: any;
  objectVal: SelectedVal = {
    type: null,
    variable: null,
  };
  // shadow variable for http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#defaultLabelProperty
  defaultLblVar: SelectedVal ={
    type:null,
    variable:null
  };
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  editComponents: EditComponents;
  // endClassWidgetGroup: EndClassWidgetGroup;
  subjectVal: SelectedVal;
  objectPropVal: SelectedVal;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("ObjectSelector", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    // this.endClassWidgetGroup = new EndClassWidgetGroup(this, this.specProvider);
  }

  render() {
    super.render();
    this.variableSelector = null;
    this.#addEventListener();
    return this;
  }

  #addEventListener() {
    this.html[0].addEventListener(
      "classTypeValueSelected",
      (e: CustomEvent) => {
        if (e.detail === "" || !e.detail)
          throw Error('No value received on "classTypeValueSelected"');
        e.stopImmediatePropagation();
        this.#createSparqlVar(e.detail);
        this.#valueWasSelected();
      }
    );

    this.html[0].addEventListener("onSelectViewVar", (e: CustomEvent) => {
      if(e.detail.selected) {
        e.detail.selected
        ? this.html.addClass("VariableSelected")
        : this.html.removeClass("VariableSelected");
      }
    });
  }

  // Creating the Variable for the variable menu
  #createSparqlVar(type: string) {
    this.objectVal.type = type;
    this.html[0].dispatchEvent(
      new CustomEvent("getSparqlVarId", {
        bubbles: true,
        detail: (id: number) => {
          //callback
          this.objectVal.variable = `?${this.#getUriClassName(type)}_${id}`;
        },
      })
    );
    this.#addDefaultLblVar(type,this.objectVal.variable)
  }

  #getUriClassName(uri:string){
    if(uri.includes('#')) return uri.split('#').pop()
    return uri.split('/').pop()
  }

  // adding a defaultlblProperty
  // see: https://docs.sparnatural.eu/OWL-based-configuration#classes-configuration-reference
  #addDefaultLblVar(type:string,varName:string) {
    const lbl = this.specProvider.getDefaultLabelProperty(type)
    if(lbl) {
      this.defaultLblVar.type = lbl
      this.defaultLblVar.variable = `${varName}_label`
    }
  }

  // triggered when the subject/domain is selected
  onSubjectSelectorSelected(subjectVal: SelectedVal) {
    this.subjectVal = subjectVal;

    // render the inputComponent for a user to select an Object
    this.inputTypeComponent = new ClassTypeId(
      this,
      this.specProvider,
      subjectVal
    );
    this.inputTypeComponent.render();
  }

  onPredicateSelectorSelected(objectPropVal: SelectedVal) {
    this.objectPropVal = objectPropVal;
    if (!this.editComponents) {
      // this is where the widgets will be determined and rendered    
      this.editComponents = new EditComponents(
        this,
        this.subjectVal,
        objectPropVal,
        this.objectVal,
        this.specProvider
      ).render();
    }
  }

  // renders the "eye" btn
  renderSelectViewVar() {
    this.inputTypeComponent.selectViewVariableBtn.render();
  }

  #valueWasSelected() {
    this.#renderUnselectBtn();
    // trigger the event that will call the PredicateSelector
    this.html[0].dispatchEvent(
      new CustomEvent("ObjectSelectorSelected", {
        bubbles: true,
        detail: this.objectVal,
      })
    );

    var desc = this.specProvider.getTooltip(this.objectVal.type);
    if (desc) {
      $(this.html).find(".ClassTypeId").attr("data-tippy-content", desc);
      var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
      tippySettings.placement = "top-start";
      tippy(".ObjectSelector .ClassTypeId[data-tippy-content]", tippySettings);
    } else {
      $(this.ParentCriteriaGroup.ObjectSelector.html).removeAttr(
        "data-tippy-content"
      );
    }
  }

  #renderUnselectBtn() {
    this.inputTypeComponent.renderUnselectBtn();
  }

  getVarName() {
    return this.objectVal.variable;
  }

  getDefaultLblVar(){
    return this.defaultLblVar?.variable
  }
  
  #setDefaultLblVar(name:string){
    this.defaultLblVar.variable = `${name}_label`
  }

  setVarName(name: string) {
    this.objectVal.variable = name;
    this.#setDefaultLblVar(name)
  }

  getTypeSelected() {
    return this.objectVal.type;
  }

  /**
   * @returns the widgetComponent inside this ObjectSelector, to examine its characteristics
   * (e.g. determine if single or multiple values)
   */
  getWidgetComponent():AbstractWidget {
    return this.editComponents.widgetWrapper.widgetComponent;
  }

}
export default ObjectSelector;

import ClassTypeId from "./ClassTypeId";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import tippy from "tippy.js";
import { getSettings } from "../../../../../../configs/client-configs/settings";
import { SelectedVal } from "../../../../../generators/ISparJson";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";
import EditComponents from "../edit-components/EditComponents";

/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
class EndClassGroup extends HTMLComponent {
  variableSelector: any;
  endClassVal: SelectedVal = {
    type: null,
    variable: null,
  };
  defaultLblVar: SelectedVal ={
    type:null,
    variable:null
  };
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  editComponents: EditComponents;
  // endClassWidgetGroup: EndClassWidgetGroup;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("EndClassGroup", ParentCriteriaGroup, null);
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
    this.endClassVal.type = type;
    this.html[0].dispatchEvent(
      new CustomEvent("getSparqlVarId", {
        bubbles: true,
        detail: (id: number) => {
          //callback
          this.endClassVal.variable = `?${this.#getUriClassName(type)}_${id}`;
        },
      })
    );
    this.#addDefaultLblVar(type,this.endClassVal.variable)
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
  onStartClassGroupSelected(startClassVal: SelectedVal) {
    this.startClassVal = startClassVal;

    // render the inputComponent for a user to select an Object
    this.inputTypeComponent = new ClassTypeId(
      this,
      this.specProvider,
      startClassVal
    );
    this.inputTypeComponent.render();
  }

  onObjectPropertyGroupSelected(objectPropVal: SelectedVal) {
    this.objectPropVal = objectPropVal;
    if (this.editComponents) {
      // html needs to be destroyed if present. Otherwise gets double rendered when and Action is called
      // multiple times
      //this.editComponents?.html?.empty()?.remove()
      //this.editComponents.render();
    } else {
      this.editComponents = new EditComponents(
        this,
        this.startClassVal,
        objectPropVal,
        this.endClassVal,
        this.specProvider
      ).render();
      // this.endClassWidgetGroup.render();
    }
  }
  renderSelectViewVar() {
    this.inputTypeComponent.selectViewVariableBtn.render();
  }

  #valueWasSelected() {
    this.#renderUnselectBtn();
    // trigger the event that will call the ObjectPropertyGroup
    this.html[0].dispatchEvent(
      new CustomEvent("EndClassGroupSelected", {
        bubbles: true,
        detail: this.endClassVal,
      })
    );

    var desc = this.specProvider.getTooltip(this.endClassVal.type);
    if (desc) {
      $(this.html).find(".ClassTypeId").attr("data-tippy-content", desc);
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

  #renderUnselectBtn() {
    this.inputTypeComponent.renderUnselectBtn();
  }

  getVarName() {
    return this.endClassVal.variable;
  }

  getDefaultLblVar(){
    return this.defaultLblVar?.variable
  }
  
  setDefaultLblVar(lbl:string){
    this.defaultLblVar.variable = lbl
  }

  setVarName(name: string) {
    this.endClassVal.variable = name;
  }
  getTypeSelected() {
    return this.endClassVal.type;
  }
}
export default EndClassGroup;

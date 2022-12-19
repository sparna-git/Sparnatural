import ClassTypeId from "./ClassTypeId";
import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import { SelectedVal } from "../../../../../generators/ISparJson";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";
import TippyInfo from "../../../../buttons/TippyInfo";
import { TOOLTIP_CONFIG } from "../../../../../settings/defaultSettings";

/**
 * Selection of the start class in a criteria/line
 **/
class SubjectSelector extends HTMLComponent {
  subjectVal: SelectedVal;
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  renderEyeBtn:Boolean = false
  // shadow variable for http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#defaultLabelProperty
  defaultLblVar: SelectedVal ={
    type:null,
    variable:null
  }

  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider: ISpecProvider,
    subjectVal?: SelectedVal,
    renderEyeBtn?: Boolean
  ) {
    super("SubjectSelector", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.inputTypeComponent = new ClassTypeId(this, this.specProvider, subjectVal);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    this.subjectVal = subjectVal
      ? subjectVal
      : {
          type: null,
          variable: null,
        };
    this.renderEyeBtn = renderEyeBtn
  }

  render() {
    super.render();
    this.inputTypeComponent.render();
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
        //only create new SPARQL variable if the subjectVal is not set by the parent component
        if (!this.subjectVal.variable){
          this.#createSparqlVar(e.detail);
          this.#addDefaultLblVar(this.subjectVal.type,this.subjectVal.variable)
        } else{
          this.#addDefaultLblVar(this.subjectVal.type,this.subjectVal.variable)
        }
        // Iff(!) First SubjectSelector of first GrpWrapper: eye btn automatically rendered + selected
        if (this.renderEyeBtn) this.#autoSelectEyeBtn()
        this.#valueWasSelected();
      }
    );
  }

  #autoSelectEyeBtn(){
    this.inputTypeComponent.selectViewVariableBtn.render() 
    this.inputTypeComponent.selectViewVariableBtn.widgetHtml[0].dispatchEvent(new Event('click'))
  }

  #createSparqlVar(type: string) {
    this.subjectVal.type = type;
    this.html[0].dispatchEvent(
      new CustomEvent("getSparqlVarId", {
        bubbles: true,
        detail: (id: number) => {
          //callback
          this.subjectVal.variable = `?${this.#getUriClassName(type)}_${id}`;
        },
      })
    );
  }

  // get the classname of the uri
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

  #valueWasSelected() {
    this.html[0].dispatchEvent(
      new CustomEvent("SubjectSelectorSelected", {
        bubbles: true,
        detail: this.subjectVal,
      })
    );

    var desc = this.specProvider.getTooltip(this.subjectVal.type);
    if (desc) {
      var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
      tippySettings.placement = "top-start";
      new TippyInfo(this, desc, tippySettings);
    }
  }
  getVarName() {
    return this.subjectVal.variable;
  }
  setVarName(name: string) {
    this.subjectVal.variable = name;
    this.#setDefaultLblVar(name)
  }
  getTypeSelected() {
    return this.subjectVal.type;
  }
  getDefaultLblVar(){
    return this.defaultLblVar?.variable
  }
  #setDefaultLblVar(name:string){
    this.defaultLblVar.variable = `${name}_label`
  }

}
export default SubjectSelector;

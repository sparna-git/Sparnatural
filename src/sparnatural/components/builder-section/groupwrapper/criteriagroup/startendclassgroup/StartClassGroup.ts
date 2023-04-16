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
class StartClassGroup extends HTMLComponent {
  startClassVal: SelectedVal;
  inputSelector: ClassTypeId;
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
    startClassVal?: SelectedVal,
    renderEyeBtn?: Boolean
  ) {
    super("StartClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.inputSelector = new ClassTypeId(this, this.specProvider, startClassVal);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    this.startClassVal = startClassVal
      ? startClassVal
      : {
          type: null,
          variable: null,
        };
    this.renderEyeBtn = renderEyeBtn
  }

  render() {
    super.render();
    this.inputSelector.render();
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
        //only create new SPARQL variable if the startClassVal is not set by the parent component
        if (!this.startClassVal.variable){
          this.#createSparqlVar(e.detail);
          this.#addDefaultLblVar(this.startClassVal.type,this.startClassVal.variable)
        } else{
          this.#addDefaultLblVar(this.startClassVal.type,this.startClassVal.variable)
        }
        // Iff(!) First StartClass of first GrpWrapper: eye btn automatically rendered + selected
        if (this.renderEyeBtn) this.#autoSelectEyeBtn()
        this.#valueWasSelected();
      }
    );
  }

  #autoSelectEyeBtn(){
    this.inputSelector.selectViewVariableBtn.render() 
    this.inputSelector.selectViewVariableBtn.widgetHtml[0].dispatchEvent(new Event('click'))
  }

  #createSparqlVar(type: string) {
    this.startClassVal.type = type;
    this.html[0].dispatchEvent(
      new CustomEvent("getSparqlVarId", {
        bubbles: true,
        detail: (id: number) => {
          //callback
          this.startClassVal.variable = `?${this.#getUriClassName(type)}_${id}`;
        },
      })
    );
  }

  // get the classname of the uri
  #getUriClassName(uri:string){
    // replaces all non-ASCII characters with an underscore in variable names
    if(uri.includes('#')) return uri.split('#').pop().replace(/[^\x00-\x7F]/g, "_")
    return uri.split('/').pop().replace(/[^\x00-\x7F]/g, "_")
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
      new CustomEvent("StartClassGroupSelected", {
        bubbles: true,
        detail: this.startClassVal,
      })
    );

    var desc = this.specProvider.getTooltip(this.startClassVal.type);
    if (desc) {
      var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
      tippySettings.placement = "top-start";
      new TippyInfo(this, desc, tippySettings);
    }
  }
  getVarName() {
    return this.startClassVal.variable;
  }
  setVarName(name: string) {
    this.startClassVal.variable = name;
    this.#setDefaultLblVar(name)
  }
  getTypeSelected() {
    return this.startClassVal.type;
  }
  getDefaultLblVar(){
    return this.defaultLblVar?.variable
  }
  #setDefaultLblVar(name:string){
    this.defaultLblVar.variable = `${name}_label`
  }

}
export default StartClassGroup;

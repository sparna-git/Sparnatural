import ClassTypeId from "./ClassTypeId";
import { ISparnaturalSpecification } from "../../../../../spec-providers/ISparnaturalSpecification";
import { SelectedVal } from "../../../..//SelectedVal";
import CriteriaGroup from "../CriteriaGroup";
import { HTMLComponent } from "../../../../HtmlComponent";
import TippyInfo from "../../../../buttons/TippyInfo";
import { TOOLTIP_CONFIG } from "../../../../../settings/defaultSettings";

/**
 * Selection of the start class in a criteria/line
 **/
class StartClassGroup extends HTMLComponent {
  startClassVal: SelectedVal;
  inputSelector: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISparnaturalSpecification;
  renderEyeBtn:Boolean = false;
  temporaryLabel: string;
  // shadow variable for http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#defaultLabelProperty
  defaultLblVar: SelectedVal ={
    type:null,
    variable:null
  }

  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider: ISparnaturalSpecification,
    temporaryLabel: string,
    startClassVal?: SelectedVal,
    renderEyeBtn?: Boolean,
  ) {
    super("StartClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    
    this.temporaryLabel = temporaryLabel;
    this.inputSelector = new ClassTypeId(this, this.specProvider, this.temporaryLabel, startClassVal);
    this.ParentCriteriaGroup = this.parentComponent as CriteriaGroup;
    this.startClassVal = startClassVal
      ? startClassVal
      : {
          type: null,
          variable: null,
        };
    this.renderEyeBtn = renderEyeBtn;
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
        } else{
          this.#syncDefaultLblVar()
        }
        // Iff(!) First StartClass of first GrpWrapper: eye btn automatically rendered + selected
        if (this.renderEyeBtn) this.autoSelectEyeBtn()
        this.#valueWasSelected();
      }
    );
  }

  /**
   * This can be called from the outside when deleting the first row and the second row becomes root
   */
  autoSelectEyeBtn(){
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
          this.startClassVal.variable = `${this.#getUriClassName(type)}_${id}`;
          this.#syncDefaultLblVar();
        },
      })
    );
  }

  // get the classname of the uri
  #getUriClassName(uri:string){
    // replaces all non-ASCII characters with an underscore in variable names
    if(uri.includes('#')) return uri.split('#').pop().replace(/[^\x00-\x7F]/g, "_").replace(/-/g, "_")
    return uri.split('/').pop().replace(/[^\x00-\x7F]/g, "_").replace(/-/g, "_")
  }

  // adding a defaultlblProperty
  // see: https://docs.sparnatural.eu/OWL-based-configuration#classes-configuration-reference
  #syncDefaultLblVar() {
    let type = this.startClassVal.type;
    let name = this.startClassVal.variable;
    const lbl = this.specProvider.getEntity(type).getDefaultLabelProperty()
    if(lbl) {
      this.defaultLblVar.type = lbl
      this.defaultLblVar.variable = `${name}_label`
    }
  }

  #valueWasSelected() {
    this.html[0].dispatchEvent(
      new CustomEvent("StartClassGroupSelected", {
        bubbles: true,
        detail: this.startClassVal,
      })
    );

    var desc = this.specProvider.getEntity(this.startClassVal.type).getTooltip();
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
    this.#syncDefaultLblVar();
  }
  getTypeSelected() {
    return this.startClassVal.type;
  }
  getDefaultLblVar(){
    return this.defaultLblVar?.variable
  }

  /**
   * @returns true if the 'eye' icon on this arrow is selected
   */
  isVarSelected() {
    return this.inputSelector?.selectViewVariableBtn?.selected;
  }

}
export default StartClassGroup;

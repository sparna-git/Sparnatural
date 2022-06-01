import ClassTypeId from "./ClassTypeId";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";
import TippyInfo from "../../../../buttons/TippyInfo";


/**
 * Selection of the start class in a criteria/line
 **/
class StartClassGroup extends HTMLComponent {
  startClassVal: SelectedVal;
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider,startClassVal?:SelectedVal) {
    super("StartClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.inputTypeComponent = new ClassTypeId(this, this.specProvider);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    this.startClassVal = startClassVal ? startClassVal : {
      type:null,
      variable:null
    };
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
        //only create new SPARQL variable if the startClassVal is not set by the parent component
        if(!this.startClassVal.variable)this.#createSparqlVar(e.detail)
        this.#valueWasSelected();
      }
    );
  }

  #createSparqlVar(type:string){
    this.startClassVal.type = type
    this.html[0].dispatchEvent(new CustomEvent('getSparqlVarId',{
      bubbles:true,
      detail:(id: number) => { //callback
        this.startClassVal.variable = `?${this.specProvider.getLabel(type)}_${id}`
        // id==1 -> first StartClassGroup of first GroupWrapper
        if(id === 1) this.html[0].dispatchEvent(new CustomEvent("onSelectViewVar", { bubbles: true,detail:this.startClassVal }));

      }
    }))
  }

  #valueWasSelected() {
    this.html[0].dispatchEvent(
      new CustomEvent("StartClassGroupSelected", {
        bubbles: true,
        detail: this.startClassVal,
      })
    );

    var desc = this.specProvider.getTooltip(this.startClassVal.type);

    /*
      Not sure what the following code does
    */

    if (desc) {
      // tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
      var tippySettings = Object.assign({}, this.settings.tooltipConfig);
      tippySettings.placement = "top-start";
      new TippyInfo(this,desc,tippySettings)
    }
  }
  getVarName() {
    return this.startClassVal.variable;
  }
  setVarName(name:string){
    this.startClassVal.variable = name
  }
  getTypeSelected(){
    return this.startClassVal.type
  }
}
export default StartClassGroup;

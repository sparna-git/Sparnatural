import tippy from "tippy.js";
import PredicateTypeId from "./PredicateTypeId";
import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";
import { SelectedVal } from "../../../../../generators/ISparJson";
import { TOOLTIP_CONFIG } from "../../../../../settings/defaultSettings";

/**
 * The property selection part of a criteria/line, encapsulating an PredicateTypeId
 **/
class PredicateSelector extends HTMLComponent {
  inputTypeComponent: PredicateTypeId;
  objectPropVal: SelectedVal = {
    variable: null,
    type: null,
  }; // value which shows which object property got chosen by the config for subject and object
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  subjectVal: SelectedVal;
  objectVal: SelectedVal;
  temporaryLabel: string;
  constructor(
    ParentComponent: CriteriaGroup,
    specProvider: ISpecProvider,
    temporaryLabel: string
  ) {
    super("PredicateSelector", ParentComponent, null);
    this.ParentCriteriaGroup = ParentComponent;
    this.temporaryLabel = temporaryLabel;
    this.specProvider = specProvider;
  }

  render() {
    super.render();
    this.#addEventListener();
    return this;
  }
  /*
		renders the temporarly object property
	*/
  onSubjectSelectorSelected(subjectVal: SelectedVal) {
    this.subjectVal = subjectVal;
    //this will set the temporary label since there hasn't been a Value chosen for ObjectSelector
    this.inputTypeComponent = new PredicateTypeId(
      this,
      this.specProvider,
      this.temporaryLabel,
      this.subjectVal
    ).render();
  }

  #addEventListener() {
    // event is caught here and then bubbles up to the CriteriaGroup
    this.html[0].addEventListener(
      "onPredicateTypeIdSelected",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        if (e.detail === "" || !e.detail)
          throw Error('No value received on "onPredicateSelectorSelected"');
        this.#createSparqlVar(e.detail);
        this.#valueWasSelected();
      }
    );
  }

  #createSparqlVar(type: string) {
    this.objectPropVal.type = type;
    this.html[0].dispatchEvent(
      new CustomEvent("getSparqlVarId", {
        bubbles: true,
        detail: (id: number) => {
          //callback
          this.objectPropVal.variable = `?${this.#getUriClassName(type)}_${id}`
      }})
    );
  }

  #valueWasSelected() {
    this.html[0].dispatchEvent(
      new CustomEvent("onPredicateSelectorSelected", {
        bubbles: true,
        detail: this.objectPropVal,
      })
    );
    var desc = this.specProvider.getTooltip(this.objectPropVal.type);

    if(desc) {
			$(this.ParentCriteriaGroup.PredicateSelector.html).find('.PredicateTypeId').attr('data-tippy-content', desc ) ;
			var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
			tippySettings.placement = "top-start";
			tippy('.PredicateSelector .PredicateTypeId[data-tippy-content]', tippySettings);
		} else {
			$(this.ParentCriteriaGroup.PredicateSelector.html).removeAttr('data-tippy-content') ;
		}
  }

  // get the classname of the uri
  #getUriClassName(uri:string){
    if(uri.includes('#')) return uri.split('#').pop()
    return uri.split('/').pop()
  }

  getTypeSelected() {
    return this.objectPropVal.type;
  }

  getVarName() {
    return this.objectPropVal.variable;
  }

  /*
		This method is triggered when an Object is selected.
		For example: Museum isRelatedTo Country. As soon as Country is chosen this method gets called
	*/
  onObjectSelectorSelected(objectVal: SelectedVal) {
    // this will update the temporarly label
    this.inputTypeComponent.setObjectSelectorVal(objectVal);
    this.inputTypeComponent.render();
  }
}
export default PredicateSelector;

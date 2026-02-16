import tippy from "tippy.js";
import ObjectPropertyTypeId from "./ObjectPropertyTypeId";
import { ISparnaturalSpecification } from "../../../../../spec-providers/ISparnaturalSpecification";
import CriteriaGroup from "../CriteriaGroup";
import { HTMLComponent } from "../../../../HtmlComponent";
import { SelectedVal } from "../../../..//SelectedVal";
import { TOOLTIP_CONFIG } from "../../../../../settings/defaultSettings";
import { Model } from "rdf-shacl-commons";

/**
 * The property selection part of a criteria/line, encapsulating an ObjectPropertyTypeId
 **/
class ObjectPropertyGroup extends HTMLComponent {
  inputSelector: ObjectPropertyTypeId;
  // value which shows which object property got chosen by the config for subject and object
  objectPropVal: SelectedVal = {
    variable: null,
    type: null,
  };
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISparnaturalSpecification;
  startClassVal: SelectedVal;
  endClassVal: SelectedVal;
  temporaryLabel: string;
  constructor(
    ParentComponent: CriteriaGroup,
    specProvider: ISparnaturalSpecification,
    temporaryLabel: string
  ) {
    super("ObjectPropertyGroup", ParentComponent, null);
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
  onStartClassGroupSelected(startClassVal: SelectedVal) {
    this.startClassVal = startClassVal;
    //this will set the temporary label since there hasn't been a Value chosen for EndClassGroup
    this.inputSelector = new ObjectPropertyTypeId(
      this,
      this.specProvider,
      this.temporaryLabel,
      this.startClassVal
    ).render();
  }

  #addEventListener() {
    // event is caught here and then bubbles up to the CriteriaGroup
    this.html[0].addEventListener(
      "onObjectPropertyTypeIdSelected",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        if (e.detail === "" || !e.detail)
          throw Error('No value received on "onObjectPropertyGroupSelected"');
        this.#createSparqlVar(e.detail);
        this.#valueWasSelected();
      }
    );
  }

  #createSparqlVar(type: string) {
    this.objectPropVal.type = type;
    this.html[0].dispatchEvent(
      new CustomEvent("getSparqlVar", {
        bubbles: true,
        detail: {
          type : type,
          callback: (variable: string) => {
            //callback
            this.objectPropVal.variable = variable;
          }
        }
      })
    );
  }

  #valueWasSelected() {
    this.html[0].dispatchEvent(
      new CustomEvent("onObjectPropertyGroupSelected", {
        bubbles: true,
        detail: this.objectPropVal,
      })
    );
    var desc = this.specProvider.getProperty(this.objectPropVal.type).getTooltip();

    if(desc) {
			$(this.ParentCriteriaGroup.ObjectPropertyGroup.html).find('.ObjectPropertyTypeId').attr('data-tippy-content', desc.replace(/"/g, '&quot;') ) ;
			var tippySettings = Object.assign({}, TOOLTIP_CONFIG);
			tippySettings.placement = "top-start";
			tippy('.ObjectPropertyGroup .ObjectPropertyTypeId[data-tippy-content]', tippySettings);
		} else {
			$(this.ParentCriteriaGroup.ObjectPropertyGroup.html).removeAttr('data-tippy-content') ;
		}
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
  onEndClassGroupSelected(endClassVal: SelectedVal) {
    // this will update the temporarly label
    this.inputSelector.setEndClassVal(endClassVal);
    this.inputSelector.render();
  }
}
export default ObjectPropertyGroup;

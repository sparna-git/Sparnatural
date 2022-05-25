import tippy from "tippy.js";
import ObjectPropertyTypeId from "./ObjectPropertyTypeId";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";

/**
 * The property selection part of a criteria/line, encapsulating an ObjectPropertyTypeId
 **/
class ObjectPropertyGroup extends HTMLComponent {
  objectPropertySelector: ObjectPropertyTypeId;
  objectPropVal: string = null; // value which shows which object property got chosen by the config for subject and object
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  constructor(
    ParentComponent: CriteriaGroup,
    specProvider: ISpecProvider,
    temporaryLabel: string
  ) {
    super("ObjectPropertyGroup", ParentComponent, null);
    this.ParentCriteriaGroup = ParentComponent;
    this.objectPropertySelector = new ObjectPropertyTypeId(
      this,
      specProvider,
      temporaryLabel
    );
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
  onStartClassGroupSelected() {
    //this will set the temporary label since there hasn't been a Value chosen for EndClassGroup
    this.objectPropertySelector.render();
  }

  #addEventListener() {
    this.html[0].addEventListener(
      "onObjectPropertyGroupSelected",
      (e: CustomEvent) => {
        if (e.detail === "" || !e.detail)
          throw Error('No value received on "classTypeValueSelected"');
        this.objectPropVal = e.detail;
        this.#valueWasSelected();
      }
    );
  }

  #valueWasSelected() {
    var desc = this.specProvider.getTooltip(this.objectPropVal);

    if (desc) {
      console.warn("StartClassGroup.valueSelected desc hapene!");
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

  /*
		This method is triggered when an Object is selected.
		For example: Museum isRelatedTo Country. As soon as Country is chosen this method gets called
	*/
  onEndClassGroupSelected() {
    // this will update the temporarly label
    this.objectPropertySelector.render();
  }
}
export default ObjectPropertyGroup;

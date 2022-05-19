import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import ArrowComponent from "../arrows/ArrowComponent";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";

/**
 * Refactored to extract this from InputTypeComponent
 **/
class ObjectPropertyTypeId extends HTMLComponent {
  needTriggerClick: boolean;
  GrandParent: CriteriaGroup;
  temporaryLabel: string;
  arrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_FRONT)
  specProvider: ISpecProvider;
  object_property_selected:any
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISpecProvider,
    temporaryLabel: string
  ) {
    super("ObjectPropertyTypeId", ParentComponent, null);
    this.temporaryLabel = temporaryLabel;
    this.needTriggerClick = false;
    this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup;
    this.specProvider = specProvider
  }

  /*
		Renders the ObjectPropertyType
		If the Endgroup is already chosen, then render with the adjusted object property
		created by PropertySelectBuilder
	*/
  render() {
    // if there is an Object selected
    if (this.GrandParent.EndClassGroup.endClassVal) {
      this.#removeTempLbl();
      let op = this.#setObjectProperty()
      // set the correct objectProperty matching to Start and End value
      this.widgetHtml = op.niceSelect()
      this.object_property_selected = op.val()
    } else {
      // there hasn't been an Object in Endclassgroup chosen. render a temporary label
      this.widgetHtml = $(
        '<span class="current temporary-label">' +
          this.temporaryLabel +
          "</span>"
      );
    }
    super.render()
    this.arrow.render()
    return this
  }

  // removes the temporary label e.g 'relatedTo'
  #removeTempLbl() {
    $(this.html).find(".temporary-label").remove();
  }

  // sets the ObjectProperty according to the Subject and Object e.g Country isCountryOf Musuem
  #setObjectProperty() {
    var selectBuilder = new PropertySelectBuilder(this.specProvider);
    var default_value = null;

    if (this.GrandParent.jsonQueryBranch != null) {
      var default_value = this.GrandParent.jsonQueryBranch.line.p;
      this.needTriggerClick = true;
    }

    return selectBuilder.buildPropertySelect(
      this.GrandParent.StartClassGroup.startClassVal,
      this.GrandParent.EndClassGroup.endClassVal,
      default_value
    );
  }


  reload() {
    console.warn("reload objectpropertytypeID")
    this.render(); // IMPORTANT  is this right? or should it be this.init()? to only update css classes
  }
}
export default ObjectPropertyTypeId;

/**
 * Builds a selector for property based on provided domain and range, by reading the
 * configuration.
 * Example: changes the relationship from 'Country relatedTo Museum' => 'Country countryOf Museum'
 **/
class PropertySelectBuilder {
  specProvider: any;
  constructor(specProvider: any) {
    this.specProvider = specProvider;
  }

  buildPropertySelect(
    domainClassID: any,
    rangeClassID: any,
    default_value: any
  ) {
    var items = this.specProvider.getConnectingProperties(
      domainClassID,
      rangeClassID
    );

    if(items.length > 1){
      throw Error("ObjectPropertyType should never have more than one connecting properties.")
    }

      let val = items[0]
      var label = this.specProvider.getLabel(val);
      var desc = this.specProvider.getTooltip(val);
      var description_attr = "";
      if (desc) {
        description_attr = ' data-desc="' + desc + '"';
      }
      // disable by default since the user don't need to select anything
      let htmlnew = $(
      `<select select-list input-val disabled> 
        <option selected="selected"  value="${val}" data-id="${val}" ${description_attr}>
        ${label}
        </option>
      </select>`
      )

    return htmlnew;
  }
}

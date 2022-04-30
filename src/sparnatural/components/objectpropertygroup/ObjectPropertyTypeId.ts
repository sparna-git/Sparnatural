import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import ArrowComponent from "../arrows/ArrowComponent";
import CriteriaGroup from "../criteriaList/CriteriaGroup";
import HTMLComponent from "../HtmlComponent";

/**
 * Refactored to extract this from InputTypeComponent
 **/
class ObjectPropertyTypeId extends HTMLComponent {
  needTriggerClick: boolean;
  GrandParent: CriteriaGroup;
  temporaryLabel: string;
  arrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_FRONT)
  specProvider: ISpecProvider;
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISpecProvider,
    temporaryLabel: string
  ) {
    super("ObjectPropertyTypeId", ParentComponent, null);
    this.temporaryLabel = temporaryLabel;
    this.cssClasses.flexWrap = true;
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
    if (this.GrandParent.EndClassGroup.value_selected) {
      this.#removeTempLbl();
      this.widgetHtml = this.#setObjectProperty();
      //this.update();
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
    $(this.html).find(".input-val").unbind("change");
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
      this.GrandParent.StartClassGroup.value_selected,
      this.GrandParent.EndClassGroup.value_selected,
      "c-" + this.GrandParent.id,
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
    inputID: string,
    default_value: any
  ) {
    var list = [];
    var items = this.specProvider.getConnectingProperties(
      domainClassID,
      rangeClassID
    );

    for (var key in items) {
      var val = items[key];
      var label = this.specProvider.getLabel(val);
      var desc = this.specProvider.getTooltip(val);
      var selected = default_value == val ? 'selected="selected"' : "";
      var description_attr = "";
      if (desc) {
        description_attr = ' data-desc="' + desc + '"';
      }
      list.push(
        '<option value="' +
          val +
          '" data-id="' +
          val +
          '"' +
          selected +
          " " +
          description_attr +
          "  >" +
          label +
          "</option>"
      );
    }

    var html_list = $("<select/>", {
      class: "select-list input-val",
      id: inputID,
      html: list.join(""),
    });
    return html_list;
  }
}

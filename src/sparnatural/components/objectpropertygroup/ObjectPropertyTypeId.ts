import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import ArrowComponent from "../arrows/ArrowComponent";
import CriteriaGroup from "../groupwrapper/CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";

/**
 * Refactored to extract this from InputTypeComponent
 **/
class ObjectPropertyTypeId extends HTMLComponent {
  GrandParent: CriteriaGroup;
  temporaryLabel: string;
  arrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_FRONT
  );
  specProvider: ISpecProvider;
  selectBuilder: PropertySelectBuilder;
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISpecProvider,
    temporaryLabel: string
  ) {
    super("ObjectPropertyTypeId", ParentComponent, null);
    this.temporaryLabel = temporaryLabel;
    this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup;
    this.specProvider = specProvider;
  }

  /*
		Renders the ObjectPropertyType
		If the Endgroup is already chosen, then render with the adjusted object property
		created by PropertySelectBuilder
	*/
  render() {
    super.render();
    // if there is an Object selected
    if (this.GrandParent.EndClassGroup.endClassVal) {
      this.#removeTempLbl();
      // set the correct objectProperty matching to Start and End value
      let oldWidget = this.#getObjectProperty();
      this.html.append(oldWidget);
      this.widgetHtml = oldWidget.niceSelect();
      this.#addOnChangeListener(oldWidget);

      // if there is no options for the user to choose, then trigger the change event
      if (this.selectBuilder.items.length <= 1) {
        oldWidget.trigger("change");
      }
    } else {
      // there hasn't been an Object in Endclassgroup chosen. render a temporary label
      this.widgetHtml = $(
        '<span class="current temporary-label">' +
          this.temporaryLabel +
          "</span>"
      );
    }
    this.html.append(this.widgetHtml);
    this.arrow.render();
    return this;
  }

  // when a value gets selected from the dropdown menu (niceselect), then change is called
  #addOnChangeListener(selectWidget: JQuery<HTMLElement>) {
    selectWidget.on("change", () => {
      let selectedValue = selectWidget.val();
      //disable further choice
      this.widgetHtml.addClass("disabled");
      this.widgetHtml.removeClass("open");
      this.html[0].dispatchEvent(
        new CustomEvent("onObjectPropertyGroupSelected", {
          bubbles: true,
          detail: selectedValue,
        })
      );
    });
  }

  // removes the temporary label e.g 'relatedTo'
  #removeTempLbl() {
    $(this.html).find(".temporary-label").remove();
  }

  // sets the ObjectProperty according to the Subject and Object e.g Country isCountryOf Musuem
  #getObjectProperty() {
    this.selectBuilder = new PropertySelectBuilder(this.specProvider);
    var default_value = null;

    return this.selectBuilder.buildPropertySelect(
      this.GrandParent.StartClassGroup.startClassVal.type,
      this.GrandParent.EndClassGroup.endClassVal.type,
      default_value
    );
  }

  reload() {
    console.warn("reload objectpropertytypeID");
    this.render(); // IMPORTANT  is this right? or should it be this.init()? to only update css classes
  }
}
export default ObjectPropertyTypeId;

/**
 * Builds a selector for property based on provided domain and range, by reading the
 * configuration.
 * Example: changes the relationship from 'Country relatedTo Museum' => 'Country countryOf Museum'
 * There can be multiple connectingProperties. User might need to choose.
 **/
class PropertySelectBuilder {
  items: Array<string>;
  specProvider: ISpecProvider;
  constructor(specProvider: any) {
    this.specProvider = specProvider;
  }

  buildPropertySelect(
    domainClassID: string,
    rangeClassID: string,
    default_value: any
  ) {
    this.items = this.specProvider.getConnectingProperties(
      domainClassID,
      rangeClassID
    );

    if (this.items.length > 1) {
      return this.#multipleConnectingProperty(this.items);
    }
    return this.#singleConnectingProperty(this.items);
  }

  #multipleConnectingProperty(items: Array<string>) {
    let default_value = items[0];
    let list: Array<string> = [];
    items.forEach((i) => {
      var label = this.specProvider.getLabel(i);
      var icon = this.specProvider.getIcon(i);
      var highlightedIcon = this.specProvider.getHighlightedIcon(i);
      // highlighted icon defaults to icon
      if (!highlightedIcon || 0 === highlightedIcon.length) {
        highlightedIcon = icon;
      }
      var image =
        icon != null
          ? ' data-icon="' + icon + '" data-iconh="' + highlightedIcon + '"'
          : "";
      //var selected = (default_value == val)?'selected="selected"':'';
      var desc = this.specProvider.getTooltip(i);
      var selected = default_value == i ? ' selected="selected"' : "";
      var description_attr = "";
      if (desc) {
        description_attr = ' data-desc="' + desc + '"';
      }
      list.push(
        '<option value="' +
          i +
          '" data-id="' +
          i +
          '"' +
          image +
          selected +
          " " +
          description_attr +
          "  >" +
          label +
          "</option>"
      );
    });
    var html_list = $("<select/>", {
      // open triggers the niceselect to be open
      class: "my-new-list input-val open",
      html: list.join(""),
    });
    return html_list;
  }

  #singleConnectingProperty(items: Array<string>) {
    let val = items[0];
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
    );

    return htmlnew;
  }
}

import ISettings from "../../../../../../sparnatural/settings/ISettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import HTMLComponent from "../../../../HtmlComponent";
import { SelectedVal } from "../../../../../generators/ISparJson";
import EditComponents from "./EditComponents";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";
import { getSettings } from "../../../../../settings/defaultSettings";


/**
 *  creates the corresponding widget
 **/
class WidgetWrapper extends HTMLComponent {
  settings: ISettings = getSettings()
  widgetType: Config;
  widgetComponent: AbstractWidget;
  specProvider: ISpecProvider;
  objectPropVal: SelectedVal;
  startClassVal: SelectedVal;
  endClassVal: SelectedVal;
  add_or: boolean = true;

  constructor(
    ParentComponent: EditComponents,
    specProvider: ISpecProvider,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super("WidgetWrapper", ParentComponent, null);
    this.specProvider = specProvider;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;

    this.widgetType = this.specProvider.getObjectPropertyType(
      this.objectPropVal.type
    );
  }

  render() {
    super.render();

    if (!this.widgetComponent) {
      this.#initWidgetComponent();
    }

    // always re-render the few labels before widget that can change depending if a value has already been selected or not
    $(this.html).find("#selectAllWrapper").remove();
    this.#addWidgetHTML(this.widgetType);

    //if there is already a widget component rendered, then only render it since we would like to keep the state
    if (this.widgetComponent) {
      // could still be null in case of non selectable property
      this.widgetComponent.render();
    }

    this.#addSelectAllListener();
    return this;
  }

  #addSelectAllListener() {
    $(this.html)
      .find(".selectAll")
      .first()
      .on("click", () => {
        this.html[0].dispatchEvent(
          new CustomEvent("selectAll", { bubbles: true })
        );
      });
  }

  #initWidgetComponent() {
    // if non selectable, simply exit
    if (this.widgetType == Config.NON_SELECTABLE_PROPERTY) {
      this.html[0].dispatchEvent(
        new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
      );
      return this;
    }

    this.widgetComponent = this.#createWidgetComponent(
      this.widgetType,
      this.objectPropVal.type,
      this.endClassVal.type
    );
  }

  #addWidgetHTML(widgetType: string) {
    var parenthesisLabel =
      " (" + this.specProvider.getLabel(this.endClassVal.type) + ") ";
    if (this.widgetType == Config.BOOLEAN_PROPERTY) {
      parenthesisLabel = " ";
    }

    let lineSpan = `<span class="edit-trait first">
    <span class="edit-trait-top"></span>
    <span class="edit-num">
      1
    </span>
    </span>`;

    let selectAnySpan = `<span class="selectAll" id="selectAll">
    <span class="underline">
    ${this.settings.langSearch.SelectAllValues}
    </span> 
    ${parenthesisLabel} 
    </span>`;

    let orSpan = `<span class="or">
      ${this.settings.langSearch.Or}
    </span> `;
    
    let endLabel = this.#getEndLabel(this.widgetType);
    let endLabelSpan = `<span>
      ${endLabel}
    </span>
    `;

    let htmlString = '';
    widgetType == Config.NON_SELECTABLE_PROPERTY
    ? (htmlString = lineSpan + selectAnySpan)
    // if there is a value, do not propose the "Any" selection option
    : (this.widgetComponent.getwidgetValues().length > 0)
      ?(htmlString = lineSpan + endLabelSpan) 
      :(htmlString = lineSpan + selectAnySpan + orSpan + endLabelSpan);

    this.widgetHtml = $(`<span id="selectAllWrapper">${htmlString}</span>`);

    this.html.append(this.widgetHtml);
  }

  #getEndLabel(widgetType: Config) {
    if (
      widgetType == Config.SEARCH_PROPERTY ||
      widgetType == Config.STRING_EQUALS_PROPERTY ||
      widgetType == Config.GRAPHDB_SEARCH_PROPERTY ||
      widgetType == Config.TREE_PROPERTY
    ) {
      // label of the "Search" pseudo-class is inserted alone in this case
      return this.specProvider.getLabel(this.endClassVal.type);
    } else if (
      widgetType == Config.LIST_PROPERTY ||
      widgetType == Config.TIME_PROPERTY_DATE ||
      widgetType == Config.TIME_PROPERTY_YEAR
    ) {
      return this.settings.langSearch.Select + " :";
    } else if (widgetType == Config.BOOLEAN_PROPERTY) {
      return "";
    } else {
      return this.settings.langSearch.Find + " :";
    }
  }



  #createWidgetComponent(
    widgetType: string,
    objectPropertyId: any,
    endClassType: any
  ): AbstractWidget {
 
  }



  getWidgetType() {
    return this.widgetType;
  }
}

export default WidgetWrapper;

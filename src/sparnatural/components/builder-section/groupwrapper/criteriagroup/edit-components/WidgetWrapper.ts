import ISettings from "../../../../../../sparnatural/settings/ISettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import { getSettings } from "../../../../../settings/defaultSettings";
import { I18n } from "../../../../../settings/I18n";
import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../../../HtmlComponent";
import { SelectedVal } from "../../../../SelectedVal";
import SparnaturalComponent from "../../../../SparnaturalComponent";
import { AbstractWidget } from "../../../../widgets/AbstractWidget";
import CriteriaGroup from "../CriteriaGroup";
import EditComponents from "./EditComponents";
import { WidgetFactory } from "./WidgetFactory";


/**
 *  creates the corresponding widget
 **/
class WidgetWrapper extends HTMLComponent {
  settings: ISettings = getSettings()
  widgetType?: string;
  widgetComponent: AbstractWidget;
  specProvider: ISparnaturalSpecification;
  objectPropVal: SelectedVal;
  startClassVal: SelectedVal;
  endClassVal: SelectedVal;
  add_or: boolean = true;

  constructor(
    parentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification,
    startClassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal
  ) {
    super("WidgetWrapper", parentComponent, null);
    this.specProvider = specProvider;
    this.startClassVal = startClassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;

    this.widgetType = this.specProvider.getProperty(this.objectPropVal.type).getPropertyType(this.endClassVal.type);
  }

  render() {
    super.render();

    if (!this.widgetComponent) {
      this.#initWidgetComponent();
    }

    // always re-render the few labels before widget that can change depending if a value has already been selected or not
    $(this.html).find("#selectAllWrapper").remove();
    this.#addWidgetHTML(this.widgetType);

    // if there is already a widget component rendered, then only render it since we would like to keep the state
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
      this.widgetType
    );
  }

  #addWidgetHTML(widgetType?: string) {
    var parenthesisLabel =
      " (" + this.specProvider.getEntity(this.endClassVal.type).getLabel() + ") ";
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
    ${I18n.labels.SelectAllValues}
    </span> 
    ${parenthesisLabel} 
    </span>`;

    let orSpan = `<span class="or">
      ${I18n.labels.Or}
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
    // : (this.widgetComponent.getWidgetValues().length > 0)
    : ((this.parentComponent.parentComponent.parentComponent as CriteriaGroup).endClassWidgetGroup.getWidgetValues().length > 0)
      ?(htmlString = lineSpan + endLabelSpan) 
      :(htmlString = lineSpan + selectAnySpan + orSpan + endLabelSpan);

    this.widgetHtml = $(`<span id="selectAllWrapper">${htmlString}</span>`);

    this.html.append(this.widgetHtml);
  }

  #getEndLabel(widgetType: string) {
    if (
      widgetType == Config.SEARCH_PROPERTY ||
      widgetType == Config.STRING_EQUALS_PROPERTY ||
      widgetType == Config.GRAPHDB_SEARCH_PROPERTY ||
      widgetType == Config.VIRTUOSO_SEARCH_PROPERTY ||
      widgetType == Config.TREE_PROPERTY
    ) {
      // label of the "Search" pseudo-class is inserted alone in this case
      return this.specProvider.getEntity(this.endClassVal.type).getLabel();
    } else if (
      widgetType == Config.LIST_PROPERTY ||
      widgetType == Config.TIME_PROPERTY_DATE ||
      widgetType == Config.TIME_PROPERTY_YEAR
    ) {
      return I18n.labels.Select + " :";
    } else if (widgetType == Config.BOOLEAN_PROPERTY) {
      return "";
    } else if (widgetType == Config.NUMBER_PROPERTY) {
      return I18n.labels.Range + " :";
    } else {
      return I18n.labels.Find + " :";
    }
  }

  #createWidgetComponent(
    widgetType: string
  ): AbstractWidget {
    
    let factory:WidgetFactory = new WidgetFactory(
      // parent component
      this,
      // spec provider
      this.specProvider,
      // factory settings
      this.settings,
      // catalog
      (this.getRootComponent() as SparnaturalComponent).catalog
    );

    return factory.buildWidget(
      widgetType,
      this.startClassVal,
      this.objectPropVal,
      this.endClassVal
    );
  }

  getWidgetType() {
    return this.widgetType;
  }
}

export default WidgetWrapper;

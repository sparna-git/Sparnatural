import { getSettings } from "../../../../../../sparnatural/settings/defaultSettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import { SelectedVal } from "../../../../SelectedVal";
import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import HTMLComponent from "../../../../HtmlComponent";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import { WidgetValue } from "../../../../widgets/AbstractWidget";
import WidgetWrapper from "./WidgetWrapper";
import ActionWhere from "../../../../buttons/actions/actioncomponents/ActionWhere";
import { I18n } from "../../../../../settings/I18n";

export class SelectAllValue implements WidgetValue {
  static key = "SelectAllValue";

  value: {
    label: string;
  };

  key():string {
    return SelectAllValue.key;
  }

  constructor(v:SelectAllValue["value"]){
    this.value = v;
  }
}


class EditComponents extends HTMLComponent {
  // the list of widget types for which the "WHERE" option should be available
  // this is an array of string to facilitate test with the widgetType value below
  static RENDER_WHERE_WIDGET_TYPES : Array<string> = [
    Config.LIST_PROPERTY,
    Config.LITERAL_LIST_PROPERTY,
    Config.RDFS_LITERAL,
    Config.AUTOCOMPLETE_PROPERTY,
    Config.TREE_PROPERTY,
    Config.NON_SELECTABLE_PROPERTY,
  ];

  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  actionWhere: ActionWhere;
  widgetWrapper: WidgetWrapper;
  specProvider: ISparnaturalSpecification;
 
  constructor(
    parentComponent: EndClassGroup,
    startCassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal,
    specProvider: ISparnaturalSpecification
  ) {
    super("EditComponents", parentComponent, null);
    this.startClassVal = startCassVal;
    this.objectPropVal = objectPropVal;
    this.endClassVal = endClassVal;
    this.specProvider = specProvider;
  }
  render(): this {
    super.render();
    this.widgetWrapper = new WidgetWrapper(
      this,
      this.specProvider,
      this.startClassVal,
      this.objectPropVal,
      this.endClassVal
    ).render();

    let widgetType = this.widgetWrapper.getWidgetType();
    if (
      EditComponents.RENDER_WHERE_WIDGET_TYPES.indexOf(widgetType) > -1
      &&
      // Do not allow WHERE if wehave reached max depth
      !this.maxDepthIsReached()
      &&
      // If this owl:Class is not in a rdf:domain of a owl:ObjectProperty don't allow
      (this.specProvider.getEntity(this.endClassVal.type).getConnectedEntities().length !== 0)
    ){
      this.actionWhere = new ActionWhere(
        this,
        this.specProvider,
        this.#onAddWhere
      ).render();
    }
    this.#addEventListeners();
    return this;
  }
  // The selectedValues are widgetValues which got selected by the user
  // For example a list of countries
  renderWidgetsWrapper() {
    super.render();
    this.widgetWrapper.render();
  }

  #addEventListeners() {
    // Binds a selection in an input widget with the display of the value in the line
    this.widgetWrapper.html[0].addEventListener(
      "selectAll",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.onSelectAll();
      }
    );
  }

  /**
   * Can be called from the outside when loading queries
   */
  onSelectAll() {
    let selectAllVal = new SelectAllValue(
      {
        label: I18n.labels.SelectAllValues,
      }
    );
    this.html[0].dispatchEvent(
      new CustomEvent("renderWidgetVal", {
        bubbles: true,
        detail: selectAllVal,
      })
    );
  }

  // MUST be arrowfunction
  #onAddWhere = () => {
    // Render the ViewVarBtn
    this.html[0].dispatchEvent(
      new CustomEvent("addWhereComponent", {
        bubbles: true,
        detail: this.endClassVal,
      })
    );
  };

  maxDepthIsReached() {
    let maxreached = false;
    this.html[0].dispatchEvent(
      new CustomEvent("getMaxVarIndex", {
        bubbles: true,
        detail: (index: number) => {
          if (index >= getSettings().maxDepth) maxreached = true;
        },
      })
    );
    return maxreached;
  }
}

export default EditComponents;

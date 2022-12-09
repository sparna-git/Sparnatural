import { getSettings } from "../../../../../../sparnatural/settings/defaultSettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import { SelectedVal } from "../../../../../generators/ISparJson";
import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import HTMLComponent from "../../../../HtmlComponent";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import { WidgetValue } from "../../../../widgets/AbstractWidget";
import WidgetWrapper from "./WidgetWrapper";
import ActionWhere from "../../../../buttons/actions/actioncomponents/ActionWhere";

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

enum RENDER_WHERE_ENUM {
  LIST_PROPERTY = Config.LIST_PROPERTY,
  LITERAL_LIST_PROPERTY = Config.LITERAL_LIST_PROPERTY,
  RDFS_LITERAL = Config.RDFS_LITERAL,
  AUTOCOMPLETE_PROPERTY = Config.AUTOCOMPLETE_PROPERTY,
  TREE_PROPERTY = Config.TREE_PROPERTY,
  NON_SELECTABLE_PROPERTY = Config.NON_SELECTABLE_PROPERTY,
}

class EditComponents extends HTMLComponent {
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;
  endClassVal: SelectedVal;
  actionWhere: ActionWhere;
  widgetWrapper: WidgetWrapper;
  specProvider: ISpecProvider;
  RENDER_WHERE = RENDER_WHERE_ENUM;
  constructor(
    parentComponent: EndClassGroup,
    startCassVal: SelectedVal,
    objectPropVal: SelectedVal,
    endClassVal: SelectedVal,
    specProvider: ISpecProvider
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
    console.log("this.maxDepthIsReached()"+this.maxDepthIsReached())
    if (
      Object.values(this.RENDER_WHERE).includes(widgetType)
      &&
      // Do not allow WHERE if wehave reached max depth
      !this.maxDepthIsReached()
      &&
      // If this owl:Class is not in a rdf:domain of a owl:ObjectProperty don't allow
      (this.specProvider.getConnectedClasses(this.endClassVal.type).length !== 0)
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
        label: getSettings().langSearch.SelectAllValues,
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

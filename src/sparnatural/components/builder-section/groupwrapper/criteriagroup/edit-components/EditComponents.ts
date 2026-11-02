import { getSettings } from "../../../../../../sparnatural/settings/defaultSettings";
import { Config } from "../../../../../ontologies/SparnaturalConfig";
import { SelectedVal } from "../../../../SelectedVal";
import { ISparnaturalSpecification } from "../../../../../spec-providers/ISparnaturalSpecification";
import { HTMLComponent } from "../../../../HtmlComponent";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import WidgetWrapper from "./WidgetWrapper";
import ActionWhere from "../../../../buttons/actions/actioncomponents/ActionWhere";
import { I18n } from "../../../../../settings/I18n";
import { LabelledCriteria } from "../../../../../SparnaturalQueryIfc";

const MIN_STACKED_WIDGET_WIDTH = 100;

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
  #widthObserver: ResizeObserver | null = null;

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
    this.#watchWidth();
    return this;
  }
  // The selectedValues are widgetValues which got selected by the user
  // For example a list of countries
  renderWidgetsWrapper() {
    super.render();
    this.widgetWrapper.render();
    this.#watchWidth();
  }

  destroy() {
    this.#widthObserver?.disconnect();
    super.destroy();
  }

  // the width of the widget is known only once loaded, and the row changes with the zoom
  #watchWidth() {
    this.#widthObserver?.disconnect();
    this.#widthObserver = new ResizeObserver(() => this.#fitInsideList());
    const row = this.html[0].closest(".CriteriaGroup");
    if (row) this.#widthObserver.observe(row);
    this.html[0].querySelectorAll(":scope > .WidgetWrapper > div").forEach((widget) => {
      this.#widthObserver.observe(widget);
    });
  }

  // The widget starts under the end class : on a narrow list it would go out on the right.
  // First drop the words that can be spared, then put the widget under the "select all" line.
  #fitInsideList() {
    const el = this.html[0];
    const list = el.closest(".componentsListe");
    if (!list) return;
    const listRight = list.getBoundingClientRect().right;
    const widget = el.querySelector<HTMLElement>(":scope > .WidgetWrapper > div");
    const fits = (selector: string) =>
      Array.from(el.querySelectorAll(selector))
        .every((part) => part.getBoundingClientRect().right <= listRight);
    const WIDGET_LINE = ":scope > .WidgetWrapper > *";
    const WHERE_LINE = ":scope > .ActionWhere *";

    const previousClasses = el.className;
    el.classList.remove("compactWidget", "stackedWidget", "stackedWhere");
    widget?.style.removeProperty("width");

    if (!fits(WIDGET_LINE)) {
      el.classList.add("compactWidget");
    }
    if (!fits(WIDGET_LINE)) {
      const naturalWidth = widget?.getBoundingClientRect().width;
      el.classList.replace("compactWidget", "stackedWidget");
      if (naturalWidth) {
        const availableWidth = listRight - widget.getBoundingClientRect().left;
        // rounded down : with the zoom, a fraction of a pixel would count as an overflow
        widget.style.width = Math.floor(Math.max(MIN_STACKED_WIDGET_WIDTH, Math.min(naturalWidth, availableWidth))) + "px";
      }
      if (!fits(WIDGET_LINE)) {
        el.classList.add("compactWidget");
      }
    }
    // the "where" line goes on two lines
    if (!fits(WHERE_LINE)) {
      el.classList.add("stackedWhere");
    }

    // the height of the edit part may change : background and links must follow
    if (el.className !== previousClasses) {
      el.dispatchEvent(new CustomEvent("redrawBackgroundAndLinks", { bubbles: true }));
    }
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
    this.html[0].dispatchEvent(
      new CustomEvent("selectAll", {
        bubbles: true
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
      new CustomEvent("getMaxDepth", {
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

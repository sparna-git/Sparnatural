
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import StartClassGroup from "./StartClassGroup";
import EndClassGroup from "./EndClassGroup";
import ArrowComponent from "../../../../arrows/ArrowComponent";
import UiuxConfig from "../../../../../../configs/fixed-configs/UiuxConfig";
import UnselectBtn from "../../../../buttons/UnselectBtn";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import SelectViewVariableBtn from "../../../../buttons/SelectViewVariableBtn";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";
/**
 * Handles the selection of a Class, either in the DOMAIN selection or the RANGE selection.
 * The DOMAIN selection happens only for the very first line/criteria.
 * Refactored to extract this from InputTypeComponent.
 **/
class ClassTypeId extends HTMLComponent {
  GrandParent: CriteriaGroup;
  id: string;
  frontArrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_FRONT
  );
  backArrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_BACK
  );

  selectBuilder: ClassSelectBuilder;
  startClassVal: SelectedVal = {
    variable: null,
    type: null
  }; // if it is a whereChild, the startclassVal is already set
  oldWidget: JQuery<HTMLElement>; // oldWidget exists cause nice-select can't listen for 'change' Events...
  UnselectButton: any;
  selectViewVariableBtn: SelectViewVariableBtn;
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISpecProvider,
    startClassVal?: any
  ) {
    super("ClassTypeId", ParentComponent, null);
    this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup;
    this.selectBuilder = new ClassSelectBuilder(this, specProvider);
    this.startClassVal = startClassVal;
  }

  render() {
    this.widgetHtml = null;
    this.selectViewVariableBtn = new SelectViewVariableBtn(
      this,
      this.#onchangeViewVariable
    )
    super.render();

    this.backArrow.render();

    if (isStartClassGroup(this.ParentComponent)) {
      this.widgetHtml = this.#getStartValues(
        this.selectBuilder,
        this.startClassVal?.type
      );
    } else {
      this.widgetHtml = this.#getRangeOfEndValues(this.selectBuilder);
    }

    this.html.append(this.widgetHtml);
    // convert to niceSelect: https://jqueryniceselect.hernansartorio.com/
    // needs to happen after html.append(). it uses rendered stuff on page to create a new select... should move away from that
    this.oldWidget = this.widgetHtml;
    this.widgetHtml = this.widgetHtml.niceSelect();
    // nice-select is not a proper select tag and that's why can't listen for change events... move away from nice-select!
    this.#addOnChangeListener(this.oldWidget);
    this.frontArrow.render();

    return this;
  }

  renderUnselectBtn(){
    let removeEndClassEvent = () => {
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveEndClass", { bubbles: true })
      );
    };
    this.UnselectButton = new UnselectBtn(this, removeEndClassEvent).render();
  }


  // If this Component is a child of the EndClassGroup component, we want the range of possible end values
  #getRangeOfEndValues(selectBuilder: ClassSelectBuilder) {
    // if you would like to have a default value selected, then change the null
    return selectBuilder.buildClassSelect(this.startClassVal.type, null);
  }

  // If this Component is a child of the StartClassGroup component, we want the possible StartValues
  #getStartValues(selectBuilder: ClassSelectBuilder, default_value: any) {
    return selectBuilder.buildClassSelect(null, default_value);
  }

  // when a value gets selected from the dropdown menu (niceselect), then change is called
  #addOnChangeListener(selectWidget: JQuery<HTMLElement>) {
    selectWidget.on("change", () => {
      let selectedValue = selectWidget.val();
      //disable further choice
      this.widgetHtml.addClass("disabled");
      this.widgetHtml.removeClass("open");
      this.html[0].dispatchEvent(
        new CustomEvent("classTypeValueSelected", {
          bubbles: true,
          detail: selectedValue,
        })
      );
    });
  }

    
  #onchangeViewVariable = () => {
    this.html[0].dispatchEvent(new CustomEvent("onSelectViewVar", { bubbles: true }));
  };

  //This function is called by EnclassWidgetGroup when a value got selected. It renders the classTypeIds as shape forms and highlights them
  highlight() {
    this.html.addClass("Highlited");
    this.frontArrow.html.removeClass("disable");
    this.backArrow.html.removeClass("disable");
  }
}
export default ClassTypeId;

/**
 * Builds a selector for a class based on provided domainId, by reading the
 * configuration. If the given domainId is null, this means we populate the first
 * class selection (starting point) so reads all classes that are domains of any property.
 *
 **/
class ClassSelectBuilder extends HTMLComponent {
  specProvider: any;
  constructor(ParentComponent: HTMLComponent, specProvider: any) {
    super("ClassTypeId", ParentComponent, null);
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();
    return this;
  }

  buildClassSelect(domainId: string, default_value: string) {
    let list: Array<string> = [];
    let items = [];

    if (domainId === null) {
      // if we are on the first class selection
      items = this.specProvider.getClassesInDomainOfAnyProperty();
    } else {
      items = this.specProvider.getConnectedClasses(domainId);
    }
    for (var key in items) {
      var val = items[key];
      var label = this.specProvider.getLabel(val);
      var icon = this.specProvider.getIcon(val);
      var highlightedIcon = this.specProvider.getHighlightedIcon(val);

      // highlighted icon defaults to icon
      if (!highlightedIcon || 0 === highlightedIcon.length) {
        highlightedIcon = icon;
      }

      var image =
        icon != null
          ? ' data-icon="' + icon + '" data-iconh="' + highlightedIcon + '"'
          : "";
      //var selected = (default_value == val)?'selected="selected"':'';
      var desc = this.specProvider.getTooltip(val);
      var selected = default_value == val ? ' selected="selected"' : "";
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
          image +
          selected +
          " " +
          description_attr +
          "  >" +
          label +
          "</option>"
      );
    }

    var html_list = $("<select/>", {
      // open triggers the niceselect to be open
      class: "my-new-list input-val open",
      html: list.join(""),
    });
    return html_list;
  }
}

function isStartClassGroup(
  ParentComponent: HTMLComponent
): ParentComponent is StartClassGroup {
  return (
    (ParentComponent as unknown as StartClassGroup).baseCssClass ===
    "StartClassGroup"
  );
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
function isEndClassGroup(
  ParentComponent: HTMLComponent
): ParentComponent is EndClassGroup {
  return (
    (ParentComponent as unknown as EndClassGroup).baseCssClass ===
    "EndClassGroup"
  );
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards

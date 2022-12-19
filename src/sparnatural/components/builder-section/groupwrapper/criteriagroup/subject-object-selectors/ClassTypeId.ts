import ISpecProvider from "../../../../../spec-providers/ISpecProvider";
import SubjectSelector from "./SubjectSelector";
import ObjectSelector from "./ObjectSelector";
import ArrowComponent from "../../../../buttons/ArrowComponent";
import UiuxConfig from "../../../../IconsConstants";
import UnselectBtn from "../../../../buttons/UnselectBtn";
import { SelectedVal } from "../../../../../generators/ISparJson";
import SelectViewVariableBtn from "../../../../buttons/SelectViewVariableBtn";
import HTMLComponent from "../../../../HtmlComponent";
/**
 * Handles the selection of a Class, either in the DOMAIN selection or the RANGE selection.
 * The DOMAIN selection happens only for the very first line/criteria.
 * Refactored to extract this from InputTypeComponent.
 **/
class ClassTypeId extends HTMLComponent {
  ParentComponent: ObjectSelector | SubjectSelector;
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
  subjectVal: SelectedVal = {
    variable: null,
    type: null,
  }; // if it is a whereChild, the subjectSelectorVal is already set
  oldWidget: JQuery<HTMLElement>; // oldWidget exists cause nice-select can't listen for 'change' Events...
  UnselectButton: any;
  selectViewVariableBtn: SelectViewVariableBtn;
  specProvider: ISpecProvider;
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISpecProvider,
    subjectVal?: any
  ) {
    super("ClassTypeId", ParentComponent, null);
    this.selectBuilder = new ClassSelectBuilder(this, specProvider);
    this.subjectVal = subjectVal;
    this.specProvider = specProvider;
  }

  render() {
    this.widgetHtml = null;
    this.selectViewVariableBtn = new SelectViewVariableBtn(
      this,
      this.#onchangeViewVariable
    );
    super.render();
    // no back arrow on start class
    if (!isSubjectSelector(this.ParentComponent)) {
      this.backArrow.render();
    }

    if (isSubjectSelector(this.ParentComponent)) {
      if(!this.subjectVal?.type) {
        // If this Component is a child of the SubjectSelector component in the first row with no value selected
        this.widgetHtml = this.selectBuilder.buildSelect_FirstSubjectSelector();
      } else {
        // If this is under a WHERE, we want only the selected value
        this.widgetHtml = this.selectBuilder.buildSelect_SubjectSelectorInWhere(this.subjectVal.type);
      }
    } else {
      // If this Component is a child of the ObjectSelector component, we want the range of possible end values
      this.widgetHtml = this.selectBuilder.buildSelect_ObjectSelector(
        this.subjectVal.type
      );
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

  // is called by ObjectSelector
  renderUnselectBtn() {
    let removeObjectSelectorEvent = () => {
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveObjectSelector", { bubbles: true })
      );
    };
    this.UnselectButton = new UnselectBtn(this, removeObjectSelectorEvent).render();
  }

  // when a value gets selected from the dropdown menu (niceselect), then change is called
  #addOnChangeListener(selectWidget: JQuery<HTMLElement>) {
    selectWidget.on("change", () => {
      let selectedValue = selectWidget.val();
      //disable further choice on nice-select
      this.widgetHtml[0].classList.add("disabled");
      this.widgetHtml[0].classList.remove("open");
      this.html[0].dispatchEvent(
        new CustomEvent("classTypeValueSelected", {
          bubbles: true,
          detail: selectedValue,
        })
      );
    });
  }

  #onchangeViewVariable = (selected: boolean) => {
    // css selector to highlight the component 
    selected
        ? this.html.addClass("VariableSelected")
        : this.html.removeClass("VariableSelected");
        
    if (isObjectSelector(this.ParentComponent)) 
      this.#onSelectViewVar(this.ParentComponent.objectVal,selected)

     // The first SubjectSelector gets an eye Btn to de/select
    if(isSubjectSelector(this.ParentComponent) && this.ParentComponent.renderEyeBtn) 
      this.#onSelectViewVar(this.ParentComponent.subjectVal,selected)
    
  };

  #onSelectViewVar(val:SelectedVal,selected:boolean){
    let payload ={
      val: val,
      selected: selected
    }
    this.selectViewVariableBtn.widgetHtml[0].dispatchEvent(
      new CustomEvent("onSelectViewVar", { bubbles: true, detail: payload })
    );
  }

  //This function is called by EnclassWidgetGroup when a value got selected. It renders the classTypeIds as shape forms and highlights them
  highlight() {
    this.html.addClass("Highlited");
    this.frontArrow.html.removeClass("disable");
    this.backArrow.html.removeClass("disable");
  }

  // renders the type label name 
  showTypeName(){
    const currentSpan = this.widgetHtml.first()[0].getElementsByClassName('current').item(0).getElementsByClassName('label').item(0)
     //display label
     currentSpan.textContent = this.specProvider.getLabel(this.ParentComponent.getTypeSelected());
  }

  // renders the variable name
  showVarName(){
    const currentSpan = this.widgetHtml.first()[0].getElementsByClassName('current').item(0).getElementsByClassName('label').item(0)
    // display variable
    currentSpan.textContent = this.ParentComponent.getVarName();
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

  buildSelect_FirstSubjectSelector() {
    return this.buildClassSelectFromItems(
      this.specProvider.getClassesInDomainOfAnyProperty(),
      null
    );
  }

  buildSelect_ObjectSelector(domainId: string) {
    return this.buildClassSelectFromItems(
      this.specProvider.getConnectedClasses(domainId),
      null
    );
  }

  buildSelect_SubjectSelectorInWhere(selectedClass:string) {
    console.log(selectedClass);
    return this.buildClassSelectFromItems(
      [selectedClass],
      null
    );
  }

  buildClassSelectFromItems(items:any[], default_value: string) {
    let list: Array<string> = [];
    for (var key in items) {
      var val = items[key];
      var label = this.specProvider.getLabel(val);
      var icon = this.specProvider.getIcon(val);
      var highlightedIcon = this.specProvider.getHighlightedIcon(val);

      // highlighted icon defaults to icon
      if (!highlightedIcon || 0 === highlightedIcon.length) {
        highlightedIcon = icon;
      }
      let image = icon != null ? `data-icon="${icon}" data-iconh="${highlightedIcon}"` :""
      //var selected = (default_value == val)?'selected="selected"':'';
      var desc = this.specProvider.getTooltip(val);
      var selected = default_value == val ? ' selected="selected"' : "";
      var description_attr = "";
      if (desc) {
        description_attr = ' data-desc="' + desc + '"';
      }
      list.push(`<option value="${val}" data-id"${val}" ${image} ${selected} ${description_attr}> ${label}</option>` );
    }

    var html_list = $("<select/>", {
      // open triggers the niceselect to be open
      class: "my-new-list input-val open",
      html: list.join(""),
    });
    return html_list;
  }
}


function isSubjectSelector(
  ParentComponent: HTMLComponent
): ParentComponent is SubjectSelector {
  return (
    (ParentComponent as unknown as SubjectSelector).baseCssClass ===
    "SubjectSelector"
  );
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards


function isObjectSelector(
  ParentComponent: HTMLComponent
): ParentComponent is ObjectSelector {
  return (
    (ParentComponent as unknown as ObjectSelector).baseCssClass ===
    "ObjectSelector"
  );
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards

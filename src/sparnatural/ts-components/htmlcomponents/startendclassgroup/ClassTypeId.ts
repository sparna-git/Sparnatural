import { findParentOrSiblingCriteria } from "../../globals/globalfunctions";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../HtmlComponent";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import StartClassGroup from "./StartClassGroup";
import EndClassGroup from "./EndClassGroup";
import ArrowComponent from "../arrows/ArrowComponent";
import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
/**
 * Handles the selection of a Class, either in the DOMAIN selection or the RANGE selection.
 * The DOMAIN selection happens only for the very first line/criteria.
 * Refactored to extract this from InputTypeComponent.
 **/
class ClassTypeId extends HTMLComponent {
  needTriggerClick: any;
  GrandParent: CriteriaGroup;
  id:string
  frontArrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_FRONT)
  backArrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_BACK)
  selectBuilder: ClassSelectBuilder;
  
  constructor(ParentComponent: HTMLComponent, specProvider: ISpecProvider) {

    super("ClassTypeId", ParentComponent, null);
    (this.cssClasses.Highlited = true),
    (this.cssClasses.flexWrap = true),
    (this.needTriggerClick = false);
    this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup;
    this.selectBuilder = new ClassSelectBuilder(specProvider);
    this.frontArrow.cssClasses.Invisible = false
    this.backArrow.cssClasses.Invisible = true
    //create Id depending on ParentComponent
    if(isStartClassGroup(ParentComponent)){
      this.id = 'a-' + this.GrandParent.id;
    }else{
      this.id = 'a-' + this.GrandParent.id;
    }    
  }

  /*
    This component hasChild components: backArrow -> widgetHtml ->frontArrow
    Rendering must be done in this ordering
  */
  render() {
    //init ParentComponent
    //delete this html
    this.widgetHtml = null
    super.render()

    this.backArrow.render()

    var default_value_s = null;
    var default_value_o = null;

    if (this.GrandParent.jsonQueryBranch) {
      var branch = this.GrandParent.jsonQueryBranch;
      default_value_s = branch.line.sType;
      default_value_o = branch.line.oType;
      this.needTriggerClick = true;
      //TODO refactor this to parentcomponent. why should child component render stuff in the ParentComponent?
      // maybe with a function but not with class variables
      if (isStartClassGroup(this.ParentComponent)) {
        this.ParentComponent.variableNamePreload = branch.line.s;
        this.ParentComponent.variableViewPreload = branch.line.sSelected;
      }
      if (isEndClassGroup(this.ParentComponent)) {
        this.ParentComponent.variableNamePreload = branch.line.o;
        this.ParentComponent.variableViewPreload = branch.line.oSelected;
      }
    }


    if (isStartClassGroup(this.ParentComponent)) {
      this.widgetHtml = this.#getStartValues(this.selectBuilder,default_value_s)
    } else{
      this.widgetHtml = this.#getRangeOfEndValues(this.selectBuilder,default_value_o)
    }
    this.appendWidgetHtml()
  
    this.frontArrow.render()
    return this
  }

  // If this Component is a child of the EndClassGroup component, we want the range of possible end values
  #getRangeOfEndValues(selectBuilder:ClassSelectBuilder,default_value_o:any){
    return selectBuilder.buildClassSelect(
      this.GrandParent.StartClassGroup.value_selected,
      this.id,
      default_value_o
    );
  }

  // If this Component is a child of the StartClassGroup component, we want the possible StartValues
  #getStartValues(selectBuilder:ClassSelectBuilder,default_value_s:any){
    var parentOrSibling = findParentOrSiblingCriteria.call(
      this,
      this.GrandParent.thisForm_,
      this.GrandParent.id
    );

    if(parentOrSibling.type){
      if (parentOrSibling.type == "parent") {
        // if we are child in a WHERE relation, the selected class is the selected
        // class in the RANGE selection of the parent
        default_value_s =
          parentOrSibling.element.EndClassGroup.value_selected;
      } else {
        // if we are sibling in a AND relation, the selected class is the selected
        // class in the DOMAIN selection of the sibling
        default_value_s =
          parentOrSibling.element.StartClassGroup.value_selected;
      }
    }
  
    return selectBuilder.buildClassSelect(null, this.id, default_value_s);
  }

  //This function is called by EnclassWidgetGroup when a value got selected. It renders the classTypeIds as shape forms and highlights them
  highlight(){
    this.cssClasses.Highlited = true
    this.frontArrow.cssClasses.disable = false
    this.backArrow.cssClasses.disable = false
  }


  reload() {
    console.log("reload on ClassTypeId should probably never be called");
    this.reload();
  }

}
export default ClassTypeId;

/**
 * Builds a selector for a class based on provided domainId, by reading the
 * configuration. If the given domainId is null, this means we populate the first
 * class selection (starting point) so reads all classes that are domains of any property.
 *
 **/
class ClassSelectBuilder {
  specProvider: any;
  constructor(specProvider: any) {
    this.specProvider = specProvider;
  }

  buildClassSelect(domainId: any, inputID: string, default_value: any) {
    var list = [];
    var items = [];

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
      class: "my-new-list input-val",
      id: "select-" + inputID,
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

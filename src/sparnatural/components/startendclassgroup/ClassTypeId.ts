import CriteriaGroup from "../criterialist/CriteriaGroup";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import StartClassGroup from "./StartClassGroup";
import EndClassGroup from "./EndClassGroup";
import ArrowComponent from "../arrows/ArrowComponent";
import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../../HtmlComponent";
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
  startClassValue:any = null
  constructor(ParentComponent: HTMLComponent, specProvider: ISpecProvider,startClassValue?:any) {
    super("ClassTypeId", ParentComponent, null)
    this.GrandParent = ParentComponent.ParentComponent as CriteriaGroup;
    this.selectBuilder = new ClassSelectBuilder(this,specProvider);
    this.startClassValue = startClassValue
  }


  render() {
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
    }

    
    if (isStartClassGroup(this.ParentComponent)) {
      this.widgetHtml = this.#getStartValues(this.selectBuilder,default_value_s)
    } else{
      this.widgetHtml = this.#getRangeOfEndValues(this.selectBuilder,default_value_o)
    }


    this.html.append(this.widgetHtml)
    // convert to niceSelect: https://jqueryniceselect.hernansartorio.com/
    // needs to happen after html.append(). it uses rendered stuff on page to create a new select... should move away from that
    let oldWidget = this.widgetHtml
    this.widgetHtml = this.widgetHtml.niceSelect()
    // nice-select is not a proper select tag and that's why can't listen for change events... move away from nice-select!
    this.#addOnChangeListener(oldWidget)
    this.frontArrow.render()
    return this
  }

  // If this Component is a child of the EndClassGroup component, we want the range of possible end values
  #getRangeOfEndValues(selectBuilder:ClassSelectBuilder,default_value_o:any){
    return selectBuilder.buildClassSelect(
      this.GrandParent.StartClassGroup.value_selected,
      default_value_o
    );
  }

  // If this Component is a child of the StartClassGroup component, we want the possible StartValues
  #getStartValues(selectBuilder:ClassSelectBuilder,default_value_s:any){
    if(this.startClassValue) default_value_s = this.startClassValue
  
    return selectBuilder.buildClassSelect(null, default_value_s);
  }

  // when a value gets selected from the dropdown menu (niceselect), then change is called
  #addOnChangeListener(selectWidget:JQuery<HTMLElement>){
    selectWidget.on('change',()=>{
      //get value from <select..> tag and dispatch -> StartClass and EndClass can listen on it
      let selectedValue = selectWidget.val()
      this.widgetHtml[0].dispatchEvent(new CustomEvent('classTypeValueSelected',{bubbles:true,detail:selectedValue}))
      //disable further choice
      this.widgetHtml.prop('disabled',true)
      this.widgetHtml.prop('open',false)
    })
  }

  //This function is called by EnclassWidgetGroup when a value got selected. It renders the classTypeIds as shape forms and highlights them
  highlight(){
    this.html.addClass('Highlited')
    this.frontArrow.html.removeClass('disable')
    this.backArrow.html.removeClass('disable')
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
class ClassSelectBuilder extends HTMLComponent {
  specProvider: any;
  constructor(ParentComponent:HTMLComponent, specProvider: any) {
    super('ClassTypeId',ParentComponent,null)
    this.specProvider = specProvider;
  }

  render(): this {
    super.render()
    return this
  }

  buildClassSelect(domainId: any, default_value: any) {
    let list:Array<string> = [];
    let items = [];

    if (domainId === null) {
      // if we are on the first class selection
      items = this.specProvider.getClassesInDomainOfAnyProperty();
    } else {
      items = this.specProvider.getConnectedClasses(domainId);
    }
    console.log('log the items')
    console.dir(items)
    for (var key in items) {
      console.log(`key:${key} item:${items[key]}`)
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
    return html_list
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

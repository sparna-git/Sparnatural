import ISparnaturalSpecification from "../../../../../spec-providers/ISparnaturalSpecification";
import StartClassGroup from "./StartClassGroup";
import EndClassGroup from "./EndClassGroup";
import {HierarchicalClassSelectBuilder, JsonDagRow, DagWidgetDefaultValue} from "./HierarchicalClassSelectBuilder";
import ArrowComponent from "../../../../buttons/ArrowComponent";
import UiuxConfig from "../../../../IconsConstants";
import UnselectBtn from "../../../../buttons/UnselectBtn";
import { SelectedVal } from "../../../..//SelectedVal";
import SelectViewVariableBtn from "../../../../buttons/SelectViewVariableBtn";
import HTMLComponent from "../../../../HtmlComponent";
import { DagIfc, DagNodeIfc, DagNode} from "../../../../../dag/Dag";
import ISpecificationEntity from "../../../../../spec-providers/ISpecificationEntity";
import ISpecificationEntry from "../../../../../spec-providers/ISpecificationEntry";
/**
 * Handles the selection of a Class, either in the DOMAIN selection or the RANGE selection.
 * The DOMAIN selection happens only for the very first line/criteria.
 **/
class ClassTypeId extends HTMLComponent {
  ParentComponent: EndClassGroup | StartClassGroup;
  id: string;
  frontArrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_FRONT
  );
  backArrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_BACK
  );

  //selectBuilder: HierarchicalClassSelectBuilder;
  selectBuilder: ClassSelectBuilder;
  startClassVal: SelectedVal = {
    variable: null,
    type: null,
  }; // if it is a whereChild, the startclassVal is already set
  oldWidget: JQuery<HTMLElement>; // oldWidget exists cause nice-select can't listen for 'change' Events...
  UnselectButton: UnselectBtn;
  selectViewVariableBtn: SelectViewVariableBtn;
  specProvider: ISparnaturalSpecification;
  htmlCurentValue: JQuery<HTMLElement>; 
  temporaryLabel: string;
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification,
    temporaryLabel: string,
    startClassVal?: any
  ) {
    super("ClassTypeId", ParentComponent, null);
    this.temporaryLabel = temporaryLabel;
    //this.selectBuilder = new HierarchicalClassSelectBuilder(this, specProvider);
    this.selectBuilder = new ClassSelectBuilder(this, specProvider);
    this.startClassVal = startClassVal;
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
    if (!isStartClassGroup(this.ParentComponent)) {
      this.backArrow.render();
    }

    this.htmlCurentValue = $(`<span class="current">${this.temporaryLabel}</span>`) ;
    let currentWrapper = $('<div class="currentWrapper"></div>') ;
    currentWrapper.append(this.htmlCurentValue) ;
    this.html.append(currentWrapper);
    
    if (isStartClassGroup(this.ParentComponent)) {
      if(!this.startClassVal?.type) {
        // If this Component is a child of the StartClassGroup component in the first row with no value selected
        this.widgetHtml = this.selectBuilder.buildSelect_FirstStartClassGroup();
      } else {
        // If this is under a WHERE, we want only the selected value
        this.widgetHtml = this.selectBuilder.buildSelect_StartClassGroupInWhere(this.startClassVal.type);
      }
    } else {
      // If this Component is a child of the EndClassGroup component, we want the range of possible end values
      this.widgetHtml = this.selectBuilder.buildSelect_EndClassGroup(
        this.startClassVal.type
      );
    }

    this.html.append(this.widgetHtml);
    // convert to niceSelect: https://jqueryniceselect.hernansartorio.com/
    // needs to happen after html.append(). it uses rendered stuff on page to create a new select... should move away from that
    this.oldWidget = this.selectBuilder.selectWidget.getInput();
    this.selectBuilder.selectWidget.initSelectUiUxListsHeight() ; //force init heigh after dominsertion.
    //this.widgetHtml = this.widgetHtml.niceSelect();
    // nice-select is not a proper select tag and that's why can't listen for change events... move away from nice-select!
    this.#addOnChangeListener(this.oldWidget);

   
    this.frontArrow.render();

    return this;
  }

  setSelected($value:string) {
    this.selectBuilder.selectWidget.setValue($value) ;
  }

  submitSelected() {
    this.selectBuilder.selectWidget.submitSelectedValue() ;
  }

  // is called by EndClassGroup
  renderUnselectBtn() {
    let removeEndClassEvent = () => {
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveEndClass", { bubbles: true })
      );
    };
    this.UnselectButton = new UnselectBtn(this, removeEndClassEvent).render();
  }
  
  setCurrentContent(id:string) {
    let entity = this.specProvider.getEntity(id) ;
    let entity_icon = entity.getIcon() ;
    let icon = `` ;
    if (entity_icon != undefined ) {
      icon = `<span><i class="fa ${entity_icon} fa-fw"></i></span>` ;
    }
    this.htmlCurentValue.html(`${icon} ${entity.getLabel()} `) ;
    this.htmlCurentValue[0].classList.add('selected') ;
  }

  // when a value gets selected from the dropdown menu (niceselect), then change is called
  #addOnChangeListener(selectWidget: JQuery<HTMLElement>) {
    selectWidget[0].addEventListener(
      "change",
      (e: CustomEvent) => {
        let selectedValue = e.detail.value ;
        console.log(e.detail) ;
        this.setCurrentContent(selectedValue) ;
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
    /*selectWidget.on("change", (e) => {
      let selectedValue = e.detail.value ;
      //disable further choice on nice-select
      this.widgetHtml[0].classList.add("disabled");
      this.widgetHtml[0].classList.remove("open");
      this.html[0].dispatchEvent(
        new CustomEvent("classTypeValueSelected", {
          bubbles: true,
          detail: selectedValue,
        })
      );
    });*/
  }

  #onchangeViewVariable = (selected: boolean) => {
    // css selector to highlight the component 
    selected
        ? this.html.addClass("VariableSelected")
        : this.html.removeClass("VariableSelected");
        
    if (isEndClassGroup(this.ParentComponent)) 
      this.#onSelectViewVar(this.ParentComponent.endClassVal,selected)

     // The first StartClass gets an eye Btn to de/select
    if(isStartClassGroup(this.ParentComponent) && this.ParentComponent.renderEyeBtn) 
      this.#onSelectViewVar(this.ParentComponent.startClassVal,selected)
    
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
     currentSpan.textContent = this.specProvider.getEntity(this.ParentComponent.getTypeSelected()).getLabel();
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
  specProvider: ISparnaturalSpecification;
  selectWidget: HierarchicalClassSelectBuilder;
  constructor(ParentComponent: HTMLComponent, specProvider: ISparnaturalSpecification) {
    super("ClassTypeId", ParentComponent, null);
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();
    return this;
  }

  

  buildSelect_FirstStartClassGroup() {
    // testing hierarchy
    let defaultValue: DagWidgetDefaultValue = {
      value: '',
      path: '',
    }
    return this.initDagWidget(
      this.specProvider.getEntitiesTreeInDomainOfAnyProperty(),
      defaultValue
    );
  }

  buildSelect_EndClassGroup(domainId: string) {
    // testing hierarchy
    let defaultValue: DagWidgetDefaultValue = {
      value: '',
      path: '',
    }
    
    return this.initDagWidget(
      this.specProvider.getEntity(domainId).getConnectedEntitiesTree(),
      defaultValue
    );
  }

  /**
   * Return it with a single selected class inside
   */
  buildSelect_StartClassGroupInWhere(selectedClass:string) {
    
    let defaultValue: DagWidgetDefaultValue = {
      value: selectedClass,
      path: '',
    }
    return this.initDagWidget(
      this.specProvider.getEntitiesTreeInDomainOfAnyProperty(),
      defaultValue
    );
  }

  /*buildFlatClassList(elements:any[], list: any[]) {

    elements.forEach(element => {
      list.push(element);
      if (element.children.length > 0) {
        list = this.buildFlatClassList(element.children, list) ;
      }
    });

    return list ;
  }*/


  convertToJsonDag(rootNodes:DagNodeIfc<ISpecificationEntry>[]) {
    console.log('rootNodes') ;
    console.log(rootNodes) ;
    let arrayToJson: Array<JsonDagRow> = [];
    arrayToJson = this.getRecursiveDagElements(rootNodes, '') ;
    return JSON.parse(JSON.stringify(arrayToJson));
  }

  getRecursiveDagElements(elements: Array<DagNodeIfc<ISpecificationEntry>>, default_icon:string) {
    let arrayToJson: Array<JsonDagRow> = [];
    elements.forEach(element => {
      let disabled = false ;
      let icon = element.payload.getIcon() ;
      if (icon == undefined) {
        icon = default_icon ;
      }

      if (element.disabled === true) {
        disabled = true ;
      }
      let rowToJson = {
        label: element.payload.getLabel(),
        id: element.payload.getId(),
        tooltip: element.payload.getTooltip(),
        color: element.payload.getColor(),
        icon: icon,
        highlightedIcon: element.payload.getHighlightedIcon(),
        // read the count from the node
        count: element.count,
        disabled: disabled,
        childs: Array()
      }
      if (element.children.length > 0) {
        rowToJson.childs = this.getRecursiveDagElements(element.children, icon) ;
      }
      arrayToJson.push(rowToJson);
    });
    return arrayToJson ;

  }

  initDagWidget(items:DagIfc<ISpecificationEntity>, default_value: DagWidgetDefaultValue) {
    let jsonDag = this.convertToJsonDag(items.roots) ;
    this.selectWidget = new HierarchicalClassSelectBuilder(this.ParentComponent, this.specProvider, jsonDag, default_value );
    return this.selectWidget.buildClassSelectFromJson() ; ;
  }

  /*buildClassSelectFromItems(items:DagIfc<ISpecificationEntity>, default_value: string) {
    console.log('----------------------test ClassSelectBuilder--------------') ;
    let jsonDag = this.convertToJsonDag(items.roots) ;
    console.log(jsonDag)
    console.log(items) ;
    let list: Array<string> = [];
    let flatList = this.buildFlatClassList(items.roots, list) ;
    for (var key in flatList) {
      var val = flatList[key];
      var label = this.specProvider.getEntity(val.id).getLabel();
      var icon = this.specProvider.getEntity(val.id).getIcon();
      var highlightedIcon = this.specProvider.getEntity(val.id).getHighlightedIcon();
      var color = this.specProvider.getEntity(val.id).getColor();

      // highlighted icon defaults to icon
      if (!highlightedIcon || 0 === highlightedIcon.length) {
        highlightedIcon = icon;
      }
      let image = icon != null ? `data-icon="${icon}" data-iconh="${highlightedIcon}"` :""
      //var selected = (default_value == val)?'selected="selected"':'';
      var desc = this.specProvider.getEntity(val.id).getTooltip();
      var selected = default_value == val.id ? ' selected="selected"' : "";
      var description_attr = "";
      if (desc) {
        description_attr = ' data-desc="' + desc + '"';
      }
      var bgColor = color ? `style='background: ${color};'`:"";
      list.push(`<option value="${val}" data-id="${val}" ${image} ${selected} ${description_attr} ${bgColor}> ${label}</option>` );
    }

    var html_list = $("<select/>", {
      // open triggers the niceselect to be open
      class: "my-new-list input-val open",
      html: list.join(""),
    });
    return html_list;
  }*/
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

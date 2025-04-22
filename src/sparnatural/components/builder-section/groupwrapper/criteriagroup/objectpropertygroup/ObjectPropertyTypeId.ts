import UiuxConfig from "../../../../IconsConstants";
import { SelectedVal } from "../../../..//SelectedVal";
import { ISparnaturalSpecification } from "../../../../../spec-providers/ISparnaturalSpecification";
import { ArrowComponent } from "../../../../buttons/ArrowComponent";
import { HTMLComponent } from "../../../../HtmlComponent";
import CriteriaGroup from "../CriteriaGroup";
import {HierarchicalClassSelectBuilder, JsonDagRow, DagWidgetDefaultValue} from "../startendclassgroup/HierarchicalClassSelectBuilder";
import { DagIfc, DagNodeIfc, DagNode} from "../../../../../dag/Dag";
import ISpecificationProperty from "../../../../../spec-providers/ISpecificationProperty";
import { ISpecificationEntry } from "../../../../../spec-providers/ISpecificationEntry";

/**
 * The property selector
 **/
class ObjectPropertyTypeId extends HTMLComponent {
  GrandParent: CriteriaGroup;
  temporaryLabel: string;
  startClassVal: SelectedVal;
  endClassVal: SelectedVal;
  oldWidget: JQuery<HTMLElement>;
  arrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_FRONT
  );
  specProvider: ISparnaturalSpecification;
  selectBuilder: PropertySelectBuilder;
  htmlCurentValue: JQuery<HTMLElement>; 
  constructor(
    ParentComponent: HTMLComponent,
    specProvider: ISparnaturalSpecification,
    temporaryLabel: string,
    startClassVal: SelectedVal
  ) {
    super("ObjectPropertyTypeId", ParentComponent, null);
    this.temporaryLabel = temporaryLabel;
    this.GrandParent = ParentComponent.parentComponent as CriteriaGroup;
    this.specProvider = specProvider;
    this.startClassVal = startClassVal;
  }

  /*
		Renders the ObjectPropertyType
		If the Endgroup is already chosen, then render with the adjusted object property
		created by PropertySelectBuilder
	*/
  render() {
    super.render(); 

      this.htmlCurentValue = $(`<span class="current temporary-label"></span>`) ;
      let currentWrapper = $('<div class="currentWrapper"></div>') ;
      currentWrapper.append(this.htmlCurentValue) ;
      this.html.append(currentWrapper);
    // if there is an Object selected
    if (this.endClassVal) {
      this.#removeTempLbl();
      // set the correct objectProperty matching to Start and End value

     
      
      this.widgetHtml = this.#getObjectProperty();
      
      this.html.append(this.widgetHtml);
      this.oldWidget = this.selectBuilder.selectWidget.getInput();
      
    this.selectBuilder.selectWidget.initSelectUiUxListsHeight() ; //force init heigh after dominsertion.

      //this.html.append(this.oldWidget);
      this.#addOnChangeListener(this.oldWidget);

      // if there is no options for the user to choose, then trigger the change event
      
      /*if (this.selectBuilder.selectableItems.length <= 1) {
        console.log(this.selectBuilder.selectableItems.length) ;
        this.oldWidget.trigger("change");
      }*/

      // If juste 1 option selectable
      if (this.selectBuilder.selectableItems.length == 1) {
        this.selectBuilder.selectWidget.defaultValue.value = this.selectBuilder.selectableItems[0] ;
        this.submitSelected();
      }

    } else {
      // there hasn't been an Object in Endclassgroup chosen. render a temporary label
      this.htmlCurentValue[0].innerHTML = this.temporaryLabel
      this.htmlCurentValue[0].classList.add('temporary-label')

      /*this.widgetHtml = $(
        '<span class="current temporary-label">' +
          this.temporaryLabel +
          "</span>"
      );*/
    }
    this.html.append(this.widgetHtml);
    this.arrow.render();
    return this;
  }

  setSelected($value:string) {
    this.selectBuilder.selectWidget.setValue($value) ;
  }

  
  submitSelected() {
    this.selectBuilder.selectWidget.submitSelectedValue() ;
  }

  
  setCurrentContent(id:string) {
    this.#removeTempLbl() ;
    let entity = this.specProvider.getProperty(id) ;
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
        this.setCurrentContent(selectedValue) ;
        //disable further choice on nice-select
        this.widgetHtml[0].classList.add("disabled");
        this.widgetHtml[0].classList.remove("open");
        this.html[0].dispatchEvent(
          new CustomEvent("onObjectPropertyTypeIdSelected", {
            bubbles: true,
            detail: selectedValue,
          })
        );
      });
  }

  // removes the temporary label e.g 'relatedTo'
  #removeTempLbl() {
    //$(this.html).find(".temporary-label").remove();
    this.htmlCurentValue[0].classList.remove('temporary-label') ;
  }
  

  // sets the ObjectProperty according to the Subject and Object e.g Country isCountryOf Musuem
  #getObjectProperty() {
    this.selectBuilder = new PropertySelectBuilder(this, this.specProvider);
    var default_value = null;

    return this.selectBuilder.buildPropertySelect(
      this.startClassVal.type,
      this.endClassVal.type,
      default_value
    );
  }
  setEndClassVal(endClassVal: SelectedVal) {
    this.endClassVal = endClassVal;
  }
}
export default ObjectPropertyTypeId;

/**
 * Builds a selector for property based on provided domain and range, by reading the
 * configuration.
 * Example: changes the relationship from 'Country relatedTo Museum' => 'Country countryOf Museum'
 * There can be multiple connectingProperties. User might need to choose.
 **/
class PropertySelectBuilder extends HTMLComponent {
  selectableItems: Array<string>;
  specProvider: ISparnaturalSpecification;
  selectWidget: HierarchicalClassSelectBuilder;
  constructor(ParentComponent: HTMLComponent, specProvider: ISparnaturalSpecification) {
    
    super("ObjectPropertyTypeId", ParentComponent, null);
    this.specProvider = specProvider;
  }

  
  render(): this {
    super.render();
    return this;
  }

  convertToJsonDag(rootNodes:DagNodeIfc<ISpecificationEntry>[]) {
    let arrayToJson: Array<JsonDagRow> = [];
    this.selectableItems = [] ;
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
      } else {

        this.selectableItems.push(element.payload.getId()) ;
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

  initDagWidget(items:DagIfc<ISpecificationProperty>, default_value: DagWidgetDefaultValue) {
    let jsonDag = this.convertToJsonDag(items.roots) ;
    this.selectWidget = new HierarchicalClassSelectBuilder(this.parentComponent, this.specProvider, jsonDag, default_value );
    return this.selectWidget.buildClassSelectFromJson() ; ;
  }

  buildPropertySelect(
    domainClassID: string,
    rangeClassID: string,
    default_value: string
  ) {
   
       
    let defaultValue: DagWidgetDefaultValue = {
      value: default_value,
      path: '',
    }

    return this.initDagWidget(
      this.specProvider.getEntity(domainClassID).getConnectingPropertiesTree(rangeClassID),
      defaultValue
    );
  }

  /*#multipleConnectingProperty(items: Array<string>) {
    let default_value = items[0];
    let list: Array<string> = [];
    items.forEach((i) => {
      var label = this.specProvider.getProperty(i).getLabel();
      var icon = this.specProvider.getProperty(i).getIcon();
      var highlightedIcon = this.specProvider.getProperty(i).getHighlightedIcon();
      // highlighted icon defaults to icon
      if (!highlightedIcon || 0 === highlightedIcon.length) {
        highlightedIcon = icon;
      }
      var image =
        icon != null
          ? ' data-icon="' + icon + '" data-iconh="' + highlightedIcon + '"'
          : "";
      //var selected = (default_value == val)?'selected="selected"':'';
      var desc = this.specProvider.getProperty(i).getTooltip();
      var selected = default_value == i ? ' selected="selected"' : "";
      var description_attr = "";
      if (desc) {
        description_attr = ' data-desc="' + desc + '"';
      }
      list.push(
        '<option value="' +
          i +
          '" data-id="' +
          i +
          '"' +
          // never try to set an icon on object properties lists
          // image +
          selected +
          " " +
          description_attr +
          "  >" +
          label +
          "</option>"
      );
    });
    var html_list = $("<select/>", {
      // open triggers the niceselect to be open
      class: "my-new-list input-val open",
      html: list.join(""),
    });
    return html_list;
  }

  #singleConnectingProperty(items: Array<string>) {
    let val = items[0];
    var label = this.specProvider.getProperty(val).getLabel();
    var desc = this.specProvider.getProperty(val).getTooltip();
    var description_attr = "";
    if (desc) {
      description_attr = ' data-desc="' + desc + '"';
    }
    // disable by default since the user don't need to select anything
    let htmlnew = $(
      `<select select-list input-val disabled> 
      <option selected="selected"  value="${val}" data-id="${val}" ${description_attr}>
      ${label}
      </option>
    </select>`
    )

    return htmlnew;
  };*/
}

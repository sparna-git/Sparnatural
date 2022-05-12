import ObjectPropertyTypeWidget from "./ObjectPropertyTypeWidget";
import { AbstractValue } from "../../sparql/Query";
import { Config } from "../../../configs/fixed-configs/SparnaturalConfig";
import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import { eventProxiCriteria } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import { TreeWidget } from "./Widgets";
import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import ArrowComponent from "../arrows/ArrowComponent";
import UnselectBtn from "../buttons/UnselectBtn";
import AddMoreValuesBtn from "../buttons/AddMoreValuesBtn";

class EndClassWidgetGroup extends HTMLComponent {
  ParentCriteriaGroup: CriteriaGroup;
  selectedValues: Array<EndClassWidgetValue> = [];
  selectAllValue: boolean = true;
  specProvider:ISpecProvider;
  addMoreValuesBtn: AddMoreValuesBtn
  VALUE_SELECTION_WIDGETS = [
    Config.LIST_PROPERTY,
    Config.LITERAL_LIST_PROPERTY,
    Config.AUTOCOMPLETE_PROPERTY,
    Config.TREE_PROPERTY,
  ];
  inputTypeComponent: ObjectPropertyTypeWidget;
  constructor(
    CriteriaGroup: CriteriaGroup,
    specProvider: ISpecProvider
  ) {
    super("EndClassWidgetGroup", CriteriaGroup,null);
    this.specProvider = specProvider
    this.ParentCriteriaGroup = CriteriaGroup;
  }

  render(){
    super.render()
    return this
  }
  /**
   * Called when the property/link between domain and range is selected, to init this.
   **/
  onObjectPropertyGroupSelected(objectProperty_selected:string) {
    this.inputTypeComponent = new ObjectPropertyTypeWidget(
      this,
      getSettings(),
      this.specProvider,
      objectProperty_selected
    ).render()
    
    // binds a selection in an input widget with the display of the value in the line
    this.inputTypeComponent.html.on("change",()=>{
      this.#onChange()
      });
    // binds a selection in an input widget with the display of the value in the line
    this.inputTypeComponent.html.on('selectAll',()=>{
      this.#onSelectAll()
    });
    
    /*
    if (this.ParentCriteriaGroup.jsonQueryBranch != null) {
      var branch = this.ParentCriteriaGroup.jsonQueryBranch;
      if (branch.line.values.length == 0) {
        if (branch.children.length == 0) {
          if (this.inputTypeComponent.canHaveSelectAll()) {
            this.#onSelectAll();
          }
        }
      } else {
        for (var key in branch.line.values) {
          this.loadValue(branch.line.values[key]);
        }
      }
    }*/

    this.html

  }

  // input : the 'key' of the value to be deleted
  onremoveValue(e: CustomEvent) {
    let valueToDel:EndClassWidgetValue = e.detail
    //On all case, selectAllValue will be set to false
    this.selectAllValue = false;

    let unselectedValue:EndClassWidgetValue
    this.selectedValues = this.selectedValues.filter((val:EndClassWidgetValue) =>{
      if(val === valueToDel){
        unselectedValue = val
        return false
      }
      return true
    })
    if(!unselectedValue) throw Error('Unselected val not found in the selectedValues list!')
    unselectedValue.html.remove()
    //if jstree remove unselecteds term
    if (this.inputTypeComponent.widgetType == Config.TREE_PROPERTY) {
      (this.inputTypeComponent.widgetComponent as TreeWidget).jsTree.jstree(
        "uncheck_node",
        $(e.currentTarget).attr("value-data")
      );
    }
    //uncheck_node()

    if (this.selectedValues.length < 1) {
      //$(this.ParentCriteriaGroup.ComponentHtml).removeClass("completed");

      // re-init the widget to empty input field
      this.inputTypeComponent.render();
    }
    this.html[0].dispatchEvent(new CustomEvent('submit',{bubbles:true}))
    this.html[0].dispatchEvent(new CustomEvent('initGenerEvent',{bubbles:true}))
    
  }

  loadValue = function loadValue(value: any) {
    this.inputTypeComponent.loadedValue =
      AbstractValue.valueToWidgetValue(value);
    $(this.inputTypeComponent).trigger("change");
    //Value added don't reuse preloaded data.
    this.inputTypeComponent.loadedValue = null;
  };

  #onSelectAll() {
    var theValueLabel =
      "<span>" + getSettings().langSearch.SelectAllValues + "</span>";
    this.selectAllValue = true;
    let unselect = $(
      '<span class="unselect" value-data="allValues"><i class="far fa-times-circle"></i></span>'
    );
    if (
      $(this.ParentCriteriaGroup.html).find(".EndClassWidgetGroup>div")
        .length == 0
    ) {
      $(this.ParentCriteriaGroup.html)
        .find(".EndClassWidgetGroup")
        .append(
          $(
            '<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">' +
              UiuxConfig.COMPONENT_ARROW_BACK +
              "</div><p>" +
              theValueLabel +
              '</p><div class="componentFrontArrow">' +
              UiuxConfig.COMPONENT_ARROW_FRONT +
              "</div></div>"
          )
        )
        .find("div")
        .first()
        .append(unselect);
    }

    unselect.on(
      "click",
      { arg1: this, arg2: "onRemoveValue" },
      eventProxiCriteria
    );

    // disable the Where
    $(this.ParentCriteriaGroup.html).parent("li").addClass("WhereImpossible");
    $(this.ParentCriteriaGroup.html)
      .find(".EndClassGroup>div")
      .first()
      .removeClass("newOr");

    //Add variable on results view
    if (!this.ParentCriteriaGroup.EndClassGroup.notSelectForview) {
      if (this.ParentCriteriaGroup.EndClassGroup.variableSelector == null) {
        this.ParentCriteriaGroup.EndClassGroup.onchangeViewVariable();
      }
    }
    this.ParentCriteriaGroup.initCompleted();

    $(this.ParentCriteriaGroup).trigger("EndClassWidgetGroupSelected");
    this.html[0].dispatchEvent(new CustomEvent('submit',{bubbles:true}))
    this.html[0].dispatchEvent(new CustomEvent('initGenerEvent',{bubbles:true}))
  }
  // this method renders Arrow Components on the ClassTypeId's
  #highlightArrowComponentents(){
    this.ParentCriteriaGroup.EndClassGroup.inputTypeComponent.highlight()
    this.ParentCriteriaGroup.StartClassGroup.inputTypeComponent.highlight()
  }

  
  #onChange() {
    //this.#highlightArrowComponentents()

    var selectedVal:{key:string,label:string,uri:string} = this.inputTypeComponent.getValue(); // could be array or single value
    // put span around with proper class if coming from a date widget
    if (selectedVal == null) {
      return false;
    }   

    // check if value already got selected before
    if(this.selectedValues.some(val => val.value_lbl === selectedVal.label)) return
    // if not, then create the EndclassWidgetValue and add it to the list
    let endClassWidgetVal = new EndClassWidgetValue(this,selectedVal.label)
    this.selectedValues.push(endClassWidgetVal)

    this.#renderNewSelectedValue(endClassWidgetVal)
    //this.ParentCriteriaGroup.initCompleted();
    this.html[0].dispatchEvent(new CustomEvent('EndClassWidgetGroupSelected',{bubbles:true}))
    this.html[0].dispatchEvent(new CustomEvent('submit',{bubbles:true}))


    //Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
    if (this.selectedValues.length == getSettings().maxOr) {
      this.addMoreValuesBtn.html.hide
    }

      this.html[0].dispatchEvent(new CustomEvent('initGenerEvent',{bubbles:true}))
  }

  // All items which got selected in the widget will be added add the back of the EndClassGroup.
  #renderNewSelectedValue(endClassWidgetVal:EndClassWidgetValue){
    endClassWidgetVal.render()
    // now render the addMoreValuesButton
    this.addMoreValuesBtn = new AddMoreValuesBtn(this,this.onAddOrValue).render()
  }


  //This is called when a value is selected from a list and you would like to add more values
  onAddOrValue = ()=> {
    
    // On vide les champs de saisie du widget
    if (!(this.inputTypeComponent.widgetType == Config.TREE_PROPERTY)) {
      this.inputTypeComponent.render() ;
    } else {
      //On avffiche de suite l'arbre. Car pas d'autre action possible
      $(this.ParentCriteriaGroup.EndClassGroup).find('a.treeBtnDisplay').first().trigger('click') ;
    }
    
    this.html[0].dispatchEvent(new CustomEvent('initGeneralEvent',{bubbles:true}))
  };
}


class EndClassWidgetValue extends HTMLComponent {
  backArrow = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_BACK)
  frontArrow = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_FRONT)
  unselectBtn: UnselectBtn
  value_lbl:string
 
  constructor(ParentComponent:EndClassWidgetGroup,value_lbl:string){
    super(value_lbl,ParentComponent,null)
    // set a tooltip if the label is a bit long
    this.value_lbl = value_lbl
  }

  render(): this {
    super.render()
    this.html.addClass('EndClassWidgetValue')
    this.backArrow.render()
    let valuelbl =`<p><span> ${this.value_lbl} </span></p>`
    this.html.append($(valuelbl)) 
    this.frontArrow.render()
    this.unselectBtn = new UnselectBtn(this,()=>{
      this.html[0].dispatchEvent(new CustomEvent('onRemoveEndClassWidgetValue',{bubbles:true}))
    }).render()
    return this
  }
}

export default EndClassWidgetGroup;

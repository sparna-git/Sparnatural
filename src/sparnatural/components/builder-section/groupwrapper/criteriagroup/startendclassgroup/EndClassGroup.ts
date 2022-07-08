import ClassTypeId from "./ClassTypeId";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import tippy from "tippy.js";
import { getSettings } from "../../../../../../configs/client-configs/settings";
import { SelectedVal } from "../../../../../sparql/ISparJson";
import { EndClassWidgetGroup, EndClassWidgetValue } from "./EndClassWidgetGroup";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../../../../HtmlComponent";
import EditComponents from "../edit-components/EditComponents";


/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
class EndClassGroup extends HTMLComponent {
  variableSelector: any;
  endClassVal: SelectedVal = {
    type:null,
    variable:null
  };
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  editComponents:EditComponents
  endClassWidgetGroup: EndClassWidgetGroup;
  startClassVal: SelectedVal;
  objectPropVal: SelectedVal;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("EndClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    this.endClassWidgetGroup = new EndClassWidgetGroup(this, this.specProvider);
  }

  render() {
    super.render();
    this.variableSelector = null;

    this.#addEventListener();
    return this;
  }

  #addEventListener() {
    this.html[0].addEventListener(
      "classTypeValueSelected",
      (e: CustomEvent) => {
        if (e.detail === "" || !e.detail)
          throw Error('No value received on "classTypeValueSelected"');
        e.stopImmediatePropagation();
        this.#createSparqlVar(e.detail)
        this.#valueWasSelected();
      }
    );
    // when inputgot selected then we remove the where btn
    this.html[0].addEventListener("removeEditComponents", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.editComponents?.html?.empty()?.remove()
      //this.editComponents = null
    });


    // gets called when the user adds widgetvalues or removes widgetvalues
    this.html[0].addEventListener("renderWidgetWrapper", (e: CustomEvent) => {
      if((!('selectedValues' in e.detail)) && e.detail.selectedValues.isArray) throw Error('renderWidgetWrapper expects list of selected values.')
      e.stopImmediatePropagation();
      // removeEditComponents: if add btn got clicked mutiple times or the old widgetwrapper is still rendered while the last selectedvalue got deleted 
      this.html[0].dispatchEvent(new CustomEvent('removeEditComponents'))
      if(e.detail.selectedValues.length === 0) {
        // Render WidgetsWrapper and ActionWhere
        this.editComponents.render()
        this.html[0].dispatchEvent(new CustomEvent('onGrpInputNotCompleted',{bubbles:true}))
      } else {
        //we only need widgetswrapper
        this.editComponents.renderWidgetsWrapper()
      }
    });

    //gets called when a user removes a previously selected widgetValue
    //removes the widgetValue from the widgetvalues list in the widget
    this.html[0].addEventListener("updateWidgetList",(e:CustomEvent)=>{
      if(!('unselectedVal' in e.detail)) throw Error('updateWidgetList expects an object of type EndClassWidgetValue')
      e.stopImmediatePropagation();
      let removed = e.detail.unselectedVal as EndClassWidgetValue
      this.editComponents.widgetWrapper.widgetComponent.onRemoveValue(removed.widgetVal)
      this.html[0].dispatchEvent(new CustomEvent("generateQuery",{bubbles:true}))
    })

    // gets called by the widget.
    this.html[0].addEventListener("renderWidgetVal", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      if(e.detail == '' || (!e.detail)) throw Error('No widgetValue received. Widget Value needs to be provided for "renderWidgetVal"')
        this.endClassWidgetGroup.renderWidgetVal(e.detail)
    });
  }

  #createSparqlVar(type:string){
    this.endClassVal.type = type
    this.html[0].dispatchEvent(new CustomEvent('getSparqlVarId',{
      bubbles:true,
      detail:(id: number) => { //callback
        this.endClassVal.variable = `?${this.specProvider.getLabel(type)}_${id}`
      }
    }))
  }

  // triggered when the subject/domain is selected
  onStartClassGroupSelected(startClassVal: SelectedVal) {
    this.startClassVal = startClassVal

    // render the inputComponent for a user to select an Object
    this.inputTypeComponent = new ClassTypeId(
      this,
      this.specProvider,
      startClassVal
    );
    this.inputTypeComponent.render();
  }


  onObjectPropertyGroupSelected(objectPropVal: SelectedVal) {
    this.objectPropVal = objectPropVal
    if (this.editComponents) return;
    this.endClassWidgetGroup.render()
    //whereaction only needs to be rendered on certain widgets
    this.editComponents = new EditComponents(this,this.startClassVal,objectPropVal,this.endClassVal,this.specProvider).render()

  }
  renderSelectViewVar(){
    this.inputTypeComponent.selectViewVariableBtn.render()
  }

  #valueWasSelected() {
    this.#renderUnselectBtn();
    // trigger the event that will call the ObjectPropertyGroup
    this.html[0].dispatchEvent(
      new CustomEvent("EndClassGroupSelected", {
        bubbles: true,
        detail: this.endClassVal,
      })
    );

    var desc = this.specProvider.getTooltip(this.endClassVal.type);
    if (desc) {
      $(this.html)
        .find(".ClassTypeId")
        .attr("data-tippy-content", desc);
      // tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
      var tippySettings = Object.assign({}, getSettings()?.tooltipConfig);
      tippySettings.placement = "top-start";
      tippy(".EndClassGroup .ClassTypeId[data-tippy-content]", tippySettings);
    } else {
      $(this.ParentCriteriaGroup.EndClassGroup.html).removeAttr(
        "data-tippy-content"
      );
    }
  }

  #renderUnselectBtn() {
    this.inputTypeComponent.renderUnselectBtn()
  }

  getVarName() {
    return this.endClassVal.variable;
  }
  setVarName(name:string){
    this.endClassVal.variable = name
  }
  getTypeSelected(){
    return this.endClassVal.type
  }
}
export default EndClassGroup;

/**
 * A single line/criteria
 **/
import { getSettings } from "../../../../../sparnatural/settings/defaultSettings";
import ISpecProvider from "../../../../spec-providers/ISpecProvider";
import UnselectBtn from "../../../buttons/UnselectBtn";
import ObjectPropertyGroup from "./objectpropertygroup/ObjectPropertyGroup";
import EndClassGroup from "./startendclassgroup/EndClassGroup";
import StartClassGroup from "./startendclassgroup/StartClassGroup";
import GroupWrapper from "../GroupWrapper";
import { OptionsGroup, OptionTypes } from "./optionsgroup/OptionsGroup";
import HTMLComponent from "../../../HtmlComponent";
import { SelectedVal } from "../../../../generators/ISparJson";
import { EndClassWidgetGroup, EndClassWidgetValue } from "./startendclassgroup/EndClassWidgetGroup";
import ActionsGroup from "../../../buttons/actions/ActionsGroup";
import { triggerOption } from "../groupwrapperevents/events/TriggerOption";

class CriteriaGroup extends HTMLComponent {
  settings: any;
  StartClassGroup: StartClassGroup;
  OptionsGroup: OptionsGroup; // optional or notexists
  ObjectPropertyGroup: ObjectPropertyGroup;
  EndClassGroup: EndClassGroup;
  endClassWidgetGroup: EndClassWidgetGroup;
  ActionsGroup: ActionsGroup;
  specProvider: ISpecProvider;
  ParentGroupWrapper: GroupWrapper;
  unselectBtn: UnselectBtn;
  startClassEyeBtn = false // Decides if the selectviewvarBtn is rendered on the startClass. That is the case only for the first one

  constructor(
    ParentComponent: GroupWrapper,
    specProvider: any,
    startClassVal?: SelectedVal,
    startClassEyeBtn?:boolean
  ) {
    super("CriteriaGroup", ParentComponent, null);
    this.specProvider = specProvider;
    this.ParentGroupWrapper = ParentComponent;
    this.StartClassGroup = new StartClassGroup(
      this,
      this.specProvider,
      startClassVal,
      startClassEyeBtn
    );
    this.startClassEyeBtn = startClassEyeBtn
  }

  render(): this {
    super.render();
    this.#renderChildComponents();
    this.unselectBtn = new UnselectBtn(this, () => {
      // caught in Parentcomponent
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveGrp", { bubbles: true })
      );
    }).render();
    return this;
  }

  #renderChildComponents() {
    // create all the elements of the criteria
    this.StartClassGroup.render();
    this.OptionsGroup = new OptionsGroup(this, this.specProvider).render();
    this.ObjectPropertyGroup = new ObjectPropertyGroup(
      this,
      this.specProvider,
      getSettings().langSearch.ObjectPropertyTemporaryLabel
    ).render();
    this.EndClassGroup = new EndClassGroup(this, this.specProvider).render();
    this.endClassWidgetGroup = new EndClassWidgetGroup(this, this.specProvider);
    this.ActionsGroup = new ActionsGroup(this, this.specProvider).render();

    this.#assembleComponents();
  }

  #assembleComponents = () => {
    // 1. User selects StartClassVal
    this.html[0].addEventListener(
      "StartClassGroupSelected",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        if (!this.#isSelectedVal(e.detail))
          throw Error(
            "StartClassGroupSelected expects object of type SelectedVal"
          );
        this.ObjectPropertyGroup.onStartClassGroupSelected(e.detail);
        this.EndClassGroup.onStartClassGroupSelected(e.detail);
      }
    );

    // 2. User Selects EndClassVal
    this.html[0].addEventListener("EndClassGroupSelected", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      if (!this.#isSelectedVal(e.detail))
        throw Error("EndClassGroupSelected expects object of type SelectedVal");
      this.ObjectPropertyGroup.onEndClassGroupSelected(e.detail);
    });

    // 3. Automatically selected or User selects ObjectPropertyGrpVal
    this.html[0].addEventListener(
      "onObjectPropertyGroupSelected",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        
        if (!this.#isSelectedVal(e.detail))
          throw Error(
            "onObjectPropertyGroupSelected expects object of type SelectedVal"
          );
        
          // if there is already a where connection or widget values selected, don't change anything
        if (!(this.ParentGroupWrapper.whereChild) && this.endClassWidgetGroup?.widgetValues?.length === 0){
          this.EndClassGroup.onObjectPropertyGroupSelected(e.detail);
          this.endClassWidgetGroup.render();
        }
        
        this.OptionsGroup.onObjectPropertyGroupSelected(
          this.ParentGroupWrapper.optionState
        );

        // if there is already a andSibling don't allow to rerender the ActionAnd again
        if (!this.ParentGroupWrapper.andSibling)
          this.ActionsGroup.onObjectPropertyGroupSelected();

        // if property has a sparqlService, switch the state
        if(this.specProvider.getServiceEndpoint(e.detail.type)) {
          triggerOption(this.ParentGroupWrapper, OptionTypes.SERVICE);
        } else {
          triggerOption(this.ParentGroupWrapper, this.ParentGroupWrapper.optionState);
        }
      }
    );

    // gets called by the widget.
    this.html[0].addEventListener("renderWidgetValues", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      if (e.detail == "" || !e.detail || !Array.isArray(e.detail))
        throw Error(
          'No widgetValues received. "renderWidgetValues expects type Array<WidgetValue>'
        );
        e.detail.forEach(v=> this.endClassWidgetGroup.renderWidgetVal(v))
      // Removes the value selection part, with 1 and 2
      this.html[0].dispatchEvent(
        new CustomEvent("removeEditComponents", { bubbles: true })
      );
      this.html[0].dispatchEvent(
        new CustomEvent("onGrpInputCompleted", { bubbles: true })
      );
    });

    // when inputgot selected then we remove the where btn and EditComponents
    this.html[0].addEventListener("removeEditComponents", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.EndClassGroup.editComponents?.html?.empty()?.remove();
    });

    //gets called when a user removes a previously selected widgetValue
    //removes the widgetValue from the widgetvalues list in the widget
    this.html[0].addEventListener("updateWidgetList", (e: CustomEvent) => {
      if (!("unselectedVal" in e.detail))
        throw Error(
          "updateWidgetList expects an object of type EndClassWidgetValue"
        );
      e.stopImmediatePropagation();
      let removed = e.detail.unselectedVal as EndClassWidgetValue;
      this.EndClassGroup.editComponents.widgetWrapper.widgetComponent?.onRemoveValue(
        removed.widgetVal
      );
      this.html[0].dispatchEvent(
        new CustomEvent("generateQuery", { bubbles: true })
      );
    });

  // gets called when the user adds widgetvalues or removes widgetvalues
  this.html[0].addEventListener("renderWidgetWrapper", (e: CustomEvent) => {
    if (!("selectedValues" in e.detail) && e.detail.selectedValues.isArray)
      throw Error("renderWidgetWrapper expects list of selected values.");
    e.stopImmediatePropagation();
    // removeEditComponents: if add btn got clicked mutiple times or the old widgetwrapper is still rendered while the last selectedvalue got deleted
    this.html[0].dispatchEvent(new CustomEvent("removeEditComponents"));
    if (e.detail.selectedValues.length === 0) {
      // Render WidgetsWrapper and ActionWhere
      this.EndClassGroup.editComponents.render();
      this.html[0].dispatchEvent(
        new CustomEvent("onGrpInputNotCompleted", { bubbles: true })
      );
    } else {
      //we only need widgetswrapper
      this.EndClassGroup.editComponents.renderWidgetsWrapper();
    }
  });
  };

  #isSelectedVal(payload: any): payload is SelectedVal {
    return "type" in payload && "variable" in payload;
  }

}
export default CriteriaGroup;

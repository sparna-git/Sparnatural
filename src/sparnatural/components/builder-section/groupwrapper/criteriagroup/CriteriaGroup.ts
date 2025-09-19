/**
 * A single line/criteria
 **/
import { ISparnaturalSpecification } from "../../../../spec-providers/ISparnaturalSpecification";
import { UnselectBtn } from "../../../buttons/UnselectBtn";
import ObjectPropertyGroup from "./objectpropertygroup/ObjectPropertyGroup";
import EndClassGroup from "./startendclassgroup/EndClassGroup";
import StartClassGroup from "./startendclassgroup/StartClassGroup";
import GroupWrapper from "../GroupWrapper";
import { OptionsGroup, OptionTypes } from "./optionsgroup/OptionsGroup";
import { HTMLComponent } from "../../../HtmlComponent";
import { SelectedVal } from "../../../SelectedVal";
import {
  EndClassWidgetGroup,
  EndClassWidgetValue,
} from "./startendclassgroup/EndClassWidgetGroup";
import ActionsGroup from "../../../buttons/actions/ActionsGroup";
import { triggerOption } from "../groupwrapperevents/events/TriggerOption";
import { I18n } from "../../../../settings/I18n";

class CriteriaGroup extends HTMLComponent {
  StartClassGroup: StartClassGroup;
  OptionsGroup: OptionsGroup; // optional or notexists
  ObjectPropertyGroup: ObjectPropertyGroup;
  EndClassGroup: EndClassGroup;
  endClassWidgetGroup: EndClassWidgetGroup;
  ActionsGroup: ActionsGroup;
  specProvider: ISparnaturalSpecification;
  ParentGroupWrapper: GroupWrapper;
  unselectBtn: UnselectBtn;

  constructor(
    parentComponent: GroupWrapper,
    specProvider: any,
    startClassVal?: SelectedVal,
    startClassEyeBtn?: boolean
  ) {
    super("CriteriaGroup", parentComponent, null);
    this.specProvider = specProvider;
    this.ParentGroupWrapper = parentComponent;
    this.StartClassGroup = new StartClassGroup(
      this,
      this.specProvider,
      I18n.labels.StartClassTemporaryLabel,
      startClassVal,
      // Decides if the selectviewvarBtn is rendered on the startClass. That is the case only for the first one
      startClassEyeBtn
    );
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
      I18n.labels.ObjectPropertyTemporaryLabel
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
        if (
          !this.ParentGroupWrapper.whereChild &&
          this.endClassWidgetGroup?.widgetValues?.length === 0
        ) {
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
        if (this.specProvider.getProperty(e.detail.type).getServiceEndpoint()) {
          triggerOption(this.ParentGroupWrapper, OptionTypes.SERVICE);
        } else {
          triggerOption(
            this.ParentGroupWrapper,
            this.ParentGroupWrapper.optionState
          );
        }
      }
    );

    // gets called by the widget.
    this.html[0].addEventListener("renderWidgetVal", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      if (e.detail == "" || !e.detail)
        throw Error(
          'No widgetValue received. Widget Value needs to be provided for "renderWidgetVal"'
        );
      if (Array.isArray(e.detail)) {
        // if there is an array with values provided, render all of them
        e.detail.forEach((v) => this.endClassWidgetGroup.renderWidgetVal(v));
      } else {
        this.endClassWidgetGroup.renderWidgetVal(e.detail);
      }
    });

    // gets called by the widget.
    this.html[0].addEventListener("selectAll", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.endClassWidgetGroup.setSelectAll();
    });

    // when inputgot selected then we remove the where btn and EditComponents
    this.html[0].addEventListener("removeEditComponents", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.EndClassGroup.editComponents?.html?.empty()?.remove();
    });

    // gets called when a user removes a previously selected widgetValue
    this.html[0].addEventListener("updateWidgetList", (e: CustomEvent) => {
      if (!("unselectedVal" in e.detail))
        throw Error(
          "updateWidgetList expects an object of type EndClassWidgetValue"
        );
      e.stopImmediatePropagation();
      
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
      if (
        e.detail.selectedValues.length === 0 &&
        // if we are not in the case that we edit the last value in the list
        // note : editedValue contains the value being edited - it could be passed again to the widget, maybe, instead
        // of keeping the state in the widget
        !e.detail.editedValue
      ) {
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

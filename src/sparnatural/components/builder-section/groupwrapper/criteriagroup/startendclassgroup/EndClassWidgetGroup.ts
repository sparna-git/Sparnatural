import UiuxConfig from "../../../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../../../spec-providers/ISpecProviders";
import { getSettings } from "../../../../../../configs/client-configs/settings";
import ArrowComponent from "../../../../arrows/ArrowComponent";
import UnselectBtn from "../../../../buttons/UnselectBtn";
import HTMLComponent from "../../../../HtmlComponent";
import AddWidgetValueBtn from "../../../../buttons/AddWidgetValueBtn";
import {
  ValueType,
  WidgetValue,
} from "../edit-components/widgets/AbstractWidget";

export class EndClassWidgetGroup extends HTMLComponent {
  ParentComponent: HTMLComponent;
  widgetValues: Array<EndClassWidgetValue> = [];
  specProvider: ISpecProvider;
  addWidgetValueBtn: AddWidgetValueBtn;
  constructor(parentComponent: HTMLComponent, specProvider: ISpecProvider) {
    super("EndClassWidgetGroup", parentComponent, null);
    this.specProvider = specProvider;
  }

  render() {
    super.render();
    this.#addEventListener();
    return this;
  }

  #addEventListener() {
    this.html[0].addEventListener(
      "onRemoveEndClassWidgetValue",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.#onRemoveValue(e);
      }
    );
  }

  // input : the 'key' of the value to be deleted
  #onRemoveValue(e: CustomEvent) {
    let valueToDel: EndClassWidgetValue = e.detail;

    let unselectedValue: EndClassWidgetValue;
    this.widgetValues = this.widgetValues.filter((val: EndClassWidgetValue) => {
      if (val.value_lbl === valueToDel.value_lbl) {
        unselectedValue = val;
        return false;
      }
      return true;
    });
    if (unselectedValue === undefined)
      throw Error("Unselected val not found in the widgetValues list!");
    unselectedValue.html.remove();

    // if the number of widgetValues is now less than the maximum
    if (this.widgetValues.length < getSettings().maxOr) {
      this.addWidgetValueBtn.html.show;
    }

    if (this.widgetValues.length < 1) {
      // reattach eventlistener. it got removed
      this.#addEventListener();
      //if there is an addWidgetValueBtn then remove it as well
      this.addWidgetValueBtn?.html?.remove();

      this.html[0].dispatchEvent(
        new CustomEvent("renderWidgetWrapper", {
          bubbles: true,
          detail: { selectedValues: this.widgetValues },
        })
      );
    }
    this.html[0].dispatchEvent(
      new CustomEvent("updateWidgetList", {
        bubbles: true,
        detail: { unselectedVal: unselectedValue },
      })
    );
    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );
  }

  // user selects a value for example a country from the listwidget
  renderWidgetVal(selectedVal: WidgetValue) {
    // check if value already got selected before
    if (
      this.widgetValues.some((val) => val.value_lbl === selectedVal.value.label)
    )
      return;
    // if not, then create the EndclassWidgetValue and add it to the list
    this.#renderEndClassWidgetVal(selectedVal);
  }

  #renderEndClassWidgetVal(widgetVal: WidgetValue) {
    let endClassWidgetVal = new EndClassWidgetValue(this, widgetVal);
    this.widgetValues.push(endClassWidgetVal);

    this.#renderNewSelectedValue(endClassWidgetVal);

    // if selectAllvalues then we don't need a AddWidgetValueBtn
    if (widgetVal.valueType == ValueType.MULTIPLE) {
      // now (re)render the addMoreValuesButton
      this.addWidgetValueBtn?.html
        ? this.addWidgetValueBtn.render()
        : (this.addWidgetValueBtn = new AddWidgetValueBtn(
            this,
            this.#addMoreValues
          ).render());
    }

    //Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
    if (this.widgetValues.length == getSettings().maxOr) {
      this.addWidgetValueBtn.html.hide;
    }

    // asks to remove the value selection part, with 1 and 2
    this.html[0].dispatchEvent(
      new CustomEvent("removeEditComponents", { bubbles: true })
    );

    this.html[0].dispatchEvent(
      new CustomEvent("onGrpInputCompleted", { bubbles: true })
    );
  }

  // All items which got selected in the widget will be added add the back of the EndClassGroup.
  #renderNewSelectedValue(endClassWidgetVal: EndClassWidgetValue) {
    endClassWidgetVal.render();
  }

  // when more values should be added then render the inputypecomponent again
  #addMoreValues = () => {
    this.html[0].dispatchEvent(
      new CustomEvent("renderWidgetWrapper", {
        bubbles: true,
        detail: { selectedValues: this.widgetValues },
      })
    );
    //this.#addEventListener();
  };

  getWidgetValue() {
    let vals = this.widgetValues.map((val) => {
      return val.widgetVal;
    });
    return vals;
  }
}

export class EndClassWidgetValue extends HTMLComponent {
  backArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_BACK);
  frontArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_FRONT);
  unselectBtn: UnselectBtn;
  value_lbl: string;
  widgetVal: WidgetValue;
  constructor(ParentComponent: EndClassWidgetGroup, selectedVal: WidgetValue) {
    super("EndClassWidgetValue", ParentComponent, null);
    // set a tooltip if the label is a bit long
    this.widgetVal = selectedVal;
    this.value_lbl = selectedVal.value.label;
  }

  render(): this {
    super.render();
    this.backArrow.render();
    let valuelbl = `<p><span> ${this.value_lbl} </span></p>`;
    this.html.append($(valuelbl));
    this.frontArrow.render();
    this.unselectBtn = new UnselectBtn(this, () => {
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveEndClassWidgetValue", {
          bubbles: true,
          detail: this,
        })
      );
    }).render();
    return this;
  }
}

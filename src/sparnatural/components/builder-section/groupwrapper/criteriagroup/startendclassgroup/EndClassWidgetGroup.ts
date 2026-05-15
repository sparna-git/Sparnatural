import UiuxConfig from "../../../../IconsConstants";
import { ISparnaturalSpecification } from "../../../../../spec-providers/ISparnaturalSpecification";
import { getSettings } from "../../../../../../sparnatural/settings/defaultSettings";
import { ArrowComponent } from "../../../../buttons/ArrowComponent";
import { UnselectBtn } from "../../../../buttons/UnselectBtn";
import { HTMLComponent } from "../../../../HtmlComponent";
import { AddWidgetValueBtn } from "../../../../buttons/AddWidgetValueBtn";
import {
  AbstractWidget,
  ValueRepetition
} from "../../../../widgets/AbstractWidget";
import CriteriaGroup from "../CriteriaGroup";
import { EditBtn } from "../../../../buttons/EditBtn";
import { LabelledCriteria, equalsCriteria, getCriteriaType, MapCriteria, CriteriaType, Criteria, RdfTermCriteria } from "../../../../../SparnaturalQueryIfc";
import { I18n } from "../../../../../settings/I18n";


import { ExpandWidgetValuesBtn } from "../../../../buttons/ExpandWidgetValuesBtn";
import { TippyInfo } from "../../../../buttons/TippyInfo";

/*
  This class is responsible for rendering the WidgetValues, selected by a widget.
  This values are added in a 'list' after the EndClassGroup
*/
export class EndClassWidgetGroup extends HTMLComponent {
  widgetValues?: Array<EndClassWidgetValue> = [];
  specProvider: ISparnaturalSpecification;
  addWidgetValueBtn: AddWidgetValueBtn;
  expandBtn: ExpandWidgetValuesBtn | undefined;
  valuesWrapper: JQuery;
  isSelectAll:boolean = false;
  #clickOutsideHandler: ((e: JQuery.ClickEvent) => void) | null = null;
  #resizeHandler: (() => void) | null = null;

  constructor(parentComponent: HTMLComponent, specProvider: ISparnaturalSpecification) {
    super("EndClassWidgetGroup", parentComponent, null);
    this.specProvider = specProvider;
  }

  render() {
    super.render();

    this.valuesWrapper = $('<div class="EndClassWidgetValuesWrapper"></div>');
    this.html.append(this.valuesWrapper);

    let popoverCloseBtn = $(`<span class="popoverCloseBtn">${UiuxConfig.ICON_REG_XMARK}</span>`);
    this.valuesWrapper.append(popoverCloseBtn);
    popoverCloseBtn.on("click", (e) => {
      e.stopPropagation();
      this.valuesWrapper.removeClass("expanded");
      this.valuesWrapper.css("max-width", "");
      this.valuesWrapper.css("width", "");
      this.html.css("width", "");
      if (this.#resizeHandler) {
        window.removeEventListener("resize", this.#resizeHandler);
        this.#resizeHandler = null;
      }
      this.html[0].dispatchEvent(new CustomEvent("redrawBackgroundAndLinks", { bubbles: true }));
      this.#updateLayout();
    });

    this.#addEventListener();
    this.#addEditEventListener();

    // click outside to collapse
    if (this.#clickOutsideHandler) {
      $(document).off("click", this.#clickOutsideHandler);
    }
    this.#clickOutsideHandler = (e) => {
      if (this.valuesWrapper.hasClass("expanded") && !$(e.target).closest(this.html).length) {
        this.html.css("width", "");
        this.valuesWrapper.css("width", "");
        this.valuesWrapper.removeClass("expanded");
        if (this.#resizeHandler) {
          window.removeEventListener("resize", this.#resizeHandler);
          this.#resizeHandler = null;
        }
        this.#updateLayout();
        this.html[0].dispatchEvent(
          new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
        );
      }
    };
    $(document).on("click", this.#clickOutsideHandler);

    return this;
  }

  destroy() {
    if (this.#clickOutsideHandler) {
      $(document).off("click", this.#clickOutsideHandler);
    }
    if (this.#resizeHandler) {
      window.removeEventListener("resize", this.#resizeHandler);
      this.#resizeHandler = null;
    }
    super.destroy();
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

  /**
   * Listens for the event to edit a value (e.g. edit a map selection)
   */
  #addEditEventListener() {
    this.html[0].addEventListener(
      "onEditEndClassWidgetValue",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();

        let valueToDel: EndClassWidgetValue = e.detail;

        let unselectedValue: EndClassWidgetValue;
        this.widgetValues = this.widgetValues.filter((val: EndClassWidgetValue) => {
          if (equalsCriteria(val.widgetVal.criteria, valueToDel.widgetVal.criteria)) {
            unselectedValue = val;
            return false;
          }
          return true;
        });
        if (unselectedValue === undefined)
          throw Error("Unselected val not found in the widgetValues list!");
        unselectedValue.html.remove();


        this.html[0].dispatchEvent(
          new CustomEvent("renderWidgetWrapper", {
            bubbles: true,
            detail: {
              selectedValues: this.widgetValues,
              editedValue: valueToDel.widgetVal
            },
          })
        );
      }
    );
  }

  // input : the widget value to remove
  #onRemoveValue(e: CustomEvent) {
    let valueToDel: EndClassWidgetValue = e.detail;

    // special case: if the value to delete is the selectAll value
    let unselectedValue: EndClassWidgetValue;
    if(valueToDel.selectAll) {
      this.isSelectAll = false;
      unselectedValue = valueToDel;
    } else {
      unselectedValue = valueToDel;

      this.widgetValues = this.widgetValues.filter((val: EndClassWidgetValue) => {
        if (equalsCriteria(val.widgetVal.criteria, valueToDel.widgetVal.criteria)) {
          unselectedValue = val;
          return false;
        }
        return true;
      });
      if (unselectedValue === undefined)
        throw Error("Unselected val not found in the widgetValues list!"); 
      
    }

    unselectedValue.html.remove();

    if (this.widgetValues.length < 1) {
      // reattach eventlistener. it got removed
      this.#addEventListener();
      //if there is an addWidgetValueBtn then remove it as well
      this.addWidgetValueBtn?.html?.remove();
      this.expandBtn?.html?.remove();
      this.expandBtn = undefined;
      this.valuesWrapper.empty();

      this.html[0].dispatchEvent(
        new CustomEvent("renderWidgetWrapper", {
          bubbles: true,
          detail: { selectedValues: this.widgetValues },
        })
      );
    }

    this.#updateLayout();

    this.html[0].dispatchEvent(
      new CustomEvent("updateWidgetList", {
        bubbles: true,
        detail: { unselectedVal: unselectedValue },
      })
    );
    this.html[0].dispatchEvent(
      new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
    );
  }

  // user selects a value for example a country from the listwidget
  renderWidgetVal(selectedVal: LabelledCriteria<Criteria>) {
    this.isSelectAll = false
    // check if value already got selected before
    if (
      this.widgetValues.some((val) => equalsCriteria(val.widgetVal.criteria, selectedVal.criteria))
    )
      return;
    
    // if not, then create the EndclassWidgetValue and add it to the list
    this.#renderEndClassWidgetVal(selectedVal);
  }

  setSelectAll() {
    this.isSelectAll = true;
    let endClassWidgetVal = new EndClassWidgetValue(this, null, true);
    this.#renderNewSelectedValue(endClassWidgetVal);

    this.#updateLayout();

    // asks to remove the value selection part, with 1 and 2
    this.html[0].dispatchEvent(
      new CustomEvent("removeEditComponents", { bubbles: true })
    );

    this.html[0].dispatchEvent(
      new CustomEvent("onGrpInputCompleted", { bubbles: true })
    );
  }

  #renderEndClassWidgetVal(widgetVal: LabelledCriteria<Criteria>) {
    let endClassWidgetVal = new EndClassWidgetValue(this, widgetVal);
    this.widgetValues.unshift(endClassWidgetVal);

    this.#renderNewSelectedValue(endClassWidgetVal);

    this.#updateLayout();

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
    // Insert in first in DOM wrapper
    if (this.valuesWrapper[0].firstChild) {
      this.valuesWrapper[0].insertBefore(endClassWidgetVal.html[0], this.valuesWrapper[0].firstChild);
    } else {
      this.valuesWrapper.append(endClassWidgetVal.html);
    }
  }

  #updateLayout() {
    const maxPerRow = getSettings().maxVisiblePerRow || 3;
    const total = this.widgetValues.length;
    const isExpanded = this.valuesWrapper.hasClass("expanded");

    this.widgetValues.forEach((val, index) => {
      if (!isExpanded && index >= maxPerRow) {
        val.html.hide();
      } else {
        val.html.show();
      }
    });

    if (total > maxPerRow) {
      if (!this.expandBtn) {
        this.expandBtn = new ExpandWidgetValuesBtn(this, (e) => {
          e.stopImmediatePropagation();
          
          if (!this.valuesWrapper.hasClass("expanded")) {
            const criteriaGroup = this.parentComponent as CriteriaGroup;
            const availableWidth = this.#calculatePopoverWidth(criteriaGroup.html[0], this.html[0]);
            this.valuesWrapper.css("width", availableWidth + "px");

            // Add resize listener with debounce
            let resizeTimeout: any;
            this.#resizeHandler = () => {
              clearTimeout(resizeTimeout);
              resizeTimeout = setTimeout(() => {
                if (this.valuesWrapper.hasClass("expanded")) {
                  const newWidth = this.#calculatePopoverWidth(criteriaGroup.html[0], this.html[0]);
                  this.valuesWrapper.css("width", newWidth + "px");
                }
              }, 150);
            };
            window.addEventListener("resize", this.#resizeHandler);
          } else {
            this.valuesWrapper.css("width", "");
            if (this.#resizeHandler) {
              window.removeEventListener("resize", this.#resizeHandler);
              this.#resizeHandler = null;
            }
          }

          this.valuesWrapper.toggleClass("expanded");
          this.#updateLayout();
          this.html[0].dispatchEvent(
            new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
          );
        });
      }
      this.expandBtn.render(total - maxPerRow);
      if (!this.html.find(this.expandBtn.html).length) {
        this.html.append(this.expandBtn.html);
      }
      this.expandBtn.html.show();
    } else {
      this.expandBtn?.html.hide();
    }

    // if the widget allows multiple values to be selected then AddWidgetValueBtn
    // undefined for NON_SELECTABLE_PROPERTY
    const widgetComp:AbstractWidget | undefined = (this.parentComponent as CriteriaGroup).endClassGroup.getWidgetComponent()
    if(widgetComp && widgetComp.valueRepetition == ValueRepetition.MULTIPLE) {
      // now (re)render the addMoreValuesButton
      this.addWidgetValueBtn?.html
        ? this.addWidgetValueBtn.render()
        : (this.addWidgetValueBtn = new AddWidgetValueBtn(
          this,
          this.#addMoreValues
        ).render());
      
      if (!this.html.find(this.addWidgetValueBtn.html).length) {
        this.html.append(this.addWidgetValueBtn.html);
      }

      if (total >= getSettings().maxOr) {
        this.addWidgetValueBtn.html.hide();
      } else {
        this.addWidgetValueBtn.html.show();
      }
    } else {
      this.addWidgetValueBtn?.html.hide();
    }
  }

  // when more values should be added then render the inputypecomponent again
  #addMoreValues = () => {
    // tell it is not completed so that it is higher
    this.html[0].dispatchEvent(
      new CustomEvent("onGrpInputNotCompleted", { bubbles: true })
    );

    this.html[0].dispatchEvent(
      new CustomEvent("renderWidgetWrapper", {
        bubbles: true,
        detail: { selectedValues: this.widgetValues },
      })
    );
    //this.#addEventListener();
  };

  getWidgetValues(): LabelledCriteria<Criteria>[] {
    let vals = this.widgetValues.map((val) => {
      return val.widgetVal;
    });
    return vals;
  }

  /**
   * @returns true if the widget value is the "Any" value
   */
  hasAnyValue():boolean {
    return this.isSelectAll;
  }

  #calculatePopoverWidth(criteriaGroupEl: HTMLElement, endClassWidgetGroupEl: HTMLElement): number {
    const criteriaGroupRect = criteriaGroupEl.getBoundingClientRect();
    
    // Calculer la largeur totale des enfants SAUF EndClassWidgetGroup
    let otherElementsWidth = 0;
    const children = Array.from(criteriaGroupEl.children);
    
    console.log("--- EndClassWidgetGroup Expand Calculation ---");
    console.log(`CriteriaGroup total width (rect): ${criteriaGroupRect.width.toFixed(1)}`);

    for (const child of children) {
      const childEl = child as HTMLElement;
      const style = window.getComputedStyle(childEl);
      
      // Skip elements positioned as 'absolute' (e.g., ActionsGroup, UnselectBtn)
      if (style.position === "absolute") {
        console.log(`- Skipping absolute child ${childEl.className || childEl.tagName}`);
        continue;
      }

      if (childEl === endClassWidgetGroupEl) continue; // ignorer EndClassWidgetGroup
      const childRect = childEl.getBoundingClientRect();
      
      const marginLeft = parseFloat(style.marginLeft) || 0;
      const marginRight = parseFloat(style.marginRight) || 0;
      
      const totalChildWidth = childRect.width + marginLeft + marginRight;
      otherElementsWidth += totalChildWidth;
      
      console.log(`- Child ${childEl.className || childEl.tagName}: w=${childRect.width.toFixed(1)}, m=${marginLeft}/${marginRight}, total=${totalChildWidth.toFixed(1)}`);
    }

    // Marges de EndClassWidgetGroup lui-même
    const ecwgStyle = window.getComputedStyle(endClassWidgetGroupEl);
    const ecwgMarginLeft = parseFloat(ecwgStyle.marginLeft) || 0;
    console.log(`ECWG margin-left: ${ecwgMarginLeft.toFixed(1)}`);

    // Largeur disponible = largeur du parent - largeur des autres éléments - marge-gauche ECWG - 15px de sécurité
    let availableWidth = criteriaGroupRect.width - otherElementsWidth - ecwgMarginLeft - 15;
    
    console.log(`Calculation: ${criteriaGroupRect.width.toFixed(1)} (parent) - ${otherElementsWidth.toFixed(1)} (others) - ${ecwgMarginLeft.toFixed(1)} (ecwg ml) - 15 (safety) = ${availableWidth.toFixed(1)}`);

    const finalWidth = Math.max(200, Math.floor(availableWidth));
    console.log(`Final width applied: ${finalWidth}`);
    console.log("----------------------------------------------");

    return finalWidth;
  }
}

export class EndClassWidgetValue extends HTMLComponent {
  backArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_BACK);
  frontArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_FRONT);
  unselectBtn: UnselectBtn;
  editBtn:EditBtn;
  // may be undefined in case of "select all"
  widgetVal?: LabelledCriteria<Criteria>;
  // in case this value is the special "select all" value
  selectAll: boolean = false;

  constructor(ParentComponent: EndClassWidgetGroup, selectedVal: LabelledCriteria<Criteria>, selectAll: boolean = false) {
    super("EndClassWidgetValue", ParentComponent, null);
    // set a tooltip if the label is a bit long
    this.widgetVal = selectedVal;
    this.selectAll = selectAll;
  }

  render(): this {
    super.render();
    this.backArrow.render();

    let theLabel = this.selectAll?I18n.labels.SelectAllValues:this.widgetVal.label;

    // set a tooltip if the label is a bit long
    var extraClass = "";
    if(
      this.widgetVal && this.widgetVal.criteria && (getCriteriaType(this.widgetVal.criteria) == CriteriaType.RdfTermCriteria)
      && (this.widgetVal.criteria as RdfTermCriteria).rdfTerm.value == "https://services.sparnatural.eu/api/v1/URI_NOT_FOUND"
    ) {
      extraClass = 'class="notFound"'
    }

    let valuelbl = `<p><span ${extraClass}> ${theLabel} </span></p>`;
    this.html.append($(valuelbl));

    if (theLabel.length > 25) {
      new TippyInfo(this, this.#stripLabelHtml(theLabel), {
        placement: 'top',
        delay: [500, 100],
        theme: 'sparnatural',
      });
    }

    this.frontArrow.render();
    this.unselectBtn = new UnselectBtn(this, () => {
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveEndClassWidgetValue", {
          bubbles: true,
          detail: this,
        })
      );
    }).render();

    if(this.widgetVal && getCriteriaType(this.widgetVal.criteria) == CriteriaType.MapCriteria) {
      this.editBtn = new EditBtn(this, () => {
        this.html[0].dispatchEvent(
          new CustomEvent("onEditEndClassWidgetValue", {
            bubbles: true,
            detail: this,
          })
        );
      }).render();
    }
    
    return this;
  }
  
  #stripLabelHtml = (html:string) =>{
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
}

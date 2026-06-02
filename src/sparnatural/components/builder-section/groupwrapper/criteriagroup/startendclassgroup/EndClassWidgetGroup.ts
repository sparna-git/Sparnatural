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
  expandedValuesWrapper: JQuery;
  popoverCloseBtn: JQuery;
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
    this.expandedValuesWrapper = $('<div class="EndClassWidgetExpandedWrapper"></div>');
    this.expandedValuesWrapper.hide();
    this.html.append(this.valuesWrapper);
    this.html.append(this.expandedValuesWrapper);

    this.popoverCloseBtn = $(`<span class="popoverCloseBtn">${UiuxConfig.ICON_ARROW_TOP}</span>`);
    this.expandedValuesWrapper.append(this.popoverCloseBtn);
    this.popoverCloseBtn.on("click", (e) => {
      e.stopPropagation();
      this.#collapseExpanded();
      this.html[0].dispatchEvent(new CustomEvent("redrawBackgroundAndLinks", { bubbles: true }));
      this.#updateLayout();
    });

    // Permanent resize handler for chip widths + expanded wrapper
    this.#resizeHandler = () => {
      if (this.expandedValuesWrapper.hasClass("expanded")) {
        const criteriaGroup = this.parentComponent as CriteriaGroup;
        const newWidth = this.#calculatePopoverWidth(criteriaGroup.html[0], this.html[0]);
        this.expandedValuesWrapper.css("width", newWidth + "px");
        this.#positionCloseBtn();
      }
      if (this.widgetValues.length > 0) {
        this.#calculateChipWidths();
      }
    };
    window.addEventListener("resize", this.#resizeHandler);

    this.#addEventListener();
    this.#addEditEventListener();

    // Recalculate chip widths when optional/notExists toggles change the criteria border
    // Listen on CriteriaGroup (parent) since OptionsGroup is a sibling, not an ancestor
    const criteriaGroupEl = (this.parentComponent as CriteriaGroup).html[0];
    criteriaGroupEl.addEventListener("redrawBackgroundAndLinks", () => {
      if (this.widgetValues.length > 0) {
        this.#resizeHandler();
      }
    });

    // click outside to collapse
    if (this.#clickOutsideHandler) {
      $(document).off("click", this.#clickOutsideHandler);
    }
    this.#clickOutsideHandler = (e) => {
      if (this.expandedValuesWrapper.hasClass("expanded") && !$(e.target).closest(this.html).length) {
        this.#collapseExpanded();
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
      this.#collapseExpanded();

      this.html[0].dispatchEvent(
        new CustomEvent("renderWidgetWrapper", {
          bubbles: true,
          detail: { selectedValues: this.widgetValues },
        })
      );
    }

    this.#redistributeValues();
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

  #redistributeValues() {
    const maxPerRow = getSettings().maxVisiblePerRow || 3;
    this.widgetValues.forEach((val, index) => {
      val.html.detach();
      if (index < maxPerRow) {
        this.valuesWrapper.append(val.html);
        val.html.show();
      } else {
        this.expandedValuesWrapper.append(val.html);
        val.html.show();
      }
    });
  }
  #updateLayout() {
    const maxPerRow = getSettings().maxVisiblePerRow || 3;
    const total = this.widgetValues.length;
    const isExpanded = this.expandedValuesWrapper.hasClass("expanded");

    this.#redistributeValues();

    if (isExpanded) {
      this.expandedValuesWrapper.show();
      this.#positionCloseBtn();
    } else {
      this.expandedValuesWrapper.hide();
      this.popoverCloseBtn?.hide();
    }

    if (total > maxPerRow) {
      if (!this.expandBtn) {
        this.expandBtn = new ExpandWidgetValuesBtn(this, (e) => {
          e.stopImmediatePropagation();

          if (!this.expandedValuesWrapper.hasClass("expanded")) {
            const criteriaGroup = this.parentComponent as CriteriaGroup;
            const availableWidth = this.#calculatePopoverWidth(criteriaGroup.html[0], this.html[0]);
            this.expandedValuesWrapper.css("width", availableWidth + "px");
          } else {
            this.expandedValuesWrapper.css("width", "");
          }

          this.expandedValuesWrapper.toggleClass("expanded");
          if (this.expandedValuesWrapper.hasClass("expanded")) {
            this.expandedValuesWrapper.show();
            this.#positionCloseBtn();
          } else {
            this.expandedValuesWrapper.hide();
            this.popoverCloseBtn?.hide();
          }
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
      this.#collapseExpanded();
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
      } else if (total === 0) {
        this.addWidgetValueBtn.html.hide();
      } else {
        this.addWidgetValueBtn.html.show();
      }
    } else {
      this.addWidgetValueBtn?.html.hide();
    }

    // Calculate chip max-width to fit maxPerRow items on one line
    if (total > 0) {
      this.#calculateChipWidths();
    } else {
      this.valuesWrapper[0].style.removeProperty('--chip-max-width');
      this.expandedValuesWrapper[0].style.removeProperty('--chip-max-width');
    }
  }

  #calculateChipWidths() {
    const maxPerRow = getSettings().maxVisiblePerRow || 3;
    const total = this.widgetValues.length;

    // --- Chip width for valuesWrapper (main row) ---
    const criteriaGroupEl = (this.parentComponent as CriteriaGroup).html[0] as HTMLElement;
    const criteriaGroupRect = criteriaGroupEl.getBoundingClientRect();

    let otherElementsWidth = 0;
    for (const child of Array.from(criteriaGroupEl.children)) {
      const childEl = child as HTMLElement;
      const childStyle = window.getComputedStyle(childEl);
      if (childStyle.position === "absolute") continue;
      if (childEl === this.html[0]) continue;
      const childRect = childEl.getBoundingClientRect();
      const ml = parseFloat(childStyle.marginLeft) || 0;
      const mr = parseFloat(childStyle.marginRight) || 0;
      otherElementsWidth += childRect.width + ml + mr;
    }

    const ecwgStyle = window.getComputedStyle(this.html[0]);
    const ecwgML = parseFloat(ecwgStyle.marginLeft) || 0;
    const ecwgPR = parseFloat(ecwgStyle.paddingRight) || 0;

    let availableWidth = criteriaGroupRect.width - otherElementsWidth - ecwgML - ecwgPR;

    const expandEl = this.expandBtn?.html?.[0] as HTMLElement | undefined;
    if (expandEl && expandEl.offsetParent !== null) {
      availableWidth -= expandEl.getBoundingClientRect().width;
    }
    const addEl = this.addWidgetValueBtn?.html?.[0] as HTMLElement | undefined;
    if (addEl && addEl.offsetParent !== null) {
      availableWidth -= addEl.getBoundingClientRect().width;
    }

    const visibleCount = Math.min(total, maxPerRow);
    const chipWidth = (availableWidth + (visibleCount - 1) * 13) / visibleCount;
    const clampedWidth = Math.max(80, Math.min(220, Math.floor(chipWidth)));
    this.valuesWrapper[0].style.setProperty('--chip-max-width', clampedWidth + 'px');

    // --- Chip width for expandedValuesWrapper (based on its own width) ---
    if (this.expandedValuesWrapper.hasClass("expanded") && this.expandedValuesWrapper.is(":visible")) {
      const expandedEl = this.expandedValuesWrapper[0] as HTMLElement;
      const expandedWidth = expandedEl.getBoundingClientRect().width;
      const expandedPR = parseFloat(getComputedStyle(expandedEl).paddingRight) || 0;
      const expandedAvailWidth = expandedWidth - expandedPR;
      const expandedChipWidth = (expandedAvailWidth + (maxPerRow - 1) * 13) / maxPerRow;
      const expandedClamped = Math.max(80, Math.min(220, Math.floor(expandedChipWidth)));
      this.expandedValuesWrapper[0].style.setProperty('--chip-max-width', expandedClamped + 'px');
    } else {
      this.expandedValuesWrapper[0].style.removeProperty('--chip-max-width');
    }
  }

  #positionCloseBtn() {
    if (!this.popoverCloseBtn) return;
    this.popoverCloseBtn.show();
  }

  #collapseExpanded() {
    this.expandedValuesWrapper.removeClass("expanded");
    this.expandedValuesWrapper.hide();
    this.popoverCloseBtn?.hide();
    this.valuesWrapper.css("max-width", "");
    this.valuesWrapper.css("width", "");
    this.html.css("width", "");
  }

  // when more values should be added then render the inputypecomponent again
  #addMoreValues = () => {
    this.#collapseExpanded();
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
    const ecwgRect = endClassWidgetGroupEl.getBoundingClientRect();

    // Align right edge of expanded wrapper with right edge of CriteriaGroup
    const expandedWidth = criteriaGroupRect.right - ecwgRect.left;

    return Math.max(200, Math.floor(expandedWidth + 2));
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

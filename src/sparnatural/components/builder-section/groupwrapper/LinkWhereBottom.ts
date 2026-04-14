import { I18n } from "../../../settings/I18n";
import { HTMLComponent } from "../../HtmlComponent";
import { OptionTypes } from "./criteriagroup/optionsgroup/OptionsGroup";
import EndClassGroup from "./criteriagroup/startendclassgroup/EndClassGroup";
import GroupWrapper from "./GroupWrapper";

/*
    This Component consists of three lines.
    The first vertical goes from the EndClassGroup to the end of the CriteriaGroup
    Then the Horizontal connects the first vertical to the left. Till the height of the WhereStartClassGroup
    The last vertical connects the Horizontal line with the new whereChild.StartClassGroup
    Some helpful notes:
     - window.scrollX | window.scrollY is used to correct the positioning of the line if the window is scrollable.
     - ax & ay are the position of the upper Element
     - bx & by are the position of the lower Element
     - (posUpperStart.left + (posUpperStart.right - posUpperStart.left) / 4) is used to calculate one quarter of the width from the left side
*/
class LinkWhereBottom extends HTMLComponent {

  parentGroupWrapper: GroupWrapper;
  widgetHTML = $(`<span>${I18n.labels.Where}</span>`);
  upperVertical = $(`<div class="upper-vertical"></div>`);
  horizontal = $(`<div class="horizontal"></div>`).append(this.widgetHTML);
  lowerVertical = $(`<div class="lower-vertical"></div>`);

  // noOption or optionalEnabled or notExists, etc.
  currentOptionState = OptionTypes.NONE;

  constructor(parentComponent: HTMLComponent) {
    super("link-where-bottom", parentComponent, null);
    this.parentGroupWrapper = parentComponent as GroupWrapper;

    // inherit the optionState from its parent
    this.currentOptionState = this.parentGroupWrapper.currentOptionState;
  }

  render(): this {
    super.render();
    
    // add an explicit class for the option
    this.html.addClass(this.currentOptionState);

    this.html.add(this.upperVertical);
    this.html.append(this.upperVertical);
    this.html.append(this.horizontal);
    this.html.append(this.lowerVertical);
    this.#drawWhereConnection(
      this.parentGroupWrapper.criteriaGroup.endClassGroup,
      this.parentGroupWrapper.whereChild
    );
    return this;
  }

  setCurrentOptionState(newState:OptionTypes) {
    HTMLComponent.switchState(this.html[0],this.currentOptionState,newState);
    this.currentOptionState = newState;
  }

  #drawWhereConnection(EndClassGroup: EndClassGroup, whereChild: GroupWrapper) {
    const parentRect = this.parentGroupWrapper.html[0].getBoundingClientRect();
    const xyUpper = this.#drawUpperVertical(EndClassGroup, whereChild, parentRect);
    const xyLower = this.#drawLowerVertical(whereChild, parentRect);
    this.#drawHorizontal(xyLower, xyUpper);
  }

  // line from the middle of the endclassgroup till the end of GroupWrapper
  #drawUpperVertical(endClassGroup: EndClassGroup, whereChild: GroupWrapper, parentRect: DOMRect) {
    const endClassClientRect = endClassGroup.html[0].getBoundingClientRect();
    const whereChildRect = whereChild.html[0].getBoundingClientRect();
    const ax = Math.round(endClassClientRect.left - parentRect.left + (endClassClientRect.right - endClassClientRect.left) / 2 - 1);
    const ay = Math.round(endClassClientRect.bottom - parentRect.top);
    const by = Math.round(whereChildRect.top - parentRect.top);

    const distance = by - ay;
    this.upperVertical.css({
      '--link-top': ay + 'px',
      '--link-left': ax + 'px',
      '--link-height': distance + 'px',
    });

    return { x: ax, y: by };
  }

  #drawHorizontal(
    xyLower: { x: number; y: number },
    xyUpper: { x: number; y: number }
  ) {
    // adapt line length according to width of the WHERE span.
    const width:number = this.widgetHTML.outerWidth()
    // position horizontal line so it ends exactly at xyUpper.x
    const ax = Math.min(xyLower.x, xyUpper.x);
    const bx = Math.max(xyLower.x, xyUpper.x);
    const distance = Math.round(bx - ax + 2); // keep +3 for overlap safety

    this.horizontal.css({
      '--link-top': Math.round(xyLower.y - 1) + 'px',
      '--link-left': Math.round(ax) + 'px',
      '--link-width': distance + 'px',
    });

    // label "WHERE" should be centered above the lower vertical line (xyLower.x)
    // we calculate its left position relative to the horizontal line's start (ax)
    const labelOffset = xyLower.x - ax;
    this.widgetHTML.css({
      'left': Math.round(labelOffset) + 'px',
      'top': '0px',
      'transform': 'translate(-50%, -50%)' // center horizontally on point, and place above the line
    });
  }

  #drawLowerVertical(whereChild: GroupWrapper, parentRect: DOMRect) {
    const startClassClientRect =
      whereChild.criteriaGroup.startClassGroup.html[0].getBoundingClientRect();
    const bx = Math.round(startClassClientRect.left - parentRect.left + (startClassClientRect.right - startClassClientRect.left) / 4 - 1);
    // -2 so that it looks connected to white group
    const by = Math.round(startClassClientRect.top - parentRect.top);

    const whereChildRect = whereChild.html[0].getBoundingClientRect();

    const ay = Math.round(whereChildRect.top - parentRect.top);

    const distance = by - ay;
    this.lowerVertical.css({
      '--link-top': ay + 'px',
      '--link-left': bx + 'px',
      '--link-height': distance + 'px',
    });

    return { x: bx, y: ay };
  }

  #getLine(ax: number, bx: number, ay: number, by: number) {
    if (ax > bx) {
      bx = ax + bx;
      ax = bx - ax;
      bx = bx - ax;

      by = ay + by;
      ay = by - ay;
      by = by - ay;
    }
    let distance = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    let calc = Math.atan((by - ay) / (bx - ax));
    let degree = (calc * 180) / Math.PI;

    return {
      transformOrigin: "top left",
      width: distance,
      top: ay + "px",
      left: ax + "px",
      transform: `rotate(${degree}deg)`,
    };
  }
}
export default LinkWhereBottom;

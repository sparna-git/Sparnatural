import { I18n } from "../../../settings/I18n";
import HTMLComponent from "../../HtmlComponent";
import GroupWrapper from "./GroupWrapper";

/*
  This class is used to draw the connecting line between two group wrappers if an AND connection is made
  Some helpful notes:
   - window.scrollX | window.scrollY is used to correct the positioning of the line if the window is scrollable.
   - ax & ay are the position of the upper (Parent) group wrapper
   - bx & by are the position of the lower (Sibling) group wrapper
   - (posUpperStart.left + (posUpperStart.right - posUpperStart.left) / 4) is used to calculate one quarter of the width from the left side
*/

class LinkAndBottom extends HTMLComponent {
  length: number;
  ParentGroupWrapper: GroupWrapper;
  constructor(ParentComponent: HTMLComponent) {
    let widgetHTML = $(`<span>${I18n.labels.And}</span>`);
    super("link-and-bottom", ParentComponent, widgetHTML);
    this.ParentGroupWrapper = ParentComponent as GroupWrapper;
  }

  render(): this {
    super.render();
    this.#drawLinkAndBottom(this.ParentGroupWrapper);
    return this;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect/element-box-diagram.png
  #drawLinkAndBottom(grpWrapper: GroupWrapper) {
    const posUpperStart =
      grpWrapper.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();
    const posLowerStart =
      grpWrapper.andSibling.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();
    // from the upper and from the upperelement move 25% into the middle
    const ax = (posUpperStart.left + (posUpperStart.right - posUpperStart.left) / 4) + window.scrollX;
    let bx = (posLowerStart.left + (posLowerStart.right - posLowerStart.left) / 4) + window.scrollX;
    // +3 so that it looks connected to white group and not orange arrow
    const ay = posUpperStart.bottom  + window.scrollY + 3;
    const by = posLowerStart.top  + window.scrollY;

    const css = this.#getLine(ax, bx, ay, by);

    this.html.css(css);
  }

  #getLine(ax: number, bx: number, ay: number, by: number) {
    if (ax > bx) {
      bx = ax + bx;
      ax = bx - ax;
      bx = bx - ax;
    }
    const distance = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    // we always need a vertical line. So 90degree is fixed
    const degree = 90;

    return {
      transformOrigin: "top left",
      width: distance,
      top: ay + "px",
      left: ax + "px",
      transform: `rotate(${degree}deg)`,
    };
  }
}

export default LinkAndBottom;

import { I18n } from "../../../settings/I18n";
import { HTMLComponent } from "../../HtmlComponent";
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
  widgetHTML = $(`<span>${I18n.labels.And}</span>`);
  constructor(ParentComponent: HTMLComponent) {
    super("link-and-bottom", ParentComponent, null);
    this.ParentGroupWrapper = ParentComponent as GroupWrapper;
  }

  render(): this {
    super.render();
    this.html.append(this.widgetHTML);
    this.#drawLinkAndBottom(this.ParentGroupWrapper);
    return this;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect/element-box-diagram.png
  #drawLinkAndBottom(grpWrapper: GroupWrapper) {
    const parentLi = grpWrapper.html[0]; // le <li class="groupe">
    const parentRect = parentLi.getBoundingClientRect();

    const posUpperStart =
      grpWrapper.criteriaGroup.startClassGroup.html[0].getBoundingClientRect();
    const posLowerStart =
      grpWrapper.andSibling.criteriaGroup.startClassGroup.html[0].getBoundingClientRect();

    // Position relative au parent <li>
    const ax = Math.round(posUpperStart.left - parentRect.left + (posUpperStart.right - posUpperStart.left) / 4 - 1);
    // +3 so that it looks connected to white group and not orange arrow
    const ay = Math.round(posUpperStart.bottom - parentRect.top);
    const by = Math.round(posLowerStart.top - parentRect.top);

    const distance = by - ay;
    if (distance <= 0) return;

    this.html.css({
      '--link-top': ay + 'px',
      '--link-left': ax + 'px',
      '--link-height': distance + 'px',
    });

    // label "AND" should be centered on the line
    this.widgetHTML.css({
      'top': '50%',
      'transform': 'translate(-50%, -50%)'
    });
  }

}

export default LinkAndBottom;

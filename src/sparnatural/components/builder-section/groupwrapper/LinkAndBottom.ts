import { getSettings } from "../../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import GroupWrapper from "./GroupWrapper";

class LinkAndBottom extends HTMLComponent {
  length: number;
  ParentGroupWrapper: GroupWrapper;
  constructor(ParentComponent: HTMLComponent) {
    let widgetHTML = $(`<span>${getSettings().langSearch.And}</span>`);
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
    let posUpperStart =
      grpWrapper.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();
    let posLowerStart =
      grpWrapper.andSibling.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();

    let ax =
      posUpperStart.left + (posUpperStart.right - posUpperStart.left) / 4;
    let bx =
      posLowerStart.left + (posLowerStart.right - posLowerStart.left) / 4;
    let ay = posUpperStart.bottom;
    let by = posLowerStart.top;

    let css = this.#getLine(ax, bx, ay, by);

    this.html.css(css);
  }

  #getLine(ax: number, bx: number, ay: number, by: number) {
    if (ax > bx) {
      bx = ax + bx;
      ax = bx - ax;
      bx = bx - ax;
    }
    let distance = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    // we always need a vertical line. So 90degree is fixed
    let degree = 90;

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

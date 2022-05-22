import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import GroupWrapper from "./GroupWrapper";

/*
    This Component consists of three lines.
    The first vertical goes from the EndClassGroup to the end of the CriteriaGroup
    Then the Horizontal connects the first vertical to the left. Till the height of the WhereStartClassGroup
    The last vertical connects the Horizontal line with the new whereChild.StartClassGroup
*/
class LinkWhereBottom extends HTMLComponent {
  ParentGroupWrapper: GroupWrapper;
  widgetHTML = $(`<span>${getSettings().langSearch.Or}</span>`);
  upperVertical = $(`<div class="upper-vertical"></div>`);
  horizontal = $(`<div class="horizontal"></div>`).append(this.widgetHTML);
  lowerVertical = $(`<div class="lower-vertical"></div>`);
  constructor(ParentComponent: HTMLComponent) {
    super("link-where-bottom", ParentComponent, null);
    this.ParentGroupWrapper = ParentComponent as GroupWrapper;
  }

  render(): this {
    super.render();
    this.html.add(this.upperVertical);
    this.html.append(this.upperVertical);
    this.html.append(this.horizontal);
    this.html.append(this.lowerVertical);
    this.#drawWhereConnection(
      this.ParentGroupWrapper.CriteriaGroup.EndClassGroup,
      this.ParentGroupWrapper.whereChild
    );
    return this;
  }

  #drawWhereConnection(EndClassGroup: EndClassGroup, whereChild: GroupWrapper) {
    let xyUpper = this.#drawUpperVertical(EndClassGroup, whereChild);
    let xyLower = this.#drawLowerVertical(whereChild);
    this.#drawHorizontal(xyLower, xyUpper);
  }
  // line from the middle of the endclassgroup till the end of GroupWrapper
  #drawUpperVertical(endClassGroup: EndClassGroup, whereChild: GroupWrapper) {
    let endClassClientRect = endClassGroup.html[0].getBoundingClientRect();
    let whereChildRect = whereChild.html[0].getBoundingClientRect();
    let middleOfEndClass =
      endClassClientRect.left +
      (endClassClientRect.right - endClassClientRect.left) / 2;
    let topWhereChild = whereChildRect.top;
    let yEndClass = endClassClientRect.bottom;

    // middleOfEndClass can be used twice since line is orthogonal to EndClassGroup
    let css = this.#getLine(
      middleOfEndClass,
      middleOfEndClass,
      yEndClass,
      topWhereChild
    );
    this.upperVertical.css(css);

    return { x: middleOfEndClass, y: topWhereChild };
  }
  #drawHorizontal(
    xyLower: { x: number; y: number },
    xyUpper: { x: number; y: number }
  ) {
    let css = this.#getLine(xyLower.x, xyUpper.x, xyLower.y, xyUpper.y);
    this.horizontal.css(css);
  }
  #drawLowerVertical(whereChild: GroupWrapper) {
    let startClassClientRect =
      whereChild.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();
    let middleOfStartClass =
      startClassClientRect.left +
      (startClassClientRect.right - startClassClientRect.left) / 2;
    let topStrClsGrp = startClassClientRect.top;

    let whereChildRect = whereChild.html[0].getBoundingClientRect();
    let topWhereChild = whereChildRect.top;

    // middleOfStartClass can be used twice since line is horizontal
    let css = this.#getLine(
      middleOfStartClass,
      middleOfStartClass,
      topWhereChild,
      topStrClsGrp
    );
    this.lowerVertical.css(css);

    return { x: middleOfStartClass, y: topWhereChild };
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

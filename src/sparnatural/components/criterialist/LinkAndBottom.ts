import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import GroupWrapper from "./GroupWrapper";

interface LineObject {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

class LinkAndBottom extends HTMLComponent {
  lineObj: LineObject; // defines the Pos and height of the line
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
  length: number;
  ParentGroupWrapper: GroupWrapper;
  constructor(ParentComponent: HTMLComponent) {
    let widgetHTML = $(`<span>${getSettings().langSearch.And}</span>`);
    super("link-and-bottom", ParentComponent, widgetHTML);
    this.ParentGroupWrapper = ParentComponent as GroupWrapper;
  }

  render(): this {
    super.render();
    this.#drawLinkAndBottom(this.ParentGroupWrapper)
    return this;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect/element-box-diagram.png
#drawLinkAndBottom(
  grpWrapper: GroupWrapper
) {
  let posUpperStart =
    grpWrapper.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();
  let posLowerStart =
    grpWrapper.andSibling.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();

  let line = {
    // line is located in the first quarter of StartClassGroup
    xStart: posUpperStart.left + (posUpperStart.right - posUpperStart.left) / 4,
    xEnd: posLowerStart.left + (posLowerStart.right - posLowerStart.left) / 4,
    yStart: posUpperStart.bottom,
    yEnd: posLowerStart.top
  };

  grpWrapper.linkAndBottom.setLineObj(line);
}

  setLineObj(lineObj: LineObject) {
    this.lineObj = lineObj;
    this.xStart = lineObj.xStart;
    this.xEnd = lineObj.xEnd;
    this.yStart = lineObj.yStart;
    this.yEnd = lineObj.yEnd;

    let distance = Math.sqrt(
      Math.pow(this.xEnd - this.xStart, 2) +
        Math.pow(this.yEnd - this.yStart, 2)
    );
    let calc = Math.atan((this.yEnd - this.yStart) / (this.xEnd - this.xStart));
    let degree = (calc * 180) / Math.PI;

    this.html.css({
      transformOrigin: "top left",
      width: distance,
      top: this.yStart + "px",
      left: this.xStart + "px",
      transform: `rotate(${degree}deg)`,
    });
  }
}

export default LinkAndBottom;

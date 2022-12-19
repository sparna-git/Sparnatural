import { getSettings } from "../../../../sparnatural/settings/defaultSettings";
import HTMLComponent from "../../HtmlComponent";
import ObjectSelector from "./criteriagroup/subject-object-selectors/ObjectSelector";
import GroupWrapper from "./GroupWrapper";

/*
    This Component consists of three lines.
    The first vertical goes from the ObjectSelector to the end of the CriteriaGroup
    Then the Horizontal connects the first vertical to the left. Till the height of the WhereSubjectSelector
    The last vertical connects the Horizontal line with the new whereChild.SubjectSelector
    Some helpful notes:
     - window.scrollX | window.scrollY is used to correct the positioning of the line if the window is scrollable.
     - ax & ay are the position of the upper Element
     - bx & by are the position of the lower Element
     - (posUpperStart.left + (posUpperStart.right - posUpperStart.left) / 4) is used to calculate one quarter of the width from the left side
*/
class LinkWhereBottom extends HTMLComponent {
  ParentGroupWrapper: GroupWrapper;
  widgetHTML = $(`<span>${getSettings().langSearch.Where}</span>`);
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
      this.ParentGroupWrapper.CriteriaGroup.ObjectSelector,
      this.ParentGroupWrapper.whereChild
    );
    return this;
  }

  #drawWhereConnection(ObjectSelector: ObjectSelector, whereChild: GroupWrapper) {
    const xyUpper = this.#drawUpperVertical(ObjectSelector, whereChild);
    const xyLower = this.#drawLowerVertical(whereChild);
    this.#drawHorizontal(xyLower, xyUpper);
  }

  // line from the middle of the objectselectorgroup till the end of GroupWrapper
  #drawUpperVertical(objectSelectorGroup: ObjectSelector, whereChild: GroupWrapper) {
    const objectSelectorClientRect = objectSelectorGroup.html[0].getBoundingClientRect();
    const whereChildRect = whereChild.html[0].getBoundingClientRect();
    const ax = (objectSelectorClientRect.left + (objectSelectorClientRect.right - objectSelectorClientRect.left) / 2) + window.scrollX;
    const ay = objectSelectorClientRect.bottom + 3 + window.scrollY;
    const by = whereChildRect.top + window.scrollY;

    // ax can be used twice since the line is orthogonal to the upper element
    let css = this.#getLine(
      ax,
      ax,
      ay,
      by
    );
    this.upperVertical.css(css);

    return { x: ax, y: by };
  }

  #drawHorizontal(
    xyLower: { x: number; y: number },
    xyUpper: { x: number; y: number }
  ) {
    // adapt line length according to width of the WHERE span.
    const width:number = this.widgetHTML.outerWidth()
    const adaptedLowerx = xyLower.x - (width / 2)
    const css = this.#getLine(adaptedLowerx, xyUpper.x, xyLower.y, xyUpper.y);
    this.horizontal.css(css);
  }

  #drawLowerVertical(whereChild: GroupWrapper) {
    const subjectSelectorClientRect =
      whereChild.CriteriaGroup.SubjectSelector.html[0].getBoundingClientRect();
    const bx =
      (subjectSelectorClientRect.left + (subjectSelectorClientRect.right - subjectSelectorClientRect.left) / 4) + window.scrollX;
    // -2 so that it looks connected to white group
    const by = subjectSelectorClientRect.top + window.scrollY - 2;

    const whereChildRect = whereChild.html[0].getBoundingClientRect();

    const ay = whereChildRect.top + window.scrollY;

    // bx can be used twice since line is orthogonal from the lower element
    const css = this.#getLine(
      bx,
      bx,
      ay,
      by
    );
    this.lowerVertical.css(css);

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

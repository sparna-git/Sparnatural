import tippy from "tippy.js";
import ClassTypeId from "./ClassTypeId";
import CriteriaGroup from "../criterialist/CriteriaGroup";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import HTMLComponent from "../../HtmlComponent";
import SelectViewVariableBtn from "../buttons/SelectViewVariableBtn";

/**
 * Selection of the start class in a criteria/line
 **/
class StartClassGroup extends HTMLComponent {
  varName: any;
  selectViewVariable: JQuery<HTMLElement>;
  notSelectForview: boolean;
  startClassVal: any;
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  selectViewVariableBtn: SelectViewVariableBtn;
  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("StartClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.inputTypeComponent = new ClassTypeId(this, this.specProvider);
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup; // must be before varName declaration
  }

  render() {
    super.render();
    this.inputTypeComponent.render();
    this.#addEventListener();
    return this;
  }

  #addEventListener() {
    this.html[0].addEventListener(
      "classTypeValueSelected",
      (e: CustomEvent) => {
        if (e.detail === "" || !e.detail)
          throw Error('No value received on "classTypeValueSelected"');
        e.stopImmediatePropagation();
        this.startClassVal = e.detail;
        this.#valueWasSelected();
      }
    );
  }

  onchangeViewVariable = () => {
    // emit custom event. getting cought in SparnaturalComponent
    let ev = new CustomEvent("updateVariableList", { bubbles: true });
    this.html[0].dispatchEvent(ev);
  };

  #valueWasSelected() {
    this.#renderSelectViewVariableBtn();

    this.html[0].dispatchEvent(
      new CustomEvent("StartClassGroupSelected", {
        bubbles: true,
        detail: this.startClassVal,
      })
    );

    this.html[0].dispatchEvent(new CustomEvent("submit", { bubbles: true }));

    var desc = this.specProvider.getTooltip(this.startClassVal);

    /*
      Not sure what the following code does
    */

    if (desc) {
      console.warn("StartClassGroup.valueSelected desc hapene!");
      $(this.ParentCriteriaGroup.StartClassGroup.html)
        .find(".ClassTypeId")
        .attr("data-tippy-content", desc);
      // tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
      var tippySettings = Object.assign({}, this.settings.tooltipConfig);
      tippySettings.placement = "top-start";
      tippy(".StartClassGroup .ClassTypeId[data-tippy-content]", tippySettings);
    } else {
      $(this.ParentCriteriaGroup.StartClassGroup.html).removeAttr(
        "data-tippy-content"
      );
    }
  }

  #renderSelectViewVariableBtn() {
    this.selectViewVariableBtn = new SelectViewVariableBtn(
      this,
      this.onchangeViewVariable
    );
  }
  getVarName() {
    return this.varName;
  }
}
export default StartClassGroup;

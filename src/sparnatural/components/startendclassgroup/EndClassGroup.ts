import ClassTypeId from "./ClassTypeId";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import CriteriaGroup from "../groupwrapper/CriteriaGroup";
import tippy from "tippy.js";
import UnselectBtn from "../buttons/UnselectBtn";
import SelectViewVariableBtn from "../buttons/SelectViewVariableBtn";
import HTMLComponent from "../../HtmlComponent";
import { getSettings } from "../../../configs/client-configs/settings";
import EndClassWidgetGroup from "../widgets/EndClassWidgetGroup";
import ActionWhere from "../actions/actioncomponents/ActionWhere";

/**
 * The "range" select, encapsulating a ClassTypeId, with a niceselect
 **/
class EndClassGroup extends HTMLComponent {
  varName: any; //IMPORTANT varName is only present at EndClassGroup and StartClassGroup. Refactor on selectedValue method from upper class
  variableSelector: any;
  endClassVal: any;
  notSelectForview: boolean;
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  endClassWidgetGroup: EndClassWidgetGroup;
  actionWhere: ActionWhere;
  startClassVal: string;
  selectViewVariableBtn: SelectViewVariableBtn;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("EndClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    this.endClassWidgetGroup = new EndClassWidgetGroup(this, this.specProvider);
  }

  render() {
    super.render();
    this.variableSelector = null;
    this.endClassVal = null;
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
        this.endClassVal = e.detail;
        this.#valueWasSelected();
      }
    );

    // when inputgot selected then we remove the where btn
    this.html[0].addEventListener("removeWhereBtn", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.actionWhere.html.remove();
    });

    // rerenderWhereBtn
    this.html[0].addEventListener("renderWhereBtn", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.actionWhere.render();
    });
  }

  // triggered when the subject/domain is selected
  onStartClassGroupSelected(startClassVal: string) {
    this.startClassVal = startClassVal;
    // render the inputComponent for a user to select an Object
    this.inputTypeComponent = new ClassTypeId(
      this,
      this.specProvider,
      startClassVal
    );
    this.inputTypeComponent.render();
    let editCompCls = $('<div class="EditComponents"></div>');
    this.html.append(editCompCls);
  }

  onObjectPropertyGroupSelected(input: string) {
    if (this.endClassWidgetGroup.inputTypeComponent || this.actionWhere) return;
    this.endClassWidgetGroup.onObjectPropertyGroupSelected(input);
    this.actionWhere = new ActionWhere(
      this,
      this.specProvider,
      this.#onAddWhere
    ).render();
  }

  //MUST be arrowfunction
  #onAddWhere = () => {
    // render the ViewVarBtn
    this.html[0].dispatchEvent(
      new CustomEvent("addWhereComponent", {
        bubbles: true,
        detail: this.endClassVal,
      })
    );
  };

  renderSelectViewVar(){
    this.selectViewVariableBtn = new SelectViewVariableBtn(
      this,
      this.onchangeViewVariable
    ).render()
  }

  
  onchangeViewVariable = () => {
    console.warn('selctviewvar clicked')
    this.html[0].dispatchEvent(new CustomEvent("onSelectViewVar", { bubbles: true }));
  };

  #valueWasSelected() {
    this.#renderUnselectBtn();
    this.endClassWidgetGroup.render();

    // trigger the event that will call the ObjectPropertyGroup
    this.html[0].dispatchEvent(
      new CustomEvent("EndClassGroupSelected", {
        bubbles: true,
        detail: this.endClassVal,
      })
    );

    var desc = this.specProvider.getTooltip(this.endClassVal);
    if (desc) {
      $(this.ParentCriteriaGroup.EndClassGroup.html)
        .find(".ClassTypeId")
        .attr("data-tippy-content", desc);
      // tippy('.EndClassGroup .ClassTypeId[data-tippy-content]', settings.tooltipConfig);
      var tippySettings = Object.assign({}, getSettings()?.tooltipConfig);
      tippySettings.placement = "top-start";
      tippy(".EndClassGroup .ClassTypeId[data-tippy-content]", tippySettings);
    } else {
      $(this.ParentCriteriaGroup.EndClassGroup.html).removeAttr(
        "data-tippy-content"
      );
    }
  }

  #renderUnselectBtn() {
    this.inputTypeComponent.renderUnselectBtn()
  }
}
export default EndClassGroup;

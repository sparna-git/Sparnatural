import ClassTypeId from "./ClassTypeId";
import { localName } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import CriteriaGroup from "../criterialist/CriteriaGroup";
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
  selectViewVariable: JQuery<HTMLElement>;
  endClassVal: any;
  notSelectForview: boolean;
  inputTypeComponent: ClassTypeId;
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  UnselectButton: UnselectBtn;
  SelectViewVariableBtn: SelectViewVariableBtn;
  endClassWidgetGroup: EndClassWidgetGroup;
  actionWhere: ActionWhere;
  startClassVal: string;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("EndClassGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.ParentCriteriaGroup = this.ParentComponent as CriteriaGroup;
    this.endClassWidgetGroup = new EndClassWidgetGroup(this, this.specProvider);
    this.actionWhere = new ActionWhere(
      this,
      this.specProvider,
      this.#onAddWhere
    );
  }

  render() {
    super.render();
    this.variableSelector = null;
    this.endClassVal = null;
    this.#addEventListener();
    return this;
  }

  //MUST be arrowfunction
  #onAddWhere = () => {
    this.html[0].dispatchEvent(
      new CustomEvent("addWhereComponent", {
        bubbles: true,
        detail: this.endClassVal,
      })
    );
  };

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
    $(this.html).append('<div class="EditComponents"></div>'); // this is important!
  }

  onchangeViewVariable = () => {
    console.warn("endclassgrp onChangeViewVar");
    this.html[0].dispatchEvent(
      new CustomEvent("updateVariableList", { bubbles: true, detail: "test" })
    );
  };

  onObjectPropertyGroupSelected(input: string) {
    this.endClassWidgetGroup.onObjectPropertyGroupSelected(input);
    this.actionWhere.render(); // first render endClassWidgetGroup then actionWhere
  }

  /*
		onChange gets called when a Endclassgroup was selected. For example choosing Musuem relatedTo Country
		When Country got selected this events fires
	*/

  #valueWasSelected() {
    this.#renderUnselectBtn();
    this.#renderSelectViewVariableBtn();
    this.endClassWidgetGroup.render();
    //Set the variable name for Sparql
    if (this.varName == null) {
      // dispatch event and get maxVarIndex via callback
      // can i refactor this so that traversing the components will set the varindex?
      this.html[0].dispatchEvent(
        new CustomEvent("getMaxVarIndex", {
          bubbles: true,
          detail: (index: number) => {
            //getting the value Sparnatural
            this.varName = "?" + localName(this.endClassVal) + "_" + index;
          },
        })
      );
    }

    if (this.specProvider.hasConnectedClasses(this.endClassVal)) {
      console.warn("EndClassgroup. specprovider hasConnectedClasses");
      $(this.ParentCriteriaGroup.html)
        .parent("li")
        .removeClass("WhereImpossible");
    } else {
      $(this.ParentCriteriaGroup.html).parent("li").addClass("WhereImpossible");
    }
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

  // is this little crossed eye button at the end of EndclassGroup component
  #renderSelectViewVariableBtn() {
    this.SelectViewVariableBtn = new SelectViewVariableBtn(
      this,
      this.onchangeViewVariable
    );
  }

  #renderUnselectBtn() {
    let removeEndClassEvent = () => {
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveEndClass", { bubbles: true })
      );
    };
    this.UnselectButton = new UnselectBtn(this, removeEndClassEvent).render();
  }

  getVarName() {
    return this.varName;
  }
}
export default EndClassGroup;

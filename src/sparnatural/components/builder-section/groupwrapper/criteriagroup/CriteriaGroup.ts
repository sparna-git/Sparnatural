/**
 * A single line/criteria
 **/

import { getSettings } from "../../../../../configs/client-configs/settings";
import ISpecProvider from "../../../../spec-providers/ISpecProviders";
import ActionsGroup from "../../../actions/ActionsGroup";
import UnselectBtn from "../../../buttons/UnselectBtn";
import ObjectPropertyGroup from "./objectpropertygroup/ObjectPropertyGroup";
import EndClassGroup from "./startendclassgroup/EndClassGroup";
import StartClassGroup from "./startendclassgroup/StartClassGroup";
import GroupWrapper from "../GroupWrapper";
import { OptionsGroup } from "./optionsgroup/OptionsGroup";
import HTMLComponent from "../../../HtmlComponent";
import { SelectedVal } from "../../../../sparql/ISparJson";

class CriteriaGroup extends HTMLComponent {
  settings: any;
  StartClassGroup: StartClassGroup;
  OptionsGroup: OptionsGroup; // optional or notexists
  ObjectPropertyGroup: ObjectPropertyGroup;
  EndClassGroup: EndClassGroup;
  ActionsGroup: ActionsGroup;
  specProvider: ISpecProvider;
  ParentGroupWrapper: GroupWrapper;
  unselectBtn: UnselectBtn;

  constructor(
    ParentComponent: GroupWrapper,
    specProvider: any,
    startClassVal?: SelectedVal
  ) {
    super("CriteriaGroup", ParentComponent, null);
    this.specProvider = specProvider;
    this.ParentGroupWrapper = ParentComponent;
    this.StartClassGroup = new StartClassGroup(
      this,
      this.specProvider,
      startClassVal
    );
  }

  render(): this {
    super.render();
    this.#renderChildComponents();
    this.unselectBtn = new UnselectBtn(this, () => {
      // caught in Parentcomponent
      this.html[0].dispatchEvent(
        new CustomEvent("onRemoveGrp", { bubbles: true })
      );
    }).render();
    return this;
  }

  #renderChildComponents() {
    // create all the elements of the criteria
    this.StartClassGroup.render();
    this.OptionsGroup = new OptionsGroup(this, this.specProvider).render();
    this.ObjectPropertyGroup = new ObjectPropertyGroup(
      this,
      this.specProvider,
      getSettings().langSearch.ObjectPropertyTemporaryLabel
    ).render();
    this.EndClassGroup = new EndClassGroup(this, this.specProvider).render();
    this.ActionsGroup = new ActionsGroup(this, this.specProvider).render();

    this.#assembleComponents();
  }

  #assembleComponents = () => {
    // 1. User selects StartClassVal
    this.html[0].addEventListener(
      "StartClassGroupSelected",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        if (!this.#isSelectedVal(e.detail))
          throw Error(
            "StartClassGroupSelected expects object of type SelectedVal"
          );
        this.ObjectPropertyGroup.onStartClassGroupSelected(e.detail);
        this.EndClassGroup.onStartClassGroupSelected(e.detail);
      }
    );

    // 2. User Selects EndClassVal
    this.html[0].addEventListener("EndClassGroupSelected", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      if (!this.#isSelectedVal(e.detail))
        throw Error("EndClassGroupSelected expects object of type SelectedVal");
      this.ObjectPropertyGroup.onEndClassGroupSelected(e.detail);
    });

    // 3. Automatically selected or User selects ObjectPropertyGrpVal
    this.html[0].addEventListener(
      "onObjectPropertyGroupSelected",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        if (!this.#isSelectedVal(e.detail))
          throw Error(
            "onObjectPropertyGroupSelected expects object of type SelectedVal"
          );
        // if there is already a where connection, don't change anything
        if (!this.ParentGroupWrapper.whereChild)
          this.EndClassGroup.onObjectPropertyGroupSelected(e.detail);
        this.OptionsGroup.onObjectPropertyGroupSelected(
          this.ParentGroupWrapper.optionState
        );
        // if there is already a andSibling don't allow to rerender the ActionAnd again
        if (!this.ParentGroupWrapper.andSibling)
          this.ActionsGroup.onObjectPropertyGroupSelected();
      }
    );
  };

  //set css completed class on GroupWrapper
  initCompleted() {
    this.ParentGroupWrapper.html.addClass("completed");
  }
  #isSelectedVal(payload: any): payload is SelectedVal {
    return "type" in payload && "variable" in payload;
  }
}
export default CriteriaGroup;

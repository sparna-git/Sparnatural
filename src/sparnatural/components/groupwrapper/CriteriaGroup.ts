import ActionsGroup from "../actions/ActionsGroup";
import StartClassGroup from "../startendclassgroup/StartClassGroup";
import { OptionsGroup } from "../optionsgroup/OptionsGroup";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import HTMLComponent from "../../HtmlComponent";
import ObjectPropertyGroup from "../objectpropertygroup/ObjectPropertyGroup";
import GroupWrapper from "./GroupWrapper";
import { getSettings } from "../../../configs/client-configs/settings";
import UnselectBtn from "../buttons/UnselectBtn";
import ISpecProvider from "../../spec-providers/ISpecProviders";

/**
 * A single line/criteria
 **/

class CriteriaGroup extends HTMLComponent {
  settings: any;
  // create all the elements of the criteria
  StartClassGroup: StartClassGroup;
  OptionsGroup: OptionsGroup;
  ObjectPropertyGroup: ObjectPropertyGroup;
  EndClassGroup: EndClassGroup;
  ActionsGroup: ActionsGroup;
  specProvider: ISpecProvider;
  ParentGroupWrapper: GroupWrapper;
  unselectBtn: UnselectBtn;

  constructor(ParentComponent: GroupWrapper, specProvider: any) {
    super("CriteriaGroup", ParentComponent, null);
    this.specProvider = specProvider;
    this.ParentGroupWrapper = ParentComponent;
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
    this.StartClassGroup = new StartClassGroup(
      this,
      this.specProvider
    ).render(); // is startClassVal here actually needed?
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
        if (e.detail === "" || !e.detail)
          throw Error(
            "The Event StartClassGroupSelected expects the startClassVal"
          );
        this.ObjectPropertyGroup.onStartClassGroupSelected(e.detail);
        this.EndClassGroup.onStartClassGroupSelected(e.detail);
      }
    );

    // 2. User Selects EndClassVal
    this.html[0].addEventListener("EndClassGroupSelected", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      if (e.detail === "" || !e.detail)
        throw Error(
          "The Event StartClassGroupSelected expects the startClassVal"
        );
      this.ObjectPropertyGroup.onEndClassGroupSelected(e.detail);
    });

    // 3. Automatically selected or User selects ObjectPropertyGrpVal
    this.html[0].addEventListener(
      "onObjectPropertyGroupSelected",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        this.EndClassGroup.onObjectPropertyGroupSelected(e.detail);
        this.OptionsGroup.onObjectPropertyGroupSelected();
        this.ActionsGroup.onObjectPropertyGroupSelected();
      }
    );
  };

  //set css completed class on GroupWrapper

  initCompleted() {
    this.ParentGroupWrapper.html.addClass("completed");
  }
}
export default CriteriaGroup;

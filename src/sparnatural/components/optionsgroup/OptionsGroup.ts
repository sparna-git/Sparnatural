import CriteriaGroup from "../groupwrapper/CriteriaGroup";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import OptionalComponent from "./optioncomponents/OptionalComponent";
import NotExistsComponent from "./optioncomponents/NotExistsComponent";
import HTMLComponent from "../../HtmlComponent";
import OptionalArrow from "../buttons/OptionalArrow";

/**
 * Contains the components for Optional and not exists arrow.
 * Components can be triggered when:
 * 1. None of the parents rows (list elements) has it already chosen
 **/
export class OptionsGroup extends HTMLComponent {
  ParentCriteriaGroup: CriteriaGroup;
  valuesSelected: { [key: string]: boolean };
  OptionalComponent: OptionalComponent;
  NotExistsComponent: NotExistsComponent;
  crtGroupId: number;
  specProvider: ISpecProvider;
  backArrow: OptionalArrow;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("OptionsGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.valuesSelected = {};
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;
    this.OptionalComponent = new OptionalComponent(
      this,
      specProvider,
      this.crtGroupId
    );
    this.NotExistsComponent = new NotExistsComponent(
      this,
      specProvider,
      this.crtGroupId
    );
  }

  render() {
    super.render();
    // if there were values selected delete it
    this.valuesSelected = {};
    return this;
  }

  // called by ParentCriteriaGroup
  onObjectPropertyGroupSelected() {
    this.#checkIfBackArrowisRenderable();
  }

  // validates if the Options Arrow can be rendered or not
  #checkIfBackArrowisRenderable() {
    if (this.#checkIfOptionsPossible && !this.backArrow) {
      //Options like NOTEXISTS are possible and none of the parent has it already activated
      this.#addOptionsPossible();
    }
  }

  #renderOptionalComponents() {
    // MUST BE WRAPPED INTO LIST DIV
    this.OptionalComponent.render();
    this.NotExistsComponent.render();
    this.html[0].dispatchEvent(new CustomEvent('initGeneralEvent',{bubbles:true}))
  }

  #addOptionsPossible() {
    this.#renderOptionsGroupBackArrow();
  }

  #checkIfOptionsPossible(): boolean {
    return (
      this.specProvider.isEnablingOptional(
        this.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal
      ) &&
      this.specProvider.isEnablingNegation(
        this.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal
      )
    );
  }

  #removeOptionalComponents() {
    this.OptionalComponent.html.remove();
    this.NotExistsComponent.html.remove();
    this.html[0].dispatchEvent(new CustomEvent('initGeneralEvent',{bubbles:true}))
  }

  #renderOptionsGroupBackArrow() {
    this.backArrow = new OptionalArrow(this, (selected: boolean) => {
      selected
        ? this.#renderOptionalComponents()
        : this.#removeOptionalComponents();
    }).render();
  }
}

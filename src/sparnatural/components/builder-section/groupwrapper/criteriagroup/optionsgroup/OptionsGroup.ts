import { deprecate } from "util";
import { ISparnaturalSpecification } from "../../../../../spec-providers/ISparnaturalSpecification";
import OptionalArrow from "../../../../buttons/OptionalArrow";
import { HTMLComponent } from "../../../../HtmlComponent";
import CriteriaGroup from "../CriteriaGroup";
import NotExistsComponent from "./optioncomponents/NotExistsComponent";
import OptionalComponent from "./optioncomponents/OptionalComponent";

/**
 * Name corresponds to the CSS class set on the CriteriaGroup and the linkWhereBottom
 * See TriggerOption.switchState()
 */
export enum OptionTypes {
  OPTIONAL = "optionalEnabled",
  NOTEXISTS = "notExistsEnabled",
  SERVICE = "serviceEnabled",
  NONE = "noOption",
}

/**
 * Contains the components for Optional and not exists arrow.
 * Components can be triggered when:
 * 1. None of the parents rows (list elements) has it already chosen
 **/
export class OptionsGroup extends HTMLComponent {
  ParentCriteriaGroup: CriteriaGroup;
  OptionalComponent: OptionalComponent;
  NotExistsComponent: NotExistsComponent;
  specProvider: ISparnaturalSpecification;
  optionalArrow: OptionalArrow;

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISparnaturalSpecification) {
    super("OptionsGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;
    this.OptionalComponent = new OptionalComponent(this);
    this.NotExistsComponent = new NotExistsComponent(this);
  }

  render() {
    super.render();
    return this;
  }

  // called by ParentCriteriaGroup
  onObjectPropertyGroupSelected(optionState: OptionTypes) {
    this.#checkIfoptionalArrowisRenderable(optionState);
  }

  // validates if the Options Arrow can be rendered or not
  #checkIfoptionalArrowisRenderable(optionState: OptionTypes) {
    if (
      this.#checkIfOptionsPossible()
      &&
      !this.optionalArrow
      &&
      optionState == OptionTypes.NONE
    ) {
      //Options like NOTEXISTS are possible and none of the parent has it already activated
      this.#addOptionsPossible();
    }
  }

  #renderOptionalComponents() {
    // MUST BE WRAPPED INTO LIST DIV
    if(
      this.specProvider.getProperty(
        this.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal.type
      ).isEnablingOptional()
    ) {
      this.OptionalComponent.render();
    }

    if(
      this.specProvider.getProperty(
        this.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal.type
      ).isEnablingNegation()
    ) {
      this.NotExistsComponent.render();
    }
    
    this.html[0].dispatchEvent(
      new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
    );
  }

  #addOptionsPossible() {
    this.#renderOptionsGroupoptionalArrow();
  }

  #checkIfOptionsPossible(): boolean {
    return (
      this.specProvider.getProperty(
        this.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal.type
      ).isEnablingOptional()
      ||
      this.specProvider.getProperty(
        this.ParentCriteriaGroup.ObjectPropertyGroup.objectPropVal.type
      ).isEnablingNegation()
    );
  }

  #removeOptionalComponents() {
    this.OptionalComponent.html.remove();
    this.NotExistsComponent.html.remove();
    this.html[0].dispatchEvent(
      new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
    );
  }

  #renderOptionsGroupoptionalArrow() {
    this.optionalArrow = new OptionalArrow(this, (selected: boolean) => {
      selected
        ? this.#renderOptionalComponents()
        : this.#removeOptionalComponents();
    }).render();
  }
}

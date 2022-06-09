import UiuxConfig from "../../../../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../../../../spec-providers/ISpecProviders";
import ArrowComponent from "../../../../../arrows/ArrowComponent";
import HTMLComponent from "../../../../../HtmlComponent";
import GroupWrapper from "../../../GroupWrapper";
import { OptionsGroup, OptionTypes } from "../OptionsGroup";

/*
    This is the base class for the optioncomponents such as NotExistComponent or OptionalComponent
*/
class BaseOptionComponent extends HTMLComponent {
  // If you would like to change the shape of the Arrow. Do it here
  frontArrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_FRONT
  );
  backArrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_BACK
  );
  default_value: string = "";
  ParentOptionsGroup: OptionsGroup;
  parentWrapper:GroupWrapper
  label: string;
  inputElement: JQuery<HTMLElement>;
  name: string;
  objectId: any;
  specProvider: ISpecProvider;
  type: OptionTypes;
  constructor(
    baseCssClass: string,
    type:OptionTypes,
    ParentComponent: OptionsGroup,
    specProvider: ISpecProvider,
    name: string
  ) {
    super(baseCssClass, ParentComponent, null);
    this.name = name;
    this.ParentOptionsGroup = ParentComponent as OptionsGroup;
    this.specProvider = specProvider;
    this.parentWrapper = this.ParentOptionsGroup.ParentCriteriaGroup.ParentGroupWrapper;
    this.type = type
  }

  render(): this {
    this.inputElement = $(
      `<input type="radio" name="${this.name}" ${this.default_value} />`
    );

    // htmlStructure rendering:
    super.render();
    this.html.append(this.inputElement);
    this.backArrow.render();
    this.html.append($(`<span>${this.label}</span>`));
    this.frontArrow.render();

    return this;
  }

  // Optional or notExists button got clicked. handle the css and state
  onChange() { 
    this.html[0].dispatchEvent(new CustomEvent('optionTriggered',{bubbles:true,detail:this.type}))
  }
}

export default BaseOptionComponent;

import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import ArrowComponent from "../../arrows/ArrowComponent";
import { OptionsGroup } from "../OptionsGroup";
import HTMLComponent from "../../../HtmlComponent";
import GroupWrapper from "../../criterialist/GroupWrapper";

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
  label: string;
  inputElement: JQuery<HTMLElement>;
  name: string;
  id: string;
  objectId: any;
  specProvider: ISpecProvider;
  constructor(
    baseCssClass: string,
    ParentComponent: OptionsGroup,
    specProvider: ISpecProvider,
    name: string,
    crtGroupId: number
  ) {
    super(baseCssClass, ParentComponent, null);
    this.name = name;
    this.id = `option-${crtGroupId}`;
    this.ParentOptionsGroup = ParentComponent as OptionsGroup;
    this.specProvider = specProvider;
  }

  render(): this {
    this.inputElement = $(
      `<input type="radio" name="${this.name}" data-id="${this.id}" ${this.default_value} />`
    );

    // htmlStructure rendering:
    super.render();
    this.html.append(this.inputElement);
    this.backArrow.render();
    this.html.append($(`<span>${this.label}</span>`));
    this.frontArrow.render();

    return this;
  }

  onChange(cls: string) {
    // get the ref to the list element
    let wrapperRef =
      this.ParentOptionsGroup.ParentCriteriaGroup.ParentGroupWrapper;
    wrapperRef.traverse((grpWarpper: GroupWrapper) => {
      grpWarpper.html.hasClass(cls)
        ? grpWarpper.html.removeClass(cls)
        : grpWarpper.html.addClass(cls);
      // add here code to hide the OptionsGroup in child classes
      grpWarpper.CriteriaGroup.OptionsGroup.backArrow.html.toggle();
    });
  }
}

export default BaseOptionComponent;

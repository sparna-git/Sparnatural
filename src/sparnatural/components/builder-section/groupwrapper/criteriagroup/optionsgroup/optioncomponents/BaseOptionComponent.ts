import UiuxConfig from "../../../../../../../configs/fixed-configs/UiuxConfig";
import ISpecProvider from "../../../../../../spec-providers/ISpecProviders";
import ArrowComponent from "../../../../../arrows/ArrowComponent";
import HTMLComponent from "../../../../../HtmlComponent";
import GroupWrapper from "../../../GroupWrapper";
import { OptionsGroup } from "../OptionsGroup";

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
    this.parentWrapper = this.ParentOptionsGroup.ParentCriteriaGroup.ParentGroupWrapper;
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

  // Optional or notExists button got clicked. handle the css and state
  onChange(cls: string) {      
    this.parentWrapper.traverse((grpWrapper: GroupWrapper) => {
      switch(cls){
        case 'notExistsEnabled':
          grpWrapper.notexists ? false : true
          //remove optional enabled class if activated
          if(grpWrapper.optional) this.#handleCSS(grpWrapper,'optionalEnabled')
          grpWrapper.optional = false
          //toggle notExistsEnabled class
          this.#handleCSS(grpWrapper,cls)
          break;
        case 'optionalEnabled':
          grpWrapper.optional ? false : true
          // remove notExistsEnabled class if activated
          if(grpWrapper.notexists) this.#handleCSS(grpWrapper,'notExistsEnabled')
          grpWrapper.notexists = false
          // toggle optionalEnabled
          this.#handleCSS(grpWrapper,cls)
          break;
        default:
          throw Error(`OptionComponent clicked doesn't recognize type: ${this.baseCssClass}`)
      }
    });
  }

  #handleCSS(grpWrapper:GroupWrapper,cls: string){
    grpWrapper.CriteriaGroup.html[0].classList.toggle(cls)
    if(grpWrapper.whereChild) grpWrapper.linkWhereBottom.html[0].classList.toggle(cls)


    //skip the toggling for this parentWrapper
    if (grpWrapper != this.parentWrapper) {
      if(grpWrapper.andSibling) grpWrapper.linkAndBottom.html[0].classList.toggle(cls)
      //remove the optional possibilities for child groups
      grpWrapper.CriteriaGroup.OptionsGroup.backArrow.html.toggle();
    }
  }
}

export default BaseOptionComponent;

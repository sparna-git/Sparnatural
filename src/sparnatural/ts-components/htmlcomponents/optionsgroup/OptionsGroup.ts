import {
  eventProxiCriteria,
  redrawBottomLink,
} from "../../globals/globalfunctions";
import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import CriteriaGroup from "../CriteriaGroup";
import HTMLComponent from "../HtmlComponent";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import ArrowComponent from "../arrows/ArrowComponent";
import OptionalComponent from "./optioncomponents/OptionalComponent";
import NotExistsComponent from "./optioncomponents/NotExistsComponent";

/**
 * Contains the components for Optional and not exists arrow.
 * Can be triggered when there was a EndClassGroup selected.
 **/
export class OptionsGroup extends HTMLComponent {
  ParentCriteriaGroup: CriteriaGroup;
  valuesSelected: { [key: string]: boolean };
  OptionalComponent: OptionalComponent 
  NotExistsComponent: NotExistsComponent
  crtGroupId:number
  backArrow: ArrowComponent = new ArrowComponent(
    this,
    UiuxConfig.COMPONENT_ARROW_BACK
  );
  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("OptionsGroup", ParentCriteriaGroup, specProvider, null);
    this.valuesSelected = {};
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;
    this.crtGroupId = ParentCriteriaGroup.id
    this.OptionalComponent = new OptionalComponent(this,specProvider,this.crtGroupId)
    this.NotExistsComponent = new NotExistsComponent(this,specProvider,this.crtGroupId)
    this.backArrow.cssClasses.Invisible = true;
  }
  //TODO refactor to render()
  // still necessary after refactoring the EndClassGroup on remove selected?
  render() {
    super.render();
    this.backArrow.render();

    if ($(this.html).find(".EditComponents").first().hasClass("Enabled")) {
      $(this.html).removeClass("Opended");
      redrawBottomLink($(this.html).parents("li.groupe").first());
    }
    $(this.html).removeClass("Disabled");
    $(this.html).removeClass("NoOptionEnabled");
    $(this.html).removeClass("Enabled");
    $(this.html).removeClass("ShowOnEdit");
    $(this.html).first().unbind("click");
    $(this.html).find(".input-val input").unbind("click");
    $(this.html).find(".input-val label").unbind("click");
    // if there were values selected delete it
    this.valuesSelected = {};
    return this;
  }

 

  onObjectPropertyGroupSelected() {
    console.log("optionsgroup onObjectPropertyGroupSelected");
    $(this.html).addClass("ShowOnEdit");

    var parentOptionEnable = false;
    let listElements = this.ParentCriteriaGroup.liRef.find('li.groupe')

    listElements.each((i)=>{
      // a parent li has the options enabled
      if($(listElements[i]).hasClass('optionEnabled')){
        parentOptionEnable = true
        this.ParentCriteriaGroup.html.addClass("OptionMenuShowed")
      }
    });

    if(this.#checkIfOptionPossible && !(parentOptionEnable)){
      this.#addOptionPossible()
    }else{
      this.#addNoOptionPossible()
      if(parentOptionEnable){
        $(this.ParentCriteriaGroup.html).addClass("OptionMenuShowed");
      }
    }

    // opens the Optional and negatif options
    $(this.backArrow.html).on("click", (e) =>{
      // check if OptionsGroup has the Class Enabled
      //TODO refactor get away from this html class checks
      if ($(this.html).hasClass("Enabled")) {
        this.#renderOptionalComponents()
        $(e.target).toggleClass("Opended");

        redrawBottomLink(this.ParentCriteriaGroup.liRef);
      }
    });


  }

  #renderOptionalComponents(){
    // MUST BE WRAPPED INTO LIST DIV
    this.OptionalComponent.render()
    this.NotExistsComponent.render()
  }

  #addNoOptionPossible(){
    this.html.removeClass("NoOptionEnabled")
    this.html.addClass("Disabled")
  }

  #addOptionPossible(){
    this.renderOptionsGroupBackArrow();
    $(this.html).addClass("Enabled");
    $(this.ParentCriteriaGroup.html).addClass("OptionMenuShowed");
  }

  #checkIfOptionPossible():boolean{
    return  (
      (this.specProvider.isEnablingOptional(
        this.ParentCriteriaGroup.ObjectPropertyGroup.value_selected
      ) &&
        this.specProvider.isEnablingNegation(
          this.ParentCriteriaGroup.ObjectPropertyGroup.value_selected
        )
      )
    ) 
  }

  //This method only gets called on StartClassGroup.InputTypeComponent
  // When the StartClassGroup is selected, then change the Front arrow to the back arrow
  renderOptionsGroupBackArrow() {
    console.log("renderOptionalBackArrow");
    this.backArrow.html.removeClass("Invisible")
  }
}

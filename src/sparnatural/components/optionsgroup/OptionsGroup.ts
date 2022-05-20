import {
  redrawBottomLink,
} from "../../globals/globalfunctions";
import CriteriaGroup from "../criterialist/CriteriaGroup";
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
  OptionalComponent: OptionalComponent 
  NotExistsComponent: NotExistsComponent
  crtGroupId:number
  specProvider: ISpecProvider;
  backArrow: OptionalArrow;
  

  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("OptionsGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider
    this.valuesSelected = {};
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;
    this.OptionalComponent = new OptionalComponent(this,specProvider,this.crtGroupId)
    this.NotExistsComponent = new NotExistsComponent(this,specProvider,this.crtGroupId)

  }

  render() {
    super.render();
    // if there were values selected delete it
    this.valuesSelected = {};
    return this;
  }

  // called by ParentCriteriaGroup
  onObjectPropertyGroupSelected() {
    $(this.html).addClass("ShowOnEdit");
    this.#checkIfBackArrowisRenderable()  
  }

  // validates if the Options Arrow can be rendered or not
  #checkIfBackArrowisRenderable(){
    if(this.#checkIfOptionsPossible){
      //Options like NOTEXISTS are possible and none of the parent has it already activated
      this.#addOptionsPossible()
    }
  }

  #renderOptionalComponents(){
    // MUST BE WRAPPED INTO LIST DIV
    this.OptionalComponent.render()
    this.NotExistsComponent.render()
  }

  #addOptionsPossible(){
    this.#renderOptionsGroupBackArrow();
  }

  #checkIfOptionsPossible():boolean{
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

  #removeOptionalComponents(){
    this.OptionalComponent.html.remove()
    this.NotExistsComponent.html.remove()
  }

  #renderOptionsGroupBackArrow() {
    this.backArrow = new OptionalArrow(this,(selected:boolean)=>{
      selected ? this.#renderOptionalComponents() : this.#removeOptionalComponents()
      redrawBottomLink(this.ParentCriteriaGroup.ParentGroupWrapper.html);
    }).render()
  }
}

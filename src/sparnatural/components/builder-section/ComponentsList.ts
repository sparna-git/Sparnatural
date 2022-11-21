import ISpecProvider from "../../spec-providers/ISpecProvider";
import HTMLComponent from "../HtmlComponent";
import GroupWrapper from "./groupwrapper/GroupWrapper";

/*
    Componentslist does correspond to the <ul class="componentsListe"> OR <ul class="childsList">
    Depending on the ParentComponent. If BGWrapper is parent, then it is the root Componentslist
    Componentslist holds a list of GroupWrapper siblings added with 'addAndComponent'.
*/
class ComponentsList extends HTMLComponent {
  specProvider: ISpecProvider;
  rootGroupWrapper: GroupWrapper;
  constructor(ParentComponent: HTMLComponent, specProvider: ISpecProvider) {
    super("componentsListe", ParentComponent, null);
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();
    this.initFirstGroupWrapper();
    return this;
  }

  initFirstGroupWrapper() {
    this.rootGroupWrapper = new GroupWrapper(this, this.specProvider,undefined,true).render();
    // The first criteriaGrp always has the "eye" icon to select it as a variable in the result set
    this.rootGroupWrapper.CriteriaGroup.StartClassGroup.inputTypeComponent.selectViewVariableBtn.render()
  }
}

export default ComponentsList;

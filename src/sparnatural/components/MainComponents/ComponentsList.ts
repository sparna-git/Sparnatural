import HTMLComponent from "../../HtmlComponent";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import GroupWrapper from "../criterialist/GroupWrapper";

/*
    Componentslist does correspond to the <ul class="componentsListe"> OR <ul class="childsList">
    Depending on the ParentComponent. If BGWrapper is parent, then it is the root Componentslist
    Componentslist holds a list of GroupWrapper siblings added with 'addAndComponent'.
*/
class ComponentsList extends HTMLComponent {
  specProvider: ISpecProvider;
  rootGroupWrapper:GroupWrapper
    constructor(ParentComponent:HTMLComponent,specProvider:ISpecProvider){
        super('componentsListe',ParentComponent,null)
        this.specProvider = specProvider
    }

    render(): this {
      console.log('componentslist render')
        super.render()
        this.initFirstGroupWrapper()
        this.rootGroupWrapper.CriteriaGroup.html.find(".StartClassGroup .nice-select:not(.disabled)")
        .trigger("click");
        return this
    }

    initFirstGroupWrapper(){
      this.rootGroupWrapper = new GroupWrapper(this,this.specProvider,null).render()
    }

}



export default ComponentsList
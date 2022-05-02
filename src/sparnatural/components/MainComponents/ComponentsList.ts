import HTMLComponent from "../../HtmlComponent";
import GroupWrapper from "../criterialist/GroupWrapper";
import LienTop from "../criterialist/LienTop";
import BgWrapper from "./BgWrapper";

/*
    Componentslist does correspond to the <ul class="componentsListe"> OR <ul class="childsList">
    Depending on the ParentComponent. If BGWrapper parent then it is the root Componentslist
    Componentslist holds a list of GroupWrapper siblings add with 'addAndComponent'.
*/
class ComponentsList extends HTMLComponent {
    LienTop = new LienTop(this)
    GroupWrappers:Array<GroupWrapper> = []
    constructor(ParentComponent:HTMLComponent){
        let baseCssClass = isRootComponentsList(ParentComponent)? 'componentsListe' : 'childsList'
        super(baseCssClass,ParentComponent,null)
    }

    render(): this {
        super.render()
        if(isRootComponentsList(this.ParentComponent)) this.LienTop.render()
        return this
    }

    //add GroupWrapper as a Sibling
    addAndComponent(){

    }

    // Create a SubComponentsList and add the GroupWrapper there
    // activate lien top
    //give it additional class childsList
    addWhereComponent(){

    }
}
function isRootComponentsList(
    ParentComponent: HTMLComponent
  ): ParentComponent is BgWrapper {
    return (
      (ParentComponent as BgWrapper).baseCssClass ===
      "bg-wrapper"
    );
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
export default ComponentsList
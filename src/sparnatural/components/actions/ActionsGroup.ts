
import CriteriaGroup from "../criterialist/CriteriaGroup";
import { eventProxiCriteria } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import ActionWhere from "./actioncomponents/ActionWhere";
import ActionAnd from "./actioncomponents/ActionAnd";
import HTMLComponent from "../../HtmlComponent";
import UnselectBtn from "../buttons/UnselectBtn";

/**
 	Groups all the actions on a line/criteria (AND / REMOVE / WHERE)
	even if they are visually not connected. ActionWhere for example is rendered under EndClassGroup -> EditComponent -> ActionWhere
 **/
class ActionsGroup extends HTMLComponent {
  actions: {
    ActionWhere: ActionWhere;
    ActionAnd: ActionAnd;
  };
  RemoveCrtGroup:UnselectBtn
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider:ISpecProvider,
  ) {
    super("ActionsGroup", ParentCriteriaGroup,  null);
    this.specProvider = specProvider
    //TODO refactor is this even necessary
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;

  }

  render(){
    super.render()
    return this
  }

  onCreated() {

    if (this.ParentCriteriaGroup.jsonQueryBranch != null) {
      var branch = this.ParentCriteriaGroup.jsonQueryBranch;
      if (branch.children.length > 0) {
        $(this.actions.ActionWhere.html).find("a").trigger("click");
      }
      if (branch.nextSibling != null) {
        $(this.actions.ActionAnd.html).find("a").trigger("click");
      }
    }
  }

  onObjectPropertyGroupSelected() {
    this.actions.ActionAnd = new ActionAnd(this,this.#onAddAnd).render()
    this.actions.ActionWhere = new ActionWhere(this, this.specProvider,this.#onAddWhere).render()

    this.html[0].dispatchEvent(new CustomEvent('initGeneralEvent',{bubbles:true}))
  }

  // This code should probably be in a higher located component such as criteria group or even higher(might need to introduce one)
  #onAddWhere() {
    this.ParentCriteriaGroup.html.parent("li").addClass("hasWhereChild");
    this.ParentCriteriaGroup.initCompleted();
    this.html[0].dispatchEvent(new CustomEvent('addWhereComponent',{bubbles:true}))
    // trigger 2 clicks to select the same class as the object class (?)
  
  }
  #onAddAnd() {
    this.#deactivateOnHover()
    this.actions.ActionAnd.html[0].dispatchEvent(new CustomEvent('addAndComponent',{bubbles:true}))
    return false;
  }

  // deactivate onHover function and remove it. Could also make it invisible?
  #deactivateOnHover(){
    let remCss = $(this.actions.ActionAnd.html).remove()
    if(remCss.length == 0) throw Error(`Didn't find ActionAnd Component. ActionAnd.html:${this.actions.ActionAnd.html}`)
  }
}
export default ActionsGroup;

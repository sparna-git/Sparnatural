
import CriteriaGroup from "../criterialist/CriteriaGroup";
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

  onObjectPropertyGroupSelected() {
    this.actions = {
      ActionAnd: new ActionAnd(this,this.#onAddAnd).render()
    }

    this.html[0].dispatchEvent(new CustomEvent('initGeneralEvent',{bubbles:true}))
  }

  // This code should probably be in a higher located component such as criteria group or even higher(might need to introduce one)
  #onAddAnd = ()=> {
    this.actions.ActionAnd.html[0].dispatchEvent(new CustomEvent('addAndComponent',{bubbles:true}))
    this.#removeActionAnd()
    return false;
  }

  // deactivate onHover function and remove it. Could also make it invisible?
  #removeActionAnd(){
    let remCss = $(this.actions.ActionAnd.html).remove()
    if(remCss.length == 0) throw Error(`Didn't find ActionAnd Component. ActionAnd.html:${this.actions.ActionAnd.html}`)
  }
}
export default ActionsGroup;

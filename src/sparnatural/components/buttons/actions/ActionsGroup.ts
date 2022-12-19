import ISpecProvider from "../../../spec-providers/ISpecProvider";
import CriteriaGroup from "../../builder-section/groupwrapper/criteriagroup/CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";
import ActionAnd from "./actioncomponents/ActionAnd";

/**
 	Groups all the actions on a line/criteria (AND / REMOVE / WHERE)
	even if they are visually not connected. ActionWhere for example is rendered under ObjectSelector -> EditComponent -> ActionWhere
 **/
class ActionsGroup extends HTMLComponent {
  actions: {
    ActionAnd: ActionAnd;
  };
  ParentCriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("ActionsGroup", ParentCriteriaGroup, null);
    this.specProvider = specProvider;
    //TODO refactor is this even necessary
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;
  }

  render() {
    super.render();
    return this;
  }

  onPredicateSelectorSelected() {
    this.actions = {
      ActionAnd: new ActionAnd(this, this.#onAddAnd).render(),
    };
  }

  // This code should probably be in a higher located component such as criteria group or even higher(might need to introduce one)
  #onAddAnd = () => {
    this.actions.ActionAnd.html[0].dispatchEvent(
      new CustomEvent("addAndComponent", {
        bubbles: true,
        detail: this.ParentCriteriaGroup.SubjectSelector.subjectVal,
      })
    );
  };
}
export default ActionsGroup;

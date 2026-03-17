import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import CriteriaGroup from "../../builder-section/groupwrapper/criteriagroup/CriteriaGroup";
import { HTMLComponent } from "../../HtmlComponent";
import ActionAnd from "./actioncomponents/ActionAnd";

/**
 	Groups all the actions on a line/criteria (AND / REMOVE / WHERE)
	even if they are visually not connected. ActionWhere for example is rendered under EndClassGroup -> EditComponent -> ActionWhere
 **/
class ActionsGroup extends HTMLComponent {
  actions: {
    actionAnd: ActionAnd;
  };
  parentCriteriaGroup: CriteriaGroup;
  specProvider: ISparnaturalSpecification;

  constructor(parentCriteriaGroup: CriteriaGroup, specProvider: ISparnaturalSpecification) {
    super("ActionsGroup", parentCriteriaGroup, null);
    this.specProvider = specProvider;
    //TODO refactor is this even necessary
    this.parentCriteriaGroup = parentCriteriaGroup as CriteriaGroup;
  }

  render() {
    super.render();
    return this;
  }

  onObjectPropertyGroupSelected() {
    this.actions = {
      actionAnd: new ActionAnd(this, this.#onAddAnd).render(),
    };
  }

  // This code should probably be in a higher located component such as criteria group or even higher(might need to introduce one)
  #onAddAnd = () => {
    this.actions.actionAnd.html[0].dispatchEvent(
      new CustomEvent("addAndComponent", {
        bubbles: true,
        detail: this.parentCriteriaGroup.startClassGroup.startClassVal,
      })
    );
  };
}
export default ActionsGroup;

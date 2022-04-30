
import CriteriaGroup from "../criteriaList/CriteriaGroup";
import ISettings from "../../../configs/client-configs/ISettings";
import { eventProxiCriteria } from "../../globals/globalfunctions";
import { initGeneralEvent } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import ActionWhere from "./actioncomponents/ActionWhere";
import ActionAnd from "./actioncomponents/ActionAnd";
import HTMLComponent from "../HtmlComponent";
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
  settings: ISettings;
  ParentCriteriaGroup: CriteriaGroup;
  constructor(
    ParentCriteriaGroup: CriteriaGroup,
    specProvider:ISpecProvider,
    settings: ISettings
  ) {
    super("ActionsGroup", ParentCriteriaGroup,  null);
    this.actions = {
      ActionWhere: new ActionWhere(this, specProvider,settings),
      ActionAnd: new ActionAnd(this, settings),
    };
    //TODO refactor is this even necessary
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;
    this.settings = settings;

  }

  render(){
    super.render()
    return this
  }

  onCreated() {
    
    this.#attachActionRemoveButtonToCriteriaGroup();

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

  /*
		Create the ActionRemove button which deletes a row when clicked. 
		Add this Button to the CriteriaGroup e.g row 
		TODO: Refactor to ActionRemove class. ActionRemove class should get render() method
	*/
  #attachActionRemoveButtonToCriteriaGroup() {
    this.RemoveCrtGroup = new UnselectBtn(this,this.ParentCriteriaGroup.ParentCriteriaList.onRemoveCriteriaGroup).render()
  }

  onObjectPropertyGroupSelected() {
    this.#renderActionAnd();
    this.#renderActionWhere();

    initGeneralEvent(this, this.ParentCriteriaGroup.thisForm_);
  }
  /*
		Create the ActionAnd button which adds another row. 
		TODO: Refactor to ActionAnd class. ActionRemove class should get render() method
	*/
  #renderActionAnd() {
    this.actions.ActionAnd.render();
    $(this.actions.ActionAnd.html).find("a").on(
      "click",
      {
        arg1: this,
        arg2: "onAddAnd",
      },
      eventProxiCriteria
    );
  }
  /*
		Create the ActionWhere button which opens another where row
		TODO: Refactor to ActionAnd class. ActionRemove class should get render() method
	*/
  #renderActionWhere() {


    this.actions.ActionWhere.render();
    $(this.actions.ActionWhere.html).find("a").on(
      "click",
      {
        arg1: this,
        arg2: "onAddWhere",
      },
      eventProxiCriteria
    );
  }

  // This code should probably be in a higher located component such as criteria group or even higher(might need to introduce one)
  onAddWhere() {
    this.ParentCriteriaGroup.html.parent("li").addClass("hasWhereChild");
    this.ParentCriteriaGroup.initCompleted();

    var new_component = this.ParentCriteriaGroup.ParentCriteriaList.addComponent.call(
      this,
      this.ParentCriteriaGroup.thisForm_,
      this.ParentCriteriaGroup.ComponentHtml,
      this.ParentCriteriaGroup.jsonQueryBranch &&
        this.ParentCriteriaGroup.jsonQueryBranch.children &&
        this.ParentCriteriaGroup.jsonQueryBranch.children.length > 0
        ? this.ParentCriteriaGroup.jsonQueryBranch.children[0]
        : null
    );

    // trigger 2 clicks to select the same class as the object class (?)
    $(new_component)
      .find(".StartClassGroup .nice-select:not(.disabled)")
      .trigger("click");
    $(new_component)
      .find(".StartClassGroup .nice-select:not(.disabled)")
      .trigger("click");
  }
  onAddAnd() {
    this.#deactivateOnHover()
    var new_component = this.ParentCriteriaGroup.ParentCriteriaList.addComponent.call(
      this,
      this.ParentCriteriaGroup.thisForm_,
      this.ParentCriteriaGroup.AncestorComponentHtml,
      this.ParentCriteriaGroup.jsonQueryBranch
        ? this.ParentCriteriaGroup.jsonQueryBranch.nextSibling
        : null
    );

    // trigger 2 clicks to select the same class as the current criteria (?)
    $(new_component)
      .find(".StartClassGroup .nice-select:not(.disabled)")
      .trigger("click");
    $(new_component)
      .find(".StartClassGroup .nice-select:not(.disabled)")
      .trigger("click");

    return false;
  }

  // deactivate onHover function and remove it. Could also make it invisible?
  #deactivateOnHover(){
    let remCss = $(this.actions.ActionAnd.html).remove()
    console.dir(remCss)
    if(remCss.length == 0) throw Error(`Didn't find ActionAnd Component. ActionAnd.html:${this.actions.ActionAnd.html}`)
  }
}
export default ActionsGroup;

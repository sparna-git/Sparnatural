import { I18n } from "../../../../settings/I18n";
import ISparnaturalSpecification from "../../../../spec-providers/ISparnaturalSpecification";
import EditComponents from "../../../builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import HTMLComponent from "../../../HtmlComponent";
import UiuxConfig from "../../../IconsConstants";

/*
    The parent component here is in the beginning the ActionsGroup component. That seems very useless. 
    check if there are any things going on eith ActionWhere.ParenComponent except the rendering in render()
    There the Endclassgroup is foun
*/
class ActionWhere extends HTMLComponent {
  parentComponent: EditComponents;
  specProvider: ISparnaturalSpecification;
  callBack: () => void;
  btn: JQuery<HTMLElement>;
  constructor(
    parentComponent: EditComponents,
    specProvider: ISparnaturalSpecification,
    callBack: () => void
  ) {
    //TODO refactor the null init in html widget
    super("ActionWhere", parentComponent, null);
    this.specProvider = specProvider;
    this.callBack = callBack;
    this.parentComponent = parentComponent;
  }
  render = () => {
    super.render();
    var choiceNumber = 2;
    var endLabel = this.specProvider.getEntity(this.parentComponent.endClassVal.type).getLabel();
    

    this.parentComponent.html[0].classList.add("nb-choice-2");

    let editTrait = $(`
    <span class="edit-trait">
      <span class="edit-num"> ${choiceNumber}</span>
    </span>`);
    let where = $(`
      <div> ${I18n.labels.Search} ${endLabel} ${
      I18n.labels.That
    } </div>
    `);
    this.btn = $(`<a>${UiuxConfig.ICON_PLUS}</a>`);
    where = where.add(this.btn[0]);
    editTrait = editTrait.add(where);
    this.btn[0].addEventListener("click", () => {
      this.callBack();
    });
    this.html.append(editTrait);
    return this;
  };
}
export default ActionWhere;

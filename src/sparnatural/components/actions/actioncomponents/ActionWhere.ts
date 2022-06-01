import ISpecProvider from "../../../spec-providers/ISpecProviders";
import { getSettings } from "../../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import EditComponents from "../../builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import { Config } from "../../../../configs/fixed-configs/SparnaturalConfig";

/*
    The parent component here is in the beginning the ActionsGroup component. That seems very useless. 
    check if there are any things going on eith ActionWhere.ParenComponent except the rendering in render()
    There the Endclassgroup is foun
*/
class ActionWhere extends HTMLComponent {
  parentComponent: EditComponents;
  specProvider: ISpecProvider;
  callBack: () => void;
  constructor(
    parentComponent: EditComponents,
    specProvider: ISpecProvider,
    callBack: () => void
  ) {
    //TODO refactor the null init in html widget
    super("ActionWhere", parentComponent, null);
    this.specProvider = specProvider;
    this.callBack = callBack;
    this.parentComponent = parentComponent
  }
  render = () => {
    var choiceNumber = 2;
    if (
      this.parentComponent.widgetWrapper.getWidgetType() ==
      Config.NON_SELECTABLE_PROPERTY
    ) {
      choiceNumber = 1;
    }
    var endLabel = this.specProvider.getLabel(
      this.parentComponent.endClassVal.type
    )

    let newhtml = $(`
      <span class="edit-trait">
        <span class="edit-num"> ${choiceNumber}</span>
      </span>
      <div> ${getSettings().langSearch.Search} ${endLabel} ${
      getSettings().langSearch.That
    } </div>
      
      `);
    let link = $(`<a>+</a>`);
    newhtml = newhtml.add(link);

    this.widgetHtml = newhtml;
    link[0].addEventListener("click", () => {
      this.callBack();
    });
    super.render();
    return this;
  };
}
export default ActionWhere;

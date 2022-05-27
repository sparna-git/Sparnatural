import ISpecProvider from "../../../spec-providers/ISpecProviders";

import { getSettings } from "../../../../configs/client-configs/settings";
import EndClassGroup from "../../builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import HTMLComponent from "../../HtmlComponent";

/*
    The parent component here is in the beginning the ActionsGroup component. That seems very useless. 
    check if there are any things going on eith ActionWhere.ParenComponent except the rendering in render()
    There the Endclassgroup is foun
*/
class ActionWhere extends HTMLComponent {
  ParentComponent: EndClassGroup;
  specProvider: ISpecProvider;
  callBack: () => void;
  constructor(
    ParentComponent: EndClassGroup,
    specProvider: ISpecProvider,
    callBack: () => void
  ) {
    //TODO refactor the null init in html widget
    super("ActionWhere", ParentComponent, null);
    this.specProvider = specProvider;
    this.callBack = callBack;
  }
  render = () => {
    // Endclassgroup -> EditComponents -> ActionWhere
    this.htmlParent = $(this.ParentComponent.html).find(".EditComponents");
    var choiceNumber = 2;
    if (
      this.ParentComponent.endClassWidgetGroup.widgetWrapper.widgetHtml ==
      null
    ) {
      choiceNumber = 1;
    }
    var endLabel = this.specProvider.getLabel(
      (this.ParentComponent as EndClassGroup).endClassVal.type
    );

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

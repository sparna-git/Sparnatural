import ISettings from "../../../../configs/client-configs/ISettings";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import CriteriaGroup from "../../CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";

import ActionsGroup from "../ActionsGroup";

/*
    The parent component here is in the beginning the ActionsGroup component. That seems very useless. 
    check if there are any things going on eith ActionWhere.ParenComponent except the rendering in render()
    There the Endclassgroup is foun
*/
class ActionWhere extends HTMLComponent {
  settings: ISettings;
  GrandParentComponent: CriteriaGroup;
  specProvider: ISpecProvider;
  constructor(
    ParentComponent: ActionsGroup,
    specProvider: ISpecProvider,
    settings: ISettings
  ) {
    //TODO refactor the null init in html widget
    super("ActionWhere", ParentComponent, null);
    this.GrandParentComponent =
      ParentComponent.ParentComponent as CriteriaGroup;
    this.cssClasses.ShowOnEdit = true;
    this.settings = settings;
    this.specProvider = specProvider
  }
  render = () => {
    // Endclassgroup -> EditComponents -> ActionWhere
    var endClassGroup = this.GrandParentComponent.EndClassGroup;
    this.htmlParent = $(endClassGroup.html).find(".EditComponents");
    var choiceNumber = 2;
    if (
      endClassGroup.ParentCriteriaGroup.EndClassWidgetGroup.inputTypeComponent
        .widgetHtml == null
    ) {
      choiceNumber = 1;
      $(endClassGroup.html).addClass("noPropertyWidget");
    } else {
      $(endClassGroup.html).removeClass("noPropertyWidget");
    }
    var endLabel = this.specProvider.getLabel(endClassGroup.value_selected);
    var widgetLabel =
      '<span class="trait-top"></span><span class="edit-trait"><span class="edit-num">' +
      choiceNumber +
      "</span></span>" +
      this.settings.langSearch.Search +
      " " +
      "endlbl:" +
      endLabel +
      " " +
      this.settings.langSearch.That +
      "...";

    this.widgetHtml = $(widgetLabel + "<a>+</a>");
    super.render();
    return this
  };
}
export default ActionWhere;

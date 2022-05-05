import ISpecProvider from "../../../spec-providers/ISpecProviders";
import CriteriaGroup from "../../criterialist/CriteriaGroup";
import HTMLComponent from "../../../HtmlComponent";

import ActionsGroup from "../ActionsGroup";
import { getSettings } from "../../../../configs/client-configs/settings";

/*
    The parent component here is in the beginning the ActionsGroup component. That seems very useless. 
    check if there are any things going on eith ActionWhere.ParenComponent except the rendering in render()
    There the Endclassgroup is foun
*/
class ActionWhere extends HTMLComponent {
  GrandParentComponent: CriteriaGroup;
  specProvider: ISpecProvider;
  callBack: ()=>void;
  constructor(
    ParentComponent: ActionsGroup,
    specProvider: ISpecProvider,
    callBack: ()=>void
  ) {
    //TODO refactor the null init in html widget
    super("ActionWhere", ParentComponent, null);
    this.GrandParentComponent =
      ParentComponent.ParentComponent as CriteriaGroup;
    this.specProvider = specProvider
    this.callBack = callBack
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
    
    let newhtml= $(`
      <span class="edit-trait">
        <span class="edit-num"> ${choiceNumber}</span>
      </span>
      <span> ${getSettings().langSearch.Search} ${endLabel} ${getSettings().langSearch.That} </span>
      
      `)
    let link = $(`<a>+</a>`)
    newhtml = newhtml.add(link)

   // let editTrait = $(`<span class="edit-trait"></span>`)
    //let editNum = $(`<span class="edit-num"> ${choiceNumber}</span>`)
    //let searchThat = $(`<div> ${getSettings().langSearch.Search} ${endLabel} ${getSettings().langSearch.That} <div>`) 
    //var widgetLabel = editTrait.append(editNum).insertAfter(searchThat).insertAfter(link)
    

    this.widgetHtml = newhtml 
    link[0].addEventListener('click',()=>{
      this.callBack()
    })
    super.render();
    return this
  };
}
export default ActionWhere;

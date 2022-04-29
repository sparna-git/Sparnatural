
import HTMLComponent from "../../HtmlComponent";
import ActionsGroup from "../ActionsGroup";


class ActionRemove extends HTMLComponent {
  constructor(parentComponent: ActionsGroup) {
    let widgetHtml = $(
      '<a><span class="unselect"><i class="far fa-times-circle"></i></span></a>'
    );
    super("ActionRemove", parentComponent, widgetHtml);
  }
  render(){
    super.render()
    return this
  }
  
}
export default ActionRemove;

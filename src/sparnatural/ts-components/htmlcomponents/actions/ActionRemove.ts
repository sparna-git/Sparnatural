import ISpecProvider from "../../../spec-providers/ISpecProviders";

import HTMLComponent from "../HtmlComponent";
import ActionsGroup from "./ActionsGroup";

class ActionRemove extends HTMLComponent {
  constructor(parentComponent: ActionsGroup, specProvider: ISpecProvider) {
    let widgetHtml = $(
      '<a><span class="unselect"><i class="far fa-times-circle"></i></span></a>'
    );
    super("ActionRemove", parentComponent, specProvider, widgetHtml);
  }
  render = () => {
    this.init();
  };
}
export default ActionRemove;

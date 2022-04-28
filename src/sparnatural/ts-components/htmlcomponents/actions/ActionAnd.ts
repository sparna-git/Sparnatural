import ISettings from "../../../../configs/client-configs/ISettings";
import HTMLComponent from "../HtmlComponent";
import ISpecProvider from "../../../spec-providers/ISpecProviders";

class ActionAnd extends HTMLComponent {
  HtmlContainer: HTMLComponent;
  constructor(
    parentComponent: HTMLComponent,
    settings: ISettings,
    specProvider: ISpecProvider
  ) {
    let widgetHtml = $(
      '<span class="trait-and-bottom"></span><a>' +
        settings.langSearch.And +
        "</a>"
    );
    super("ActionAnd", parentComponent, specProvider, widgetHtml);
    this.cssClasses.ShowOnHover = true;
    this.HtmlContainer = parentComponent;
  }
  render(){
    super.render()
    return this
  }
}
export default ActionAnd;

import { getSettings } from "../../../../configs/client-configs/settings";
import HTMLComponent from "../../../HtmlComponent";


class ActionAnd extends HTMLComponent {
  HtmlContainer: HTMLComponent;
  constructor(
    parentComponent: HTMLComponent,
  ) {
    let widgetHtml = $(
      '<span class="trait-and-bottom"></span><a>' +
        getSettings().langSearch.And +
        "</a>"
    );
    super("ActionAnd", parentComponent, widgetHtml);
    this.cssClasses.ShowOnHover = true;
    this.HtmlContainer = parentComponent;
  }
  render(){
    super.render()
    return this
  }
}
export default ActionAnd;

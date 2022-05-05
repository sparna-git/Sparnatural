import { getSettings } from "../../../../configs/client-configs/settings";
import HTMLComponent from "../../../HtmlComponent";


class ActionAnd extends HTMLComponent {
  constructor(
    parentComponent: HTMLComponent,
    callBack:()=>void
  ) {
    let link = $(`<a>${getSettings().langSearch.And}</a>`)
    let widgetHtml = $(
      `<span class="trait-and-bottom"></span>`
    ).append(link);
    super("ActionAnd", parentComponent, widgetHtml);
    link[0].addEventListener('click',()=>{
      callBack()
    })
  }
  render(){
    super.render()
    return this
  }
}
export default ActionAnd;

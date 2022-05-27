import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../HtmlComponent";

class AddUserInputBtn extends HTMLComponent {
    callBack: () => void;
    constructor(parentComponent:HTMLComponent, callBack: () => void){
        let widgetHtml = $(`<button class="button-add">
        ${getSettings().langSearch.ButtonAdd}
        </button>`)
        super('AddUserInputBtn',parentComponent,widgetHtml)
        this.callBack = callBack
    }

    render(): this {
        super.render()
        this.widgetHtml[0].addEventListener("click", () => {
            this.callBack();
          });
        return this
    }
}

export default AddUserInputBtn
import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../HtmlComponent";

class AddUserInputBtn extends HTMLComponent {
    constructor(parentComponent:HTMLComponent){
        let widgetHtml = $(`<button class="button-add">
        ${getSettings().langSearch.ButtonAdd}
        </button>`)
        super('AddUserInputBtn',parentComponent,widgetHtml)
    }

    render(): this {
        super.render()
        return this
    }
}

export default AddUserInputBtn
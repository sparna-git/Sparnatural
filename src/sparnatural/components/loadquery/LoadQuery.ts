import { ISparJson } from "../../sparql/ISparJson"
import HTMLComponent from "../HtmlComponent"
import Sparnatural from "../Sparnatural"
import { Dropdown } from "./dropdown/dropdown"

/*
    This Class takes an Array with Jsons in the form of ISparJson together with a queryname.
    It validates the queries and shows them in a Dropdownlist.
    If a query gets chosen
*/

export default class LoadQuery extends HTMLComponent {
    dropDown: Dropdown

    constructor(parentComponent:Sparnatural,queries:Array<{queryName:string,query:ISparJson}>){
        super('preloaded-queries',parentComponent,null)
    }

    render(): this {
        super.render()
        this.#renderDropDown()

        return this
    }
    #renderDropDown(){
        this.dropDown = new Dropdown()
        this.html.append($(`<custom-dropdown label="Dropdown" option="option2"></custom-dropdown`));
        (document.querySelector('custom-dropdown') as Dropdown).options = {
            option1: { label: 'Option 1' },
            option2: { label: 'Option 2' },
          };
          
        document.querySelector('custom-dropdown')
        .addEventListener('onChange', value => console.log(value));
    }
}
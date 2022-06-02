import { ISparJson } from "../../sparql/ISparJson"
import HTMLComponent from "../HtmlComponent"
import Sparnatural from "../Sparnatural"

/*
    This Class takes an Array with Jsons in the form of ISparJson together with a queryname.
    It validates the queries and shows them in a Dropdownlist.
    If a query gets chosen
*/

export default class LoadQuery extends HTMLComponent {
    constructor(parentComponent:Sparnatural,queries:Array<{queryName:string,query:ISparJson}>){
        super('preloaded-queries',parentComponent,null)
    }

    render(): this {
        super.render()
        
        return this
    }
}
import { PreLoadQueries } from "../../../configs/client-configs/ISettings"
import { queries } from "../../preloadedqueries"
import { Branch, CriteriaLine, ISparJson, Order } from "../../sparql/ISparJson"
import { IWidget } from "../builder-section/groupwrapper/criteriagroup/edit-components/widgets/IWidget"
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

    constructor(parentComponent:Sparnatural,queries:PreLoadQueries){
        super('preloaded-queries',parentComponent,null)
    }

    render(): this {
        super.render()
        let parsedQueries = this.#parseQueries()
        this.#renderDropDown()

        return this
    }

    #parseQueries(){
        try{
            let queryJson:Array<{queryName:string,
                query:string}> = JSON.parse(queries.toString())
            let validatedQueries = this.#validateQueries(queryJson)
            return queryJson
        }
        catch(error){
            let message = ''
            if(error instanceof Error) message = error.message
            else message = String(error)
        }
    }
    #renderDropDown(){
        this.dropDown = new Dropdown()
        this.html.append($(`<custom-dropdown label="Preloaded queries" option="option2"></custom-dropdown`));
        (document.querySelector('custom-dropdown') as Dropdown).options = {
            option1: { label: 'Option 1' },
            option2: { label: 'Option 2' },
          };
          
        document.querySelector('custom-dropdown')
        .addEventListener('onChange', value => console.log(value));
    }

    #validateQueries(queries:Array<{ queryName:string,query:string}>) {
        
        // filter out the queries which are not in the correct format
        queries = queries.filter(q=>{
            if(!('queryName' in q && this.#instanceOfISparJson(q))){
                console.warn(`The provided query "${q}" doesn't hold the Sparnatural JSON structure`)
                return false
            }
            return true 
        })
        return queries
    }
    #instanceOfISparJson(queryObj:any):queryObj is ISparJson{

        let hasKeys = 'distinct' in queryObj && 'variables' in queryObj && 'lang' in queryObj && 'order' in queryObj

        let branches = queryObj.branches as Array<Branch>
        // iterate through top level andSiblings
        let every = branches.every(b=>{
           return this.#instanceOfBranch(queryObj['branches'])
        })
        
       
        return hasKeys && every
    }
    #instanceOfBranch(branch:Branch):branch is Branch{
        let hasKeys = 'line' in branch && 'optional' in branch && 'notExists' in branch
        let isInstanceOf = true
        isInstanceOf = this.#instanceOfLine(branch.line)
        let every = branch.children.every(b=>{
            return this.#instanceOfBranch(b)
        })
        return hasKeys && every
    }
    #instanceOfLine(line:CriteriaLine): line is CriteriaLine{
        let hasKeys = 's' in line && 'p' in line && 'o' in line && 'sType' in line && 'oType' in line
        let isInstanceOf = true
        let every = line.values.every(v=>{
            return this.#isWidgetValue(v)
        })
        return hasKeys && every
    }
    //some basic validation if the provided value is an IWidget['value']
    #isWidgetValue(val: IWidget['value']): val is IWidget['value']{
        //every WidgetVal needs to have at least a label
        let hasKeys = 'label' in val

        return hasKeys

    }
}
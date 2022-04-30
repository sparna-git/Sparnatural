import CriteriaList from "./criteriaList/CriteriaList";
import HTMLComponent from "./HtmlComponent";

/*
    Top Class does not extend from HTMLComponent
*/
class ComponentsList extends HTMLComponent {
    CriteriaLists:Array<CriteriaList> = []
    constructor(){
        super('componentsListe',null,null)
    }

    render(): this {
        super.render()
        return this
    }
}
export default ComponentsList
import HTMLComponent from "./HtmlComponent";
/*
    This Components represents the <li class="groupe"..> tag
    Possible states are:
    - addWereEnable: it is possible to have a next WHERE relationship to a child CriteriaList
    - addWereDisable: it is not(!) possible to have a next WHERE relationship to a child CriteriaList
    - haveWereChild: The CriteriaList has a WHERE connection to a sub CriteriaList
    - completed: The inputs for this CriteriaGroup are all selected
    - hasallCompleted: The inputs for this CriteriaGroup and(!) all subCriteriaLists are all selected
    - hasAnd: The CriteriaList has an ADD connection to a sibling CriteriaList
*/
class CriteriaList extends HTMLComponent{
    childsList:Array<CriteriaList> = [] // The childsList contains all the sub CriteriaList added with the Where button
    linkAndBottom:any // connection line drawn from this CriteriaList with sibling CriteriaList
    linkWhereBottom:any // connection line drawn from this CriteriaList to child CriteriaList
    completed:boolean
    hasAllCompleted:boolean
    hasAnd:boolean
    hasWhereChild:boolean
    constructor(ParentComponent:HTMLComponent){
        super('groupe',ParentComponent,null)

    }
}
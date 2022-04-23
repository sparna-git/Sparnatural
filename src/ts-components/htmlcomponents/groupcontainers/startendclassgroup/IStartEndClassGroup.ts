import CriteriaGroup from "../CriteriaGroup";
import GroupContenaire from "../GroupContenaire";
export default interface IStartEndClassGroup extends GroupContenaire {
    ParentComponent:CriteriaGroup | GroupContenaire
    varName:any
    variableSelector:any
    selectViewVariable:JQuery<HTMLElement>
    value_selected:any
    variableNamePreload:string
	variableViewPreload:string

}
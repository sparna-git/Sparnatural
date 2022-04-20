import { GroupContenaire } from "../SparnaturalComponents";

class ActionRemove extends GroupContenaire {
    widgetHtml: string
    constructor(parentComponent:GroupContenaire){
        super("ActionRemove",parentComponent)
        this.cssClasses={
            ActionRemove: true,
            Created: false
        }
        this.widgetHtml = '<a><span class="unselect"><i class="far fa-times-circle"></i></span></a>' ;
        this.init()
    }
}
export default ActionRemove
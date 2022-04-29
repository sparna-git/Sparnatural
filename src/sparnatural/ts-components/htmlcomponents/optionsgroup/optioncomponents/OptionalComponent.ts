import { getSettings } from "../../../../../configs/client-configs/settings";
import ISpecProvider from "../../../../spec-providers/ISpecProviders";
import OptionComponent from "../OptionComponent";
import { OptionsGroup } from "../OptionsGroup";

/*
    Not Exists Component. Get's rendered by OptionsGroup if this is enabled.
    When Clicked changes the SPARQL of the query to a NOTEXISTS form
*/
class OptionalComponent extends OptionComponent{
    // If you would like to change the shape of the Arrow. Do it here
    constructor(ParentComponent:OptionsGroup,specProvider:ISpecProvider,crtGroupId:number){
        super('Optional',ParentComponent,specProvider,'optional',crtGroupId)
    }

    render(): this {
        this.objectId = this.ParentOptionsGroup.ParentCriteriaGroup.ObjectPropertyGroup.value_selected
        console.log(`thisobjectid: ${this.objectId}`)
        if(this.specProvider.isEnablingOptional(this.objectId)){
            console.log(`optionalcomponent inside if`)
            this.label = getSettings().langSearch.labelOptionOptional
        }
        super.render()
        return this
    }
        
    onChange(): void {
        super.onChange('optionalEnabled')
    }
  
}
export default OptionalComponent
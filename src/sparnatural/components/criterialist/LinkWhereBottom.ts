import HTMLComponent from "../../HtmlComponent";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import GroupWrapper from "./GroupWrapper";

class LinkWhereBottom extends HTMLComponent{
    ParentGroupWrapper: GroupWrapper;

    constructor(ParentComponent:HTMLComponent){
        super('link-where-bottom',ParentComponent,null)
        this.ParentGroupWrapper = ParentComponent as GroupWrapper
    }

    render(): this {
        let leftshift = this.#calculateLeftShift(
            this.ParentGroupWrapper.CriteriaGroup.EndClassGroup,
            this.ParentGroupWrapper.whereChild
        )
        this.html.css("left", leftshift);
        return this
    }


        // Calculate the Horizontal shift connecting the parent Criteria Group with the WHERE inserted child CriteriaGroup
    #calculateLeftShift(
        EndClassGroup:EndClassGroup,
        whereChild:GroupWrapper 
    ): number {
        return (
            this.#getOffset(
                EndClassGroup,
                whereChild
            ) + 51
        );
    }
    
    #getOffset(
        elem: EndClassGroup,
        elemParent: GroupWrapper
      ) {
        return $(elem.html).offset().left - $(elemParent).offset().left;
      }

}
export default LinkWhereBottom
import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import ComponentsList from "../MainComponents/ComponentsList";
import GroupWrapper from "./GroupWrapper";

class LienTop extends HTMLComponent {
    ParentComponentsList: ComponentsList;
    ParentGroupWrapper: GroupWrapper;
    constructor(ParentComponent:HTMLComponent){
        let widgetHTML = $(`<span> ${getSettings().langSearch.Where}</span>`)
        super('lien-top',ParentComponent,widgetHTML)
        this.ParentComponentsList = ParentComponent as ComponentsList
        this.ParentGroupWrapper = this.ParentComponentsList.ParentComponent as GroupWrapper
    }
    render(): this {
        let width = this.#calculateHorizontalWidth(this.ParentGroupWrapper.ParentComponent,this.ParentGroupWrapper)
        this.html.css("width", width)
        return this
    }

      // Calculate the Horizontal line connecting the parent Criteria Group with the WHERE inserted child CriteriaGroup
    #calculateHorizontalWidth(
        groupWrapperParent: HTMLComponent,
        groupWrapper: GroupWrapper
    ) {
        return (
        this.#getOffset(
            groupWrapperParent,
            groupWrapper
        ) - 57
    );
    }

    #getOffset(
        elem: HTMLComponent,
        elemParent: GroupWrapper
      ) {
        return $(elem.html).offset().left - $(elemParent.html).offset().left;
      }
}

export default LienTop
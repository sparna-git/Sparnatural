import HTMLComponent from "../../HtmlComponent";
import EndClassGroup from "../startendclassgroup/EndClassGroup";
import CriteriaGroup from "./CriteriaGroup";
import GroupWrapper from "./GroupWrapper";


/*
    This Component consists of three lines.
    The first vertical goes from the EndClassGroup to the end of the CriteriaGroup
    Then the Horizontal connects the first vertical to the left. Till the height of the WhereStartClassGroup
    The last vertical connects the Horizontal line with the new whereChild.StartClassGroup
*/
class LinkWhereBottom extends HTMLComponent{
    ParentGroupWrapper: GroupWrapper;
    upperVertical = $(`<div class="upper-vertical></div>`)
    horizontal = $(`<div class="horizontal></div>`)
    lowerVertical = $(`<div class="lower-vertical></div>`)
    constructor(ParentComponent:HTMLComponent){
        super('link-where-bottom',ParentComponent,null)
        this.ParentGroupWrapper = ParentComponent as GroupWrapper
    }

    render(): this {
        super.render()
        this.#drawWhereConnection(this.ParentGroupWrapper.CriteriaGroup.EndClassGroup,this.ParentGroupWrapper.whereChild,this.ParentGroupWrapper.CriteriaGroup)
        this.html.append(this.upperVertical)
        this.html.append(this.horizontal)
        this.html.append(this.lowerVertical)
        return this
    }

    #drawWhereConnection(
        EndClassGroup:EndClassGroup,
        whereChild:GroupWrapper,
        criteriaGroup:CriteriaGroup
    )
    {
        this.#drawUpperVertical(EndClassGroup,criteriaGroup)
        this.#drawHorizontal(whereChild,EndClassGroup)
        this.#drawLowerVertical(whereChild)
    }
    // line from the middle of the endclassgroup till the end of GroupWrapper
    #drawUpperVertical(endClassGroup:EndClassGroup,criteriaGroup:CriteriaGroup){
        let endClassClientRect = endClassGroup.html[0].getBoundingClientRect()
        let criteriaGrpRect = criteriaGroup.html[0].getBoundingClientRect()
        let middleOfEndClass = endClassClientRect.left + ((endClassClientRect.right - endClassClientRect.left)/2)
        let yEndClass = endClassClientRect.bottom
        let bottomCriteriaGrp = criteriaGrpRect.bottom

        // middleOfEndClass can be used twice since line is orthogonal to EndClassGroup
        let css = this.#getLine(middleOfEndClass,middleOfEndClass,yEndClass,bottomCriteriaGrp) 
        this.upperVertical.css(css)
    }
    #drawHorizontal(whereChild:GroupWrapper,endClassGroup:EndClassGroup){
        let startClassClientRect = whereChild.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect()
        let middleOfStartClass = startClassClientRect.left + ((startClassClientRect.right - startClassClientRect.left)/2)

        let endClassClientRect = endClassGroup.html[0].getBoundingClientRect()
        let middleOfEndClass = endClassClientRect.left + ((endClassClientRect.right - endClassClientRect.left)/2)

        let yEndClass = endClassClientRect.bottom
        let topCriteriaGrp = whereChild.CriteriaGroup.html[0].getBoundingClientRect().bottom
        let css = this.#getLine(middleOfStartClass,middleOfEndClass,yEndClass,topCriteriaGrp)
        this.horizontal.css(css)
    }
    #drawLowerVertical(whereChild:GroupWrapper){
        let startClassClientRect = whereChild.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect()
        let middleOfStartClass = startClassClientRect.left + ((startClassClientRect.right - startClassClientRect.left)/2)
        let topStrClsGrp = startClassClientRect.top

        let criteriaGrpRect = whereChild.CriteriaGroup.html[0].getBoundingClientRect()
        let topCriteriaGrp = criteriaGrpRect.top

        let css = this.#getLine(middleOfStartClass,middleOfStartClass,topCriteriaGrp,topStrClsGrp)
        this.lowerVertical.css(css)
    }

    #getLine(ax:number,bx:number,ay:number,by:number){
        if(ax > bx) {
            bx = ax + bx; 
            ax = bx - ax;
            bx = bx - ax;
    
            by = ay + by;
            ay = by - ay;
            by = by - ay;
        }
        let distance = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
        let calc = Math.atan((by - ay) / (bx - ax));
        let degree = calc * 180 / Math.PI;

        return{
            transformOrigin: 'top left',
            width: distance,
            top: ay + 'px',
            left: ax + 'px',
            transform: `rotate(${degree}deg)`
        }
    }

}
export default LinkWhereBottom
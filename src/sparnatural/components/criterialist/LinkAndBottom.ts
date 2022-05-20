import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";

interface LineObject{
    xStart: number,
    xEnd: number,
    yStart: number,
    yEnd: number,
    length: number
}

class LinkAndBottom extends HTMLComponent{
    lineObj:LineObject // defines the Pos and height of the line
    xStart: number
    xEnd: number
    yStart: number
    yEnd: number
    length: number
    constructor(ParentComponent:HTMLComponent){
        let widgetHTML = $(`<span>${getSettings().langSearch.And}</span>`)
        super('link-and-bottom',ParentComponent,widgetHTML)
    }

    render(): this {
        super.render()
        return this
    }

    setLineObj(lineObj:LineObject){
        console.warn('should draw')
        this.lineObj = lineObj
        this.xStart = lineObj.xStart
        this.xEnd = lineObj.xEnd
        this.yStart = lineObj.yStart
        this.yEnd = lineObj.yEnd

        let distance = Math.sqrt(Math.pow(this.xEnd - this.xStart, 2) + Math.pow(this.yEnd - this.yStart, 2));
        let calc = Math.atan((this.yEnd - this.yStart) / (this.xEnd - this.xStart));
        let degree = calc * 180 / Math.PI;

        this.html.css({
            transformOrigin: 'top left',
            width: distance,
            top: this.yStart + 'px',
            left: this.xStart + 'px',
            transform: `rotate(${degree}deg)`
        })
    }
    
}

export default LinkAndBottom
import HTMLComponent from "../HtmlComponent";
import BgWrapper from "./BgWrapper";
import SubmitSection from "./SubmitSection";
import VariableSection from "./VariableSelection";

class Sparnatural extends HTMLComponent {
    BgWrapper = new BgWrapper(this)
    SubmitSection = new SubmitSection(this)
    VariableSelection = new VariableSection(this)
    filter =  $(
        '<svg data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" style="width:0;height:0;display:block"><defs><filter style="color-interpolation-filters:sRGB;" inkscape:label="Drop Shadow" id="filter19278" x="-0.15483875" y="-0.11428573" width="1.3096775" height="1.2714286"><feFlood flood-opacity="0.811765" flood-color="rgb(120,120,120)" result="flood" id="feFlood19268" /><feComposite in="flood" in2="SourceGraphic" operator="out" result="composite1" id="feComposite19270" /><feGaussianBlur in="composite1" stdDeviation="2" result="blur" id="feGaussianBlur19272" /><feOffset dx="3.60822e-16" dy="1.8" result="offset" id="feOffset19274" /><feComposite in="offset" in2="SourceGraphic" operator="atop" result="composite2" id="feComposite19276" /></filter></defs></svg>'
    )
    constructor(){
        //Sparnatural: Does not have a ParentComponent!
        super("Sparnatural",null,null)
    }

    render(): this {
        this.BgWrapper.render()
        this.SubmitSection.render()
        this.VariableSelection.render()
        this.html.append(this.filter)
        return this
    }
}
export default Sparnatural
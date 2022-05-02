import ResetBtn from "../buttons/ResetBtn";
import ComponentsList from "./ComponentsList";
import HTMLComponent from "../../HtmlComponent";
import Sparnatural from "./Sparnatural";

class BgWrapper extends HTMLComponent {
    ParentSparnatural: Sparnatural;
    resetBtn:ResetBtn
    componentsList = new ComponentsList(this)
    constructor(ParentComponent:Sparnatural){
        super("bg-wrapper",ParentComponent,null)
        this
    }
    render(): this {
        super.render()
        this.componentsList.render()
        this.resetBtn = new ResetBtn(this,this.resetCallback).render()

        return this
    }

    resetCallback = ()=>{
        // delete all Components. necessary when i just create a new componentslist?
      this.componentsList.GroupWrappers.forEach(wrapper=>{
        wrapper.html.empty()
      })
      this.componentsList = new ComponentsList(this)
    }
} export default BgWrapper
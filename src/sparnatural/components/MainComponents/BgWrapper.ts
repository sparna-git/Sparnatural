import ResetBtn from "../buttons/ResetBtn";
import ComponentsList from "../ComponentsList";
import HTMLComponent from "./HtmlComponent";
import Sparnatural from "./Sparnatural";

class BgWrapper extends HTMLComponent {
    ParentSparnatural: Sparnatural;
    resetBtn:ResetBtn
    componentsList = new ComponentsList(this)
    constructor(ParentComponent:Sparnatural){
        super("bg-wrapper",ParentComponent,null)
        this.ParentSparnatural = ParentComponent as Sparnatural
    }
    render(): this {
        super.render()
        this.resetBtn = new ResetBtn(this,this.resetCallback).render()
        return this
    }

    resetCallback = ()=>{
        this.ParentSparnatural.clearForm(this.ParentSparnatural.form);
    }
} export default BgWrapper
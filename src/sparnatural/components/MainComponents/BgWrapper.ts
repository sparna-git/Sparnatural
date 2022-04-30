import ResetBtn from "../buttons/ResetBtn";
import HTMLComponent from "../HtmlComponent";
import Sparnatural from "./Sparnatural";

class BgWrapper extends HTMLComponent {
    resetBtn:ResetBtn
    ParentSparnatural: Sparnatural;
    constructor(ParentComponent:Sparnatural){
        super("bg-wrapper",ParentComponent,null)
        this.ParentSparnatural = ParentComponent as Sparnatural
    }
    render(): this {
        super.render()
        this.resetBtn = new ResetBtn(this,this.resetCallback)
        return this
    }

    resetCallback = ()=>{
        this.ParentSparnatural.clearForm(this.ParentSparnatural.form);
    }
} export default BgWrapper
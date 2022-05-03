import ResetBtn from "../buttons/ResetBtn";
import ComponentsList from "./ComponentsList";
import HTMLComponent from "../../HtmlComponent";
import Sparnatural from "./Sparnatural";
import ISpecProvider from "../../spec-providers/ISpecProviders";

class BgWrapper extends HTMLComponent {
    ParentSparnatural: Sparnatural;
    resetBtn:ResetBtn
    componentsList:ComponentsList
    specProvider: ISpecProvider;
    constructor(ParentComponent:Sparnatural,specProvider:ISpecProvider){
        super("bg-wrapper",ParentComponent,null)
        this.specProvider = specProvider
    }
    render(): this {
        super.render()
        this.componentsList == new ComponentsList(this,this.specProvider).render()
        this.resetBtn = new ResetBtn(this,this.resetCallback).render()

        return this
    }

    resetCallback = ()=>{
      this.componentsList = new ComponentsList(this,this.specProvider).render()
    }
} export default BgWrapper
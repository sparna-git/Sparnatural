import { getSettings } from "../../../configs/client-configs/settings";
import PlayBtn from "../buttons/PlayBtn";
import HTMLComponent from "../../HtmlComponent";
import Sparnatural from "./Sparnatural";

class SubmitSection extends HTMLComponent {
    playBtn:PlayBtn
    ParentSparnatural: Sparnatural;
    constructor(ParentComponent:HTMLComponent){
        let widgetHTML = $(`<div class="submitSection"></div>`)
        super("bg-submitSectionWrapper",ParentComponent,widgetHTML)
        this.ParentSparnatural = ParentComponent as Sparnatural
    }
    render(): this {
        super.render()
        this.playBtn = new PlayBtn(this.ParentComponent,this.sumbitAction)
        return this
    }
    
    // Make arrow function to bind the this lexically
    // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
    sumbitAction = ()=>{
        if (getSettings().onSubmit) {
            getSettings().onSubmit(form);
        }
    }


    /* DONT Forget
          enableSubmit() {
        $(this.Form.sparnatural)
          .find(".submitSection a")
          .removeClass("submitDisable");
      }
    
      disableSubmit() {
        $(this.Form.sparnatural).find(".submitSection a").addClass("submitDisable");
      }

    */
} export default SubmitSection
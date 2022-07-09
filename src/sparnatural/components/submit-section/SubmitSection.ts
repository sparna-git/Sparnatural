import { getSettings } from "../../../configs/client-configs/settings";
import PlayBtn from "../buttons/PlayBtn";
import HTMLComponent from "../HtmlComponent";
import Sparnatural from "../Sparnatural";

class SubmitSection extends HTMLComponent {
  playBtn: PlayBtn;
  ParentSparnatural: Sparnatural;
  constructor(ParentComponent: HTMLComponent) {
    super("submitSection", ParentComponent, null);
    this.ParentSparnatural = ParentComponent as Sparnatural;
  }
  render(): this {
    super.render();
    this.playBtn = new PlayBtn(this, this.submitAction).render()
    return this;
  }

  // Make arrow function to bind the this lexically
  // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
  submitAction = () => {
    if (getSettings().onSubmit) {
      let e = new CustomEvent("onSubmit", { bubbles: true });
      this.html[0].dispatchEvent(e);
    }
  };

  enableSubmit() {
    this.html.removeClass("submitDisable");
  }

  disableSubmit() {
    this.html.addClass("submitDisable");
  }
}
export default SubmitSection;

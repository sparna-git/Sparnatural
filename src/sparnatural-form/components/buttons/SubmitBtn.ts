import { getSettings } from "../../../sparnatural-form/settings/defaultsSettings";
import PlayBtn from "../../../sparnatural/components/buttons/PlayBtn";
import HTMLComponent from "../../../sparnatural/components/HtmlComponent";
import SparnaturalFormComponent from "../../../sparnatural-form/components/SparnaturalFormComponent";
import { SparnaturalFormElement } from "../../../SparnaturalFormElement";

class SubmitSection extends HTMLComponent {
  playBtn: PlayBtn;
  ParentSparnatural: SparnaturalFormComponent;
  constructor(ParentComponent: HTMLComponent) {
    super("submitSection", ParentComponent, null);
    this.ParentSparnatural = ParentComponent as SparnaturalFormComponent;
  }
  render(): this {
    super.render();
    this.playBtn = new PlayBtn(this, this.submitAction).render();
    return this;
  }

  // Make arrow function to bind the this lexically
  // see: https://stackoverflow.com/questions/55088050/ts-class-method-is-undefined-in-callback
  submitAction = () => {
    if (getSettings().submitButton) {
      console.log("SubmitSection: Submit button clicked");
      let e = new CustomEvent(SparnaturalFormElement.EVENT_SUBMIT, {
        bubbles: true,
        detail: this.ParentSparnatural,
      });
      console.log(e.bubbles);
      console.log(e.detail);
      this.html[0].dispatchEvent(e);
    }
  };

  enableSubmit() {
    this.playBtn.enable();
  }

  disableSubmit() {
    this.playBtn.disable();
  }
}
export default SubmitSection;

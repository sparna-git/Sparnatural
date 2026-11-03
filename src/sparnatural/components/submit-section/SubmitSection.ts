import { getSettings } from "../../../sparnatural/settings/defaultSettings";
import { PlayBtn } from "../buttons/PlayBtn";
import { HTMLComponent } from "../HtmlComponent";
import SparnaturalComponent from "../SparnaturalComponent";
import { SparnaturalElement } from "../../../SparnaturalElement";
import { I18n } from "../../settings/I18n";

class SubmitSection extends HTMLComponent {
  playBtn: PlayBtn;
  ParentSparnatural: SparnaturalComponent;
  constructor(ParentComponent: HTMLComponent) {
    super("submitSection", ParentComponent, null);
    this.ParentSparnatural = ParentComponent as SparnaturalComponent;
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
      let e = new CustomEvent(SparnaturalElement.EVENT_SUBMIT, {
        bubbles: true,
        detail: this.ParentSparnatural,
      });
      this.html[0].dispatchEvent(e);
      HTMLComponent.announce(this.html[0], I18n.labels["Announce.searchStarted"]);
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

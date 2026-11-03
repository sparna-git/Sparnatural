import { ResetBtn } from "../buttons/ResetBtn";
import ComponentsList from "./ComponentsList";
import SparnaturalComponent from "../SparnaturalComponent";
import { ISparnaturalSpecification } from "../../spec-providers/ISparnaturalSpecification";
import { HTMLComponent } from "../HtmlComponent";
import { SparnaturalElement } from "../../../SparnaturalElement";
import { I18n } from "../../settings/I18n";

class BgWrapper extends HTMLComponent {

  ParentSparnatural: SparnaturalComponent;
  resetBtn: ResetBtn;
  componentsList: ComponentsList;
  specProvider: ISparnaturalSpecification;

  constructor(ParentComponent: SparnaturalComponent, specProvider: ISparnaturalSpecification) {
    super("builder-section", ParentComponent, null);
    this.specProvider = specProvider;
    this.ParentSparnatural = ParentComponent;
  }

  render(): this {
    super.render();
    this.#renderComponents();
    return this;
  }

  #renderComponents() {
    this.componentsList = new ComponentsList(this, this.specProvider).render();
    // screen readers : reset comes after the query, just before the submit button. The CSS keeps it at the top
    this.resetBtn = new ResetBtn(this, this.resetCallback).render();
  }

  resetCallback = () => {
    this.componentsList.html.empty();
    this.componentsList.html.remove();
    this.componentsList = null;
    this.resetBtn.html.empty();
    this.resetBtn.html.remove();
    this.#renderComponents();
    this.html[0].dispatchEvent(new CustomEvent("resetVars",{bubbles: true}));
    // redraw background so that background height of first line is recomputed - otherwise it can stay small
    this.html[0].dispatchEvent(new CustomEvent("redrawBackgroundAndLinks",{bubbles: true}));
    HTMLComponent.announce(this.html[0], I18n.labels["Announce.reset"]);

    // fire an event to the outside world
    this.html[0].dispatchEvent(new CustomEvent(SparnaturalElement.EVENT_RESET, {
      bubbles: true,
      detail: {
        sparnatural: this.ParentSparnatural
      }
    }));
  };
  
}
export default BgWrapper;

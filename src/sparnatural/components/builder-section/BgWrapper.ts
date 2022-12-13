import ResetBtn from "../buttons/ResetBtn";
import ComponentsList from "./ComponentsList";
import Sparnatural from "../SparnaturalComponent";
import ISpecProvider from "../../spec-providers/ISpecProvider";
import HTMLComponent from "../HtmlComponent";
import { MaxVarAction } from "../../statehandling/ActionStore";

class BgWrapper extends HTMLComponent {
  ParentSparnatural: Sparnatural;
  resetBtn: ResetBtn;
  componentsList: ComponentsList;
  specProvider: ISpecProvider;
  constructor(ParentComponent: Sparnatural, specProvider: ISpecProvider) {
    super("builder-section", ParentComponent, null);
    this.specProvider = specProvider;
  }
  render(): this {
    super.render();
    this.#renderComponents();
    return this;
  }

  #renderComponents() {
    this.resetBtn = new ResetBtn(this, this.resetCallback).render();
    this.componentsList = new ComponentsList(this, this.specProvider).render();
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

    // fire a callback to the outside world
    if (this.ParentSparnatural.settings.onReset) {
      this.ParentSparnatural.settings.onReset(this.ParentSparnatural);
    }
  };
}
export default BgWrapper;

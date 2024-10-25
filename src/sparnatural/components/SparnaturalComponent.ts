import { getSettings } from "../../sparnatural/settings/defaultSettings";
import ISparnaturalSpecification from "../spec-providers/ISparnaturalSpecification";
import BgWrapper from "./builder-section/BgWrapper";
import SubmitSection from "./submit-section/SubmitSection";
import SparnaturalSpecificationFactory from "../spec-providers/SparnaturalSpecificationFactory";
import ActionStore from "../statehandling/ActionStore";
import VariableSection from "./variables-section/VariableSelection";
import HTMLComponent from "./HtmlComponent";
import { SparnaturalElement } from "../../SparnaturalElement";
import { Catalog } from "../settings/Catalog";
import { I18n } from "../settings/I18n";

class SparnaturalComponent extends HTMLComponent {
  specProvider: ISparnaturalSpecification;
  actionStore: ActionStore;
  BgWrapper: BgWrapper;
  SubmitSection: SubmitSection;
  variableSection: VariableSection;
  catalog: Catalog;
  // filter that is applied to optional/not exists green arrows, based on its ID
  filter = $(
    '<svg data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" style="width:0;height:0;display:block"><defs><filter style="color-interpolation-filters:sRGB;" inkscape:label="Drop Shadow" id="filter19278" x="-0.15483875" y="-0.11428573" width="1.3096775" height="1.2714286"><feFlood flood-opacity="0.811765" flood-color="rgb(120,120,120)" result="flood" id="feFlood19268" /><feComposite in="flood" in2="SourceGraphic" operator="out" result="composite1" id="feComposite19270" /><feGaussianBlur in="composite1" stdDeviation="2" result="blur" id="feGaussianBlur19272" /><feOffset dx="3.60822e-16" dy="1.8" result="offset" id="feOffset19274" /><feComposite in="offset" in2="SourceGraphic" operator="atop" result="composite2" id="feComposite19276" /></filter></defs></svg>'
  );

  constructor() {
    //Sparnatural: Does not have a ParentComponent!
    super("Sparnatural", null, null);
  }

  render(): this {
    this.#initLang();
    this.#initCatalog();
    this.initSpecificationProvider((sp: ISparnaturalSpecification) => {
      this.specProvider = sp;
      //Think this will be launched before load query ???
      this.actionStore = new ActionStore(this, this.specProvider);
      this.BgWrapper = new BgWrapper(this, this.specProvider).render();
      // display the submit button only if a callback was provided
      if (getSettings().submitButton) {
        this.SubmitSection = new SubmitSection(this).render();
      }
      console.log("submit section", this.SubmitSection);
      this.variableSection = new VariableSection(
        this,
        this.specProvider
      ).render();
      //BGWrapper must be rendered first
      this.html[0].dispatchEvent(
        new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
      );
      this.html.append(this.filter);
      console.log(
        "Found languages in configuration : " + this.specProvider.getLanguages()
      );

      this.html[0].dispatchEvent(
        new CustomEvent(SparnaturalElement.EVENT_INIT, {
          bubbles: true,
          detail: {
            sparnatural: this,
          },
        })
      );
    });

    return this;
  }

  #initCatalog() {
    let settings = getSettings();
    let me = this;
    if (settings.catalog) {
      $.getJSON(settings.catalog, function (data) {
        me.catalog = new Catalog(data);
      }).fail(function (response) {
        console.error(
          "Sparnatural - unable to load catalog file : " + settings.catalog
        );
      });
    }
  }

  initSpecificationProvider(callback: any) {
    let settings = getSettings();
    let specProviderFactory = new SparnaturalSpecificationFactory();
    specProviderFactory.build(settings.src, settings.language, (sp: any) => {
      // call the call back when done
      callback(sp);
    });
  }

  // method is exposed from the HTMLElement
  enablePlayBtn = () => {
    this.SubmitSection.playBtn.removeLoading();
  };

  // method is exposed from the HTMLElement
  disablePlayBtn = () => {
    this.SubmitSection.playBtn.disable();
  };

  setQuiet(quiet: boolean) {
    this.actionStore.quiet = quiet;
  }

  isEmpty() {
    return (
      this.BgWrapper.componentsList.rootGroupWrapper.CriteriaGroup
        .StartClassGroup.startClassVal?.type == null
    );
  }

  #initLang() {
    if (getSettings().language === "fr") {
      I18n.init("fr");
    } else {
      I18n.init("en");
    }
  }
}
export default SparnaturalComponent;

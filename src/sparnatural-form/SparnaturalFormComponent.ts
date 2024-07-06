import WidgetWrapper from "../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetWrapper";
import HTMLComponent from "../sparnatural/components/HtmlComponent";
import { I18n } from "../sparnatural/settings/I18n";
import ISparnaturalSpecification from "../sparnatural/spec-providers/ISparnaturalSpecification";
import ISpecificationEntity from "../sparnatural/spec-providers/ISpecificationEntity";
import SparnaturalSpecificationFactory from "../sparnatural/spec-providers/SparnaturalSpecificationFactory";
import { SparnaturalFormAttributes } from "../SparnaturalFormAttributes";
import ISettings from "./ISettings";
import { SparnaturalFormI18n } from "./SparnaturalFormI18n";

class SparnaturalFormComponent extends HTMLComponent {
  
  specProvider: ISparnaturalSpecification;
  formSettings: ISettings;

  constructor(
    attributes : SparnaturalFormAttributes
  ) {
    // this is a root component : Does not have a ParentComponent!
    super("SparnaturalForm", null, null);
    
    // TODO : init settings from attributes
    this.formSettings = attributes;
  }

  render(): this {
    this.#initFormLabels()
    this.#initSparnaturalLabels()
    
    this.initSpecificationProvider((sp: ISparnaturalSpecification) => {
      this.specProvider = sp;

      let testClass:ISpecificationEntity = this.specProvider.getEntity(
        this.specProvider.getEntitiesInDomainOfAnyProperty()[0]
      );
      let ww:WidgetWrapper = new WidgetWrapper(
        this,
        this.specProvider,
        {
          variable:"Test_1",
          type:testClass.getId()
        },
        {
          variable:"Property_1",
          type:testClass.getConnectingProperties(testClass.getConnectedEntities()[0])[0]
        },
        {
          variable:"Test_2",
          type:testClass.getConnectedEntities()[0]
        }
      );
      ww.render();

    });
    
    return this;
  }

  initSpecificationProvider(callback:any) {

    let specProviderFactory = new SparnaturalSpecificationFactory();
    specProviderFactory.build(this.formSettings.src, this.formSettings.language, (sp: any) => {
      // call the call back when done
      callback(sp);
    });    
  }

  #initFormLabels() {
    if (this.settings.language === "fr") {
      SparnaturalFormI18n.init("fr");
    } else {
      SparnaturalFormI18n.init("en");
    }
  }

  #initSparnaturalLabels() {
    if (this.settings.language === "fr") {
      I18n.init("fr");
    } else {
      I18n.init("en");
    }
  }


}
export default SparnaturalFormComponent;

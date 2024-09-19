import { WidgetFactory } from "../sparnatural/components/builder-section/groupwrapper/criteriagroup/edit-components/WidgetFactory";
import HTMLComponent from "../sparnatural/components/HtmlComponent";
import { ISparJson } from "../sparnatural/generators/json/ISparJson";
import { I18n } from "../sparnatural/settings/I18n";
import ISparnaturalSpecification from "../sparnatural/spec-providers/ISparnaturalSpecification";
import ISpecificationEntity from "../sparnatural/spec-providers/ISpecificationEntity";
import SparnaturalSpecificationFactory from "../sparnatural/spec-providers/SparnaturalSpecificationFactory";
import { SparnaturalFormAttributes } from "../SparnaturalFormAttributes";
import ISettings from "./ISettings";
import { SparnaturalFormI18n } from "./SparnaturalFormI18n";

class SparnaturalFormComponent extends HTMLComponent {
  

  // the content of all HTML element attributes
  formSettings: ISettings;
  // Sparnatural configuration
  specProvider: ISparnaturalSpecification;
  // The JSON query from the "query" attribute
  jsonQuery: ISparJson;

  constructor(
    attributes : SparnaturalFormAttributes
  ) {
    // this is a root component : Does not have a ParentComponent!
    super("SparnaturalForm", null, null);
    
    this.formSettings = attributes;
    this.formSettings.customization = {};
  }

  render(): this {
    this.#initSparnaturalFormStaticLabels()
    this.#initSparnaturalStaticLabels()
    
    this.initSpecificationProvider((sp: ISparnaturalSpecification) => {
      this.specProvider = sp;
      
      // ICI : générer le formulaire

      // Etape 1 : lire le contenu de la query dans le paramètre "query"
      this.initJsonQuery((query:ISparJson) => {
        console.log("Successfully read query in " + this.formSettings.query);

        /*** CODE DE TEST ***/
      
        let testClass:ISpecificationEntity = this.specProvider.getEntity(
          this.specProvider.getEntitiesInDomainOfAnyProperty()[0]
        );
    
        let wf:WidgetFactory = new WidgetFactory(
          this,
          this.specProvider,
          (this.getRootComponent() as SparnaturalFormComponent).formSettings,
          null
        );
    
        let theWidget = wf.buildWidget(
          this.specProvider.getProperty(testClass.getConnectingProperties(testClass.getConnectedEntities()[1])[0]).getPropertyType(testClass.getConnectedEntities()[0]),
          {
            variable:"Test_1",
            type:testClass.getId()
          },
          {
            variable:"Property_1",
            type:testClass.getConnectingProperties(testClass.getConnectedEntities()[1])[0]
          },
          {
            variable:"Test_2",
            type:testClass.getConnectedEntities()[1]
          }
        );

        // renders the widget
        theWidget.render();

        /*** FIN DU CODE DE TEST ***/
      });



      // Etape 2 :




      
    });
    
    return this;
  }

  /**
   * Reads and parse the configuration provided in the "src" attribute, and fires a callback when ready
   * @param callback the function that is called with the ISpecificationProvider instance created after reading the config
   */
  initSpecificationProvider(callback:any) {

    let specProviderFactory = new SparnaturalSpecificationFactory();
    specProviderFactory.build(this.formSettings.src, this.formSettings.language, (sp: any) => {
      // call the call back when done
      callback(sp);
    });    
  }

  /**
   * Reads the Sparnatural query
   * @param callback 
   */
  initJsonQuery(callback:(query:ISparJson)=>void) {
    let queryUrl = this.formSettings.query;

    $.when(
      $.getJSON(queryUrl, function (data) {
        callback(data as ISparJson);
      }).fail(function (response) {
        console.error(
          "Sparnatural - unable to load JSON query file : " + queryUrl
        );
      })
    ).done(function () {});

  }

  /**
   * Initialize the static labels used to render sparnatural-form
   */
  #initSparnaturalFormStaticLabels() {
    if (this.formSettings.language === "fr") {
      SparnaturalFormI18n.init("fr");
    } else {
      SparnaturalFormI18n.init("en");
    }
  }

  /**
   * Initialize the static labels used to render the widgets from Sparnatural
   */
  #initSparnaturalStaticLabels() {
    if (this.formSettings.language === "fr") {
      I18n.init("fr");
    } else {
      I18n.init("en");
    }
  }


}
export default SparnaturalFormComponent;

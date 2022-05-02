import ISettings from "../../../configs/client-configs/ISettings";
import { getSettings } from "../../../configs/client-configs/settings";
import { initGeneralEvent, redrawBottomLink } from "../../globals/globalfunctions";
import { QuerySPARQLWriter } from "../../sparql/Query";
import JSONQueryGenerator from "../../sparql/QueryGenerators";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import VariableSelectionBuilder from "./VariableSelectionBuilder";
import HTMLComponent from "../../HtmlComponent";
import BgWrapper from "./BgWrapper";
import SubmitSection from "./SubmitSection";
import VariableSection from "./VariableSelection";
import SpecificationProviderFactory from "../../spec-providers/SpecificationProviderFactory"

// This is ugly, should use i18n features instead
const i18nLabels = {
    en: require("../assets/lang/en.json"),
    fr: require("../assets/lang/fr.json"),
  };

class Sparnatural extends HTMLComponent {
    specProvider:ISpecProvider
    submitOpened = true
    Form: {
        sparnatural: Sparnatural;
        firstInit: boolean;
        preLoad: boolean;
        langSearch: any;
      } = {
        sparnatural: this,
        firstInit: false,
        // JSON of the query to be loaded
        preLoad: false,
        langSearch: null,
      };
    BgWrapper = new BgWrapper(this)
    SubmitSection = new SubmitSection(this)
    VariableSelection = new VariableSection(this)
    filter =  $(
        '<svg data-name="Calque 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" style="width:0;height:0;display:block"><defs><filter style="color-interpolation-filters:sRGB;" inkscape:label="Drop Shadow" id="filter19278" x="-0.15483875" y="-0.11428573" width="1.3096775" height="1.2714286"><feFlood flood-opacity="0.811765" flood-color="rgb(120,120,120)" result="flood" id="feFlood19268" /><feComposite in="flood" in2="SourceGraphic" operator="out" result="composite1" id="feComposite19270" /><feGaussianBlur in="composite1" stdDeviation="2" result="blur" id="feGaussianBlur19272" /><feOffset dx="3.60822e-16" dy="1.8" result="offset" id="feOffset19274" /><feComposite in="offset" in2="SourceGraphic" operator="atop" result="composite2" id="feComposite19276" /></filter></defs></svg>'
    )
    constructor(){
        //Sparnatural: Does not have a ParentComponent!
        super("Sparnatural",null,null)
    }

    render(): this {
        this.BgWrapper.render()
        this.SubmitSection.render()
        this.VariableSelection.render()
        this.html.append(this.filter)
        this.#addCustomEventListners()
        return this
    }

    // register the event listeners to listen for event from the components
    #addCustomEventListners(){

        // executed by VariableSelection, Start-EndclassGroup & VariableSelector
        this.html[0].addEventListener('updateVariableList',(e)=>{
            console.log('updateVariableList event caught')
            e.stopImmediatePropagation()
        })
        this.html[0].addEventListener('onSubmit',(e)=>{
          console.log('onSubmit even caught')
          e.stopImmediatePropagation()
        })

        // when the 
        this.html[0].addEventListener('switchVariableName',()=>{
          this.BgWrapper.componentsList.html
          .toggleClass("displayVarName");
    
        $("li.groupe").each(function () {
          redrawBottomLink($(this));
        });
        })
        // maxvarindex shows the index for the sparql variables. e.g Country_1
        let maxVarIndex = 0
        this.html[0].addEventListener('getMaxVarIndex',(e:CustomEvent)=>{
          e.stopImmediatePropagation()
          maxVarIndex++
          // return the index in callback
          e.detail(maxVarIndex)
        })

        this.addOnSubmitHook()
        
    }


    initSparnatural() {
        getSettings().langSearch = i18nLabels["en"];
        this.Form.langSearch = i18nLabels["en"];
        let settings = getSettings();
        let specProviderFactory = new SpecificationProviderFactory()

        specProviderFactory.build(settings.config, settings.language, (sp: any) => {
          this.specProvider = sp;
        });
        this.initForm(this.Form);
        // add the first CriteriaGroup to the component
        addComponent.call(this, this.Form, $(this.Form.sparnatural).find("ul"));
        $(this.Form.sparnatural)
          .find(".StartClassGroup .nice-select:not(.disabled)")
          .trigger("click");
        // uncomment to trigger gathering of statistics
        // initStatistics(specProvider);
      }

    initForm(form: any) {
        let settings = getSettings()
    
        form.queryOptions = {
          distinct: settings.addDistinct,
          displayVariableList: ["?this"],
          orderSort: null,
          defaultLang: settings.language,
        };
    
        this.initVariablesSelector.call(this, form);
    
        initGeneralEvent.call(this, form);
    
        this.addOnSubmitHook();
    
        $(form.sparnatural).trigger("formInitialized");
      }

    
  doLoadQuery(form: any, json: any) {
    // stores the JSON to be preloaded
    form.preLoad = json;
    // clear the form
    // On Clear form new component is automaticaly added, json gets loaded
    this.clearForm(form);

    form.sparnatural.variablesSelector.loadQuery();

    // And now, submit form
    $(form.sparnatural).trigger("submit");
    form.preLoad = false;
    // clear the jsonQueryBranch copied on every component, otherwise they always stay here
    // and we get the same criterias over and over when removing and re-editing
    form.sparnatural.components.forEach(function (component: any) {
      component.CriteriaGroup.jsonQueryBranch = null;
    });
    return form;
  }

    clearForm() {

    }

    loadQuery(json: any) {
        var jsonWithLinks = this.preprocess(json);
        // console.log(jsonWithLinks);
        //Désactiver le submit du form
        //en amont reset de ce qui est déjà dans l'interface (fonction à part)
        if (this.Form.firstInit === true) {
          this.Form = this.doLoadQuery(this.Form, jsonWithLinks);
        } else {
          //Si un travail est en cours on attend...
          $(this.Form.sparnatural).on("initialised", () => {
            this.Form = this.doLoadQuery(this.Form, jsonWithLinks);
          });
        }
    }


    clear() {
        this.Form = this.clearForm(this.Form);
      }
    

      enableLoading() {
        $(this.Form.sparnatural)
          .find(".submitSection a")
          .addClass("submitDisable, loadingEnabled"); /// Need to be disabled with loading
      }
      disableLoading() {
        $(this.Form.sparnatural)
          .find(".submitSection a")
          .removeClass("loadingEnabled");
      }  

    /**
   * Preprocess JSON query to add parent and nextSibling links
   **/
     preprocess(jsonQuery: any) {
        for (var i = 0; i < jsonQuery.branches.length; i++) {
          var branch = jsonQuery.branches[i];
          var next = null;
          if (jsonQuery.branches.length > i + 1) {
            next = jsonQuery.branches[i + 1];
          }
          this.preprocessRec(branch, null, next, jsonQuery);
        }
        return jsonQuery;
      }
    
      preprocessRec(branch: any, parent: any, nextSibling: any, jsonQuery: any) {
        branch.parent = parent;
        branch.nextSibling = nextSibling;
        // set flags ot indicate if the eye is open by testing the selected variables
        if (jsonQuery.variables.includes(branch.line.s)) {
          branch.line.sSelected = true;
        }
        if (jsonQuery.variables.includes(branch.line.o)) {
          branch.line.oSelected = true;
        }
        for (var i = 0; i < branch.children.length; i++) {
          var child = branch.children[i];
          var next = null;
          if (branch.children.length > i + 1) {
            next = branch.children[i + 1];
          }
          this.preprocessRec(child, branch, next, jsonQuery);
        }
      }

    
  initVariablesSelector(form: any) {
    form.sparnatural.variablesSelector = {};
    // TODO maybe refactor this to hold VariableSelector objects?
    let varSelectBuilder = new VariableSelectionBuilder(form);
    varSelectBuilder.render();

    // not sur what to do with this
    this.loadQuery = function () {
      this.submitOpened = false;
      for (var i = 0; i < this.form.preLoad.variables.length; i++) {
        var variableName = this.form.preLoad.variables[i];
        for (var x = 0; x < this.form.sparnatural.components.length; x++) {
          var critere = this.form.sparnatural.components[x].CriteriaGroup;
          if (critere.StartClassGroup.variableNamePreload == variableName) {
            critere.StartClassGroup.onchangeViewVariable();
            break; // une variable ne doit être trouvé q'une seule fois et seulement la première
          }
          if (critere.EndClassGroup.variableNamePreload == variableName) {
            critere.EndClassGroup.onchangeViewVariable();
            break; // une variable ne doit être trouvé q'une seule fois et seulement la première
          }
        }
        x = 0;
      }
      this.submitOpened = true;
    };
  }

  
  addOnSubmitHook() {
    // triggered when Sparnatural is submitted : generates output SPARQL query
    this.html[0].addEventListener("submit", (event) => {
      let settings = getSettings()
      console.log("submit called");
      if (this.submitOpened == true) {
        event.preventDefault();

        // prints the JSON query data structure on the console
        var jsonGenerator = new JSONQueryGenerator();
        var jsonQuery = jsonGenerator.generateQuery(event.data.formObject);

        if (jsonQuery != null) {
          console.log("*** New JSON Data structure ***");
          console.log(JSON.stringify(jsonQuery, null, 4));

          // prints the SPARQL generated from the writing of the JSON data structure
          console.log("*** New SPARQL from JSON data structure ***");
          var writer = new QuerySPARQLWriter(
            settings.typePredicate,
            this.specProvider
          );
          writer.setPrefixes(settings.sparqlPrefixes);
          console.log(writer.toSPARQL(jsonQuery));

          // fire callback
          settings.onQueryUpdated(
            writer.toSPARQL(jsonQuery),
            jsonQuery,
            this.specProvider
          );

          //Can enable for submit
          this.SubmitSection.enableSubmit();
        }
      }
    });
  }
}
export default Sparnatural
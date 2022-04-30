import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../HtmlComponent";
import BgWrapper from "./BgWrapper";
import SubmitSection from "./SubmitSection";
import VariableSection from "./VariableSelection";

class Sparnatural extends HTMLComponent {
    Form: {
        sparnatural: Sparnatural;
        submitOpened: boolean;
        firstInit: boolean;
        preLoad: boolean;
        langSearch: any;
      } = {
        sparnatural: this,
        submitOpened: true,
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
        return this
    }


    initSparnatural() {
        getSettings().langSearch = i18nLabels["en"];
        this.Form.langSearch = i18nLabels["en"];
        let settings = this.getSettings();
        let specProviderFactory = new SpecificationProviderFactory();
    
        specProviderFactory.build(settings.config, settings.language, (sp: any) => {
          this.specProvider = sp;
          this.initForm(this.Form);
          // add the first CriteriaGroup to the component
          addComponent.call(this, this.Form, $(this.Form.sparnatural).find("ul"));
          $(this.Form.sparnatural)
            .find(".StartClassGroup .nice-select:not(.disabled)")
            .trigger("click");
          // uncomment to trigger gathering of statistics
          // initStatistics(specProvider);
        });
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
    
        this.addOnSubmitHook(form, settings);
    
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

    clearForm(form: any) {
        //Stop submit form on this work.
        form.submitOpened = false;
        for (var i = form.sparnatural.components.length - 1; i > -1; i--) {
          if (
            $(
              form.sparnatural.components[i].CriteriaGroup.AncestorComponentHtml
            ).hasClass("componentsListe")
          ) {
            form.sparnatural.components[i].CriteriaGroup.onRemoveCriteria();
          }
        }
        form.submitOpened = true;
        return form;
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
    
      enableSubmit() {
        $(this.Form.sparnatural)
          .find(".submitSection a")
          .removeClass("submitDisable");
      }
    
      disableSubmit() {
        $(this.Form.sparnatural).find(".submitSection a").addClass("submitDisable");
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
   * Returns the maximum index of variables within all the criterias
   **/
  getMaxVarIndex() {
    var max = 0;
    for (var i = 0; i < this.components.length; i++) {
      var startVarName =
        this.components[i].CriteriaGroup.StartClassGroup.getVarName();
      var endVarName =
        this.components[i].CriteriaGroup.EndClassGroup.getVarName();

      if (startVarName && startVarName.split("_").length > 1) {
        var index = parseInt(startVarName.split("_")[1]);
        if (index > max) {
          max = index;
        }
      }

      if (endVarName && endVarName.split("_").length > 1) {
        var index = parseInt(endVarName.split("_")[1]);
        if (index > max) {
          max = index;
        }
      }
    }

    return max;
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
      this.form.submitOpened = false;
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
      this.form.submitOpened = true;
    };
  }

  
  addOnSubmitHook(form: any, settings: ISettings) {
    // triggered when Sparnatural is submitted : generates output SPARQL query
    $(form.sparnatural).on("submit", { formObject: form }, function (event) {
      console.log("submit called");
      if (form.submitOpened == true) {
        event.preventDefault();
        /*if ($(event.data.formObject.sparnatural).find('li.groupe').not('.completed').length > 0) {
						return false ;
					}*/

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
          form.sparnatural.enableSubmit();
        }
      }
    });
  }
}
export default Sparnatural
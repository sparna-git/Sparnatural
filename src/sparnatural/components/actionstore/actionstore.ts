import { getSettings } from "../../../configs/client-configs/settings";
import { redrawBottomLink } from "../../globals/globalfunctions";
import { QuerySPARQLWriter } from "../../sparql/Query";
import JSONQueryGenerator from "../../sparql/QueryGenerators";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import GroupWrapper from "../criterialist/GroupWrapper";
import Sparnatural from "../MainComponents/Sparnatural";
// This is ugly, should use i18n features instead
const i18nLabels = {
    en: require("../../../assets/lang/en.json"),
    fr: require("../../../assets/lang/fr.json"),
  };
/*
    The ActionStore is responsible of the statehandling.
    It is inspired by redux where Events are dispatched and then caught 
    by the Eventlisteners. They then change the state and trigger the right actions in the UI
*/
class ActionStore {
    sparnatural: Sparnatural;
    specProvider: any;
    orderSort:string
    //submitOpened = false still implement
    constructor(sparnatural:Sparnatural,specProvider:ISpecProvider){
        this.specProvider = specProvider
        this.sparnatural = sparnatural
        this.#addCustomEventListners()
        this.addOnSubmitHook()
    }
    Form: {
        distinct:any,
        displayVariableList:Array<string>,
        firstInit: boolean,
        preLoad: any,
        langSearch: any,
      } = {
        distinct: getSettings().addDistinct,
        displayVariableList: ["?this"],
        firstInit: false,
        // JSON of the query to be loaded
        preLoad: null,
        langSearch: i18nLabels["en"]
      };

    // register the event listeners to listen for event from the components
    #addCustomEventListners(){
        this.sparnatural.html[0].addEventListener('displayVarName',(e:CustomEvent)=>{
            e.stopImmediatePropagation()
            e.detail ? this.sparnatural.BgWrapper.componentsList.html.addClass('displayVarName'):
            this.sparnatural.BgWrapper.componentsList.html.removeClass('displayVarName')
            this.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse((grp)=>{
            redrawBottomLink(grp.html)
            })
        })
        // executed by VariableSelection, Start-EndclassGroup & VariableSelector
        this.sparnatural.html[0].addEventListener('updateVariableList',(e)=>{
            console.log('updateVariableList event caught')
            e.stopImmediatePropagation()
        })
        
        
        this.sparnatural.html[0].addEventListener('onSubmit',(e)=>{
            console.log('onSubmit even caught')
            e.stopImmediatePropagation()
        })

        // Switch which toggles if the Start and Endvalues are shown as their Var name. e.g Country_1
        this.sparnatural.html[0].addEventListener('switchVariableName',()=>{
            this.sparnatural.BgWrapper.componentsList.html
            .toggleClass("displayVarName");
            // when the varnames are shown, the size of the components can change.
            this.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse((grp:GroupWrapper)=>{
                redrawBottomLink(grp.html)
            })
        })
        // maxvarindex shows the index for the sparql variables. e.g Country_1
        let maxVarIndex = 0
        this.sparnatural.html[0].addEventListener('getMaxVarIndex',(e:CustomEvent)=>{
            e.stopImmediatePropagation()
            maxVarIndex++
            // return the index in callback
            e.detail(maxVarIndex)
        }) 
        
        this.sparnatural.html[0].addEventListener('changeOrderSort',(e:CustomEvent)=>{
            this.orderSort = e.detail
        })

        this.sparnatural.html[0].addEventListener('initGeneralEvent',()=>{
          this.#initGeneralevent()
        })
    }

    #initGeneralevent(){
      let settings = getSettings()
      $("li.groupe").off("mouseover");
      $("li.groupe").off("mouseleave");
      $("li.groupe").on("mouseover", function (event) {
        event.stopImmediatePropagation();
        $("li.groupe").removeClass("OnHover");
        $(this).addClass("OnHover");
      });
      $("li.groupe").on("mouseleave", function (event) {
        event.stopImmediatePropagation();
        $("li.groupe").removeClass("OnHover");
      });
      /*background: linear-gradient(180deg, rgba(255,0,0,1) 0%, rgba(255,0,0,1) 27%, rgba(5,193,255,1) 28%, rgba(5,193,255,1) 51%, rgba(255,0,0,1) 52%, rgba(255,0,0,1) 77%, rgba(0,0,0,1) 78%, rgba(0,0,0,1) 100%); /* w3c */
      //#all_li will contain the elements with class groupe addWhereEnable
      var $all_li = this.sparnatural.html.find("li.groupe");
      var leng = $all_li.length;
      if (leng <= 10) {
        leng = 10;
      }
      var ratio = 100 / leng / 100;
      var prev = 0;
      var cssdef = "linear-gradient(180deg";
      $all_li.each((index, elem) => {
        // elemements are of class="group addwhereEnable"
        var a = (index + 1) * ratio;
        // outer height of html elements classgroup addWhereEnable
        var height = $(elem).find(">div").outerHeight(true);
        cssdef +=
          ", rgba(" +
          settings.backgroundBaseColor +
          "," +
          a +
          ") " +
          prev +
          "px, rgba(" +
          settings.backgroundBaseColor +
          "," +
          a +
          ") " +
          (prev + height) +
          "px";
        prev = prev + height + 1;
        if ($(elem).next().length > 0) {
          //hasAnd is responsible that the connection gets drawn
          $(elem).addClass("hasAnd");
          var this_li = $(elem);
    
          var this_link_and = $(elem).find(".link-and-bottom");
    
          $(this_link_and).height($(this_li).height());
        } else {
          $(elem).removeClass("hasAnd");
        }
      });
    
      this.sparnatural.BgWrapper.html.css({ background: cssdef + ")" });
    }

    addOnSubmitHook() {
        // triggered when Sparnatural is submitted : generates output SPARQL query
        this.sparnatural.html[0].addEventListener("submit", (event) => {
            event.stopImmediatePropagation()
            let settings = getSettings()
          console.log("submit called");
            event.preventDefault();
    
            // prints the JSON query data structure on the console
            var jsonGenerator = new JSONQueryGenerator();
            //var jsonQuery = jsonGenerator.generateQuery(event.data.formObject);
            var jsonQuery = null
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
    
              //TODO enable disable geying out the submitbtn
              //this.SubmitSection.enableSubmit();
            }
        });
      }

}

export default ActionStore
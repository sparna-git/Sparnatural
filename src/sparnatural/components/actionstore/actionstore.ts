import { cssHooks } from "jquery";
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
        // refactor this away
        this.sparnatural.html[0].addEventListener('initGeneralEvent',()=>{
          this.#initGeneralevent()
        })
    }

    #initGeneralevent(){
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
      //#all_li will contain the elements with class groupe addWhereEnable

      let cssdef =''
      //index used in callback
      let index = 0
      let currentHeight = 0
      let previousHeight=0
      // traverse through components and calculate background / linkAndBottoms /  for them
      this.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse((grpWrapper:GroupWrapper)=>{
        previousHeight = currentHeight
        currentHeight = grpWrapper.html.outerHeight(true) + 1
        cssdef += this.#drawBackgroungOfGroupWrapper(index,previousHeight,currentHeight)
        index++
        if(grpWrapper.andSibling) this.#drawLinkAndBottom(grpWrapper,previousHeight,currentHeight)
      })
      this.sparnatural.BgWrapper.html.css('background', cssdef );
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect/element-box-diagram.png
    #drawLinkAndBottom(grpWarpper:GroupWrapper,prevHeight:number,currHeight:number){
      let posUpperStart = grpWarpper.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect()
      let posLowerStart = grpWarpper.andSibling.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect()

      let line = {
        xStart: posUpperStart.left + ((posUpperStart.right - posUpperStart.left)/2),
        xEnd: posLowerStart.left + ((posLowerStart.right - posLowerStart.left)/2),
        yStart: posUpperStart.bottom,
        yEnd: posLowerStart.top,
        length: currHeight+prevHeight
      }

      grpWarpper.linkAndBottom.setLineObj(line)
    }

    #drawBackgroungOfGroupWrapper(index:number,prev:number,currHeight:number) {
      var ratio = 100 / 10 / 100; 
      let a = (index + 1) * ratio;
      let rgba = `rgba(${getSettings().backgroundBaseColor},${a})`
      return `linear-gradient(180deg,${rgba} ${prev}px, ${rgba} ${currHeight}px)`
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
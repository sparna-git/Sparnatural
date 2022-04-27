import { getSettings } from "../../configs/client-configs/settings";
import CriteriaGroup from "../htmlcomponents/groupcontainers/CriteriaGroup";
import { getOffset, initGeneralEvent } from "./globalfunctions";

// TODO refactor in addAndCompnentpart and addWhereComponentpart
export function addComponent(
    thisForm_: {
      sparnatural: any;
      submitOpened?: boolean;
      firstInit: any;
      preLoad?: boolean;
    },
    contexte: any,
    jsonQueryBranch: any = null
  ) {
    console.log("addComponent with");
    console.dir(thisForm_)
    console.dir(contexte)
    console.dir(jsonQueryBranch)
    console.log('fini args')
    let index = thisForm_.sparnatural.components.length; // IMPORTANT check if this does the same as legacy code...
    console.log(index)
    // disable the WHERE if we have reached maximum depth
    var classWherePossible = "addWereEnable";
    if (
      $(contexte).parents("li.groupe").length + 1 ==
      getSettings().maxDepth - 1
    ) {
      classWherePossible = "addWereDisable";
    }
  
    // the connection line between CriteriaGroups
    var gabari =
      '<li class="groupe" data-index="' +
      index +
      '"><span class="link-and-bottom"><span>' +
      getSettings().langSearch.And +
      '</span></span><span class="link-where-bottom"></span><input name="a-' +
      index +
      '" type="hidden" value=""><input name="b-' +
      index +
      '" type="hidden" value=""><input name="c-' +
      index +
      '" type="hidden" value=""></li>';
  
    let ul:JQuery<HTMLElement>
  
    if ($(contexte).is("li")) {
      if ($(contexte).find(">ul").length == 0) {
      console.warn('addComponent WHERE/AND')
        ul = addWhere(contexte)
      } else {
        ul = addAndComponentOnWhere(contexte)
      }
      var gabariEl = $(gabari).appendTo(ul); 
    } else {
      var gabariEl = $(gabari).appendTo(contexte);
    }
    console.log('gabari')
    console.dir(gabariEl)
    $(gabariEl).addClass(classWherePossible);
    var UnCritere = new CriteriaGroup(
      this,
      {
        AncestorHtmlContext: contexte,
        HtmlContext: gabariEl,
        FormContext: thisForm_,
        ContextComponentIndex: index,
      },
      getSettings(),
      this.specProvider,
      // pass the JSON query branch as an input parameter
      jsonQueryBranch
    );
  
    thisForm_.sparnatural.components.push({
      index: index,
      CriteriaGroup: UnCritere,
    });
    initGeneralEvent.call(this, thisForm_, getSettings());
  
    //le critère est inséré et listé dans les composants, on peut lancer l'event de création
    $(UnCritere).trigger("Created");
    if (thisForm_.firstInit == false) {
      thisForm_.firstInit = true;
      $(thisForm_.sparnatural).trigger("initialised");
    }
    return $(gabari);
  }
  
  function addWhere(contexte:any){
      console.warn('addComponent WHERE called')
      var ul = $(
        '<ul class="childsList"><div class="lien-top"><span>' +
          getSettings().langSearch.Where +
          "</span></div></ul>"
      ).appendTo($(contexte));
      var parent_li = $(ul).parent("li");
      let width = calculateHorizontalWidth(parent_li,ul)
      let leftshift = calculateLeftShift(parent_li,ul)
      console.log(`n_width: ${width}, t_width:${leftshift}`)
      $(ul).find(">.lien-top").css("width", width);
      $(parent_li).find(">.link-where-bottom").css("left", leftshift);
      return ul
  }
  
  function addAndComponentOnWhere(contexte:any){
    return $(contexte).find(">ul");
  }
  
  // Calculate the Horizontal line connecting the parent Criteria Group with the WHERE inserted child CriteriaGroup
  function calculateHorizontalWidth(parent_li:JQuery<HTMLElement>,ul:JQuery<HTMLElement>){
    return getOffset($(parent_li).find(">div>.EndClassGroup"), $(ul) as JQuery<HTMLUListElement>) - 57;
  }
  
  // Calculate the Horizontal shift connecting the parent Criteria Group with the WHERE inserted child CriteriaGroup
  function calculateLeftShift(parent_li:JQuery<HTMLElement>,ul:JQuery<HTMLElement>):number {
    return getOffset($(parent_li).find(">div>.EndClassGroup"), $(ul) as JQuery<HTMLUListElement>) + 51;
  }
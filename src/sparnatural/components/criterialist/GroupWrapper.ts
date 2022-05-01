import { getSettings } from "../../../configs/client-configs/settings";
import { findParentOrSiblingCriteria, initGeneralEvent } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import ComponentsList from "../MainComponents/ComponentsList";
import HTMLComponent from "../../HtmlComponent";
import CriteriaGroup from "./CriteriaGroup";
import LinkAndBottom from "./LinkAndBottom";
import LinkWhereBottom from "./LinkWhereBottom";
/*
    This Components represents the <li class="groupe"..> tag
    Possible states are:
    - addWhereEnable: it is possible to have a next WHERE relationship to a child CriteriaList
    - addWhereDisable: it is not(!) possible to have a next WHERE relationship to a child CriteriaList
    - haveWereChild: The CriteriaList has a WHERE connection to a sub CriteriaList
    - completed: The inputs for this CriteriaGroup are all selected
    - hasallCompleted: The inputs for this CriteriaGroup and(!) all subCriteriaLists are all selected
    - hasAnd: The CriteriaList has an ADD connection to a sibling CriteriaList
*/
class GroupWrapper extends HTMLComponent{
    childsList = new ComponentsList(this)// The childsList contains all the sub CriteriaList added with the Where button
    linkAndBottom = new LinkAndBottom(this) // connection line drawn from this CriteriaList with hasAnd CriteriaList
    linkWhereBottom = new LinkWhereBottom(this) // connection line drawn from this CriteriaList hasWhereChild CriteriaList
    completed:boolean 
    hasAllCompleted:boolean 
    hasAnd:boolean
    hasWhereChild:boolean
    specProvider:ISpecProvider
    CriteriaGroup:CriteriaGroup
    Form: { sparnatural: any; submitOpened?: boolean; firstInit: any; preLoad?: boolean; };
    context: any;
    jsonQueryBranch: any;
    index: any;
    
    constructor(ParentComponent:ComponentsList,specProvider:ISpecProvider,thisForm_: {
      sparnatural: any;
      submitOpened?: boolean;
      firstInit: any;
      preLoad?: boolean;
      }, 
      contexte: any,
      index:number,
      jsonQueryBranch?: any
      )
      {
        super('groupe',ParentComponent,null)

        this.specProvider = specProvider
        this.Form = thisForm_
        this.context = contexte
        this.jsonQueryBranch = jsonQueryBranch
        this.index = index
      }

    render(): this {
      super.render()
      // Refactor: This is only important for the css. make css independent of one data-index
      this.html.addClass(`data-index="${this.index}"`)
      this.linkAndBottom.render()
      this.linkWhereBottom.render()

       // disable the WHERE if we have reached maximum dept
      let classWherePossible = this.checkIfMaxDepthIsReached ? "addWhereDisable" : "addWhereEnable"
      this.html.addClass(classWherePossible);
      return this
    }
// TODO refactor in addAndCompnentpart and addWhereComponentpart
addComponent(
  thisForm_: {
    sparnatural: any;
    submitOpened?: boolean;
    firstInit: any;
    preLoad?: boolean;
  },
  contexte: any,
  jsonQueryBranch: any = null
) {
  let index = thisForm_.sparnatural.components.length; 
  
  let ul: JQuery<HTMLElement>;

  if ($(contexte).is("li")) {
    if ($(contexte).find(">ul").length == 0) {
      ul = this.#addWhere(contexte);
    } else {
      ul = this.#addAndComponentOnWhere(contexte);
    }
    var gabariEl = $(gabari).appendTo(ul);
  } else {
    var gabariEl = $(gabari).appendTo(contexte);
  }
  $(gabariEl).addClass(classWherePossible);
  console.log('creating new criterias')
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
    jsonQueryBranch,
    $(contexte).find(`[data-index='${index}']`),
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

checkIfMaxDepthIsReached(contexte:any){
  return (
    this.childsList.GroupWrappers.length ==
    getSettings().maxDepth - 1
  )
}

addWhereComponent(){

}

addAndComponent(){

}

//If the CriteriaGroup should be deleted
onRemoveCriteriaGroup(){
  var index_to_remove = this.CriteriaGroup.id;

  //RemoveSelectedVariable names
  if (this.CriteriaGroup.EndClassGroup.variableSelector != null) {
    this.CriteriaGroup.EndClassGroup.variableSelector.remove();
    this.CriteriaGroup.EndClassGroup.variableSelector = null;
  }
  //Remove option selected if enbled
  if ($(this.CriteriaGroup.html).parents("li").first().hasClass("optionalEnabled")) {
    $(this.CriteriaGroup.html)
      .parents("li")
      .first()
      .parents("li.groupe")
      .each(function () {
        $(this)
          .find(">div>.OptionsGroup")
          .first()
          .addClass("Enabled");
        $(this)
          .find(">div>.OptionsGroup")
          .first()
          .removeClass("Disabled");
      });
    $(this.CriteriaGroup.html)
      .parents("li")
      .first()
      .find("li.groupe")
      .each(function () {
        $(this)
          .find(">div>.OptionsGroup")
          .first()
          .addClass("Enabled");
        $(this)
          .find(">div>.OptionsGroup")
          .first()
          .removeClass("Disabled");
      });
  }
  // iterate on every "line" in the query
  $(this.CriteriaGroup.thisForm_.sparnatural.components).each(function () {
    var parentOrSibling = findParentOrSiblingCriteria.call(
      this,
      this.CriteriaGroup.thisForm_,
      this.index
    );
    if (
      parentOrSibling.type != null &&
      parentOrSibling.type == "parent" &&
      parentOrSibling.element != null
    ) {
      // if the line is a child of the one to remove, remove it too
      var el = parentOrSibling.element as CriteriaGroup;
      if (el.id === index_to_remove) {
        this.CriteriaGroup.onRemoveCriteria();
      }
    }
  });

  var formObject = this.CriteriaGroup.thisForm_;
  var formContextHtml = this.CriteriaGroup.AncestorComponentHtml;

  // remove event listeners
  this.CriteriaGroup.ComponentHtml.outerHTML = this.CriteriaGroup.ComponentHtml.outerHTML; // IMPORTANT : does that actually do something?
  // remove the HTML
  $(this.CriteriaGroup.ComponentHtml).remove();

  var iteration_to_remove = 0;
  $(this.CriteriaGroup.thisForm_.sparnatural.components).each(function (i: number) {
    if (this.index === index_to_remove) {
      iteration_to_remove = i;
    }
  });
  // remove from list of components
  this.CriteriaGroup.thisForm_.sparnatural.components.splice(iteration_to_remove, 1);

  if (this.CriteriaGroup.thisForm_.sparnatural.components.length == 0) {
    // top-level criteria : add first criteria and trigger click on class selection
    var jsonQueryBranch = null;
    // if this is the very first criteria and there is a query to read, start from
    // the first branch
    if (this.CriteriaGroup.thisForm_.preLoad !== false) {
      jsonQueryBranch = this.CriteriaGroup.thisForm_.preLoad.branches[0];
    }

    $(".variablesOtherSelect .sortableItem").remove();

    this.CriteriaGroup.ParentCriteriaList.addComponent.call(
      this,
      formObject,
      formContextHtml,
      jsonQueryBranch
    );


    // re-submit form after deletion
    initGeneralEvent(this, formObject);
    $(this.CriteriaGroup.thisForm_.sparnatural).trigger("submit");
  }
 
}  

#addAndComponentOnWhere(contexte: any) {
  return $(contexte).find(">ul");
}


}
export default GroupWrapper
import { getSettings } from "../../../configs/client-configs/settings";
import { findParentOrSiblingCriteria, initGeneralEvent } from "../../globals/globalfunctions";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import HTMLComponent from "../HtmlComponent";
import CriteriaGroup from "./CriteriaGroup";
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
class CriteriaList extends HTMLComponent{
    childsList:Array<CriteriaList> = [] // The childsList contains all the sub CriteriaList added with the Where button
    linkAndBottom:any // connection line drawn from this CriteriaList with hasAnd CriteriaList
    linkWhereBottom:any // connection line drawn from this CriteriaList hasWhereChild CriteriaList
    completed:boolean 
    hasAllCompleted:boolean 
    hasAnd:boolean
    hasWhereChild:boolean
    specProvider:ISpecProvider
    
    constructor(ParentComponent:HTMLComponent,specProvider:ISpecProvider){
        super('groupe',ParentComponent,null)
        this.specProvider = specProvider
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
  let index = thisForm_.sparnatural.components.length; // IMPORTANT check if this does the same as legacy code...
  // disable the WHERE if we have reached maximum depth
  var classWherePossible = "addWhereEnable";
  if (
    $(contexte).parents("li.groupe").length + 1 ==
    getSettings().maxDepth - 1
  ) {
    classWherePossible = "addWhereDisable";
  }

  // the connection line between CriteriaGroups
  var gabari =
    '<li class="groupe" data-index="' +
    index +
    '"><span class="link-and-bottom"><span>' +
    getSettings().langSearch.And +
    '</span></span><span class="link-where-bottom">'

  //componentslist
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

//If the CriteriaGroup should be deleted
onRemoveCriteriaGroup(CrtGroup:CriteriaGroup){
  var index_to_remove = CrtGroup.id;

  //RemoveSelectedVariable names
  if (CrtGroup.EndClassGroup.variableSelector != null) {
    CrtGroup.EndClassGroup.variableSelector.remove();
    CrtGroup.EndClassGroup.variableSelector = null;
  }
  //Remove option selected if enbled
  if ($(CrtGroup.html).parents("li").first().hasClass("optionalEnabled")) {
    $(CrtGroup.html)
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
    $(CrtGroup.html)
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
  $(CrtGroup.thisForm_.sparnatural.components).each(function () {
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

  var formObject = CrtGroup.thisForm_;
  var formContextHtml = CrtGroup.AncestorComponentHtml;

  // remove event listeners
  CrtGroup.ComponentHtml.outerHTML = CrtGroup.ComponentHtml.outerHTML; // IMPORTANT : does that actually do something?
  // remove the HTML
  $(CrtGroup.ComponentHtml).remove();

  var iteration_to_remove = 0;
  $(CrtGroup.thisForm_.sparnatural.components).each(function (i: number) {
    if (this.index === index_to_remove) {
      iteration_to_remove = i;
    }
  });
  // remove from list of components
  CrtGroup.thisForm_.sparnatural.components.splice(iteration_to_remove, 1);

  if (CrtGroup.thisForm_.sparnatural.components.length == 0) {
    // top-level criteria : add first criteria and trigger click on class selection
    var jsonQueryBranch = null;
    // if this is the very first criteria and there is a query to read, start from
    // the first branch
    if (CrtGroup.thisForm_.preLoad !== false) {
      jsonQueryBranch = CrtGroup.thisForm_.preLoad.branches[0];
    }

    $(".variablesOtherSelect .sortableItem").remove();

    CrtGroup.ParentCriteriaList.addComponent.call(
      this,
      formObject,
      formContextHtml,
      jsonQueryBranch
    );


    // re-submit form after deletion
    initGeneralEvent(this, formObject);
    $(CrtGroup.thisForm_.sparnatural).trigger("submit");
  }

  return false;
 
}


    // Calculate the Horizontal shift connecting the parent Criteria Group with the WHERE inserted child CriteriaGroup
#calculateLeftShift(
    parent_li: JQuery<HTMLElement>,
    ul: JQuery<HTMLElement>
  ): number {
    return (
      this.#getOffset(
        $(parent_li).find(">div>.EndClassGroup"),
        $(ul) as JQuery<HTMLUListElement>
      ) + 51
    );
  }

  #getOffset(
    elem: JQuery<HTMLElement>,
    elemParent: JQuery<HTMLUListElement>
  ) {
    return elem.offset().left - $(elemParent).offset().left;
  }

  redrawBottomLink(parentElementLi: JQuery<HTMLElement>) {
    var ul = $(parentElementLi).children("ul").first();
    if (ul.length == 1) {
        let n_width:any = this.#getOffset(
            $(parentElementLi).find(">div>.EndClassGroup"),
            $(ul) as JQuery<HTMLUListElement>
          )-
          111 +
          15 +
          11 +
          20 +
          5 +
          3;

      var t_width =
        this.#getOffset(
          $(parentElementLi).find(">div>.EndClassGroup"),
          $(ul) as JQuery<HTMLUListElement>
        ) +
        15 +
        11 +
        20 +
        5;
      $(ul).find(">.lien-top").css("width", n_width);
      $(parentElementLi).find(">.link-where-bottom").css("left", t_width);
    }
  }
  #addWhere(contexte: any) {
    var ul = $(
      '<ul class="childsList"><div class="lien-top"><span>' +
        getSettings().langSearch.Where +
        "</span></div></ul>"
    ).appendTo($(contexte));
    var parent_li = $(ul).parent("li");
    let width = this.#calculateHorizontalWidth(parent_li, ul);
    let leftshift = this.#calculateLeftShift(parent_li, ul);
    $(ul).find(">.lien-top").css("width", width);
    $(parent_li).find(">.link-where-bottom").css("left", leftshift);
    return ul;
  }

  

#addAndComponentOnWhere(contexte: any) {
  return $(contexte).find(">ul");
}

  // Calculate the Horizontal line connecting the parent Criteria Group with the WHERE inserted child CriteriaGroup
#calculateHorizontalWidth(
  parent_li: JQuery<HTMLElement>,
  ul: JQuery<HTMLElement>
) {
  return (
    this.#getOffset(
      $(parent_li).find(">div>.EndClassGroup"),
      $(ul) as JQuery<HTMLUListElement>
    ) - 57
  );
}
}
export default CriteriaList
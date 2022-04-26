import { FilteringSpecificationProvider } from "../../spec-providers/FilteringSpecificationProvider";

import { SimpleStatisticsHandler } from "../../StatisticsHandlers";
import CriteriaGroup from "../htmlcomponents/groupcontainers/CriteriaGroup";
import ISettings from "../../configs/client-configs/ISettings"
import { getSettings } from "../../configs/client-configs//settings";

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

  // si il faut descendre d'un niveau
  if ($(contexte).is("li")) {
    if ($(contexte).find(">ul").length == 0) {
      var ul = $(
        '<ul class="childsList"><div class="lien-top"><span>' +
          getSettings().langSearch.Where +
          "</span></div></ul>"
      ).appendTo($(contexte));
      var parent_li = $(ul).parent("li");
      var n_width = 0;
      n_width =
        n_width +
        this.getOffset($(parent_li).find(">div>.EndClassGroup"), $(ul)) - (111 + 15 + 11 + 20 + 5 + 3);
      var t_width =
        this.getOffset($(parent_li).find(">div>.EndClassGroup"), $(ul)) + (15 + 11 + 20 + 5);
      $(ul).attr(
        "data-test",
        this.getOffset($(parent_li).find(">div>.EndClassGroup"), $(ul))
      );
      $(ul).find(">.lien-top").css("width", n_width);
      $(parent_li).find(">.link-where-bottom").css("left", t_width);
    } else {
      var ul = $(contexte).find(">ul");
    }

    var gabariEl = $(gabari).appendTo(ul); //IMPORTANT :Introduced new var gabariEl
  } else {
    var gabariEl = $(gabari).appendTo(contexte); // IMPORTANT : Introduced new var gabariEl
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

//Responsible if a where or and got clicked?
export function initGeneralEvent(thisForm_: any, settings: ISettings) {
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
  var $all_li = $(thisForm_.sparnatural).find("li.groupe");
  var leng = $all_li.length;
  if (leng <= 10) {
    leng = 10;
  }
  console.log("all_li")
  console.dir($all_li)
  var ratio = 100 / leng / 100;
  var prev = 0;
  var cssdef = "linear-gradient(180deg";
  $all_li.each((index,elem) =>{
    // elemements are group addwhereEnable
    var a = (index + 1) * ratio;
    console.log('what was found')
    console.dir(elem)
    // outer height of group addWhereEnable
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
      console.log('hasAND does get called')
      $(elem).addClass("hasAnd");
      var this_li = $(elem);

      var this_link_and = $(elem).find(".link-and-bottom");

      $(this_link_and).height($(this_li).height());
    } else {
      $(elem).removeClass("hasAnd");
    }
  });

  $(thisForm_.sparnatural)
    .find("div.bg-wrapper")
    .css({ background: cssdef + ")" });
}

export function initStatistics(aSpecProvider: any) {
  let specProvider = new FilteringSpecificationProvider(aSpecProvider);
  let settings = getSettings();
  /* Run statistics queries */
  var statisticsHandler = new SimpleStatisticsHandler(
    // endpoint URL
    settings.defaultEndpoint,

    // sparqlPostProcessor
    {
      semanticPostProcess: (sparql: any) => {
        // also add prefixes
        for (key in settings.sparqlPrefixes) {
          sparql = sparql.replace(
            "SELECT ",
            "PREFIX " +
              key +
              ": <" +
              settings.sparqlPrefixes[key] +
              "> \nSELECT "
          );
        }
        return specProvider.expandSparql(sparql);
      },
    }
  );

  const items = specProvider.getAllSparnaturalClasses();
  for (var key in items) {
    var aClass = items[key];

    if (
      !specProvider.isRemoteClass(aClass) &&
      !specProvider.isLiteralClass(aClass)
    ) {
      var options = {
        url: statisticsHandler.countClassUrl(aClass),
        dataType: "json",
        method: "GET",
        data: {
          dataType: "json",
        },
        // keep reference to current class so that it can be accessed in handler
        context: { classUri: aClass },
      };

      var handler = (data: any) =>{
        var count = statisticsHandler.elementCount(data);
        // "this" refers to the "context" property of the options, see jQuery options
        specProvider.notifyClassCount(this.classUri, count);

        if (count > 0) {
          for (const aRange of specProvider.getConnectedClasses(
            this.classUri
          )) {
            for (const aProperty of specProvider.getConnectingProperties(
              this.classUri,
              aRange
            )) {
              var url;
              if (
                specProvider.isRemoteClass(aRange) ||
                specProvider.isLiteralClass(aRange)
              ) {
                url = statisticsHandler.countPropertyWithoutRangeUrl(
                  this.classUri,
                  aProperty
                );
              } else {
                url = statisticsHandler.countPropertyUrl(
                  this.classUri,
                  aProperty,
                  aRange
                );
              }

              var options = {
                url: url,
                dataType: "json",
                method: "GET",
                data: {
                  dataType: "json",
                },
                // keep reference to current class so that it can be accessed in handler
                context: {
                  domain: this.classUri,
                  property: aProperty,
                  range: aRange,
                },
              };

              var handler = (data: any) => {
                var count = statisticsHandler.elementCount(data);
                // "this" refers to the "context" property of the options, see jQuery options
                specProvider.notifyPropertyCount(
                  this.domain,
                  this.property,
                  this.range,
                  count
                );
              };

              var requestProperty = $.ajax(options);
              requestProperty.done(handler);
            }
          }
        }
      };

      var request = $.ajax(options);
      request.done(handler);
    }
  }
}


/**
 * Utility function to find the criteria "above" a given criteria ID, being
 * either the "parent" in a WHERE criteria, or the "sibling"
 * in an AND criteria
 **/
 export function findParentOrSiblingCriteria(thisForm_: { sparnatural: { components: any; }; }, id: string) {
   // TODO refactor type (sibling | parent) to enums and not strings
	let dependant:{type:any,element:any} = {
		type: null,
		element: $(thisForm_.sparnatural).find('li[data-index="'+id+'"]')
	}
  //
	var dep_id: number = null ;
	if ($(dependant.element).parents('li').length > 0) {			
		dep_id = parseInt($($(dependant.element).parents('li')[0]).attr('data-index')) ;
		dependant = {type : 'parent', element: null} // TODO refactor element:null; if that happens and for each will not change element the the calling function will crash
	} else {
		if ($(dependant.element).prev().length > 0) {
			dep_id = parseInt($(dependant.element).prev().attr('data-index')) ;
			dependant = {type : 'sibling', element: null} // TODO refactor element:null; if that happens and for each will not change element the the calling function will crash
		}
	} 

	thisForm_.sparnatural.components.forEach((component:{index:number,CriteriaGroup:CriteriaGroup}) => {	
		if (component.index == dep_id) {
			dependant = {
				type: dependant.type,
				element: component.CriteriaGroup
			}
		} 
	}) ;

  // catch this error otherwise calling function will crash
  if(!dependant.element) throw Error("Didn't find the dependant element. dependant.element should not be null.")

	return dependant ;
}

export function eventProxiCriteria(e: { data: { arg1: any; arg2: any; }; }) {
	console.log("eventproxycriteria")

	var arg1 = e.data.arg1;
	var arg2 = e.data.arg2;
	arg1[arg2](e) ;
}

export function localName(uri: string) {
	if (uri.indexOf("#") > -1) {
		return uri.split("#")[1] ;
	} else {
		var components = uri.split("/") ;
		return components[components.length - 1] ;
	}
}
export function redrawBottomLink(parentElementLi: JQuery<HTMLElement>) {
	var n_width = 0;
	var ul = $(parentElementLi).children('ul').first() ;
	if (ul.length == 1) {
		n_width = n_width + getOffset( $(parentElementLi).find('>div>.EndClassGroup'), $(ul) ) - 111 + 15 + 11 + 20 + 5 + 3 ;
		var t_width = getOffset( $(parentElementLi).find('>div>.EndClassGroup'), $(ul) ) + 15 + 11 + 20 + 5  ;
		$(ul).find('>.lien-top').css('width', n_width) ;
		$(parentElementLi).find('>.link-where-bottom').css('left', t_width) ;
	}
}
export function getOffset( elem: JQuery<HTMLElement>, elemParent: JQuery<HTMLUListElement> ) {
	return elem.offset().left - $(elemParent).offset().left ;
}

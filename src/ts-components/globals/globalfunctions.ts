import { FilteringSpecificationProvider } from "../../FilteringSpecificationProvider";
import JsonLdSpecificationProvider from "../../JsonLdSpecificationProvider";
import { RDFSpecificationProvider } from "../../RDFSpecificationProvider";
import { SimpleStatisticsHandler } from "../../StatisticsHandlers";
import CriteriaGroup from "../htmlcomponents/groupcontainers/CriteriaGroup";
import ISettings from "./ISettings";
import { getSettings } from "./settings";

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
  console.log("addComponent");
  let index = thisForm_.sparnatural.components.length; // IMPORTANT check if this does the same as legacy code...

  // disable the WHERE if we have reached maximum depth
  var classWherePossible = "addWereEnable";
  if (
    $(contexte).parents("li.groupe").length + 1 ==
    getSettings().maxDepth - 1
  ) {
    classWherePossible = "addWereDisable";
  }

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
        this.getOffset($(parent_li).find(">div>.EndClassGroup"), $(ul)) -
        111 +
        15 +
        11 +
        20 +
        5 +
        3;
      var t_width =
        this.getOffset($(parent_li).find(">div>.EndClassGroup"), $(ul)) +
        15 +
        11 +
        20 +
        5;
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

  // var $all_li = $(thisForm_.sparnatural).find('li.groupe') ;
  var $all_li = $(thisForm_.sparnatural).find("li.groupe");
  var leng = $all_li.length;
  if (leng <= 10) {
    leng = 10;
  }
  var ratio = 100 / leng / 100;
  var prev = 0;
  var cssdef = "linear-gradient(180deg";
  $all_li.each(function (index) {
    var a = (index + 1) * ratio;
    var height = $(this).find(">div").outerHeight(true);
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
    if ($(this).next().length > 0) {
      $(this).addClass("hasAnd");
      var this_li = $(this);

      var this_link_and = $(this).find(".link-and-bottom");

      $(this_link_and).height($(this_li).height());
    } else {
      $(this).removeClass("hasAnd");
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
      semanticPostProcess: function (sparql: any) {
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

      var handler = function (data: any) {
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

              var handler = function (data: any) {
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

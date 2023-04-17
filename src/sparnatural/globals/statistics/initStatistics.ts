import { getSettings } from "../../../sparnatural/settings/defaultSettings";
import { FilteringSpecificationProvider } from "../../spec-providers/FilteringSpecificationProvider";
import { SimpleStatisticsHandler } from "./StatisticsHandlers";

export function initStatistics(aSpecProvider: any, lang: string) {
  let specProvider = new FilteringSpecificationProvider(aSpecProvider, lang);
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
        return specProvider.expandSparql(sparql, {});
      },
    }
  );

  const items = specProvider.getAllSparnaturalEntities();
  for (var key in items) {
    var aClass = items[key];

    if (
      !specProvider.isRemoteEntity(aClass) &&
      !specProvider.isLiteralEntity(aClass)
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

      var handler = (data: any) => {
        var count = statisticsHandler.elementCount(data);
        // "this" refers to the "context" property of the options, see jQuery options
        specProvider.notifyClassCount(this.classUri, count);

        if (count > 0) {
          for (const aRange of specProvider.getConnectedEntities(
            this.classUri
          )) {
            for (const aProperty of specProvider.getConnectingProperties(
              this.classUri,
              aRange
            )) {
              var url;
              if (
                specProvider.isRemoteEntity(aRange) ||
                specProvider.isLiteralEntity(aRange)
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

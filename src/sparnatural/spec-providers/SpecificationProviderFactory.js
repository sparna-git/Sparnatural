import JsonLdSpecificationProvider from "./JsonLdSpecificationProvider";
import { OWLSpecificationProvider } from "./OWLSpecificationProvider";

class SpecificationProviderFactory {
  build(config, language, callback) {
    if (typeof config == "object") {
      // if the config is a JSON object in the page, read it directly
      callback(new JsonLdSpecificationProvider(config, language));
    } else if (config.includes("@prefix") || config.includes("<http")) {
      // inline Turtle
      new OWLSpecificationProvider.build(config, language).then(function (
        provider
      ) {
        console.log(provider);
        callback(provider);
      });
    } else {
      if (config.includes("json")) {
        // otherwise interpret it as a URL, load id and parse the result
        $.when(
          $.getJSON(config, function (data) {
            callback(new JsonLdSpecificationProvider(data, language));
          }).fail(function (response) {
            console.error(
              "Sparnatural - unable to load JSON config file : " + config
            );
            console.log(response);
          })
        ).done(function () {});
      } else {
        $.ajax({
          method: "GET",
          url: config,
          dataType: "text",
        })
          .done(function (configData) {
            OWLSpecificationProvider.build(
              configData,
              config,
              language,
              function(provider) {
                console.log(provider);
                callback(provider);
              }
            );
          })
          .fail(function (response) {
            console.error(
              "Sparnatural - unable to load RDF config file : " + config
            );
            console.log(response);
          });
      }
    }
  }
}
export default SpecificationProviderFactory;

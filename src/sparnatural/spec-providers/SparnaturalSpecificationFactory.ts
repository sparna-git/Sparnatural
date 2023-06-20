import { BaseRDFReader } from "./BaseRDFReader";
import JsonLdSpecificationProvider from "./jsonld//JsonLdSpecificationProvider";
import { OWLSpecificationProvider } from "./owl//OWLSpecificationProvider";
import { SHACLSpecificationProvider } from "./shacl/SHACLSpecificationProvider";
import { Quad, Store } from "n3";

class SparnaturalSpecificationFactory {
  build(config:any, language:string, callback:any) {
    if (typeof config == "object") {
      // if the config is a JSON object in the page, read it directly
      callback(new JsonLdSpecificationProvider(config, language));
    } else if (config.includes("@prefix") || config.includes("<http")) {
      // inline Turtle
      BaseRDFReader.buildStore(config, "http://sparnatural.eu#", (theStore:Store<Quad>) => {
        var provider = new SHACLSpecificationProvider(
          theStore,
          language
        );
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
          })
        ).done(function () {});
      } else {
        $.ajax({
          method: "GET",
          url: config,
          dataType: "text",
        })
          .done(function (configData) {

            if(config.includes("shacl")) {
              BaseRDFReader.buildStore(configData, config, (theStore:Store<Quad>) => {
                var provider = new SHACLSpecificationProvider(
                  theStore,
                  language
                );
                callback(provider);
              });
            } else {
              BaseRDFReader.buildStore(configData, config, (theStore:Store<Quad>) => {
                var provider = new OWLSpecificationProvider(
                  theStore,
                  language
                );
                callback(provider);
              });
            }

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
export default SparnaturalSpecificationFactory;

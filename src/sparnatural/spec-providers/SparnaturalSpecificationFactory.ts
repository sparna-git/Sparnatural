import { DataFactory } from 'rdf-data-factory';
import { RdfStore } from "rdf-stores";
import { BaseRDFReader, RDF } from "./BaseRDFReader";
import JsonLdSpecificationProvider from "./jsonld//JsonLdSpecificationProvider";
import { OWLSpecificationProvider } from "./owl//OWLSpecificationProvider";
import { SH, SHACLSpecificationProvider } from "./shacl/SHACLSpecificationProvider";

class SparnaturalSpecificationFactory {

  build(cfg:any, language:string, callback:any) {
    if (typeof cfg == "object") {
      // if the config is a JSON object in the page, read it directly
      callback(new JsonLdSpecificationProvider(cfg, language));
    } else if (cfg.includes("@prefix") || cfg.includes("<http")) {
      // inline Turtle
      BaseRDFReader.buildStoreFromString(cfg, "https://sparnatural.eu", (theStore:RdfStore) => {
        let provider = new SHACLSpecificationProvider(
          theStore,
          language
        );
        callback(provider); 
      });
    } else {
        if (cfg.includes("json")) {
          // if it contains "json" parse the result as JSON
          $.when(
            $.getJSON(cfg, function (data) {
              callback(new JsonLdSpecificationProvider(data, language));
            }).fail(function (response) {
              console.error(
                "Sparnatural - unable to load JSON config file : " + cfg
              );
            })
          ).done(function () {});
        } else {

          let configs = (cfg as string).split(" ");
          console.log("Configuring from " + configs.length + " configs");

          let DF = new DataFactory();
    
          BaseRDFReader.buildStore(configs, (theStore:RdfStore) => {
            if(theStore.asDataset().has(
              DF.quad(
                null,
                RDF.TYPE,
                SH.NODE_SHAPE,
                null
              )
            )) {
              let provider = new SHACLSpecificationProvider(
                theStore,
                language
              );
              callback(provider); 
            } else {
              let provider = new OWLSpecificationProvider(
                theStore,
                language
              );
              callback(provider);
            }
          });
        }
    }
  }
}
export default SparnaturalSpecificationFactory;

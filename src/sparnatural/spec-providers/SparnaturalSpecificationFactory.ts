import { DataFactory } from 'rdf-data-factory';
import { RdfStore } from "rdf-stores";
import { BaseRDFReader, RDF } from "./BaseRDFReader";
import { OWLSpecificationProvider } from "./owl//OWLSpecificationProvider";
import { SH, SHACLSpecificationProvider } from "./shacl/SHACLSpecificationProvider";

let DF = new DataFactory();

class SparnaturalSpecificationFactory {

  build(cfg:any, language:string, callback:any) {
    if (cfg.includes("@prefix") || cfg.includes("<http")) {
      // inline Turtle
      BaseRDFReader.buildStoreFromString(cfg, "https://sparnatural.eu", (theStore:RdfStore) => {
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
    } else {
      let configs = (cfg as string).split(" ");
      console.log("Configuring from " + configs.length + " configs");

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
export default SparnaturalSpecificationFactory;

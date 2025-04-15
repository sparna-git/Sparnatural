import { DataFactory } from 'rdf-data-factory';
import { RdfStore } from "rdf-stores";
import { BaseRDFReader, RDF } from "./BaseRDFReader";
import { OWLSpecificationProvider } from "./owl//OWLSpecificationProvider";
import { SH, SHACLSpecificationProvider } from "./shacl/SHACLSpecificationProvider";
import { Catalog } from '../settings/Catalog';

let DF = new DataFactory();

class SparnaturalSpecificationFactory {

  build(cfg:any, language:string, catalog:Catalog|undefined, callback:any) {
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
      // split on whitespace and load all files
      let configs = (cfg as string).split(/\s+/).filter((e:string) => e.length > 0);
      console.log("Configuring from " + configs.length + " configs");

      if(catalog) {
        // also add all statistics files of selected endpoints
        // note that endpoint filtering happened before
        catalog.getServices().forEach(s => {
          if(s.getExtent()){
            configs.push(s.getExtent());
            console.log("Adding a statistics file to store : "+s.getExtent());
          }
        });
      }

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

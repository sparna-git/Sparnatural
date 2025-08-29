import { DataFactory } from 'rdf-data-factory';
import rdfParser from "rdf-parse";
var Readable = require('stream').Readable
import { RdfStore } from 'rdf-stores';
import { Quad, Stream } from "@rdfjs/types";
import { StoreModel } from './StoreModel';

const factory = new DataFactory();

export class RdfStoreReader {
 

  static buildStoreFromString(configData:string, filePath:string, callback: any) {
    const store:RdfStore = RdfStore.createDefault();
    console.log("Building store from string...");
    let quadStream: Stream<Quad> = RdfStoreReader.#toQuadStream(configData,filePath);

    store.import(quadStream)
      .on('error', () => console.log("Problem parsing inline config"))
      .once('end', () => callback(store));
  }


  static buildStore(files: Array<string>, callback: any) {
    // Create a new store with default settings
    // see https://www.npmjs.com/package/rdf-stores
    const store:RdfStore = RdfStore.createDefault();

    let promises = new Array<Promise<RdfStore>>();
    for(let config of files) {
      console.log("Importing in store '" + config + "'");

      let p:Promise<RdfStore> = new Promise((resolve, reject) =>
        $.ajax({
          method: "GET",
          url: config,
          dataType: "text",
        }).done(function (configData) {

          let quadStream: Stream<Quad> = RdfStoreReader.#toQuadStream(configData,config);

          store.import(quadStream)
            .on('error', reject)
            .once('end', () => resolve(store));

        }).fail(function (response) {
          console.error(
            "Sparnatural - unable to load RDF config file : " + config
          );
          reject();
        })
      ); // end Promise

      promises.push(p);
    }

    // when all done, call callback
    Promise.all(promises).then((values) => {
      console.log(
        "Specification store populated with " +
          store.countQuads(
            null,
            null,
            null,
            null
          ) +
          " triples."
      );
      callback(store);
    })
  }

  static #toQuadStream(string:any, filePath:any) {
    // turn input string into a stream
    var textStream = new Readable();
    textStream.push(string)    // the string you want
    textStream.push(null)     // indicates end-of-file basically - the end of the stream

    var quadStream;
    try {
      // attempt to parse based on path
      console.log("Attempt to parse determining format from path " + filePath+"...");
      quadStream = rdfParser.parse(textStream, { path: filePath });
    } catch (exception) {
      try {
        console.log("Attempt to parse in Turtle...");
        // attempt to parse in turtle
        quadStream = rdfParser.parse(textStream, {
          contentType: "text/turtle",
        });
      } catch (exception) {
        console.log("Attempt to parse in RDF/XML...");
        // attempt to parse in RDF/XML
        quadStream = rdfParser.parse(textStream, {
          contentType: "application/rdf+xml",
        });
      }
    }

    return quadStream;
  }
}

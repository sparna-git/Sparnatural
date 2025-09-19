import { DataFactory } from 'rdf-data-factory';
import rdfParser from "rdf-parse";
var Readable = require('stream').Readable
import { RdfStore } from 'rdf-stores';
import { Quad, Stream } from "@rdfjs/types";

const factory = new DataFactory();

/**
 * Utility class to build an RDF store from files or strings
 */
export class RdfStoreReader {
 

  /**
   * @param configData the RDF content as a string
   * @param filePath the file path to determine the format from
   * @param callback 
   * @returns a store built from the string
   */
  static buildStoreFromString(configData:string, filePath:string, callback: (store:RdfStore) => void) {
    const store:RdfStore = RdfStore.createDefault();
    let quadStream: Stream<Quad> = RdfStoreReader.#toQuadStream(configData,filePath);

    store.import(quadStream)
      .on('error', () => console.error("Problem parsing inline config"))
      .once('end', () => callback(store));
  }

  /**
   * @param files array of file paths to load into the store
   * @param callback 
   * @returns a store built from the files
   */
  static buildStore(files: Array<string>, callback: (store:RdfStore) => void) {
    // Create a new store with default settings
    // see https://www.npmjs.com/package/rdf-stores
    const store:RdfStore = RdfStore.createDefault();

    let promises = new Array<Promise<RdfStore>>();
    for(let config of files) {
      console.log("Importing file in store : '" + config + "'");

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
            "Unable to load file in store : " + config
          );
          reject();
        })
      ); // end Promise

      promises.push(p);
    }

    // when all done, call callback
    Promise.all(promises).then((values) => {
      console.log(
        "Store populated with " +
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

import factory from "@rdfjs/data-model";
import { NamedNode, Quad, Store } from "n3";
import { RDF } from "./OWLSpecificationProvider";
import rdfParser from "rdf-parse";
var Readable = require('stream').Readable
import { storeStream } from "rdf-store-stream";

export class BaseRDFReader {
    protected lang: string;
    protected store: Store<Quad>;

    constructor(n3store: Store<Quad>, lang: string) {
        // init memory store
        this.store = n3store;
        this.lang = lang;
    }

    static buildStore(string: any, filePath: string, callback: any) {
        console.log("Building Store from " + filePath);
    
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
    
        // import into store
        storeStream(quadStream).then((theStore:Store<Quad>) => {
          console.log(
            "Specification store populated with " +
              theStore.countQuads(
                undefined,
                undefined,
                undefined,
                undefined
              ) +
              " triples."
          );
          callback(theStore);
        });
      }

  /**
   * Reads the given property on an entity, and return values as an array
   **/
  _readAsResource(uri: any, property: any) {
    return this.store
      .getQuads(factory.namedNode(uri), property, undefined, undefined)
      .map((quad: { object: { id: any } }) => quad.object.id);
  }

  /**
   * Reads the given property on an entity, and returns the first value found, or null if not found
   **/
  _readAsSingleResource(uri: any, property: any) {
    var values = this._readAsResource(uri, property);

    if (values.length > 0) {
      return values[0];
    }

    return null;
  }

  _readAsLiteral(uri: any, property: any) {
    return this.store
      .getQuads(factory.namedNode(uri), property, undefined, undefined)
      .map((quad: { object: { value: any } }) => quad.object.value);
  }

  _readAsSingleLiteral(uri: any, property: any) {
    var values = this._readAsLiteral(uri, property);
    if (values.length == 0) {
      return undefined;
    } else {
      return values[0];
    }
  }

  _readAsLiteralWithLang(
    uri: any,
    property: any,
    lang: any,
    defaultToNoLang = true
  ) {
    var values = this.store
      .getQuads(factory.namedNode(uri), property, undefined, undefined)
      .filter((quad: any) => quad.object.language == lang)
      .map((quad: { object: { value: any } }) => quad.object.value);

    if (values.length == 0 && defaultToNoLang) {
      values = this.store
        .getQuads(factory.namedNode(uri), property, undefined, undefined)
        .filter((quad: any) => quad.object.language == "")
        .map((quad: { object: { value: any } }) => quad.object.value);
    }

    return values.join(", ");
  }

  _readAsRdfNode(rdfNode: any, property: any) {
    return this.store
      .getQuads(rdfNode, property, undefined, undefined)
      .map((quad: { object: any }) => quad.object);
  }

  _hasProperty(rdfNode: any, property: any) {
    return (
      this.store.getQuads(
        rdfNode,
        property,
        undefined,
        undefined
      ).length > 0
    );
  }

   /**
   * Reads rdf:type(s) of an entity, and return them as an array
   **/
    _readRdfTypes(uri: any) {
        return this._readAsResource(uri, RDF.TYPE);
    }


    /****** LIST HANDLING ********/

    _readList_rec(list: any) {
        var result = this.store
          .getQuads(list, RDF.FIRST, undefined, undefined)
          .map((quad: { object: { id: any } }) => quad.object.id);
    
        var subLists = this._readAsRdfNode(list, RDF.REST);
        if (subLists.length > 0) {
          result = result.concat(this._readList_rec(subLists[0]));
        }
    
        return result;
      }
    
      _readRootList(listId: any): any {
        var root = this._readSuperList(listId);
        if (root == null) {
          return listId;
        } else {
          return this._readRootList(root);
        }
      }
    
      _readSuperList(listId: any) {
        const propertyQuads = this.store.getQuads(
          undefined,
          RDF.REST,
          listId,
          undefined
        );
    
        if (propertyQuads.length > 0) {
          return propertyQuads[0].subject.id;
        } else {
          return null;
        }
      }

      _pushIfNotExist(item: any, items: any[]) {
        if (items.indexOf(item) < 0) {
          items.push(item);
        }
    
        return items;
      }
}
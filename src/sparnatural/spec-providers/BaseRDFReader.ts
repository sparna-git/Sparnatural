import { DataFactory } from 'rdf-data-factory';
import rdfParser from "rdf-parse";
var Readable = require('stream').Readable
import Datasources from "../ontologies/SparnaturalConfigDatasources";
import { RdfStore } from 'rdf-stores';
import { NamedNode, Quad, Stream, Term } from "@rdfjs/types";

const factory = new DataFactory();

const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
export const RDF = {
  LANG_STRING: factory.namedNode(RDF_NAMESPACE + "langString") as NamedNode,
  TYPE: factory.namedNode(RDF_NAMESPACE + "type") as NamedNode,
  FIRST: factory.namedNode(RDF_NAMESPACE + "first") as NamedNode,
  REST: factory.namedNode(RDF_NAMESPACE + "rest") as NamedNode,
  NIL: factory.namedNode(RDF_NAMESPACE + "nil") as NamedNode,
};

const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#";
export const RDFS = {
  CLASS: factory.namedNode(RDFS_NAMESPACE + "Class") as NamedNode,
  LABEL: factory.namedNode(RDFS_NAMESPACE + "label") as NamedNode,
  DOMAIN: factory.namedNode(RDFS_NAMESPACE + "domain") as NamedNode,
  RANGE: factory.namedNode(RDFS_NAMESPACE + "range") as NamedNode,
  SUBPROPERTY_OF: factory.namedNode(
    RDFS_NAMESPACE + "subPropertyOf"
  ) as NamedNode,
  SUBCLASS_OF: factory.namedNode(RDFS_NAMESPACE + "subClassOf") as NamedNode,
};

export class BaseRDFReader {
    protected lang: string;
    protected store: RdfStore;

    constructor(n3store: RdfStore, lang: string) {
        this.store = n3store;
        this.lang = lang;
    }

    static buildStoreFromString(configData:string, filePath:string, callback: any) {
      const store:RdfStore = RdfStore.createDefault();
      let quadStream: Stream<Quad> = BaseRDFReader.#toQuadStream(configData,filePath);

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

            let quadStream: Stream<Quad> = BaseRDFReader.#toQuadStream(configData,config);

            store.import(quadStream)
              .on('error', reject)
              .once('end', () => resolve(store));

          }).fail(function (response) {
            console.error(
              "Sparnatural - unable to load RDF config file : " + config
            );
            console.log(response);
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

    static buildStoreBak(files: Map<string,string>, callback: any) {
        // Create a new store with default settings
        // see https://www.npmjs.com/package/rdf-stores
        const store:RdfStore = RdfStore.createDefault();

        let promises = new Array<Promise<RdfStore>>();
        for(let key of files.keys()) {
          console.log("Importing in store '" + key + "'");
          let quadStream: Stream<Quad> = BaseRDFReader.#toQuadStream(files.get(key),key);
          
          let p:Promise<RdfStore> = new Promise((resolve, reject) => store.import(quadStream)
            .on('error', reject)
            .once('end', () => resolve(store)));
          
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

      _readDatasourceAnnotationProperty(
        propertyOrClassId: any,
        datasourceAnnotationProperty: any
      ) {
        // read predicate datasource
        const datasourceQuads = this.store.getQuads(
          factory.namedNode(propertyOrClassId),
          factory.namedNode(datasourceAnnotationProperty),
          null,
          null
        );
    
        if (datasourceQuads.length == 0) {
          return null;
        }
    
        for (const datasourceQuad of datasourceQuads) {
          const datasourceUri = datasourceQuad.object.value;
          var knownDatasource = Datasources.DATASOURCES_CONFIG.get(datasourceUri);
          if (knownDatasource != null) {
            return knownDatasource;
          } else {
            return this.#_buildDatasource(datasourceUri);
          }
        }
    
        // IMPORTANT should here be propper error handling?
        return {};
      }

   /**
   * {
   *   queryString: "...",
   *   queryTemplate: "...",
   *   labelPath: "...",
   *   labelProperty: "...",
   *   childrenPath: "...",
   *   childrenProperty: "...",
   *   noSort: true
   * }
   **/

  #_buildDatasource(datasourceUri: string) {
    var datasource: {
      queryString?: string;
      queryTemplate?: any;
      labelPath?: any;
      labelProperty?: any;
      childrenPath?: any;
      childrenProperty?: any;
      sparqlEndpointUrl?: any;
      noSort?: any;
    } = {};
    // read datasource characteristics

    // Alternative 1 : read optional queryString
    var queryStrings = this._readAsLiteral(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.QUERY_STRING)
    );

    if (queryStrings.length > 0) {
      datasource.queryString = queryStrings[0];
    }

    // Alternative 2 : query template + label path
    var queryTemplates = this._readAsResource(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.QUERY_TEMPLATE)
    );
    if (queryTemplates.length > 0) {
      var theQueryTemplate = queryTemplates[0];
      var knownQueryTemplate =
        Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(theQueryTemplate);
      if (knownQueryTemplate != null) {
        // 2.1 It is known in default Sparnatural ontology
        datasource.queryTemplate = knownQueryTemplate;
      } else {
        // 2.2 Unknown, read the query string on the query template
        var queryStrings = this._readAsResource(
          factory.namedNode(theQueryTemplate),
          factory.namedNode(Datasources.QUERY_STRING)
        );
        if (queryStrings.length > 0) {
          var queryString = queryStrings[0];
          datasource.queryTemplate =
            queryString.startsWith('"') && queryString.endsWith('"')
              ? queryString.substring(1, queryString.length - 1)
              : queryString;
        }
      }

      // labelPath
      var labelPaths = this._readAsLiteral(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.LABEL_PATH)
      );
      if (labelPaths.length > 0) {
        datasource.labelPath = labelPaths[0];
      }

      // labelProperty
      var labelProperties = this._readAsResource(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.LABEL_PROPERTY)
      );
      if (labelProperties.length > 0) {
        datasource.labelProperty = labelProperties[0];
      }

      // childrenPath
      var childrenPaths = this._readAsLiteral(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.CHILDREN_PATH)
      );
      if (childrenPaths.length > 0) {
        datasource.childrenPath = childrenPaths[0];
      }

      // childrenProperty
      var childrenProperties = this._readAsResource(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.CHILDREN_PROPERTY)
      );
      if (childrenProperties.length > 0) {
        datasource.childrenProperty = childrenProperties[0];
      }
    }

    // read optional sparqlEndpointUrl
    var sparqlEndpointUrls = this._readAsLiteral(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.SPARQL_ENDPOINT_URL)
    );
    if (sparqlEndpointUrls.length > 0) {
      datasource.sparqlEndpointUrl = sparqlEndpointUrls[0];
    }

    // read optional noSort
    var noSorts = this._readAsLiteral(factory.namedNode(datasourceUri), factory.namedNode(Datasources.NO_SORT));
    if (noSorts.length > 0) {
      datasource.noSort = noSorts[0] === "true";
    }

    return datasource;
  }


  /**
   * Reads the given property on an entity, and return values as an array
   **/
  _readAsResource(uri: Term, property: Term) {
    return this.store
      .getQuads(uri, property, null, null)
      .map((quad: { object: { value: any } }) => quad.object.value);
  }

  /**
   * Reads the given property on an entity, and returns the first value found, or null if not found
   **/
  _readAsSingleResource(uri: Term, property: Term) {
    var values = this._readAsResource(uri, property);

    if (values.length > 0) {
      return values[0];
    }

    return null;
  }

  _readAsLiteral(uri: Term, property: Term) {
    return this.store
      .getQuads(uri, property, null, null)
      .map((quad: { object: { value: any } }) => quad.object.value);
  }

  _readAsSingleLiteral(uri: Term, property: Term) {
    var values = this._readAsLiteral(uri, property);
    if (values.length == 0) {
      return undefined;
    } else {
      return values[0];
    }
  }

  _readAsLiteralWithLang(
    uri: Term,
    property: Term,
    lang: string,
    defaultToNoLang = true
  ) {
    var values = this.store
      .getQuads(uri, property, null, null)
      .filter((quad: any) => quad.object.language == lang)
      .map((quad: { object: { value: any } }) => quad.object.value);

    if (values.length == 0 && defaultToNoLang) {
      values = this.store
        .getQuads(uri, property, null, null)
        .filter((quad: any) => quad.object.language == "")
        .map((quad: { object: { value: any } }) => quad.object.value);
    }

    return values.join(", ");
  }

  _readAsRdfNode(rdfNode: Term, property: Term) {
    return this.store
      .getQuads(rdfNode, property, null, null)
      .map((quad: { object: any }) => quad.object);
  }

  _hasProperty(rdfNode: Term, property: Term) {
    return this._hasTriple(rdfNode, property, null);
  }

  _hasTriple(rdfNode: Term, property: Term, value:Term|null) {
    return (
      this.store.getQuads(
        rdfNode,
        property,
        value,
        null
      ).length > 0
    );
  }

   /**
   * Reads rdf:type(s) of an entity, and return them as an array
   **/
    _readRdfTypes(uri: Term) {
        return this._readAsResource(uri, RDF.TYPE);
    }


    /****** LIST HANDLING ********/

    _listContains(rdfNode: any, propertyList: any, property:any, value:any) {
      let found:boolean = false;
      let listContent:any[] = this._readAsList(rdfNode, propertyList);
      listContent.forEach(node => {
        if(this._hasTriple(node, property, value)) found=true;
      });
      return found;
    }

    /**
     * returns RDFTerms
     */
    _readAsList(rdfNode: any, property: any) {
      let result:any[] = new Array<any>();
      this.store
        .getQuads(rdfNode, property, null, null)
        .map((quad: { object: any }) => {
          result.push(...this._readList_rec(quad.object))
        });
      return result;
    }

    /**
     * returns RDFTerms
     */
    _readList_rec(list: any) {
        var result = this.store
          .getQuads(list, RDF.FIRST, null, null)
          .map((quad: { object: { value: any } }) => quad.object);
    
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
          null,
          RDF.REST,
          listId,
          null
        );
    
        if (propertyQuads.length > 0) {
          return propertyQuads[0].subject.value;
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
import { DataFactory } from 'rdf-data-factory';
import rdfParser from "rdf-parse";
var Readable = require('stream').Readable
import { Datasources } from "../ontologies/SparnaturalConfigDatasources";
import { RdfStore } from 'rdf-stores';
import { NamedNode, Quad, Stream, Term } from "@rdfjs/types";
import { StoreModel } from './StoreModel';
import { RDF } from '../../rdf/vocabularies/RDF';
import { RDFS } from '../../rdf/vocabularies/RDFS';

const factory = new DataFactory();

export class BaseRDFReader {
    protected lang: string;
    protected store: RdfStore;
    protected graph: StoreModel;

    constructor(n3store: RdfStore, lang: string) {
        this.store = n3store;
        this.lang = lang;
        this.graph = new StoreModel(n3store);
    }

    static buildStoreFromString(configData:string, filePath:string, callback: any) {
      const store:RdfStore = RdfStore.createDefault();
      console.log("Building store from string...");
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
    var queryStrings = this.graph.readProperty(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.QUERY_STRING)
    ).map(n=>n.value);

    if (queryStrings.length > 0) {
      datasource.queryString = queryStrings[0];
    }

    // Alternative 2 : query template + label path
    var queryTemplates = this.graph.readProperty(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.QUERY_TEMPLATE)
    ).map(n=>n.value);

    if (queryTemplates.length > 0) {
      var theQueryTemplate = queryTemplates[0];
      var knownQueryTemplate =
        Datasources.QUERY_STRINGS_BY_QUERY_TEMPLATE.get(theQueryTemplate);
      if (knownQueryTemplate != null) {
        // 2.1 It is known in default Sparnatural ontology
        datasource.queryTemplate = knownQueryTemplate;
      } else {
        // 2.2 Unknown, read the query string on the query template
        var queryStrings = this.graph.readProperty(
          factory.namedNode(theQueryTemplate),
          factory.namedNode(Datasources.QUERY_STRING)
        ).map(n=>n.value);
        if (queryStrings.length > 0) {
          var queryString = queryStrings[0];
          datasource.queryTemplate =
            queryString.startsWith('"') && queryString.endsWith('"')
              ? queryString.substring(1, queryString.length - 1)
              : queryString;
        }
      }

      // labelPath
      var labelPaths = this.graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.LABEL_PATH)
      ).map(n=>n.value);
      if (labelPaths.length > 0) {
        datasource.labelPath = labelPaths[0];
      }

      // labelProperty
      var labelProperties = this.graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.LABEL_PROPERTY)
      ).map(n=>n.value);
      if (labelProperties.length > 0) {
        datasource.labelProperty = labelProperties[0];
      }

      // childrenPath
      var childrenPaths = this.graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.CHILDREN_PATH)
      ).map(n=>n.value);
      if (childrenPaths.length > 0) {
        datasource.childrenPath = childrenPaths[0];
      }

      // childrenProperty
      var childrenProperties = this.graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.CHILDREN_PROPERTY)
      ).map(n=>n.value);
      if (childrenProperties.length > 0) {
        datasource.childrenProperty = childrenProperties[0];
      }
    }

    // read optional sparqlEndpointUrl
    var sparqlEndpointUrls = this.graph.readProperty(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.SPARQL_ENDPOINT_URL)
    ).map(n=>n.value);
    if (sparqlEndpointUrls.length > 0) {
      datasource.sparqlEndpointUrl = sparqlEndpointUrls[0];
    }

    // read optional noSort
    var noSorts = this.graph.readProperty(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.NO_SORT)
    ).map(n=>n.value);
    if (noSorts.length > 0) {
      datasource.noSort = noSorts[0] === "true";
    }

    return datasource;
  }

   /**
   * Reads rdf:type(s) of an entity, and return them as an array
   **/
    _readRdfTypes(uri: Term):Term[] {
        return this.graph.readProperty(uri, RDF.TYPE);
    }

}

export { RDF };
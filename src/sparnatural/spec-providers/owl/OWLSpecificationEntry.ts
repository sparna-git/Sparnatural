import { BaseRDFReader } from "../BaseRDFReader";
import ISpecificationEntry from "../ISpecificationEntry";
import { Quad, Store } from "n3";
import { OWLSpecificationProvider, RDFS } from "./OWLSpecificationProvider";
import { Config } from "../../ontologies/SparnaturalConfig";
import Datasources from "../../ontologies/SparnaturalConfigDatasources";
import factory from "@rdfjs/data-model";

export class OWLSpecificationEntry extends BaseRDFReader implements ISpecificationEntry {
    uri:string;
    provider:OWLSpecificationProvider;


    constructor(uri:string, provider: OWLSpecificationProvider, n3store: Store<Quad>, lang: string) {
        super(n3store, lang);
        this.uri=uri;
        this.provider=provider;
    }

    getId(): string {
        return this.uri;
    }

    getLabel(): string {
        return this.#_readLabel(this.uri, this.lang);
    }

    getTooltip(): string {
        return this._readAsLiteralWithLang(this.uri, Config.TOOLTIP, this.lang);
    }

    getIcon(): string {
        var faIcon = this._readAsLiteral(
            this.uri,
            factory.namedNode(Config.FA_ICON)
          );
          if (faIcon.length > 0) {
            // use of fa-fw for fixed-width icons
            return (
              "<span style='font-size: 170%;' >&nbsp;<i class='" +
              faIcon +
              " fa-fw'></i></span>"
            );
          } else {
            var icons = this._readAsLiteral(this.uri, factory.namedNode(Config.ICON));
            if (icons.length > 0) {
              return icons[0];
            } else {
              // this is ugly, just so it aligns with other entries having an icon
              return "<span style='font-size: 175%;' >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
            }
          }
    }

    getHighlightedIcon() {
      var icons = this._readAsLiteral(
        this.uri,
        factory.namedNode(Config.HIGHLIGHTED_ICON)
      );
      if (icons.length > 0) {
        return icons[0];
      } 
    }
    
    getDatasource() {
        return this.#_readDatasourceAnnotationProperty(
            this.uri,
            Datasources.DATASOURCE
        );
    }

    getTreeChildrenDatasource() {
        return this.#_readDatasourceAnnotationProperty(
            this.uri,
            Datasources.TREE_CHILDREN_DATASOURCE
          );
    }

    getTreeRootsDatasource() {
        return this.#_readDatasourceAnnotationProperty(
            this.uri,
            Datasources.TREE_ROOTS_DATASOURCE
        );
    }

    /**
     * Reads config:order of an entity and returns it, or null if not set
     **/
    #_readOrder(uri: any) {
        return this._readAsSingleLiteral(uri, Config.ORDER);
    }

    /**
     * Reads config:order of an entity and returns it, or null if not set
     **/
    #_readLabel(uri: any, lang:string) {
        return this._readAsLiteralWithLang(uri, RDFS.LABEL, lang);
    }

    #_readDatasourceAnnotationProperty(
        propertyOrClassId: any,
        datasourceAnnotationProperty: any
      ) {
        // read predicate datasource
        const datasourceQuads = this.store.getQuads(
          factory.namedNode(propertyOrClassId),
          datasourceAnnotationProperty,
          null,
          null
        );
    
        if (datasourceQuads.length == 0) {
          return null;
        }
    
        for (const datasourceQuad of datasourceQuads) {
          const datasourceUri = datasourceQuad.object.id;
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

  #_buildDatasource(datasourceUri: any) {
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
      datasourceUri,
      Datasources.QUERY_STRING
    );
    if (queryStrings.length > 0) {
      datasource.queryString = queryStrings[0];
    }

    // Alternative 2 : query template + label path
    var queryTemplates = this._readAsResource(
      datasourceUri,
      Datasources.QUERY_TEMPLATE
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
          theQueryTemplate,
          Datasources.QUERY_STRING
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
        datasourceUri,
        Datasources.LABEL_PATH
      );
      if (labelPaths.length > 0) {
        datasource.labelPath = labelPaths[0];
      }

      // labelProperty
      var labelProperties = this._readAsResource(
        datasourceUri,
        Datasources.LABEL_PROPERTY
      );
      if (labelProperties.length > 0) {
        datasource.labelProperty = labelProperties[0];
      }

      // childrenPath
      var childrenPaths = this._readAsLiteral(
        datasourceUri,
        Datasources.CHILDREN_PATH
      );
      if (childrenPaths.length > 0) {
        datasource.childrenPath = childrenPaths[0];
      }

      // childrenProperty
      var childrenProperties = this._readAsResource(
        datasourceUri,
        Datasources.CHILDREN_PROPERTY
      );
      if (childrenProperties.length > 0) {
        datasource.childrenProperty = childrenProperties[0];
      }
    }

    // read optional sparqlEndpointUrl
    var sparqlEndpointUrls = this._readAsLiteral(
      datasourceUri,
      Datasources.SPARQL_ENDPOINT_URL
    );
    if (sparqlEndpointUrls.length > 0) {
      datasource.sparqlEndpointUrl = sparqlEndpointUrls[0];
    }

    // read optional noSort
    var noSorts = this._readAsLiteral(datasourceUri, Datasources.NO_SORT);
    if (noSorts.length > 0) {
      datasource.noSort = noSorts[0] === "true";
    }

    return datasource;
  }
}
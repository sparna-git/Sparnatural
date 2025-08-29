import { DataFactory } from 'rdf-data-factory';
import { Datasources } from "../ontologies/SparnaturalConfigDatasources";
import { StoreModel } from '../../rdf/StoreModel';
import { RDF } from '../../rdf/vocabularies/RDF';
import { IDatasource } from './IDatasource';

const factory = new DataFactory();

export class DatasourceReading {

    public static readDatasourceAnnotationProperty(
      propertyOrClassId: string,
      datasourceAnnotationProperty: string,
      graph: StoreModel
    ):IDatasource {
      // read predicate datasource
      const datasourceQuads = graph.readProperty(
        factory.namedNode(propertyOrClassId),
        factory.namedNode(datasourceAnnotationProperty)
      )

      if (datasourceQuads.length == 0) {
        return null;
      }
  
      for (const datasourceQuad of datasourceQuads) {
        const datasourceUri = datasourceQuad.value;
        var knownDatasource = Datasources.DATASOURCES_CONFIG.get(datasourceUri);
        if (knownDatasource != null) {
          return knownDatasource;
        } else {
          return DatasourceReading._buildDatasource(datasourceUri, graph);
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

  static _buildDatasource(datasourceUri: string, graph: StoreModel):IDatasource {
    var datasource: IDatasource = {};
    // read datasource characteristics

    // Alternative 1 : read optional queryString
    var queryStrings = graph.readProperty(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.QUERY_STRING)
    ).map(n=>n.value);

    if (queryStrings.length > 0) {
      datasource.queryString = queryStrings[0];
    }

    // Alternative 2 : query template + label path
    var queryTemplates = graph.readProperty(
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
        var queryStrings = graph.readProperty(
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
      var labelPaths = graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.LABEL_PATH)
      ).map(n=>n.value);
      if (labelPaths.length > 0) {
        datasource.labelPath = labelPaths[0];
      }

      // labelProperty
      var labelProperties = graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.LABEL_PROPERTY)
      ).map(n=>n.value);
      if (labelProperties.length > 0) {
        datasource.labelProperty = labelProperties[0];
      }

      // childrenPath
      var childrenPaths = graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.CHILDREN_PATH)
      ).map(n=>n.value);
      if (childrenPaths.length > 0) {
        datasource.childrenPath = childrenPaths[0];
      }

      // childrenProperty
      var childrenProperties = graph.readProperty(
        factory.namedNode(datasourceUri),
        factory.namedNode(Datasources.CHILDREN_PROPERTY)
      ).map(n=>n.value);
      if (childrenProperties.length > 0) {
        datasource.childrenProperty = childrenProperties[0];
      }
    }

    // read optional sparqlEndpointUrl
    var sparqlEndpointUrls = graph.readProperty(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.SPARQL_ENDPOINT_URL)
    ).map(n=>n.value);
    if (sparqlEndpointUrls.length > 0) {
      datasource.sparqlEndpointUrl = sparqlEndpointUrls[0];
    }

    // read optional noSort
    var noSorts = graph.readProperty(
      factory.namedNode(datasourceUri),
      factory.namedNode(Datasources.NO_SORT)
    ).map(n=>n.value);
    if (noSorts.length > 0) {
      datasource.noSort = noSorts[0] === "true";
    }

    return datasource;
  }

}
import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const SPARNATURAL_NAMESPACE = "http://data.sparna.fr/ontologies/sparnatural-config-core#";

export const SPARNATURAL = {
  AUTOCOMPLETE_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "AutocompleteProperty") as NamedNode,
  BOOLEAN_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "BooleanProperty") as NamedNode,
  GRAPHDB_SEARCH_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "GraphDBSearchProperty") as NamedNode,
  JENA_SEARCH_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "JenaSearchProperty") as NamedNode,
  LIST_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "ListProperty") as NamedNode,
  MAP_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "MapProperty") as NamedNode,
  NON_SELECTABLE_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "NonSelectableProperty") as NamedNode,
  NUMBER_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "NumberProperty") as NamedNode,
  SEARCH_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "SearchProperty") as NamedNode,
  STRING_EQUALS_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "StringEqualsProperty") as NamedNode,
  TIME_PROPERTY_DATE: factory.namedNode(SPARNATURAL_NAMESPACE + "TimeProperty-Date") as NamedNode,
  TIME_PROPERTY_PERIOD: factory.namedNode(SPARNATURAL_NAMESPACE + "TimeProperty-Period") as NamedNode,
  TIME_PROPERTY_YEAR: factory.namedNode(SPARNATURAL_NAMESPACE + "TimeProperty-Year") as NamedNode,
  TREE_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "TreeProperty") as NamedNode,
  VIRTUOSO_SEARCH_PROPERTY: factory.namedNode(SPARNATURAL_NAMESPACE + "VirtuosoSearchProperty") as NamedNode,
};

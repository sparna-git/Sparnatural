import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const GEOFUNCTIONS_NAMESPACE = 'http://www.opengis.net/def/function/geosparql/'
export const GEOFUNCTIONS = {
  WITHIN: factory.namedNode(GEOFUNCTIONS_NAMESPACE + 'sfWithin') as NamedNode
}

const GEOSPARQL_NAMESPACE = "http://www.opengis.net/ont/geosparql#"
export const GEOSPARQL = {
  WKT_LITERAL: factory.namedNode(GEOSPARQL_NAMESPACE + 'wktLiteral') as NamedNode
}

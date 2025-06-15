import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const VOID_NAMESPACE = "http://rdfs.org/ns/void#";
export const VOID = {
  ENTITIES: factory.namedNode(VOID_NAMESPACE + "entities") as NamedNode,
  TRIPLES: factory.namedNode(VOID_NAMESPACE + "triples") as NamedNode,
  DISTINCT_OBJECTS: factory.namedNode(VOID_NAMESPACE + "distinctObjects") as NamedNode,
};

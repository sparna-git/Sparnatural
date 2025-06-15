import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
export const RDF = {
  LANG_STRING: factory.namedNode(RDF_NAMESPACE + "langString") as NamedNode,
  TYPE: factory.namedNode(RDF_NAMESPACE + "type") as NamedNode,
  FIRST: factory.namedNode(RDF_NAMESPACE + "first") as NamedNode,
  REST: factory.namedNode(RDF_NAMESPACE + "rest") as NamedNode,
  NIL: factory.namedNode(RDF_NAMESPACE + "nil") as NamedNode,
};

import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const FOAF_NAMESPACE = "http://xmlns.com/foaf/0.1/";
export const FOAF = {
  NAME: factory.namedNode(FOAF_NAMESPACE + "name") as NamedNode,
};

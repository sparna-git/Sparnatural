import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const DCT_NAMESPACE = "http://purl.org/dc/terms/";
export const DCT = {
  CONFORMS_TO: factory.namedNode(DCT_NAMESPACE + "conformsTo") as NamedNode,
  TITLE: factory.namedNode(DCT_NAMESPACE + "title") as NamedNode,
};

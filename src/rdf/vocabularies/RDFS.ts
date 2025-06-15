import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#";
export const RDFS = {
  CLASS: factory.namedNode(RDFS_NAMESPACE + "Class") as NamedNode,
  LABEL: factory.namedNode(RDFS_NAMESPACE + "label") as NamedNode,
  COMMENT: factory.namedNode(RDFS_NAMESPACE + "comment") as NamedNode,
  DOMAIN: factory.namedNode(RDFS_NAMESPACE + "domain") as NamedNode,
  RANGE: factory.namedNode(RDFS_NAMESPACE + "range") as NamedNode,
  RESOURCE: factory.namedNode(RDFS_NAMESPACE + "Resource") as NamedNode,
  SUBPROPERTY_OF: factory.namedNode(RDFS_NAMESPACE + "subPropertyOf") as NamedNode,
  SUBCLASS_OF: factory.namedNode(RDFS_NAMESPACE + "subClassOf") as NamedNode,
};

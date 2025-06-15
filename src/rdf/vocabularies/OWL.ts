import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#";
export const OWL = {
  THING: factory.namedNode(OWL_NAMESPACE + "Thing") as NamedNode,
  EQUIVALENT_PROPERTY: factory.namedNode(OWL_NAMESPACE + "equivalentProperty") as NamedNode,
  EQUIVALENT_CLASS: factory.namedNode(OWL_NAMESPACE + "equivalentClass") as NamedNode,
  UNION_OF: factory.namedNode(OWL_NAMESPACE + "unionOf") as NamedNode,
};

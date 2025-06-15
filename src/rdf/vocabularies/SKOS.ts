import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const SKOS_NAMESPACE = "http://www.w3.org/2004/02/skos/core#";
export const SKOS = {
  CONCEPT: factory.namedNode(SKOS_NAMESPACE + "Concept") as NamedNode,
  DEFINITION: factory.namedNode(SKOS_NAMESPACE + "definition") as NamedNode,
  IN_SCHEME: factory.namedNode(SKOS_NAMESPACE + "inScheme") as NamedNode,
  PREF_LABEL: factory.namedNode(SKOS_NAMESPACE + "prefLabel") as NamedNode,
};

import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const SCHEMA_NAMESPACE = "https://schema.org/";
export const SCHEMA = {
  NAME: factory.namedNode(SCHEMA_NAMESPACE + "name") as NamedNode,
};

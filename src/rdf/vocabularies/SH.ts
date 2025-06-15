import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const SH_NAMESPACE = "http://www.w3.org/ns/shacl#";
export const SH = {
  ALTERNATIVE_PATH: factory.namedNode(SH_NAMESPACE + "alternativePath") as NamedNode,
  CLASS: factory.namedNode(SH_NAMESPACE + "class") as NamedNode,
  DATATYPE: factory.namedNode(SH_NAMESPACE + "datatype") as NamedNode,
  DEACTIVATED: factory.namedNode(SH_NAMESPACE + "deactivated") as NamedNode,
  DESCRIPTION: factory.namedNode(SH_NAMESPACE + "description") as NamedNode,
  HAS_VALUE: factory.namedNode(SH_NAMESPACE + "hasValue") as NamedNode,
  IN: factory.namedNode(SH_NAMESPACE + "in") as NamedNode,
  INVERSE_PATH: factory.namedNode(SH_NAMESPACE + "inversePath") as NamedNode,
  IRI: factory.namedNode(SH_NAMESPACE + "IRI") as NamedNode,
  LANGUAGE_IN: factory.namedNode(SH_NAMESPACE + "languageIn") as NamedNode,
  LITERAL: factory.namedNode(SH_NAMESPACE + "Literal") as NamedNode,
  NAME: factory.namedNode(SH_NAMESPACE + "name") as NamedNode,
  NODE: factory.namedNode(SH_NAMESPACE + "node") as NamedNode,
  NODE_KIND: factory.namedNode(SH_NAMESPACE + "nodeKind") as NamedNode,
  NODE_SHAPE: factory.namedNode(SH_NAMESPACE + "NodeShape") as NamedNode,
  ONE_OR_MORE_PATH: factory.namedNode(SH_NAMESPACE + "oneOrMorePath") as NamedNode,
  OR: factory.namedNode(SH_NAMESPACE + "or") as NamedNode,
  ORDER: factory.namedNode(SH_NAMESPACE + "order") as NamedNode,
  PATH: factory.namedNode(SH_NAMESPACE + "path") as NamedNode,
  PROPERTY: factory.namedNode(SH_NAMESPACE + "property") as NamedNode,
  SELECT: factory.namedNode(SH_NAMESPACE + "select") as NamedNode,
  TARGET: factory.namedNode(SH_NAMESPACE + "target") as NamedNode,
  TARGET_CLASS: factory.namedNode(SH_NAMESPACE + "targetClass") as NamedNode,
  UNIQUE_LANG: factory.namedNode(SH_NAMESPACE + "uniqueLang") as NamedNode,
  ZERO_OR_MORE_PATH: factory.namedNode(SH_NAMESPACE + "zeroOrMorePath") as NamedNode,
  ZERO_OR_ONE_PATH: factory.namedNode(SH_NAMESPACE + "zeroOrOnePath") as NamedNode,
  PARENT: factory.namedNode(SH_NAMESPACE + "parent") as NamedNode,
};

import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema#";
export const XSD = {
  BOOLEAN: factory.namedNode(XSD_NAMESPACE + "boolean") as NamedNode,
  BYTE: factory.namedNode(XSD_NAMESPACE + "byte") as NamedNode,
  DATE: factory.namedNode(XSD_NAMESPACE + "date") as NamedNode,
  DATE_TIME: factory.namedNode(XSD_NAMESPACE + "dateTime") as NamedNode,
  DECIMAL: factory.namedNode(XSD_NAMESPACE + "decimal") as NamedNode,
  DOUBLE: factory.namedNode(XSD_NAMESPACE + "double") as NamedNode,
  FLOAT: factory.namedNode(XSD_NAMESPACE + "float") as NamedNode,
  GYEAR: factory.namedNode(XSD_NAMESPACE + "gYear") as NamedNode,
  INT: factory.namedNode(XSD_NAMESPACE + "int") as NamedNode,
  INTEGER: factory.namedNode(XSD_NAMESPACE + "integer") as NamedNode,
  NONNEGATIVE_INTEGER: factory.namedNode(XSD_NAMESPACE + "nonNegativeInteger") as NamedNode,
  LONG: factory.namedNode(XSD_NAMESPACE + "long") as NamedNode,
  SHORT: factory.namedNode(XSD_NAMESPACE + "short") as NamedNode,
  STRING: factory.namedNode(XSD_NAMESPACE + "string") as NamedNode,
  UNSIGNED_BYTE: factory.namedNode(XSD_NAMESPACE + "unsignedByte") as NamedNode,
  UNSIGNED_INT: factory.namedNode(XSD_NAMESPACE + "unsignedInt") as NamedNode,
  UNSIGNED_LONG: factory.namedNode(XSD_NAMESPACE + "unsignedLong") as NamedNode,
  UNSIGNED_SHORT: factory.namedNode(XSD_NAMESPACE + "unsignedShort") as NamedNode,
};

import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const VOLIPI_NAMESPACE = "http://data.sparna.fr/ontologies/volipi#";
export const VOLIPI = {
  COLOR: factory.namedNode(VOLIPI_NAMESPACE + "color") as NamedNode,
  MESSAGE: factory.namedNode(VOLIPI_NAMESPACE + "message") as NamedNode,
  ICON_NAME: factory.namedNode(VOLIPI_NAMESPACE + "iconName") as NamedNode,
  ICON: factory.namedNode(VOLIPI_NAMESPACE + "icon") as NamedNode,
};

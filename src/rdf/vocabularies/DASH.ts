import { DataFactory, NamedNode } from 'rdf-data-factory';

const factory = new DataFactory();

const DASH_NAMESPACE = "http://datashapes.org/dash#";
export const DASH = {
  SEARCH_WIDGET: factory.namedNode(DASH_NAMESPACE + "searchWidget") as NamedNode,
  SEARCH_WIDGET_CLASS: factory.namedNode(DASH_NAMESPACE + "SearchWidget") as NamedNode,
  PROPERTY_ROLE: factory.namedNode(DASH_NAMESPACE + "propertyRole") as NamedNode,
  LABEL_ROLE: factory.namedNode(DASH_NAMESPACE + "LabelRole") as NamedNode,
};

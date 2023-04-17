import factory from "@rdfjs/data-model";
import { NamedNode, Quad, Store } from "n3";
import { Config } from "../ontologies/SparnaturalConfig";
import ISpecProvider from "./ISpecProvider";
import Datasources from "../ontologies/SparnaturalConfigDatasources";
import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator
} from "sparqljs";
import { BaseRDFReader } from "./BaseRDFReader";

export class SHACLSpecificationProvider extends BaseRDFReader implements ISpecProvider {

  constructor(n3store: Store<Quad>, lang: string) {
    super(n3store, lang);
  }

  getEntitiesInDomainOfAnyProperty() {
    return new Array<string>();
  }

  getAllSparnaturalEntities() {
    return new Array<string>();
  }

  getServiceEndpoint(propertyId:string):string | null{
    return null;
  }

  isLogicallyExecutedAfter(propertyId:string):boolean {
    return false;
  }

  getLabel(entityId: any) {
    return "label"
  }

  getTooltip(entityId: any) {
    return "tooltip"
  }

  getIcon(classId: string) {
    
  }

  getHighlightedIcon(classId: string) {
    
  }

  getConnectedEntities(classId: string) {
    return new Array<string>();
  }

  hasConnectedEntities(classId: any) {
    return this.getConnectedEntities(classId).length > 0;
  }

  getConnectingProperties(domainClassId: any, rangeClassId: any) {
    return new Array<string>();
  }

  getPropertyType(objectPropertyId: any) {
    return Config.AUTOCOMPLETE_PROPERTY;
  }

  isRemoteEntity(classUri: string) {
    return false;
  }

  isLiteralEntity(classUri: string) {
    return false;
  }

  expandSparql(sparql: string, prefixes:{ [key: string]: string }) {
    return sparql;
  }

  getDefaultLabelProperty(classId: any):string | null {
    return null;
  }

  getBeginDateProperty(propertyId: any):string | null {
    return null;
  }

  getEndDateProperty(propertyId: any):string | null {
    return null;
  }

  getExactDateProperty(propertyId: any):string | null {
    return null;
  }

  getDatasource(propertyOrClassId: any) {
    
  }

  getTreeRootsDatasource(propertyOrClassId: any) {
    
  }

  getTreeChildrenDatasource(propertyOrClassId: any) {
    
  }

  isEnablingOptional(propertyId: any) {
    return false;
  }

  isEnablingNegation(propertyId: any) {
    return false;
  }

  isMultilingual(propertyId: any) {
    return false;
  }

  readRange(propertyId: any) {
    
  }

}

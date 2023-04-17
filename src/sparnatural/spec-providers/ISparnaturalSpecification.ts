import { Config } from "../ontologies/SparnaturalConfig";

/*
    All Sparnatural specifications provided by the SparnaturalSpecificationFactory MUST implement this interface
*/
interface ISparnaturalSpecification {

  /** Global methods at the config level */
  getAllSparnaturalEntities():Array<string>;
  getEntitiesInDomainOfAnyProperty():Array<string>;
  expandSparql(sparql: string, prefixes: { [key: string]: string }): string;
 
  /** Common methods on entities and properties **/
  getLabel(classOrPropertyId: string): string;
  getTooltip(classOrPropertyId: string): string;
  getDatasource(classOrPropertyId: string): any;
  getTreeChildrenDatasource(classOrPropertyId: string): any;
  getTreeRootsDatasource(classOrPropertyId: string): any;

  /** Methods on entities/classes **/
  getConnectedEntities(entityUri:string):Array<string>;
  hasConnectedEntities(value_selected: string): any;
  getConnectingProperties(domain: string, range: string): Array<string>;
  isLiteralEntity(entityUri: string): boolean;
  isRemoteEntity(entityUri: string): boolean;
  getDefaultLabelProperty(entityUri: string):string|null;
  getIcon(entityUri: string): string;
  getHighlightedIcon(entityUri: string): string;
  
  /** Methods on properties **/
  getPropertyType(objectPropertyId: string): Config;
  isMultilingual(propertyId: string): boolean;
  
  getBeginDateProperty(propertyId: string): string|null;
  getEndDateProperty(propertyId: string): string|null;
  getExactDateProperty(propertyId: string): string|null;
  
  isEnablingNegation(propertyId: string): boolean;
  isEnablingOptional(propertyId: string): boolean;

  getServiceEndpoint(propertyId:string):string | null;
  isLogicallyExecutedAfter(propertyId:string):boolean;
}
export default ISparnaturalSpecification;

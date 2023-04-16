import { Config } from "../ontologies/SparnaturalConfig";

/*
    All SpecificationProvider provided by the SpecificationProviderFactory MUST implement this interface
*/
interface ISpecProvider {

  getAllSparnaturalClasses():Array<String>;
  getClassesInDomainOfAnyProperty():Array<String>;
  getConnectedClasses(classId:string):Array<string>;
  hasConnectedClasses(value_selected: string): any;
  getConnectingProperties(domain: string, range: string): Array<string>;
  getObjectPropertyType(objectPropertyId: string): Config;
  isLiteralClass(classUri: string): boolean;
  isRemoteClass(classUri: string): boolean;
  getDefaultLabelProperty(classId: string):string|null;

  getIcon(value_selected: string): any;
  getHighlightedIcon(value_selected: string): any;

  
  expandSparql(sparql: string, prefixes: { [key: string]: string }): string;
  
  getDatasource(objectPropertyId: string): any;
  getTreeChildrenDatasource(objectPropertyId: string): any;
  getTreeRootsDatasource(objectPropertyId: string): any;

  
  
  isMultilingual(propertyUri: string): boolean;
  
  getLabel(value_selected: string): string;
  getTooltip(value_selected: string): string;
  
  getBeginDateProperty(propertyId: string): string|null;
  getEndDateProperty(propertyId: string): string|null;
  getExactDateProperty(propertyId: string): string|null;
  
  isEnablingNegation(value_selected: string): boolean;
  isEnablingOptional(value_selected: string): boolean;

  getServiceEndpoint(propertyId:string):string | null;
  isLogicallyExecutedAfter(propertyId:string):boolean;
}
export default ISpecProvider;

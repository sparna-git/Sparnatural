import { Config } from "../../configs/fixed-configs/SparnaturalConfig";

/*
    All SpecificationProvider provided by the SpecificationProviderFactory MUST implement this interface
*/
interface ISpecProvider {
  isEnablingNegation(value_selected: string): boolean;
  isEnablingOptional(value_selected: string): boolean;
  getHighlightedIcon(value_selected: string): any;
  getIcon(value_selected: string): any;
  getTreeChildrenDatasource(objectPropertyId: string): any;
  getTreeRootsDatasource(objectPropertyId: string): any;
  expandSparql(sparql: string): string;
  getDefaultLabelProperty(classId: string):string;
  getDatasource(objectPropertyId: string): any;
  isLiteralClass(value_selected: string): any;
  getObjectPropertyType(objectPropertyId: string): Config;
  getLabel(value_selected: string): string;
  getTooltip(value_selected: string): string;
  hasConnectedClasses(value_selected: string): any;
  getConnectingProperties(domain: string, range: string): Array<string>;
  getBeginDateProperty(propertyId: string): string;
  getEndDateProperty(propertyId: string): string;
  getExactDateProperty(propertyId: string): string;
  getConnectedClasses(classId:string):Array<string>;
}
export default ISpecProvider;

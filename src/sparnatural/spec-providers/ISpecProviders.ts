/*
    All SpecificationProvider provided by the SpecificationProviderFactory MUST implement this interface
*/
interface ISpecProvider {
  isEnablingNegation(value_selected: string): boolean;
  isEnablingOptional(value_selected: string): boolean;
  getHighlightedIcon(value_selected: string): string;
  getIcon(value_selected: string): string;
  getTreeChildrenDatasource(objectPropertyId: string): string;
  getTreeRootsDatasource(objectPropertyId: string): any;
  expandSparql(sparql: string): string;
  getDatasource(objectPropertyId: string): any ;
  isLiteralClass(value_selected: string): any;
  getObjectPropertyType(objectPropertyId: string): string;
  getLabel(value_selected: string): string;
  getTooltip(value_selected: string): string;
  hasConnectedClasses(value_selected: string): any;
  getConnectingProperties(domain:string,range:string): Array<string>;
}
export default ISpecProvider;

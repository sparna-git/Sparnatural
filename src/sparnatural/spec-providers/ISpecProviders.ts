/*
    All SpecificationProvider provided by the SpecificationProviderFactory MUST implement this interface
*/
interface ISpecProvider {
  isEnablingNegation(value_selected: any): any;
  isEnablingOptional(value_selected: any): any;
  getHighlightedIcon(value_selected: any): any;
  getIcon(value_selected: any): any;
  getTreeChildrenDatasource(objectPropertyId: any): any;
  getTreeRootsDatasource(objectPropertyId: any): any;
  expandSparql(sparql: any): any;
  getDatasource(objectPropertyId: any): any;
  isLiteralClass(value_selected: any): any;
  getObjectPropertyType(objectPropertyId: any): string;
  getLabel(value_selected: any): any;
  getTooltip(value_selected: any): any;
  hasConnectedClasses(value_selected: any): any;
}
export default ISpecProvider;

import { Term } from "@rdfjs/types";
import { ISpecificationEntry } from "./ISpecificationEntry";

interface ISpecificationProperty extends ISpecificationEntry {
  /**
   * @param range the selected range in the criteria, in case the widget varies depending on the range
   */
  getPropertyType(range:string): string|undefined;
  isMultilingual(): boolean;

  getRange():Array<string>;

  getBeginDateProperty(): string|undefined;
  getEndDateProperty(): string|undefined;
  getExactDateProperty(): string|undefined;
  
  isEnablingNegation(): boolean;
  isEnablingOptional(): boolean;

  getServiceEndpoint():string | undefined;
  isLogicallyExecutedAfter():boolean;

  getDatasource(): any;
  getTreeChildrenDatasource(): any;
  getTreeRootsDatasource(): any;

  /**
   * @returns the mininum allowed value, as a string, or undefined if not set
   */
  getMinValue():string | undefined;

  /**
   * @returns the maximum allowed value, as a string, or undefined if not set
   */
  getMaxValue():string | undefined;

  /**
   * @returns the list of allowed values, as RDF Terms, or undefined is not set
   */
  getValues():Term[] | undefined;

  /**
   * @returns true if the query should omit the class criteria of its range all the time
   */
  omitClassCriteria(): boolean;

  /**
   * @returns true if the property has its range defined as a qualified value shape
   */
  hasQualifiedValueShapeRange(): boolean;
}
export default ISpecificationProperty;

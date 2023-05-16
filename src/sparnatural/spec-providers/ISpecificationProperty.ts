import { Config } from "../ontologies/SparnaturalConfig";
import ISpecificationEntity from "./ISpecificationEntity";
import ISpecificationEntry from "./ISpecificationEntry";

interface ISpecificationProperty extends ISpecificationEntry {
  getPropertyType(): string|undefined;
  isMultilingual(): boolean;

  getRange():Array<string>;
  
  getBeginDateProperty(): string|null;
  getEndDateProperty(): string|null;
  getExactDateProperty(): string|null;
  
  isEnablingNegation(): boolean;
  isEnablingOptional(): boolean;

  getServiceEndpoint():string | null;
  isLogicallyExecutedAfter():boolean;

  /**
   * @returns true if the query should omit the class criteria of its range all the time
   */
  omitClassCriteria(): boolean;
}
export default ISpecificationProperty;

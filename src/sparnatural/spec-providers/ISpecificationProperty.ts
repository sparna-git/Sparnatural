import { Config } from "../ontologies/SparnaturalConfig";
import ISpecificationEntity from "./ISpecificationEntity";
import ISpecificationEntry from "./ISpecificationEntry";

interface ISpecificationProperty extends ISpecificationEntry {
  getPropertyType(): string|undefined;
  isMultilingual(): boolean;
  
  getBeginDateProperty(): string|null;
  getEndDateProperty(): string|null;
  getExactDateProperty(): string|null;
  
  isEnablingNegation(): boolean;
  isEnablingOptional(): boolean;

  getServiceEndpoint():string | null;
  isLogicallyExecutedAfter():boolean;
}
export default ISpecificationProperty;

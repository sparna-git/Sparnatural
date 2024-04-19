import { Config } from "../ontologies/SparnaturalConfig";
import ISpecificationEntry from "./ISpecificationEntry";


interface ISpecificationEntity extends ISpecificationEntry {


  getConnectedEntities():Array<string>;
  hasConnectedEntities(): boolean;
  getConnectingProperties(range: string): Array<string>;
  isLiteralEntity(): boolean;

  /**
   * @deprecated
   */
  isRemoteEntity(): boolean;
  getDefaultLabelProperty():string|undefined;
  getParentClass() :string|undefined;

}
export default ISpecificationEntity;

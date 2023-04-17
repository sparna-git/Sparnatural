import { Config } from "../ontologies/SparnaturalConfig";
import ISpecificationEntry from "./ISpecificationEntry";


interface ISpecificationEntity extends ISpecificationEntry {


  getConnectedEntities():Array<string>;
  hasConnectedEntities(): boolean;
  getConnectingProperties(range: string): Array<string>;
  isLiteralEntity(): boolean;
  isRemoteEntity(): boolean;
  getDefaultLabelProperty():string|null;

}
export default ISpecificationEntity;

import { DagIfc } from "../dag/Dag";
import { Config } from "../ontologies/SparnaturalConfig";
import ISpecificationEntry from "./ISpecificationEntry";


interface ISpecificationEntity extends ISpecificationEntry {


  getConnectedEntities():Array<string>;

  getConnectedEntitiesTree():DagIfc<ISpecificationEntity>;

  hasConnectedEntities(): boolean;
  getConnectingProperties(range: string): Array<string>;
  isLiteralEntity(): boolean;

  /**
   * @deprecated
   */
  isRemoteEntity(): boolean;
  getDefaultLabelProperty():string|undefined;

}
export default ISpecificationEntity;

import { DagIfc } from "../dag/Dag";
import { Config } from "../ontologies/SparnaturalConfig";
import ISpecificationEntry from "./ISpecificationEntry";


interface ISpecificationEntity extends ISpecificationEntry {


  getConnectedEntities():Array<string>;

  /**
   * @returns : the Tree of the connected entities
   */
  getConnectedEntitiesTree(): DagIfc<ISpecificationEntity>

  hasConnectedEntities(): boolean;
  getConnectingProperties(range: string): Array<string>;
  isLiteralEntity(): boolean;

  hasTypeCriteria(): boolean;

  getDefaultLabelProperty():string|undefined;

}
export default ISpecificationEntity;

import { DagIfc } from "../dag/Dag";
import { ISpecificationEntry } from "./ISpecificationEntry";
import ISpecificationProperty from "./ISpecificationProperty";


export interface ISpecificationEntity extends ISpecificationEntry {


  getConnectedEntities():Array<string>;

  /**
   * @returns : the Tree of the connected entities
   */
  getConnectedEntitiesTree(): DagIfc<ISpecificationEntity>

  hasConnectedEntities(): boolean;
  getConnectingProperties(range: string): Array<string>;
  getConnectingPropertiesTree(range: string): DagIfc<ISpecificationProperty>;
  isLiteralEntity(): boolean;

  hasTypeCriteria(): boolean;

  getDefaultLabelProperty():string|undefined;

  couldBeSkosConcept():boolean;

}

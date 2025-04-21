import { DagIfc } from "../dag/Dag";
import { Config } from "../ontologies/SparnaturalConfig";
import { ISpecificationEntity } from "./ISpecificationEntity";
import ISpecificationProperty from "./ISpecificationProperty";

/*
    All Sparnatural specifications provided by the SparnaturalSpecificationFactory MUST implement this interface
*/
export interface ISparnaturalSpecification {

  /**
   * Lists all the entity ids - currently only used for filtering purposes, but could probably be deleted
   * @deprecated
   */
  getAllSparnaturalEntities():Array<string>;

  /**
   * @deprecated use the tree variant instead
   */
  getEntitiesInDomainOfAnyProperty():Array<string>;

  /**
   * @returns : the initial tree of entities to be displayed in Sparnatural
   */
  getEntitiesTreeInDomainOfAnyProperty(): DagIfc<ISpecificationEntity>;

  expandSparql(sparql: string, prefixes: { [key: string]: string }): string; 

  /**
   * @param id Reads an entity in the configuration
   */
  getEntity(id:string):ISpecificationEntity;

    /**
   * @param id Reads a property in the configuration
   */
  getProperty(id:string):ISpecificationProperty;

  /**
   * Reads the languages available in the configuration
   */
  getLanguages():Array<string>;

}

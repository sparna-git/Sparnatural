import { Config } from "../ontologies/SparnaturalConfig";
import ISpecificationEntity from "./ISpecificationEntity";
import ISpecificationProperty from "./ISpecificationProperty";

/*
    All Sparnatural specifications provided by the SparnaturalSpecificationFactory MUST implement this interface
*/
interface ISparnaturalSpecification {

  getAllSparnaturalEntities():Array<string>;
  getEntitiesInDomainOfAnyProperty():Array<string>;
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
export default ISparnaturalSpecification;

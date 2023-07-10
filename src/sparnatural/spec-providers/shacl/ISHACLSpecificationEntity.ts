import ISpecificationEntity from "../ISpecificationEntity";
import { RdfStore } from "rdf-stores";



interface ISHACLSpecificationEntity extends ISpecificationEntity {

    isRangeOf(n3store:RdfStore, shapeUri:string):boolean;

}
export default ISHACLSpecificationEntity;
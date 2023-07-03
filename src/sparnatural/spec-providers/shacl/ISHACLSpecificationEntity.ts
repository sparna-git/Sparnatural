import { Quad, Store } from "n3";
import ISpecificationEntity from "../ISpecificationEntity";



interface ISHACLSpecificationEntity extends ISpecificationEntity {

    isRangeOf(n3store:Store<Quad>, shapeUri:string):boolean;

}
export default ISHACLSpecificationEntity;
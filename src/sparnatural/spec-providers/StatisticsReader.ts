import { Quad, Quad_Object, Quad_Predicate, Quad_Subject, Term } from "@rdfjs/types/data-model";
import { RdfStore } from "rdf-stores";
import { RDF } from "./BaseRDFReader";
import { DataFactory } from "rdf-data-factory";
import { QuadPredicate } from "n3";
import { StoreModel } from "./StoreModel";
import { DCT, VOID } from "./shacl/SHACLSpecificationProvider";

let factory = new DataFactory();

export class StatisticsReader {

    protected store: StoreModel;

    constructor(store: StoreModel) {
        this.store = store;
    }

    getDistinctObjectsCountForShape(shape:Term) {
        let partitions:Quad_Subject[] = this.store
          .findSubjectsOf(DCT.CONFORMS_TO, shape);
    
          let result:number|undefined = undefined
          partitions.forEach(partition => {
            result = this.store.readSinglePropertyAsNumber(partition, VOID.DISTINCT_OBJECTS);
          });
    
          return result
    }

    getTriplesCountForShape(shape:Term) {
        let partitions:Quad_Subject[] = this.store
          .findSubjectsOf(DCT.CONFORMS_TO, shape);
    
          let result:number|undefined = undefined
          partitions.forEach(partition => {
            result = this.store.readSinglePropertyAsNumber(partition, VOID.TRIPLES);
          });
    
          return result
    }

    getEntitiesCountForShape(shape:Term) {
        let partitions:Quad_Subject[] = this.store
          .findSubjectsOf(DCT.CONFORMS_TO, shape);
    
          let result:number|undefined = undefined
          partitions.forEach(partition => {
            result = this.store.readSinglePropertyAsNumber(partition, VOID.ENTITIES);
          });
    
          return result
    }

}
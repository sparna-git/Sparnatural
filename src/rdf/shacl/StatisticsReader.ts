import { Quad_Subject, Term } from "@rdfjs/types/data-model";
import { DataFactory } from "rdf-data-factory";
import { Model } from "../Model";
import { DCT } from "../vocabularies/DCT";
import { VOID } from "../vocabularies/VOID";

let factory = new DataFactory();

export class StatisticsReader {

    protected store: Model;

    constructor(store: Model) {
        this.store = store;
    }

    hasStatistics(shape:Term) {
      let found:boolean = false;
      
      let partitions:Quad_Subject[] = this.store
          .findSubjectsOf(DCT.CONFORMS_TO, shape);
    
      partitions.forEach(partition => {
        if(
          this.store.hasTriple(partition, VOID.TRIPLES, null)
          ||
          this.store.hasTriple(partition, VOID.ENTITIES, null)
        ) {
          found = true;
        }
      });

      return found
    }

    getDistinctObjectsCountForShape(shape:Term):number|undefined {
        let partitions:Quad_Subject[] = this.store
          .findSubjectsOf(DCT.CONFORMS_TO, shape);
    
          let result:number|undefined = undefined
          partitions.forEach(partition => {
            // here we cannot make a sum
            result = this.store.readSinglePropertyAsNumber(partition, VOID.DISTINCT_OBJECTS);
          });
    
          return result
    }

    getTriplesCountForShape(shape:Term):number|undefined {
        let partitions:Quad_Subject[] = this.store
          .findSubjectsOf(DCT.CONFORMS_TO, shape);
    
          
          let result:number|undefined = undefined
          partitions.forEach(partition => {
            if(result === undefined) {
              result = 0;
            }
            // make the sum of every statistics we have
            result += this.store.readSinglePropertyAsNumber(partition, VOID.TRIPLES);
          });
    
          return result
    }

    getEntitiesCountForShape(shape:Term):number|undefined {
        let partitions:Quad_Subject[] = this.store
          .findSubjectsOf(DCT.CONFORMS_TO, shape);
    
          let result:number|undefined = undefined
          partitions.forEach(partition => {
            if(result === undefined) {
              result = 0;
            }
            // make the sum of every statistics we have
            result += this.store.readSinglePropertyAsNumber(partition, VOID.ENTITIES);
          });
    
          return result
    }

}
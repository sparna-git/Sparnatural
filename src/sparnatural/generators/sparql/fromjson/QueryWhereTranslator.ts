import { DataFactory } from 'rdf-data-factory';
import { Pattern, Variable } from "sparqljs";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import { ISparJson } from '../../json/ISparJson';
import BranchTranslator from './BranchTranslator';

const factory = new DataFactory();

export default class QueryWhereTranslator{
    // variables set in construtor
    #jsonQuery:ISparJson
    #specProvider: ISparnaturalSpecification
    
    // patterns built in the build process
    #resultPtrns: Pattern[] = []    
    #executedAfterPtrns: Pattern[] = []

    // default vars gathered from children
    #defaultVars: Variable[] =[]

    constructor(
        jsonQuery: ISparJson,
        specProvider:ISparnaturalSpecification
    ){
        this.#jsonQuery = jsonQuery
        this.#specProvider = specProvider      
    }

   build() {
    if (this.#jsonQuery && this.#jsonQuery.branches && this.#specProvider && Array.isArray(this.#jsonQuery.branches)) {
        this.#jsonQuery.branches.forEach((branch, index) => {
            if (branch && this.#jsonQuery && this.#specProvider) {
                let branchBuilder = new BranchTranslator(
                    branch,
                    this.#jsonQuery,
                    this.#specProvider,
                    // indicates if it is the very first
                    (index === 0),
                    // they are never inside optional or not exist at the first level
                    false
                );
                branchBuilder.build();
                this.#defaultVars.push(...branchBuilder.getDefaultVars());
                this.#resultPtrns.push(...branchBuilder.getResultPtrns());
            }
        });
    } else {
        console.error('Required variables are missing or invalid');
    }
}


    getResultPtrns(){
        return this.#resultPtrns
    }


    getDefaultVars(){
        return this.#defaultVars
    }

    getExecutedAfterPtrns(){
        return this.#executedAfterPtrns;
    }
}
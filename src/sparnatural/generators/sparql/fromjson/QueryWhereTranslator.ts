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
        this.#jsonQuery.branches.forEach((branch, index) => {
            let branchBuilder = new BranchTranslator(
                branch,
                this.#jsonQuery,
                this.#specProvider,
                // indicates if it is the very first
                (index == 0),
                // they are never inside optional or not exist at the first level
                false
            );
            branchBuilder.build();
            this.#resultPtrns.push(...branchBuilder.getResultPtrns());
        })
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
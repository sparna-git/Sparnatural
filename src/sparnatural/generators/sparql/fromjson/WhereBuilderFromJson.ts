import { DataFactory } from 'rdf-data-factory';
import { Pattern, Variable } from "sparqljs";
import { OptionTypes } from "../../../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../../components/builder-section/groupwrapper/GroupWrapper";
import { AbstractWidget } from "../../../components/widgets/AbstractWidget";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import ClassBuilder from "../ClassBuilder";
import IntersectionBuilder from "../IntersectionBuilder";
import SparqlFactory from "../SparqlFactory";
import ValueBuilderIfc, { ValueBuilderFactory } from '../ValueBuilder';
import { ISparJson } from '../../json/ISparJson';
import BranchBuilder from './BranchBuilder';

const factory = new DataFactory();

export default class WhereBuilderFromJson{
    // variables set in construtor
    #jsonQuery:ISparJson
    #specProvider: ISparnaturalSpecification
    
    #valueBuilder:ValueBuilderIfc;
    
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
        this.#jsonQuery.branches.forEach(b => {
            let branchBuilder = new BranchBuilder(b, this.#specProvider);
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
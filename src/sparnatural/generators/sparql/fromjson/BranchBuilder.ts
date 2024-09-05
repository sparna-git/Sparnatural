import { DataFactory } from 'rdf-data-factory';
import { Pattern, Triple, Variable } from "sparqljs";
import { OptionTypes } from "../../../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../../components/builder-section/groupwrapper/GroupWrapper";
import { AbstractWidget } from "../../../components/widgets/AbstractWidget";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import ClassBuilder from "../ClassBuilder";
import IntersectionBuilder from "../IntersectionBuilder";
import SparqlFactory from "../SparqlFactory";
import ValueBuilderIfc, { ValueBuilderFactory } from '../ValueBuilder';
import { Branch, ISparJson } from '../../json/ISparJson';
import { getSettings } from "../../../settings/defaultSettings";

const factory = new DataFactory();

export default class BranchBuilder{
    // variables set in construtor
    #branch:Branch
    #specProvider: ISparnaturalSpecification
    
    protected subjectClassTriple:Triple

    // patterns built in the build process
    #resultPtrns: Pattern[] = []    
    #executedAfterPtrns: Pattern[] = []

    // default vars gathered from children
    #defaultVars: Variable[] =[]

    constructor(branch: Branch,specProvider:ISparnaturalSpecification){
        this.#branch = branch
        this.#specProvider = specProvider       
    }

    build() {
        this.#buildSubjectClassTriple()
        this.#createResultPtrns()
    }

    #buildSubjectClassTriple() {
        // don't build the class triple if the entity does not hove type
        if(this.#specProvider.getEntity(this.#branch.line.sType).hasTypeCriteria()) {
            var typePredicate;
            if(getSettings().typePredicate){
                typePredicate = SparqlFactory.parsePropertyPath(getSettings().typePredicate)
            } else {
                typePredicate = factory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
            }

            this.subjectClassTriple = SparqlFactory.buildTypeTriple(
                factory.variable(this.#branch.line.s) ,
                typePredicate,
                factory.namedNode(this.#branch.line.sType)
            )
        }
    }

    #createResultPtrns() {
        // no default label got created. only insert start tuple
        if(this.subjectClassTriple) {
            this.#resultPtrns.push(SparqlFactory.buildBgpPattern([this.subjectClassTriple]))
        }      
    }

    getResultPtrns():Pattern[]{
        return this.#resultPtrns
    }

    getDefaultVars(){
        return this.#defaultVars
    }

    getExecutedAfterPtrns(){
        return this.#executedAfterPtrns;
    }
}
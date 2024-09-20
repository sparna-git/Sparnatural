import { DataFactory } from 'rdf-data-factory';
import { Pattern, Variable } from "sparqljs";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "../SparqlFactory";
import ValueBuilderIfc, { ValueBuilderFactory } from '../ValueBuilder';
import { Branch, ISparJson, VariableExpression, VariableTerm } from '../../json/ISparJson';
import TypedVariableTranslator from './TypedVariableTranslator';
import { getSettings } from '../../../settings/defaultSettings';

const factory = new DataFactory();

/**
 * Translates a Branch JSON structure into SparqlJs structure
 */
export default class BranchTranslator{

    // The JSON branch to convert to SPARQL
    #branch:Branch
    // The full query from which the branch is extracted
    #fullQuery:ISparJson;
    #specProvider: ISparnaturalSpecification
    // whether this branch is a children of another branch
    #isVeryFirst:boolean
    #isInOption:boolean

    // to translate widget values to SPARQL
    #valueBuilder:ValueBuilderIfc;

    // intermediate patterns   
    #startClassPtrn:Pattern[] = []
    #endClassPtrn:Pattern[] = []
    #intersectionPtrn:Pattern[] = [] 
    #whereChildPtrns: Pattern[] = []
    #valuePtrns: Pattern[] = []
    #executedAfterPtrns: Pattern[] = []

    // final result
    #resultPtrns: Pattern[] = []    

    // default vars gathered from children
    #defaultVars: Variable[] =[]

    constructor(
        // the branch to convert
        branch: Branch,
        // the full query (we need it to test if variables are selected)
        fullQuery:ISparJson,
        // the sparnatural spec
        specProvider:ISparnaturalSpecification,
        // true if this branch is the very first of the query (not a child of another, not a sibling of the first one)
        isVeryFirst:boolean,
        // true if this branch is under (recursively) of another that is itself in an option
        isInOption:boolean
    ){
        this.#branch = branch
        this.#fullQuery = fullQuery;
        this.#specProvider = specProvider
        this.#isVeryFirst = isVeryFirst
        this.#isInOption = isInOption

        // create the object to convert widget values to SPARQL
        let endClassValue = this.#branch.line.oType;
        // this is because the query generation may be triggered while the end class is not there yet
        if(endClassValue != null) {            
            this.#valueBuilder = new ValueBuilderFactory().buildValueBuilder(
                this.#specProvider.getProperty(this.#branch.line.p).getPropertyType(endClassValue)
            );
            // pass everything needed to generate SPARQL
            this.#valueBuilder.init(
                this.#specProvider,
                {variable:this.#branch.line.s,type:this.#branch.line.sType},
                {variable:null,type:this.#branch.line.p},
                {variable:this.#branch.line.o,type:this.#branch.line.oType},
                BranchTranslator.isVarSelected(fullQuery,this.#branch.line.o),
                this.#branch.line.values
            );
        }
    }

    build() {
        this.#buildChildrenPatterns()
        this.#buildSubjectClassPtrn()
        this.#buildIntersectionPtrn()
        this.#buildObjectClassPtrn()
        this.#buildValuePtrn()

        this.#buildFinalResultPtrn()
    }

    /**
     * Converts all children branches, and gather their patterns at this level
     */
    #buildChildrenPatterns() {
        this.#branch.children.forEach(branch => {
            const builder = new BranchTranslator(
                branch,
                this.#fullQuery,
                this.#specProvider,
                // children are never the very first
                true,
                // children branch will be in option if this one is optional or not exists
                this.#branch.optional || this.#branch.notExists
            )
            builder.build()
            this.#whereChildPtrns = builder.getResultPtrns()
            // gather default vars from children
            this.#defaultVars.push(...builder.getDefaultVars())
            // gather patterns to be executed after
            this.#executedAfterPtrns.push(...builder.getExecutedAfterPtrns())
        })

    }

    #buildValuePtrn() {
        if (this.#branch.line.values?.length > 0 ) {
            this.#valuePtrns = this.#valueBuilder.build();
        }
    }

    /**
     * Generates the triple of the type of subject ("s" and "sType" in the branch JSON structure)
     */
    #buildSubjectClassPtrn() {
        if(!this.#valueBuilder?.isBlockingStart()) {
            let typeTranslator:TypedVariableTranslator = new TypedVariableTranslator(
                this.#branch.line.s,
                this.#branch.line.sType,
                BranchTranslator.isVarSelected(this.#fullQuery,this.#branch.line.s),
                this.#specProvider
            );
            typeTranslator.build();
            this.#startClassPtrn = typeTranslator.resultPtrns;
            if(typeTranslator.hasDefaultLabel()) {
                this.#defaultVars.push(factory.variable(typeTranslator.defaultLabelVarName))
            }
        }
    }

    #buildObjectClassPtrn(){
        if(!this.#valueBuilder?.isBlockingEnd()) {
            let typeTranslator:TypedVariableTranslator = new TypedVariableTranslator(
                this.#branch.line.o,
                this.#branch.line.oType,
                BranchTranslator.isVarSelected(this.#fullQuery,this.#branch.line.o),
                this.#specProvider
            );
            typeTranslator.build();

            this.#endClassPtrn = typeTranslator.resultPtrns
            if(typeTranslator.hasDefaultLabel()) {
                this.#defaultVars.push(factory.variable(typeTranslator.defaultLabelVarName))
            }
        }
    }

    #buildIntersectionPtrn(){

        // the intersection triple can very well be generated even if no rdf:type triple is generated for the end class.
        if(!this.#valueBuilder?.isBlockingObjectProp()){

            this.#intersectionPtrn.push(
                SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                factory.variable(this.#branch.line.s),
                this.#branch.line.p,
                factory.variable(this.#branch.line.o)
                )])
            );

            // add language filter if property is set to be multilingual
            if(this.#specProvider.getProperty(this.#branch.line.p).isMultilingual()) {
                this.#intersectionPtrn.push(SparqlFactory.buildFilterLangEquals(
                    factory.variable(this.#branch.line.o),
                    factory.literal(getSettings().language)
                ));
            }
        }
    }

    /**
     * Translates the line to SPARQL
     */
    #buildFinalResultPtrn(){

        // always store the startClassPattern in the final result pattern (no OPTIONAL, no NOT EXISTS, no SERVICE)
        // the subject type criteria is generated only for the first criteria,
        // not if it is inside a WHERE or an AND
        if(this.#isVeryFirst) this.#resultPtrns.push(...this.#startClassPtrn)

        // concat all the patterns together, except the start pattern which is handled differntly
        let exceptStartPtrn:Pattern[] = []
        if(this.#intersectionPtrn) {
            exceptStartPtrn.push(...this.#intersectionPtrn)
        }

        if(
            !this.#specProvider.getEntity(this.#branch.line.oType).isLiteralEntity()
            &&
            !this.#specProvider.getProperty(this.#branch.line.p).omitClassCriteria()
        ) {
            exceptStartPtrn.push(...this.#endClassPtrn)
        } 
        exceptStartPtrn.push(...this.#valuePtrns)
        exceptStartPtrn.push(...this.#whereChildPtrns)

        // this will wrap everything except start inside the OPTIONAL or NOT EXISTS
        this.#createOptionStatePtrn(exceptStartPtrn)
    }

    #createOptionStatePtrn(exceptStartPtrn:Pattern[]){
        // create a SERVICE clause if needed
        const sparqlService = this.#specProvider.getProperty(this.#branch.line.p).getServiceEndpoint()
        let servicePtrn = null;
        if(sparqlService ){
            const endpoint = factory.namedNode(sparqlService)
            // to be on the safe side : when rollback an endclass group, we may come here with only the start class group criteria
            // and nothing in this array
            if(exceptStartPtrn.length > 0) {
                servicePtrn = SparqlFactory.buildServicePattern(exceptStartPtrn,endpoint)
            }
        }
        
        let normalOrServicePatterns:Pattern[] = servicePtrn ? [servicePtrn] : exceptStartPtrn;

        // produce the generated patterns, maybe wrapped in OPTIONAL or NOT EXISTS
        let finalResultPtrns:Pattern[] = [];
        // if this branch is optional and is not inside an optional branch
        if(this.#branch.optional && !this.#isInOption){
            finalResultPtrns.push(SparqlFactory.buildOptionalPattern(normalOrServicePatterns));
        } else if(this.#branch.notExists && !this.#isInOption){
            finalResultPtrns.push(SparqlFactory.buildNotExistsPattern(SparqlFactory.buildGroupPattern(normalOrServicePatterns)))
        } else {
            // nothing special, just retain the patterns in the final result pattern
            finalResultPtrns.push(...normalOrServicePatterns);
        }

        // then decide where to store the generated patterns : either in "normal" patterns
        // or in patterns that shall be executed after the rest of the query
        if(servicePtrn && this.#specProvider.getProperty(this.#branch.line.p).isLogicallyExecutedAfter()) {
            this.#executedAfterPtrns.push(...finalResultPtrns);
        } else {
            this.#resultPtrns.push(...finalResultPtrns);
        }
        
    }

    /**
     * @param query The query to test
     * @param varName The variable to test the selection for
     * @returns true if the varName is selected in the query
     */
    static isVarSelected(query:ISparJson, varName:string):boolean {
        return (query.variables.filter(v => {
            // if it is an aggregated variable...
            if((v as VariableExpression).expression) {
                let vExpression:VariableExpression = v as VariableExpression;
                if(vExpression.expression.expression.value == varName) {
                    return true;
                }
            } else {
                if((v as VariableTerm).value == varName) {
                    return true;
                }
            }
            return false;
        }).length == 1)
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
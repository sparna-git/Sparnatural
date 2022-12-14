import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern, Variable } from "sparqljs";
import { OptionTypes } from "../../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import { AbstractWidget } from "../../components/widgets/AbstractWidget";
import ISpecProvider from "../../spec-providers/ISpecProvider";
import ClassBuilder from "./ClassBuilder";
import IntersectionBuilder from "./IntersectionBuilder";
import SparqlFactory from "../SparqlFactory";

export default class WhereBuilder{
    // variables set in construtor
    #grpWrapper:GroupWrapper
    #specProvider: ISpecProvider
    #isChild:boolean
    #isInOption:boolean
    #widgetComponent:AbstractWidget | null | undefined = null
    
    // patterns built in the build process
    #resultPtrns: Pattern[] = []    
    #startClassPtrn:Pattern[] = []
    #endClassPtrn:Pattern[] = []
    #intersectionPtrn:BgpPattern 
    #whereChildPtrns: Pattern[] = []
    #andChildPtrns: Pattern[] = []
    #rdfPtrns: Pattern[] = []
    #executedAfterPtrns: Pattern[] = []

    // default vars gathered from children
    #defaultVars: Variable[] =[]

    constructor(grpWrapper:GroupWrapper,specProvider:ISpecProvider,isChild:boolean,isInOption:boolean){
        this.#grpWrapper = grpWrapper
        this.#specProvider = specProvider
        this.#isChild = isChild
        this.#isInOption = isInOption
        this.#widgetComponent = this.#grpWrapper.CriteriaGroup.EndClassGroup?.editComponents?.widgetWrapper?.widgetComponent
    }

    build() {
        this.#buildChildPatterns()
        this.#buildRdfPtrn()
        this.#buildStartClassPtrn()
        this.#buildEndClassPtrn()
        this.#buildIntersectionPtrn()
        this.#buildGrpWrapperPtrn()
    }

    #buildChildPatterns(){
        if(this.#grpWrapper.whereChild) this.#buildWhereChildPtrn()
        if(this.#grpWrapper.andSibling) this.#buildAndChildPtrn()
    }

    #buildWhereChildPtrn(){
        const builder = new WhereBuilder(this.#grpWrapper.whereChild,this.#specProvider,true,this.#grpWrapper.optionState !== OptionTypes.NONE)
        builder.build()
        this.#whereChildPtrns = builder.getResultPtrns()
        // gather default vars from children
        this.#defaultVars.push(...builder.getDefaultVars())
        // gather patterns to be executed after
        this.#executedAfterPtrns.push(...builder.getExecutedAfterPtrns())
    }

    #buildAndChildPtrn(){
        const builder = new WhereBuilder(this.#grpWrapper.andSibling,this.#specProvider,true,this.#isInOption)
        builder.build()
        this.#andChildPtrns = builder.getResultPtrns()
        // gather default vars from children
        this.#defaultVars.push(...builder.getDefaultVars())
        // gather patterns to be executed after
        this.#executedAfterPtrns.push(...builder.getExecutedAfterPtrns())
    }

    #buildRdfPtrn(){
        //get the infromation from the widget if there are widgetvalues selected
        if (this.#widgetComponent?.getwidgetValues()?.length > 0 ) this.#rdfPtrns = this.#widgetComponent.getRdfJsPattern();
    }

    #buildEndClassPtrn(){
        const endClsGrp = this.#grpWrapper.CriteriaGroup.EndClassGroup
        const endClsBuilder = new ClassBuilder(endClsGrp,this.#specProvider,this.#widgetComponent?.isBlockingEnd())
        endClsBuilder.build()
        this.#endClassPtrn = endClsBuilder.getPattern()
        if(endClsBuilder.getDefaultVar()) {
            this.#defaultVars.push(endClsBuilder.getDefaultVar())
        }
    }

    #buildStartClassPtrn() {
        const startClsGrp = this.#grpWrapper.CriteriaGroup.StartClassGroup
        const startClsBuilder = new ClassBuilder(startClsGrp,this.#specProvider,this.#widgetComponent?.isBlockingStart())
        startClsBuilder.build()
        this.#startClassPtrn = startClsBuilder.getPattern()
        if(startClsBuilder.getDefaultVar()) {
            this.#defaultVars.push(startClsBuilder.getDefaultVar())
        }
    }

    #buildIntersectionPtrn(){
        const objectPropCls = this.#grpWrapper.CriteriaGroup.ObjectPropertyGroup
        const intersectionBuilder = new IntersectionBuilder(this.#startClassPtrn,this.#endClassPtrn,this.#widgetComponent,objectPropCls)
        intersectionBuilder.build()
        this.#intersectionPtrn = intersectionBuilder.getPattern()
    }

    #buildGrpWrapperPtrn(){
        // The startClassPtrn does not need to be created if it is a WHERE or ANDChild
        const hasStartClass = (!this.#isChild)
        const hasEndClass = (
            !this.#specProvider.isLiteralClass(this.#grpWrapper.CriteriaGroup.EndClassGroup.getTypeSelected())
            &&
            !this.#specProvider.isRemoteClass(this.#grpWrapper.CriteriaGroup.EndClassGroup.getTypeSelected())
        );
        const hasIntersectionTriple = (this.#intersectionPtrn)

        let exceptStartPtrn:Pattern[] = []
        if(hasIntersectionTriple && this.#intersectionPtrn) exceptStartPtrn.push(this.#intersectionPtrn)
        if(hasEndClass) exceptStartPtrn.push(...this.#endClassPtrn)
        exceptStartPtrn.push(...this.#rdfPtrns)
        exceptStartPtrn.push(...this.#whereChildPtrns)

        this.#createOptionStatePtrn(hasStartClass,exceptStartPtrn)

        this.#resultPtrns.push(...this.#andChildPtrns)

    }

    #createOptionStatePtrn(hasStartClass:boolean,exceptStartPtrn:Pattern[]){
        // always store the startClassPattern in the final result pattern (no OPTIONAL, no NOT EXISTS, no SERVICE)
        if(hasStartClass) this.#resultPtrns.push(...this.#startClassPtrn)

        // create a SERVICE clause if needed
        const sparqlService = this.#specProvider.getServiceEndpoint(this.#grpWrapper.CriteriaGroup.ObjectPropertyGroup?.getTypeSelected())
        let servicePtrn = null;
        if(this.#grpWrapper.optionState === OptionTypes.SERVICE || (sparqlService != null)){
            const endpoint = DataFactory.namedNode(sparqlService)
            // to be on the safe side : when rollback an endclass group, we may come here with only the start class group criteria
            // and nothing in this array
            if(exceptStartPtrn.length > 0) {
                servicePtrn = SparqlFactory.buildServicePattern(exceptStartPtrn,endpoint)
            }
        }
        
        let normalOrServicePatterns:Pattern[] = servicePtrn ? [servicePtrn] : exceptStartPtrn;

        // produce the generated patterns, maybe wrapped in OPTIONAL or NOT EXISTS
        let finalResultPtrns:Pattern[] = [];
        if(this.#grpWrapper.optionState === OptionTypes.OPTIONAL && !this.#isInOption){
            finalResultPtrns.push(SparqlFactory.buildOptionalPattern(normalOrServicePatterns));
        } else if(this.#grpWrapper.optionState === OptionTypes.NOTEXISTS && !this.#isInOption){
            finalResultPtrns.push(SparqlFactory.buildNotExistsPattern(SparqlFactory.buildGroupPattern(normalOrServicePatterns)))
        } else {
            // nothing special, just retain the patterns in the final result pattern
            finalResultPtrns.push(...normalOrServicePatterns);
        }

        // then decide where to store the generated patterns : either in "normal" patterns
        // or in patterns that shall be executed after the rest of the query
        if(servicePtrn && this.#specProvider.isLogicallyExecutedAfter(this.#grpWrapper.CriteriaGroup.ObjectPropertyGroup?.getTypeSelected())) {
            this.#executedAfterPtrns.push(...finalResultPtrns);
        } else {
            this.#resultPtrns.push(...finalResultPtrns);
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
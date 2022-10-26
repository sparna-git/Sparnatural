import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, Pattern, Variable } from "sparqljs";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { AbstractWidget } from "../components/widgets/AbstractWidget";
import ISpecProvider from "../spec-providers/ISpecProviders";
import ClassBuilder from "./builders/ClassBuilder";
import IntersectionBuilder from "./builders/IntersectionBuilder";
import SparqlFactory from "./SparqlFactory";

export default class WhereBuilder{
    #resultPtrns: Pattern[] = []
    #grpWrapper
    #specProvider
    #widgetComponent:AbstractWidget | null | undefined = null
    #startClassPtrn:Pattern[] = []
    #endClassPtrn:Pattern[] = []
    #isChild:boolean
    #isInOption:boolean
    #intersectionPtrn:BgpPattern 
    #whereChildPtrns: Pattern[] = []
    #andChildPtrns: Pattern[] = []
    #rdfPtrns: Pattern[] = []
    #defaultVars: Variable[] =[]
    constructor(grpWrapper:GroupWrapper,specProvider:ISpecProvider,isChild:boolean,isInOption:boolean){
        this.#grpWrapper = grpWrapper
        this.#specProvider = specProvider
        this.#isChild = isChild
        this.#isInOption = isInOption
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
        this.#defaultVars.push(...builder.getDefaultVars())
    }

    #buildAndChildPtrn(){
        const builder = new WhereBuilder(this.#grpWrapper.andSibling,this.#specProvider,true,this.#isInOption)
        builder.build()
        this.#andChildPtrns = builder.getResultPtrns()
        this.#defaultVars.push(...builder.getDefaultVars())
    }

    #buildRdfPtrn(){
        this.#widgetComponent = this.#grpWrapper.CriteriaGroup.EndClassGroup?.editComponents?.widgetWrapper?.widgetComponent
        //get the infromation from the widget if there are widgetvalues selected
        if (this.#widgetComponent?.getwidgetValues()?.length > 0 ) this.#rdfPtrns = this.#widgetComponent.getRdfJsPattern();
    }

    #buildEndClassPtrn(){
        const endClsGrp = this.#grpWrapper.CriteriaGroup.EndClassGroup
        const endClsBuilder = new ClassBuilder(endClsGrp,this.#specProvider,this.#widgetComponent)
        endClsBuilder.build()
        this.#endClassPtrn = endClsBuilder.getPattern()
        if(endClsBuilder.getDefaultVar())this.#defaultVars.push(endClsBuilder.getDefaultVar())
    }

    #buildStartClassPtrn() {
        const startClsGrp = this.#grpWrapper.CriteriaGroup.StartClassGroup
        const startClsBuilder = new ClassBuilder(startClsGrp,this.#specProvider,this.#widgetComponent)
        startClsBuilder.build()
        this.#startClassPtrn = startClsBuilder.getPattern()
        if(startClsBuilder.getDefaultVar())this.#defaultVars.push(startClsBuilder.getDefaultVar())
    }

    #buildIntersectionPtrn(){
        const objectPropCls = this.#grpWrapper.CriteriaGroup.ObjectPropertyGroup
        const intersectionBuilder = new IntersectionBuilder(this.#startClassPtrn,this.#endClassPtrn,this.#widgetComponent,objectPropCls)
        intersectionBuilder.build()
        this.#intersectionPtrn = intersectionBuilder.getPattern()
    }

    #buildGrpWrapperPtrn(){
        const hasStartClass = (!this.#isChild)
        const hasEndClass = (!this.#specProvider.isLiteralClass(this.#grpWrapper.CriteriaGroup.EndClassGroup.getTypeSelected()))
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
        if(hasStartClass) this.#resultPtrns.push(...this.#startClassPtrn)

        const serviceDatasource = this.#specProvider.getSparqlEndpointUrl(this.#grpWrapper.CriteriaGroup.ObjectPropertyGroup?.getTypeSelected())
        let servicePtrn
        if(this.#grpWrapper.optionState === OptionTypes.SERVICE || serviceDatasource){
            const endpoint = DataFactory.namedNode(serviceDatasource)
            servicePtrn = SparqlFactory.buildServicePattern(exceptStartPtrn,endpoint)
        }

        if(this.#grpWrapper.optionState === OptionTypes.NONE || this.#isInOption ) {
            servicePtrn ? this.#resultPtrns.push(servicePtrn) : this.#resultPtrns.push(...exceptStartPtrn)
            return
        } 

        if(this.#grpWrapper.optionState === OptionTypes.OPTIONAL){
            servicePtrn ? 
            this.#resultPtrns.push(SparqlFactory.buildOptionalPattern([servicePtrn]))
            :
            this.#resultPtrns.push(SparqlFactory.buildOptionalPattern(exceptStartPtrn))
            return
        }

        if(this.#grpWrapper.optionState === OptionTypes.NOTEXISTS){
            let ptrn
            servicePtrn ? 
            ptrn = SparqlFactory.buildGroupPattern([servicePtrn])
            :
            ptrn = SparqlFactory.buildGroupPattern(exceptStartPtrn)
            this.#resultPtrns.push(SparqlFactory.buildNotExistsPattern(ptrn))
            return
        }
    }

    getResultPtrns(){
        return this.#resultPtrns
    }

    getDefaultVars(){
        return this.#defaultVars
    }
}
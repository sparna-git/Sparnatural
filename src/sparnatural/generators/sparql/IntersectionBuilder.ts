import { DataFactory } from 'rdf-data-factory';
import { Pattern } from "sparqljs";
import ObjectPropertyGroup from "../../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { AbstractWidget } from "../../components/widgets/AbstractWidget";
import { getSettings } from "../../settings/defaultSettings";
import ISparnaturalSpecification from "../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "./SparqlFactory";
import ValueBuilderIfc from './ValueBuilder';

const factory = new DataFactory();

export default class IntersectionBuilder{
    #startClassVar:string|undefined
    #endClassVar:string|undefined
    #valueBuilder:ValueBuilderIfc
    #objectPropCls:ObjectPropertyGroup
    resultPtrn:Pattern[] = []
    specProvider:ISparnaturalSpecification
    
    constructor(
        startClassVar:string|undefined,
        endClassVar:string|undefined,
        valueBuilder:ValueBuilderIfc,
        objectPropCls:ObjectPropertyGroup,
        specProvider:ISparnaturalSpecification
    ){
        this.#startClassVar = startClassVar
        this.#endClassVar = endClassVar
        this.#valueBuilder = valueBuilder
        this.#objectPropCls = objectPropCls 
        this.specProvider = specProvider
    }

    build(){
        // the intersection triple can very well be generated even if no rdf:type triple is generated for the end class.
        if(this.#startClassVar && this.#endClassVar && !this.#valueBuilder?.isBlockingObjectProp()){
            
            /*
            this.resultPtrn.push(
                SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                (this.#startClsPtrn[0] as BgpPattern).triples[0].subject as VariableTerm,
                this.#objectPropCls.getTypeSelected(),
                (this.#endClsPtrn[0] as BgpPattern).triples[0].subject as VariableTerm
                )])
            );
            */

            this.resultPtrn.push(
                SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                factory.variable(this.#startClassVar.replace('?','')),
                this.#objectPropCls.getTypeSelected(),
                factory.variable(this.#endClassVar.replace('?',''))
                )])
            );

            // add language filter if property is set to be multilingual
            if(this.specProvider.getProperty(this.#objectPropCls.getTypeSelected()).isMultilingual()) {
                this.resultPtrn.push(SparqlFactory.buildFilterLangEquals(
                    factory.variable(this.#endClassVar.replace('?','')),
                    factory.literal(getSettings().language)
                ));
            }
        }
    }

    getPattern(){
        return this.resultPtrn
    }
}
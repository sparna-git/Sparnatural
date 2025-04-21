import { DataFactory } from 'rdf-data-factory';
import { Pattern } from "sparqljs";
import ObjectPropertyGroup from "../../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { ISparnaturalSpecification } from "../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "./SparqlFactory";
import ValueBuilderIfc from './ValueBuilder';
import ISpecificationProperty from '../../spec-providers/ISpecificationProperty';

const factory = new DataFactory();

export default class IntersectionBuilder{
    #startClassVar:string|undefined
    #endClassVar:string|undefined
    #valueBuilder:ValueBuilderIfc
    #objectPropCls:ObjectPropertyGroup
    resultPtrn:Pattern[] = []
    specProvider:ISparnaturalSpecification
    settings: any;
    
    constructor(
        startClassVar:string|undefined,
        endClassVar:string|undefined,
        valueBuilder:ValueBuilderIfc,
        objectPropCls:ObjectPropertyGroup,
        specProvider:ISparnaturalSpecification,
        settings: any
    ){
        this.#startClassVar = startClassVar
        this.#endClassVar = endClassVar
        this.#valueBuilder = valueBuilder
        this.#objectPropCls = objectPropCls 
        this.specProvider = specProvider
        this.settings = settings;
    }

    build(){
        // the intersection triple can very well be generated even if no rdf:type triple is generated for the end class.
        if(this.#startClassVar && this.#endClassVar && !this.#valueBuilder?.isBlockingObjectProp()){

            let specProperty:ISpecificationProperty = this.specProvider.getProperty(this.#objectPropCls.getTypeSelected());

            if(specProperty.getBeginDateProperty() && specProperty.getEndDateProperty()) {
                if(specProperty.getBeginDateProperty()) {
                    this.resultPtrn.push(
                        SparqlFactory.buildOptionalPattern([
                            SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                            factory.variable(this.#startClassVar),
                            specProperty.getBeginDateProperty(),
                            factory.variable(this.#endClassVar+"_begin")
                            )])
                        ])
                    );
                }

                if(specProperty.getEndDateProperty()) {
                    this.resultPtrn.push(
                        SparqlFactory.buildOptionalPattern([
                            SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                            factory.variable(this.#startClassVar),
                            specProperty.getEndDateProperty(),
                            factory.variable(this.#endClassVar+"_end")
                            )])
                        ])
                    );
                }

                if(specProperty.getExactDateProperty()) {
                    this.resultPtrn.push(
                        SparqlFactory.buildOptionalPattern([
                            SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                            factory.variable(this.#startClassVar),
                            specProperty.getEndDateProperty(),
                            factory.variable(this.#endClassVar+"_exact")
                            )])
                        ])
                    );
                }
            } else {
                this.resultPtrn.push(
                    SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                    factory.variable(this.#startClassVar),
                    this.#objectPropCls.getTypeSelected(),
                    factory.variable(this.#endClassVar)
                    )])
                );
            }


            // add language filter if property is set to be multilingual
            if(this.specProvider.getProperty(this.#objectPropCls.getTypeSelected()).isMultilingual()) {
                this.resultPtrn.push(SparqlFactory.buildFilterLangEquals(
                    factory.variable(this.#endClassVar),
                    factory.literal(this.settings.language)
                ));
            }
        }
    }

    getPattern(){
        return this.resultPtrn
    }
}
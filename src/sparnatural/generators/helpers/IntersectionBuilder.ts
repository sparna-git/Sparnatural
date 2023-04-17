import { DataFactory } from "n3";
import { BgpPattern, Pattern, Triple, VariableTerm } from "sparqljs";
import ObjectPropertyGroup from "../../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { AbstractWidget } from "../../components/widgets/AbstractWidget";
import { getSettings } from "../../settings/defaultSettings";
import ISparnaturalSpecification from "../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "../SparqlFactory";

export default class IntersectionBuilder{
    #startClassVar:string|undefined
    #endClassVar:string|undefined
    #widgetComponent:AbstractWidget
    #objectPropCls:ObjectPropertyGroup
    resultPtrn:Pattern[] = []
    specProvider:ISparnaturalSpecification
    
    constructor(
        startClassVar:string|undefined,
        endClassVar:string|undefined,
        widgetComponent:AbstractWidget,
        objectPropCls:ObjectPropertyGroup,
        specProvider:ISparnaturalSpecification
    ){
        this.#startClassVar = startClassVar
        this.#endClassVar = endClassVar
        this.#widgetComponent = widgetComponent
        this.#objectPropCls = objectPropCls 
        this.specProvider = specProvider
    }

    build(){
        // the intersection triple can very well be generated even if no rdf:type triple is generated for the end class.
        if(this.#startClassVar && this.#endClassVar && !this.#widgetComponent?.isBlockingObjectProp()){
            
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
                DataFactory.variable(this.#startClassVar.replace('?','')),
                this.#objectPropCls.getTypeSelected(),
                DataFactory.variable(this.#endClassVar.replace('?',''))
                )])
            );

            // add language filter if property is set to be multilingual
            if(this.specProvider.isMultilingual(this.#objectPropCls.getTypeSelected())) {
                this.resultPtrn.push(SparqlFactory.buildFilterLangEquals(
                    DataFactory.variable(this.#endClassVar.replace('?','')),
                    DataFactory.literal(getSettings().language)
                ));
            }
        }
    }

    getPattern(){
        return this.resultPtrn
    }
}
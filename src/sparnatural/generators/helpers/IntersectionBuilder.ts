import { DataFactory } from "n3";
import { BgpPattern, Pattern, Triple, VariableTerm } from "sparqljs";
import ObjectPropertyGroup from "../../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { AbstractWidget } from "../../components/widgets/AbstractWidget";
import { getSettings } from "../../settings/defaultSettings";
import ISpecProvider from "../../spec-providers/ISpecProvider";
import SparqlFactory from "../SparqlFactory";

export default class IntersectionBuilder{
    #startClsPtrn:Pattern[]
    #endClsPtrn:Pattern[]
    #widgetComponent:AbstractWidget
    #objectPropCls:ObjectPropertyGroup
    resultPtrn:Pattern[] = []
    specProvider:ISpecProvider
    constructor(startClsPtrn:Pattern[],endClsPtrn:Pattern[],widgetComponent:AbstractWidget,objectPropCls:ObjectPropertyGroup,specProvider:ISpecProvider){
        this.#startClsPtrn = startClsPtrn
        this.#endClsPtrn = endClsPtrn
        this.#widgetComponent = widgetComponent
        this.#objectPropCls = objectPropCls 
        this.specProvider = specProvider
    }

    build(){
        // TODO : That's strange : blocking start or end happens *before* here and can prevent startCls and endCls patterns
        // however this should NOT prevent the intersection triple to be generated
        // the intersection triple can very well be generated even if no rdf:type triple is generated for the end class.
        if(!this.#widgetComponent?.isBlockingObjectProp() && this.#startClsPtrn.length > 0 && this.#endClsPtrn.length > 0){
            
            this.resultPtrn.push(
                SparqlFactory.buildBgpPattern([SparqlFactory.buildIntersectionTriple(
                (this.#startClsPtrn[0] as BgpPattern).triples[0].subject as VariableTerm,
                this.#objectPropCls.getTypeSelected(),
                (this.#endClsPtrn[0] as BgpPattern).triples[0].subject as VariableTerm
                )])
            );

            // add language filter if property is set to be multilingual
            if(this.specProvider.isMultilingual(this.#objectPropCls.getTypeSelected())) {
                this.resultPtrn.push(SparqlFactory.buildFilterLangEquals(
                    (this.#endClsPtrn[0] as BgpPattern).triples[0].subject as VariableTerm,
                    DataFactory.literal(getSettings().language)
                ));
            }
        }
    }

    getPattern(){
        return this.resultPtrn
    }
}
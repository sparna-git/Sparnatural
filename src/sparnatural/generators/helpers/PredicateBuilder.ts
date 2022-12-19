import { BgpPattern, Pattern, Triple, VariableTerm } from "sparqljs";
import ObjectPropertyGroup from "../../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { AbstractWidget } from "../../components/widgets/AbstractWidget";
import SparqlFactory from "../SparqlFactory";

export default class PredicateBuilder{
    #startClsPtrn:Pattern[]
    #endClsPtrn:Pattern[]
    #widgetComponent:AbstractWidget
    #predicateTriple:Triple
    #objectPropCls:ObjectPropertyGroup
    resultPtrn:BgpPattern
    constructor(startClsPtrn:Pattern[],endClsPtrn:Pattern[],widgetComponent:AbstractWidget,objectPropCls:ObjectPropertyGroup){
        this.#startClsPtrn = startClsPtrn
        this.#endClsPtrn = endClsPtrn
        this.#widgetComponent = widgetComponent
        this.#objectPropCls = objectPropCls
    }

    build(){
        if(!this.#widgetComponent?.isBlockingPredicate() && this.#startClsPtrn.length > 0 && this.#endClsPtrn.length > 0){
            this.#predicateTriple = SparqlFactory.buildPredicateTriple(
              (this.#startClsPtrn[0] as BgpPattern).triples[0].subject as VariableTerm,
              this.#objectPropCls.getTypeSelected(),
              (this.#endClsPtrn[0] as BgpPattern).triples[0].subject as VariableTerm
            );

            this.#createPattern()
        }
    }

    #createPattern(){
        this.resultPtrn = SparqlFactory.buildBgpPattern([this.#predicateTriple])
    }

    getPattern(){
        return this.resultPtrn
    }
}
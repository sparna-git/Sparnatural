import { DataFactory } from "n3";
import { BgpPattern, Pattern, Triple, VariableTerm } from "sparqljs";
import PredicateSelector from "../../components/builder-section/groupwrapper/criteriagroup/predicateselector/PredicateSelector";
import { AbstractWidget } from "../../components/widgets/AbstractWidget";
import { getSettings } from "../../settings/defaultSettings";
import ISpecProvider from "../../spec-providers/ISpecProvider";
import SparqlFactory from "../SparqlFactory";

export default class PredicateBuilder{
    #startClsPtrn:Pattern[]
    #endClsPtrn:Pattern[]
    #widgetComponent:AbstractWidget
    #objectPropCls:PredicateSelector
    resultPtrn:Pattern[] = []
    specProvider:ISpecProvider
    constructor(startClsPtrn:Pattern[],endClsPtrn:Pattern[],widgetComponent:AbstractWidget,objectPropCls:PredicateSelector,specProvider:ISpecProvider){
        this.#startClsPtrn = startClsPtrn
        this.#endClsPtrn = endClsPtrn
        this.#widgetComponent = widgetComponent
        this.#objectPropCls = objectPropCls
        this.specProvider = specProvider
    }

    build(){
        if(!this.#widgetComponent?.isBlockingPredicate() && this.#startClsPtrn.length > 0 && this.#endClsPtrn.length > 0){
            this.resultPtrn.push(
                SparqlFactory.buildBgpPattern([SparqlFactory.buildPredicateTriple(
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
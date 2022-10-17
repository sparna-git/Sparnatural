import { DataFactory } from "n3";
import { OptionalPattern, Pattern, Triple } from "sparqljs";
import EndClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import StartClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import { AbstractWidget } from "../../components/widgets/AbstractWidget";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import SparqlFactory from "../SparqlFactory";

export default class  ClassBuilder {
    protected resultPtrn:Pattern[] = []
    protected specProvider:ISpecProvider
    protected classGroup: StartClassGroup | EndClassGroup
    protected classTriple:Triple
    protected defaultLblTriple:Triple
    protected defaultInOptional:OptionalPattern
    protected widgetComponent:AbstractWidget
    constructor(classGroup:StartClassGroup | EndClassGroup,specProvider:ISpecProvider,widgetComponent:AbstractWidget){
        this.classGroup = classGroup
        this.specProvider = specProvider
        this.widgetComponent = widgetComponent
    }

    build(){
        const blocking = this.#ifBlocking()
        if(blocking) return
        this.#ifDefaultTrpl()
        this.#createPtrn()
    }

    #ifDefaultTrpl(){
        const varIsSelected = this.classGroup.inputTypeComponent?.selectViewVariableBtn?.selected
        const defaultLbl = this.specProvider.getDefaultLabelProperty(this.classTriple.object.value)
        if (! defaultLbl) return
        this.#buildDefaultLblTrpl()
        this.#ifDefaultTrplInOptional(defaultLbl) 
    }

    #ifDefaultTrplInOptional(defaultLbl:string){
        if (this.specProvider.isEnablingOptional(defaultLbl)) this.#putDefaultLblInOptional()  
    }

    #ifBlocking(){
        if(this.widgetComponent?.isBlockingStart() || this.classGroup.getTypeSelected() === null) return true
        this.#buildClsTriple()
        return false
    }

    #buildClsTriple(){
        this.classTriple= SparqlFactory.buildRdfTypeTriple(
            DataFactory.variable(this.classGroup.getVarName()?.replace('?','')) ,
            DataFactory.namedNode(this.classGroup.getTypeSelected())
        )
    }

    #buildDefaultLblTrpl(){
        this.defaultLblTriple = SparqlFactory.buildTriple(
            DataFactory.variable(this.classTriple.subject.value.replace("?", "")),
            DataFactory.namedNode(this.classGroup.defaultLblVar.type),
            DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
          )
    }

    #putDefaultLblInOptional(){
        this.defaultInOptional = SparqlFactory.buildOptionalPattern([SparqlFactory.buildBgpPattern([this.defaultLblTriple])])
    }

    #createPtrn(){
        if(this.defaultInOptional) {
            // classTriple + the defaultLabel inside OPTIONAL pattern
            // Don't put OPTIONAL inside BgpPattern It's not allowed
            this.resultPtrn.push(SparqlFactory.buildBgpPattern([this.classTriple]))
            this.resultPtrn.push(this.defaultInOptional)
        } else {
            if(this.defaultLblTriple){
              // create classtriple + defaultLabel in one bgp pattern
              this.resultPtrn.push(SparqlFactory.buildBgpPattern([this.classTriple,this.defaultLblTriple]))
            } else {
              // no default label got created. only insert start tuple
              this.resultPtrn.push(SparqlFactory.buildBgpPattern([this.classTriple]))
            }        
        }
    }

    getPattern():Pattern[]{
        return this.resultPtrn
    }
}
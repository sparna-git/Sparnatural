import { DataFactory } from "n3";
import { OptionalPattern, Pattern, Triple, Variable } from "sparqljs";
import EndClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import StartClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import { getSettings } from "../../settings/defaultSettings";
import ISparnaturalSpecification from "../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "../SparqlFactory";


export default class  ClassBuilder {
    protected resultPtrn:Pattern[] = []
    protected specProvider:ISparnaturalSpecification
    protected classGroup: StartClassGroup | EndClassGroup
    protected classTriple:Triple
    // can consist of multiple patterns in case there is a FILTER(lang(?var) = "xx") if the property is multilingual
    protected defaultLblPatterns:Pattern[] =[]
    protected defaultInOptional:OptionalPattern
    protected widgetIsBlocking:boolean
    protected typePredicate:string

    constructor(classGroup:StartClassGroup | EndClassGroup,specProvider:ISparnaturalSpecification,widgetIsBlocking:boolean,typePredicate:string="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"){
        this.classGroup = classGroup
        this.specProvider = specProvider
        this.widgetIsBlocking = widgetIsBlocking
        this.typePredicate = typePredicate
    }

    build(){
        const blocking = this.#ifBlocking()
        // if(blocking) return
        this.#ifDefaultTrpl()
        this.#createPtrn()
    }

    #ifDefaultTrpl(){
        const defaultLbl = this.specProvider.getEntity(this.classGroup.getTypeSelected()).getDefaultLabelProperty()
        if (!defaultLbl) return
        this.#buildDefaultLblTrpl()
        this.#ifDefaultTrplInOptional(defaultLbl) 
    }

    #ifDefaultTrplInOptional(defaultLbl:string){
        if (
            this.specProvider.getProperty(defaultLbl).isEnablingOptional()
            // don't put in optional if we are already doing an "OPTIONAL {...} OPTIONAL{...} BIND(COALESCE(...))" pattern
            &&
            !(
                getSettings().defaultLanguage != getSettings().language
            )
        ) this.#putDefaultLblInOptional()  
    }

    #ifBlocking(){
        if(
            this.widgetIsBlocking
            ||
            this.classGroup.getTypeSelected() === null
        ) return true
        this.#buildClsTriple()
        return false
    }

    #buildClsTriple(){
        //https://github.com/sparna-git/Sparnatural/issues/72
        if(getSettings().typePredicate){
            const parsed = SparqlFactory.parsePropertyPath(getSettings().typePredicate)
            this.classTriple = SparqlFactory.buildTypeTriple(
                DataFactory.variable(this.classGroup.getVarName()?.replace('?','')) ,
                parsed,
                DataFactory.namedNode(this.classGroup.getTypeSelected())
            )
        } else {
            this.classTriple = SparqlFactory.buildTypeTriple(
                DataFactory.variable(this.classGroup.getVarName()?.replace('?','')) ,
                DataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
                DataFactory.namedNode(this.classGroup.getTypeSelected())
            )
        }
    }

    #buildDefaultLblTrpl(){
        // generate only in the case the defaultVar exists
        if(this.getDefaultVar()) {

            if(this.specProvider.getProperty(this.classGroup.defaultLblVar.type).isMultilingual()) {
                if(getSettings().language == getSettings().defaultLanguage) {
                    this.defaultLblPatterns.push(
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                DataFactory.variable(this.classGroup.getVarName()?.replace('?','')),
                                DataFactory.namedNode(this.classGroup.defaultLblVar.type),
                                DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
                            )]
                    ));
                    this.defaultLblPatterns.push(
                        SparqlFactory.buildFilterLangEquals(
                            DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`),
                            DataFactory.literal(getSettings().language)
                        )
                    );
                } else {
                    this.defaultLblPatterns.push(SparqlFactory.buildOptionalPattern(
                        [
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                DataFactory.variable(this.classGroup.getVarName()?.replace('?','')),
                                DataFactory.namedNode(this.classGroup.defaultLblVar.type),
                                DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_lang`)
                            )]
                        ),
                        SparqlFactory.buildFilterLangEquals(
                            DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_lang`),
                            DataFactory.literal(getSettings().language)
                        )
                        ]
                    ));

                    this.defaultLblPatterns.push(SparqlFactory.buildOptionalPattern(
                        [
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                DataFactory.variable(this.classGroup.getVarName()?.replace('?','')),
                                DataFactory.namedNode(this.classGroup.defaultLblVar.type),
                                DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_defaultLang`)
                            )]
                        ),
                        SparqlFactory.buildFilterLangEquals(
                            DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_defaultLang`),
                            DataFactory.literal(getSettings().defaultLanguage)
                        )
                        ]
                    ));

                    this.defaultLblPatterns.push(SparqlFactory.buildBindCoalescePattern(
                        DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_lang`),
                        DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_defaultLang`),
                        DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
                    ));
                }
            } else {
                this.defaultLblPatterns.push(
                    SparqlFactory.buildBgpPattern([
                        SparqlFactory.buildTriple(
                            DataFactory.variable(this.classGroup.getVarName()?.replace('?','')),
                            DataFactory.namedNode(this.classGroup.defaultLblVar.type),
                            DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
                        )
                    ])
                    );
            }
        }
    }

    #putDefaultLblInOptional(){
        if(this.defaultLblPatterns.length > 0){
            this.defaultInOptional = SparqlFactory.buildOptionalPattern(this.defaultLblPatterns)
        }
    }

    #createPtrn(){
        if(this.defaultInOptional) {
            // classTriple + the defaultLabel inside OPTIONAL pattern
            // Don't put OPTIONAL inside BgpPattern It's not allowed
            if(this.classTriple) {
                this.resultPtrn.push(SparqlFactory.buildBgpPattern([this.classTriple]))
            }
            this.resultPtrn.push(this.defaultInOptional)
        } else {
            if(this.defaultLblPatterns.length > 0){
              // create classtriple + defaultLabel
              if(this.classTriple) {
                 this.resultPtrn.push(SparqlFactory.buildBgpPattern([this.classTriple]));
              }
              this.resultPtrn.push(...this.defaultLblPatterns)
            } else {
              // no default label got created. only insert start tuple
              if(this.classTriple) {
                  this.resultPtrn.push(SparqlFactory.buildBgpPattern([this.classTriple]))
              }
            }        
        }
    }

    getPattern():Pattern[]{
        return this.resultPtrn
    }

    /**
     * @returns the defaultLabel variable, only in the case the variable is selected for inclusion as a column
     */
    getDefaultVar():Variable {
        const selected = this.classGroup.inputSelector?.selectViewVariableBtn?.selected
        if(selected && this.classGroup.defaultLblVar.variable) return DataFactory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
    }
}
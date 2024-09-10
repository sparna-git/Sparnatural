import { DataFactory } from 'rdf-data-factory';
import { OptionalPattern, Pattern, Triple, Variable } from "sparqljs";
import EndClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import StartClassGroup from "../../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import { getSettings } from "../../settings/defaultSettings";
import ISparnaturalSpecification from "../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "./SparqlFactory";

const factory = new DataFactory();

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
        // don't build the class triple if the entity does not hove type
        if(this.specProvider.getEntity(this.classGroup.getTypeSelected()).hasTypeCriteria()) {
            var typePredicate;
            if(getSettings().typePredicate){
                typePredicate = SparqlFactory.parsePropertyPath(getSettings().typePredicate)
            } else {
                typePredicate = factory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
            }

            this.classTriple = SparqlFactory.buildTypeTriple(
                factory.variable(this.classGroup.getVarName()?.replace('?','')) ,
                typePredicate,
                factory.namedNode(this.classGroup.getTypeSelected())
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
                                factory.variable(this.classGroup.getVarName()?.replace('?','')),
                                factory.namedNode(this.classGroup.defaultLblVar.type),
                                factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
                            )]
                    ));
                    this.defaultLblPatterns.push(
                        SparqlFactory.buildFilterLangEquals(
                            factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`),
                            factory.literal(getSettings().language)
                        )
                    );
                } else {
                    this.defaultLblPatterns.push(SparqlFactory.buildOptionalPattern(
                        [
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                factory.variable(this.classGroup.getVarName()?.replace('?','')),
                                factory.namedNode(this.classGroup.defaultLblVar.type),
                                factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_lang`)
                            )]
                        ),
                        SparqlFactory.buildFilterLangEquals(
                            factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_lang`),
                            factory.literal(getSettings().language)
                        )
                        ]
                    ));

                    this.defaultLblPatterns.push(SparqlFactory.buildOptionalPattern(
                        [
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                factory.variable(this.classGroup.getVarName()?.replace('?','')),
                                factory.namedNode(this.classGroup.defaultLblVar.type),
                                factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_defaultLang`)
                            )]
                        ),
                        SparqlFactory.buildFilterLangEquals(
                            factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_defaultLang`),
                            factory.literal(getSettings().defaultLanguage)
                        )
                        ]
                    ));

                    this.defaultLblPatterns.push(SparqlFactory.buildBindCoalescePattern(
                        factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_lang`),
                        factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}_defaultLang`),
                        factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
                    ));
                }
            } else {
                this.defaultLblPatterns.push(
                    SparqlFactory.buildBgpPattern([
                        SparqlFactory.buildTriple(
                            factory.variable(this.classGroup.getVarName()?.replace('?','')),
                            factory.namedNode(this.classGroup.defaultLblVar.type),
                            factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
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
        if(selected && this.classGroup.defaultLblVar.variable) return factory.variable(`${this.classGroup.defaultLblVar.variable.replace("?", "")}`)
    }
}
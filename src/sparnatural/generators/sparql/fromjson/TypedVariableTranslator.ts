import { DataFactory } from 'rdf-data-factory';
import { Pattern, Triple } from "sparqljs";
import ISparnaturalSpecification from "../../../spec-providers/ISparnaturalSpecification";
import SparqlFactory from "../SparqlFactory";
import { getSettings } from "../../../settings/defaultSettings";
import ISpecificationProperty from '../../../spec-providers/ISpecificationProperty';

const factory = new DataFactory();

/**
 * Converts a variable with a type into the corresponding SPARQL pattern. The variables and type
 * are either "s" and "sType" or "o" and "oType".
 * Also adds the patterns to fetch the default label for the variable, if necessary
 */
export default class TypedVariableTranslator{

    // The variable name
    #variableName:string;
    // The URI of the type in the config
    #variableType:string;
    // whether the variable is selected or not
    #variableIsSelected:boolean;
    // can consist of multiple patterns in case there is a FILTER(lang(?var) = "xx") if the property is multilingual
    protected defaultLblPatterns:Pattern[] =[]

    #specProvider: ISparnaturalSpecification
    
    #typeTriple:Triple

    // patterns built in the build process
    #resultPtrns: Pattern[] = []    
    #executedAfterPtrns: Pattern[] = []

    constructor(
        variableName:string,
        variableType:string,
        variableIsSelected:boolean,
        specProvider:ISparnaturalSpecification
    ){
        this.#variableName = variableName
        this.#variableType = variableType
        this.#specProvider = specProvider
        this.#variableIsSelected = variableIsSelected
    }

    build() {
        this.#buildTypeTriple()
        // generate default label patterns only if the varibale is selected
        if(this.#variableIsSelected) {
            this.#buildDefaultLblTrpl()
        }
        this.#createResultPtrns()
    }

    /**
     * Generates the triple of the type
     */
    #buildTypeTriple() {
        // don't build the class triple if the entity does not have a type criteria
        if(this.#specProvider.getEntity(this.#variableType).hasTypeCriteria()) {
            var typePredicate;
            if(getSettings().typePredicate){
                typePredicate = SparqlFactory.parsePropertyPath(getSettings().typePredicate)
            } else {
                typePredicate = factory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
            }

            this.#typeTriple = SparqlFactory.buildTypeTriple(
                factory.variable(this.#variableName) ,
                typePredicate,
                factory.namedNode(this.#variableType)
            )
        }
    }

    #buildDefaultLblTrpl(){
        // generate only in the case the default label property exists
        if(this.hasDefaultLabel()) {
            let defaultLabelProp:ISpecificationProperty = this.getDefaultLabelProperty();

            if(defaultLabelProp.isMultilingual()) {
                // default label property is multilingual
                // try to match it against the lang and defaultLang parameters of Sparnatural
                
                if(getSettings().language == getSettings().defaultLanguage) {
                    // lang and defaultLang are the same
                    // try to match with an equality on the language

                    // ?Person_1 foaf:name ?Person_1_label
                    this.defaultLblPatterns.push(
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                factory.variable(this.#variableName),
                                factory.namedNode(defaultLabelProp.getId()),
                                factory.variable(this.getDefaultLabelVarName())
                            )]
                    ));
                    // FILTER(?Person_1_label = "fr")
                    this.defaultLblPatterns.push(
                        SparqlFactory.buildFilterLangEquals(
                            factory.variable(this.getDefaultLabelVarName()),
                            factory.literal(getSettings().language)
                        )
                    );
                } else {
                    // the user langauge and default data language are different
                    // use a pattern OPTIONAL {...} OPTIONAL {...} BIND(COALESCE(?x1,?x2) AS ?x)
                    
                    // OPTIONAL { ?Person_1 foaf:name ?Person_1_label_lang . FILTER(?Person_1_label_lang = "fr")}
                    this.defaultLblPatterns.push(SparqlFactory.buildOptionalPattern(
                        [
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                factory.variable(this.#variableName),
                                factory.namedNode(defaultLabelProp.getId()),
                                factory.variable(this.getDefaultLabelVarName()+"_lang")
                            )]
                        ),
                        SparqlFactory.buildFilterLangEquals(
                            factory.variable(this.getDefaultLabelVarName()+"_lang"),
                            factory.literal(getSettings().language)
                        )
                        ]
                    ));

                    // OPTIONAL { ?Person_1 foaf:name ?Person_1_label_defaultLang . FILTER(?Person_1_label_defaultLang = "en")}
                    this.defaultLblPatterns.push(SparqlFactory.buildOptionalPattern(
                        [
                        SparqlFactory.buildBgpPattern(
                            [SparqlFactory.buildTriple(
                                factory.variable(this.#variableName),
                                factory.namedNode(defaultLabelProp.getId()),
                                factory.variable(this.getDefaultLabelVarName()+"_defaultLang")
                            )]
                        ),
                        SparqlFactory.buildFilterLangEquals(
                            factory.variable(this.getDefaultLabelVarName()+"_defaultLang"),
                            factory.literal(getSettings().defaultLanguage)
                        )
                        ]
                    ));

                    // BIND(COALESCE(?Person_1_label,?Person_1_defaultLabel) AS ?Person_1_label)
                    this.defaultLblPatterns.push(SparqlFactory.buildBindCoalescePattern(
                        factory.variable(this.getDefaultLabelVarName()+"_lang"),
                        factory.variable(this.getDefaultLabelVarName()+"_defaultLang"),
                        factory.variable(this.getDefaultLabelVarName())
                    ));
                }
            } else {
                // default label property is not multilingual
                // simply fetch it

                // ?Person_1 foaf:name ?Person_1_label
                this.defaultLblPatterns.push(
                    SparqlFactory.buildBgpPattern([
                        SparqlFactory.buildTriple(
                            factory.variable(this.#variableName),
                            factory.namedNode(defaultLabelProp.getId()),
                            factory.variable(this.getDefaultLabelVarName())
                        )
                    ])
                    );
            }
        }
    }

    #createResultPtrns() {
        // push the type triple first
        if(this.#typeTriple) {
            this.#resultPtrns.push(SparqlFactory.buildBgpPattern([this.#typeTriple]));
        }

        if(this.defaultLblPatterns.length > 0){
            if (
                this.getDefaultLabelProperty().isEnablingOptional()
                // don't put in optional if we are already doing an "OPTIONAL {...} OPTIONAL{...} BIND(COALESCE(...))" pattern
                &&
                !(
                    getSettings().defaultLanguage != getSettings().language
                )
            ) {
                // in that case, we push an OPTIONAL { ... } pattern
                this.#resultPtrns.push(SparqlFactory.buildOptionalPattern(this.defaultLblPatterns))
            } else {
                // simply push the default label patterns
                this.#resultPtrns.push(...this.defaultLblPatterns)
            }
        }
    }

    /**
     * @returns ttrue in the case the current type has a default label property
     */
    hasDefaultLabel():boolean {
        let defaultLabelProperty = this.#specProvider.getEntity(this.#variableType)?.getDefaultLabelProperty();
        return (defaultLabelProperty)?true:false;
    }

    /**
     * @returns The default label property from the configuration
     */
    getDefaultLabelProperty():ISpecificationProperty {
        let defaultLabelProperty = this.#specProvider.getEntity(this.#variableType)?.getDefaultLabelProperty();
        return this.#specProvider.getProperty(defaultLabelProperty);
    }

    /**
     * @returns the default label variable name as a string
     */
    getDefaultLabelVarName():string {
        return this.#variableName+"_label"
    }

    getResultPtrns():Pattern[]{
        return this.#resultPtrns
    }

    getExecutedAfterPtrns(){
        return this.#executedAfterPtrns;
    }
}
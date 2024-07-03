import { BaseRDFReader, RDF, RDFS } from "../BaseRDFReader";
import { DataFactory, NamedNode } from 'rdf-data-factory';
import { DASH, SH, SHACLSpecificationProvider, SKOS, VOLIPI, XSD } from "./SHACLSpecificationProvider";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SHACLSpecificationProperty } from "./SHACLSpecificationProperty";
import ISHACLSpecificationEntity from "./ISHACLSpecificationEntity";
import { GEOSPARQL } from "../../components/widgets/MapWidget";
import { RdfStore } from "rdf-stores";
import { Quad_Subject, Term } from "@rdfjs/types";
import { StoreModel } from "../StoreModel";

const factory = new DataFactory();

export class SHACLSpecificationEntity extends SHACLSpecificationEntry implements ISHACLSpecificationEntity {

    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: RdfStore, lang: string) {
        super(uri, provider, n3store, lang);
    }

    getLabel(): string {
        // first try to read an rdfs:label
        let label = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), RDFS.LABEL, this.lang)?.value;
        
        if(!label) {
            // attempt to read it on the targetClass, if we have it
            if(this.graph.hasTriple(factory.namedNode(this.uri), SH.TARGET_CLASS, null)) {
                let targetClass = this.graph.readSingleProperty(factory.namedNode(this.uri), SH.TARGET_CLASS);
                label = this.graph.readSinglePropertyInLang(targetClass as Term, RDFS.LABEL, this.lang)?.value;
            }
        }

        if(!label) {
            // attempt to read the local part of the targetClass URI
            if(this.graph.hasTriple(factory.namedNode(this.uri), SH.TARGET_CLASS, null)) {
                let targetClass = this.graph.readSingleProperty(factory.namedNode(this.uri), SH.TARGET_CLASS);
                label = StoreModel.getLocalName(targetClass.value) as string;
            }
        }

        if(!label) {
            // default : read the local part of the URI
            label = StoreModel.getLocalName(this.uri) as string;
        }

        return label;
    }

    getTooltip(): string | undefined {
        let tooltip = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), VOLIPI.MESSAGE, this.lang)?.value;
        
        if(!tooltip) {
            // try with sh:description
            tooltip = this.graph.readSinglePropertyInLang(factory.namedNode(this.uri), SH.DESCRIPTION, this.lang)?.value;
        }

        if(this.graph.hasTriple(factory.namedNode(this.uri), SH.TARGET_CLASS, null)) {
            if(!tooltip) {
                // try to read an rdfs:comment on the class itself
                // note that we try to read the value even in case the target is a blank node, e.g. SPARQL target
                tooltip = this.graph.readSinglePropertyInLang(
                    this.graph.readSingleProperty(factory.namedNode(this.uri), SH.TARGET_CLASS) as Term,  
                    SKOS.DEFINITION, 
                    this.lang)?.value;
            }

            if(!tooltip) {
                // try to read an rdfs:comment on the class itself
                // note that we try to read the value even in case the target is a blank node, e.g. SPARQL target
                tooltip = this.graph.readSinglePropertyInLang(
                    this.graph.readSingleProperty(factory.namedNode(this.uri), SH.TARGET_CLASS) as Term,  
                    RDFS.COMMENT, 
                    this.lang)?.value;
            }
        }

        return tooltip;
    }


    getConnectingProperties(range: string): string[] {
        var items: string[] = [];

        // read all sh:property
        //let propShapes = this._readAsResource(factory.namedNode(this.uri), SH.PROPERTY);
        let propShapes = this.getProperties();
        
        propShapes
        .forEach(ps => {
            let prop = new SHACLSpecificationProperty(ps, this.provider, this.store, this.lang);
            if(!prop.isDeactivated()) {
                let pRange = prop.getRange();
                if(pRange.indexOf(range) > -1) {
                    items.push(ps);
                }
            }
        });

        // dedup, although probably dedup is not necessary here
        var dedupItems = [...new Set(items)];
        // sort dedups
        var sortedDedups = SHACLSpecificationEntry.sort(dedupItems.map(s => new SHACLSpecificationProperty(s, this.provider, this.store, this.lang)));
        // return dedup array of strings
        return sortedDedups.map(e => e.getId());
    }

    getConnectedEntities(): string[] {
        var items: string[] = [];

        // read all sh:property
        // let propShapes = this._readAsResource(factory.namedNode(this.uri), SH.PROPERTY);
        let propShapes = this.getProperties();

        propShapes
        .forEach(ps => {            
            // read the property
            let prop = new SHACLSpecificationProperty(ps, this.provider, this.store, this.lang);
            if(!prop.isDeactivated()) {
                // and then read their ranges
                items.push(...prop.getRange());
            }
        });

        // dedup
        var dedupItems = [...new Set(items)];
        // sort dedups
        var sortedDedups = SHACLSpecificationEntry.sort(dedupItems.map(s => new SHACLSpecificationEntity(s, this.provider, this.store, this.lang)));
        // return dedup array of strings
        return sortedDedups.map(e => e.getId());        
    }

    hasConnectedEntities(): boolean {
        return (this.getConnectedEntities().length > 0)
    }
    
    /**
     * @returns all properties available on this node shape, including inherited properties from superclasses
     */
    getProperties(): string[] {
        var items: string[] = [];

        // read all sh:property
        let propShapes = 
            this.graph.readProperty(factory.namedNode(this.uri), SH.PROPERTY)
            .map(node => node.value);
                
        // add all properties from node shapes of superclasses
        let superClasses:Term[] = this.getSuperClasses();
        superClasses.forEach(sc => {
            let ns = this.provider.getNodeShapeTargetingClass(sc as Quad_Subject);
            if(ns) {
                let superClassEntity = new SHACLSpecificationEntity(ns.value,this.provider, this.store, this.lang);
                propShapes.push(...superClassEntity.getProperties());
            } else {
                console.warn("Warning, cannot find a node shape targeting class "+sc.value);
            }
        });

        propShapes
        .forEach(ps => {
            let prop = new SHACLSpecificationProperty(ps, this.provider, this.store, this.lang);
            if(!prop.isDeactivated()) {
                items.push(ps);
            }
        });

        // dedup, although probably dedup is not necessary here
        var dedupItems = [...new Set(items)];
        // sort dedups
        var sortedDedups = SHACLSpecificationEntry.sort(dedupItems.map(s => new SHACLSpecificationProperty(s, this.provider, this.store, this.lang)));
        // return dedup array of strings
        return sortedDedups.map(e => e.getId());
    }

    /**
     * 
     * @returns true if sh:nodeKind = sh:Literal, or if sh:datatype is present, or if sh:languageIn is present
     */
    isLiteralEntity(): boolean {
        var hasNodeKindLiteral = this.graph.hasTriple(factory.namedNode(this.uri), SH.NODE_KIND, SH.LITERAL);
        var hasDatatype = this.graph.hasTriple(factory.namedNode(this.uri), SH.DATATYPE, null);
        var hasLanguageIn = this.graph.hasTriple(factory.namedNode(this.uri), SH.LANGUAGE_IN, null);
        var hasUniqueLang = this.graph.hasTriple(factory.namedNode(this.uri), SH.UNIQUE_LANG, null);

        return hasNodeKindLiteral || hasDatatype || hasLanguageIn || hasUniqueLang;
    }

    isRemoteEntity(): boolean {
        return false;
    }

    /**
     * @returns a property labelled with dash:propertyRole = dash:LabelRole
     */
    getDefaultLabelProperty(): string | undefined {
        var items: any[] = [];

        // read all properties
        let propShapes = this.graph.readProperty(factory.namedNode(this.uri), SH.PROPERTY);

        propShapes.forEach(ps => {
            if (this.store.getQuads(
                ps,
                DASH.PROPERTY_ROLE,
                DASH.LABEL_ROLE,
                null
            ).length > 0) {
                items.push(ps);
            }
        });

        return items.length>0?items[0].value:undefined;
    }

    getParents(): string[] {
        
        return this.getSuperClasses()
            // note : we exclude blank nodes
            .filter(term => term.termType == "NamedNode")
            // we find the shape targeting this class - it can be the class itself
            .map(term => {
                if(this.graph.hasTriple(term as Quad_Subject, RDF.TYPE, RDFS.CLASS)) {
                    return term;
                } else {
                    return this.graph.findSingleSubjectOf(SH.TARGET_CLASS, term);
                }                
            })
            // remove those for which the shape was not found
            .filter(term => (term != undefined))
            // and simply return the string value
            .map(term => term.value);
    }

    /**
     * @returns the immediate superclasses of this NodeShape+Class, or of the classes being targeted by this NodeShape
     */
    getSuperClasses(): Term[] {
        // retrieve target classes
        let targetClasses:Term[] = this.#getTargetClasses();
        // then retrieve super classes of those classes
        let superClasses:Term[] = [];
        targetClasses.forEach(tc => {
            let currentSuperClasses = this.graph.readProperty(tc, RDFS.SUBCLASS_OF);
            superClasses.push(...currentSuperClasses);
        });
        return superClasses;
    }

    /**
     * @returns all super classes, recursively, of the provided classes. This is currently not used.
     */
    #getSuperClassesRec(n3store:RdfStore, classNode:Term): Term[] {
        var items: Term[] = [];
        let superClasses = this.graph.readProperty(classNode, RDFS.SUBCLASS_OF);
        items.push(...superClasses);
        superClasses.forEach(sc => {
            items.push(...this.#getSuperClassesRec(n3store, sc));
        });
        return items;
    }

    isRangeOf(n3store:RdfStore, shapeUri:any) {
       return (SHACLSpecificationProperty.readShClassAndShNodeOn(n3store, shapeUri).indexOf(this.uri) > -1);
    }

    /**
     * @returns all targeted classes, either implicitly or explicitly through sh:targetClass
     */
    #getTargetClasses():Term[] {
        if(this.#isNodeShapeAndClass()) {
            return [factory.namedNode(this.uri)];
        } else {
            return this.getShTargetClass();
        }
    }

    /**
     * @returns true if this entity is both a NodeShape and a Class
     */
    #isNodeShapeAndClass():boolean {
        return (
            this.graph.hasTriple(factory.namedNode(this.uri), RDF.TYPE, RDFS.CLASS)
            &&
            this.graph.hasTriple(factory.namedNode(this.uri), RDF.TYPE, SH.NODE_SHAPE)
        );
    }

    /**
     * @returns all values of sh:targetClass on this entity, as RDF Terms
     */
    getShTargetClass():Term[] {
        return this.graph.readProperty(factory.namedNode(this.uri), SH.TARGET_CLASS);
    }

    /**
     * @returns all values of sh:targetClass on this entity, as RDF Terms
     */
    getParentClass():string {
        return this.graph.readSingleProperty(factory.namedNode(this.uri), SH.PARENT)?.value;
    }

}


export class SpecialSHACLSpecificationEntity implements ISHACLSpecificationEntity {

    private id:string;
    private icon:string;
    private label:string;
    private isRangeOfFunction:Function;

    constructor(id:string, icon:string,label:string, isRangeOfFunction:Function) {
        this.id = id;
        this.icon = icon;
        this.label = label;
        this.isRangeOfFunction = isRangeOfFunction;
    }

    getConnectedEntities(): string[] {
        return new Array<string>();
    }

    hasConnectedEntities(): boolean {
        return false;
    }

    getConnectingProperties(range: string): string[] {
        return new Array<string>();
    }

    isLiteralEntity(): boolean {
        return true;
    }

    isRemoteEntity(): boolean {
        return false;
    }

    getDefaultLabelProperty(): string | undefined {
        return undefined;
    }

    getId(): string {
        return this.id;
    }

    getLabel(): string {
        return this.label;
    }

    getOrder(): string|undefined {
        return undefined;
    }

    getTooltip(): string | undefined {
        return undefined;
    }

    getColor(): string | undefined {
        // return "slategray";
        return undefined;
    }

    getDatasource(): any {
        return null;
    }

    getTreeChildrenDatasource(): any {
        return null;
    }

    getTreeRootsDatasource(): any {
        return null;
    }

    getIcon(): string {
        return SHACLSpecificationEntry.buildIconHtml(this.icon);
    }

    getHighlightedIcon(): string {
        return "";
    }

    isRangeOf(n3store:RdfStore, shapeUri:any):boolean {
        return this.isRangeOfFunction(n3store, shapeUri);
    }

    getParents(): string[] {
        return [];
    }
}

export class SpecialSHACLSpecificationEntityRegistry {

    private registry:Map<string,SpecialSHACLSpecificationEntity> = new Map<string,SpecialSHACLSpecificationEntity>();

    public static SPECIAL_SHACL_ENTITY_DATES = "http://special/Z_Date";

    public static SPECIAL_SHACL_ENTITY_LOCATION = "http://special/Z_Location";

    public static SPECIAL_SHACL_ENTITY_TEXT = "http://special/Z_Text";

    public static SPECIAL_SHACL_ENTITY_NUMBER = "http://special/Z_Number";

    public static SPECIAL_SHACL_ENTITY_OTHER = "http://special/ZZ_Other";


    static instance = new SpecialSHACLSpecificationEntityRegistry();

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() { 
        this.registry.set(
            SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER,
            new SpecialSHACLSpecificationEntity(
                SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_OTHER,
                "fa-solid fa-ellipsis",
                "Other",
                function(n3store:RdfStore, shapeUri:any):boolean {
                    // this is in range if nothing else is in range
                    let graph:StoreModel = new StoreModel(n3store);
                    return (
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.NODE, null) 
                        &&
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.CLASS, null) 
                        &&
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.DATE) 
                        &&
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.DATE_TIME) 
                        &&
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.GYEAR)
                        &&
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, GEOSPARQL.WKT_LITERAL)
                        &&
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.STRING) 
                        &&
                        !graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, RDF.LANG_STRING) 
                    );
                }
            )
        )

        this.registry.set(
            SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_DATES,
            new SpecialSHACLSpecificationEntity(
                SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_DATES,
                "fa-solid fa-calendar",
                "Date",
                function(n3store:RdfStore, shapeUri:any):boolean {
                    let graph:StoreModel = new StoreModel(n3store);
                    return (
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.DATE) 
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.DATE_TIME) 
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.GYEAR)
                    );
                }
            )
        )

        this.registry.set(
            SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_LOCATION,
            new SpecialSHACLSpecificationEntity(
                SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_LOCATION,
                "fa-solid fa-map-location-dot",
                "Location",
                function(n3store:RdfStore, shapeUri:any):boolean {
                    let graph:StoreModel = new StoreModel(n3store);
                    return graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, GEOSPARQL.WKT_LITERAL)
                }
            )
        )

        this.registry.set(
            SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_TEXT,
            new SpecialSHACLSpecificationEntity(
                SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_TEXT,
                "fa-solid fa-font",
                "Text",
                function(n3store:RdfStore, shapeUri:any):boolean {
                    let graph:StoreModel = new StoreModel(n3store);
                    return (
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.STRING) 
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, RDF.LANG_STRING) 
                        ||
                        // no datatype but we know it is a Literal
                        (
                            graph.hasTriple(factory.namedNode(shapeUri), SH.NODE_KIND, SH.LITERAL)
                            &&
                            (
                                !graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, null)
                                ||
                                (
                                    !graph.readSingleProperty(factory.namedNode(shapeUri), SH.DATATYPE)?.value.startsWith("http://www.w3.org/2001/XMLSchema#")
                                    &&
                                    !graph.readSingleProperty(factory.namedNode(shapeUri), SH.DATATYPE)?.value.startsWith("http://www.opengis.net/ont/geosparql#")
                                )
                            )
                        )
                    );
                }
            )
        )

        this.registry.set(
            SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_NUMBER,
            new SpecialSHACLSpecificationEntity(
                SpecialSHACLSpecificationEntityRegistry.SPECIAL_SHACL_ENTITY_NUMBER,
                "fa-solid fa-1",
                "Number",
                function(n3store:RdfStore, shapeUri:any):boolean {
                    let graph:StoreModel = new StoreModel(n3store);
                    return (
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.BYTE)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.DECIMAL)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.DOUBLE) 
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.FLOAT) 
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.INT)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.INTEGER)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.LONG)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.NONNEGATIVE_INTEGER)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.SHORT)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.UNSIGNED_BYTE)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.UNSIGNED_INT)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.UNSIGNED_LONG)
                        ||
                        graph.hasTriple(factory.namedNode(shapeUri), SH.DATATYPE, XSD.UNSIGNED_SHORT)  
                    );
                }
            )
        )
    }

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): SpecialSHACLSpecificationEntityRegistry {
        if (!SpecialSHACLSpecificationEntityRegistry.instance) {
            SpecialSHACLSpecificationEntityRegistry.instance = new SpecialSHACLSpecificationEntityRegistry();
        }

        return SpecialSHACLSpecificationEntityRegistry.instance;
    }

    public getRegistry(): Map<string,SpecialSHACLSpecificationEntity> {
        return this.registry;
    }

}


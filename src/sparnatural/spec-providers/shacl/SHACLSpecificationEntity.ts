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
import { DagIfc, Dag } from "../../dag/Dag";
import ISpecificationEntity from "../ISpecificationEntity";
import ISpecificationProperty from "../ISpecificationProperty";
import ISparnaturalSpecification from "../ISparnaturalSpecification";

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
        // read all sh:property and find the ones that can target the selected class
        var items: string[] = [];
        let propShapes = this.getProperties();
        propShapes.forEach(ps => {
            let prop = new SHACLSpecificationProperty(ps, this.provider, this.store, this.lang);
            let pRange = prop.getRange();
            if(pRange.indexOf(range) > -1) {
                items.push(ps);
            }
        });

        // add properties available from parents - recursively
        let parents = this.provider.getEntity(range).getParents();
        parents.forEach(aParent => {
            items = [...items, ...this.getConnectingProperties(aParent)];
        })

        // dedup, although probably dedup is not necessary here
        var dedupItems = [...new Set(items)];
        // sort dedups
        var sortedDedups = SHACLSpecificationEntry.sort(dedupItems.map(s => new SHACLSpecificationProperty(s, this.provider, this.store, this.lang)));
        // return dedup array of strings
        return sortedDedups.map(e => e.getId());
    }

    /**
     * Return the tree of properties connecting this entity to the specified range entity
     * @param range The URI of the selected target entity
     * @returns 
     */
    getConnectingPropertiesTree(range: string): DagIfc<ISpecificationProperty> {
        // 1. get list of properties
        let properties:ISpecificationProperty[] = this.getConnectingProperties(range).map(s => this.provider.getProperty(s)) as ISpecificationProperty[];
        // retrieve the potential parents
        while(!properties.every(property => {
            return property.getParents().every(parent => {
                return (properties.find(anotherProperty => anotherProperty.getId() === parent) != undefined);
            });      
        })) {
            let parentsToAdd:ISpecificationProperty[] = [];
            properties.forEach(property => {
                property.getParents().forEach(parent => {
                    // if the parent is not already there, add it to the list of parents to add
                    if(!properties.find(anotherProperty => anotherProperty.getId() === parent)) {
                        
                        parentsToAdd.push(this.provider.getProperty(parent) as ISpecificationProperty);
                    }
                })
            });
            parentsToAdd.forEach(p => properties.push(p));
        }

        // 2. turn it into a tree
        let dag:Dag<ISpecificationProperty> = new Dag<ISpecificationProperty>();
        dag.initFromParentableAndIdAbleEntity(properties, []);

        // sort the tree with compare function
        dag.sort(SHACLSpecificationProperty.compare);

        return dag;
    }
    

    getConnectedEntities(): string[] {
        var items: string[] = [];

        // read all properties that make sense for Sparnatural
        let propShapes = this.getProperties();

        propShapes
        .forEach(ps => {            
            // read the property
            let prop = new SHACLSpecificationProperty(ps, this.provider, this.store, this.lang);
            // and then read their ranges
            items.push(...prop.getRange());
        });

        // dedup
        var dedupItems = [...new Set(items)];
        // sort dedups
        var sortedDedups = SHACLSpecificationEntry.sort(dedupItems.map(s => new SHACLSpecificationEntity(s, this.provider, this.store, this.lang)));
        // return dedup array of strings
        return sortedDedups.map(e => e.getId());        
    }

    getConnectedEntitiesTree(): DagIfc<ISpecificationEntity> {
        // 1. get directly connected entities
        let entities:SHACLSpecificationEntity[] = this.getConnectedEntities().map(s => this.provider.getEntity(s)) as SHACLSpecificationEntity[];
        
        // 2. add the children of these entities - recursively
        while(!entities.every(entity => {
            return entity.getChildren().every(child => {
                return (entities.find(anotherEntity => anotherEntity.getId() === child) != undefined);
            });
        })) {
            let childrenToAdd:SHACLSpecificationEntity[] = [];
            entities.forEach(entity => {
                entity.getChildren().forEach(child => {
                    if(!entities.find(anotherEntity => anotherEntity.getId() === child)) {
                        childrenToAdd.push(this.provider.getEntity(child) as SHACLSpecificationEntity);
                    }
                })
            });
            childrenToAdd.forEach(p => entities.push(p));
        }


        // 3. complement the initial list with their parents
        let disabledList:string[] = new Array<string>();
        // while not all parents of all entities are not part of the list...
        while(!entities.every(entity => {
            return entity.getParents().every(parent => {
                return (entities.find(anotherEntity => anotherEntity.getId() === parent) != undefined);
            });      
        })) {
            let parentsToAdd:SHACLSpecificationEntity[] = [];
            entities.forEach(entity => {
                entity.getParents().forEach(parent => {
                    if(!entities.find(anotherEntity => anotherEntity.getId() === parent)) {
                        parentsToAdd.push(this.provider.getEntity(parent) as SHACLSpecificationEntity);
                    }
                })
            });
            parentsToAdd.forEach(p => entities.push(p));
            // also keep that as a disabled node
            parentsToAdd.forEach(p => disabledList.push(p.getId()));
        }

        let dag:Dag<ISpecificationEntity> = new Dag<ISpecificationEntity>();
        dag.initFromParentableAndIdAbleEntity(entities, disabledList);

        // sort the tree with compare function
        dag.sort(SHACLSpecificationEntity.compare);

        return dag;
    }

    hasConnectedEntities(): boolean {
        return (this.getConnectedEntities().length > 0)
    }
    
    /**
     * @returns all (non-deactivated) properties available on this node shape, including inherited properties from superclasses
     */
    getProperties(): string[] {
        var items: string[] = [];

        // read all sh:property
        let propShapes = 
            this.graph.readProperty(factory.namedNode(this.uri), SH.PROPERTY)
            .map(node => node.value);
                
        // add all properties from parents (either through sh:node or sh:targetClass/rdfs:subClassOf/^sh:targetClass)
        let parents:string[] = this.getParents();
        parents.forEach(p => {
            let parentEntity = new SHACLSpecificationEntity(p,this.provider, this.store, this.lang);
            propShapes.push(...parentEntity.getProperties());
        });

        // filter properties not to be shown
        propShapes
        .forEach(ps => {
            if(SHACLSpecificationProperty.isSparnaturalSHACLSpecificationProperty(ps, this.store)) {
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

    /**
     * @returns true if this shape has a target, either a targetClass or sh:target, or is itself a Class
     */
    hasTypeCriteria(): boolean {
        var hasTargetClass = this.graph.hasTriple(factory.namedNode(this.uri), SH.TARGET_CLASS, null);
        var hasTarget = this.graph.hasTriple(factory.namedNode(this.uri), SH.TARGET, null);
        var isItselfClass = this.graph.hasTriple(factory.namedNode(this.uri), RDF.TYPE, RDFS.CLASS);
        return (hasTargetClass || hasTarget || isItselfClass);
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

        // nothing found, see if we can inherit it
        if(items.length == 0) {
            let parents = this.getParents();
            let parentDefaultLabelProp:string|undefined;
            parents.forEach(p => {
                // if not found already, set it to the parent default label prop - otherwise keep the value we found
                if(!parentDefaultLabelProp) {
                    let parentEntity = new SHACLSpecificationEntity(p,this.provider, this.store, this.lang);   
                    parentDefaultLabelProp = parentEntity.getDefaultLabelProperty();
                }
            });
            // could be undefined or a string
            return parentDefaultLabelProp;
        } else {
            // return the first one found
            return items[0].value
        }
        
    }

    getParents(): string[] {
        
        let parentsFromSuperClasses = this.#findShapesTargetingClassIn(this.getImmediateSuperClassesOfTargetClass());

        if(parentsFromSuperClasses.length == 0) {
            parentsFromSuperClasses = this.#findShapesTargetingClassIn(this.getSuperClassesOfTargetClass(2));
        }
        if(parentsFromSuperClasses.length == 0) {
            parentsFromSuperClasses = this.#findShapesTargetingClassIn(this.getSuperClassesOfTargetClass(3));
        }
        if(parentsFromSuperClasses.length == 0) {
            parentsFromSuperClasses = this.#findShapesTargetingClassIn(this.getSuperClassesOfTargetClass(4));
        }
        if(parentsFromSuperClasses.length == 0) {
            parentsFromSuperClasses = this.#findShapesTargetingClassIn(this.getSuperClassesOfTargetClass(5));
        }

        // get the parents from sh:node
        let parentsFromShNode = this.#getShNode();
        
        // concat parents from superclasses and from node - deduplicated
        let parents = [...new Set([...parentsFromSuperClasses, ...parentsFromShNode])];
        return parents
            // and simply return the string value
            .map(term => term.value);
    }

    #findShapesTargetingClassIn(classes: Term[]) {
        // note : we exclude blank nodes
        return classes.filter(term => term.termType == "NamedNode")
        // we find the shape targeting this class - it can be the class itself
        .map(term => {
            if(this.graph.hasTriple(term as Quad_Subject, RDF.TYPE, RDFS.CLASS)) {
                return term;
            } else {
                return this.graph.findSingleSubjectOf(SH.TARGET_CLASS, term);
            }                
        })
        // remove those for which the shape was not found
        .filter(term => (term != undefined));
    }

    getChildren(): string[] {
        let cildrenFromSuperClasses = this.getSubClassesOfTargetClass()
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
            .filter(term => (term != undefined));

        // get the children from sh:node
        let childrenFromShNode = this.#getInverseOfShNodeForExplicitNodeShapes();
        
        // concat parents from superclasses and from node - deduplicated
        let children = [...new Set([...cildrenFromSuperClasses, ...childrenFromShNode])];
        return children
            // and simply return the string value
            .map(term => term.value);
    }

    /**
     * @returns the recursive superclasses of the target class of this Shape (can be the shape itself)
     */
    getAllSuperClassesOfTargetClass(): Term[] {
        // retrieve target classes
        let targetClasses:Term[] = this.#getTargetClasses();
        // then retrieve super classes of those classes
        let superClasses:Term[] = [];
        targetClasses.forEach(tc => {
            let allSuperClasses = this.graph.readPropertyRec(tc, RDFS.SUBCLASS_OF);
            superClasses.push(...allSuperClasses);
        });
        return superClasses;
    }

    /**
     * @returns the immediate superclasses of the target class of this Shape (can be the shape itself)
     */
    getImmediateSuperClassesOfTargetClass(): Term[] {
        return this.getSuperClassesOfTargetClass(1);
    }

    getSuperClassesOfTargetClass(level: number): Term[] {
        // retrieve target classes
        let targetClasses:Term[] = this.#getTargetClasses();
        // then retrieve super classes of those classes
        let superClasses:Term[] = [];
        targetClasses.forEach(tc => {
            let currentSuperClasses = this.#getSuperClassesAtLevel(tc, level);
            superClasses.push(...currentSuperClasses);
        });
        return superClasses;
    }

    /**
     * @returns the immediate subclasses of the target class of this Shape (can be the shape itself)
     */
    getSubClassesOfTargetClass(): Term[] {
        // retrieve target classes
        let targetClasses:Term[] = this.#getTargetClasses();
        // then retrieve sub classes of those classes
        let subClasses:Term[] = [];
        targetClasses.forEach(tc => {
            let currentSubClasses = this.graph.findSubjectsOf(RDFS.SUBCLASS_OF, tc)
            subClasses.push(...currentSubClasses);
        });
        return subClasses;
    }

    /**
     * @returns all super classes, recursively, of the provided classes. This is currently not used.
     */
    #getSuperClassesRec(classNode:Term): Term[] {
        var items: Term[] = [];
        let superClasses = this.graph.readProperty(classNode, RDFS.SUBCLASS_OF);
        items.push(...superClasses);
        superClasses.forEach(sc => {
            items.push(...this.#getSuperClassesRec(sc));
        });
        return items;
    }

    /**
     * @returns the superClasses of the provided class, at a certain level
     */
    #getSuperClassesAtLevel(classNode:Term, level:number): Term[] {
        if(level < 1) {
            return null;
        }
        var items: Term[] = [];
        let superClasses = this.graph.readProperty(classNode, RDFS.SUBCLASS_OF);
        items.push(...superClasses);
        if(level == 1) {
            return items;
        } else {
            var result: Term[] = [];
            items.forEach(i => result.push(...this.#getSuperClassesAtLevel(i, (level-1))));
            return result;
        }
    }

    /**
     * @returns the NodeShape IRI that are referenced from this one with sh:node - this is like subClassOf
     */
    #getShNode(): Term[] {
        return this.graph.readProperty(factory.namedNode(this.uri), SH.NODE);
    }

    /**
     * @returns the NodeShapes IRI that reference this one with sh:node
     */
    #getInverseOfShNodeForExplicitNodeShapes(): Term[] {
        let subjects:Quad_Subject[] = this.graph.findSubjectsOf(SH.NODE, factory.namedNode(this.uri));
        // keep only the sh:node references from NodeShapes, not property shapes or sh:or on property shapes
        // there could be more precise ways of doing this
        return subjects.filter(term => 
            term.termType == "NamedNode"
            &&
            this.graph.hasTriple(term, RDF.TYPE, SH.NODE_SHAPE)
        )

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
     * @returns true if this shape as an sh:target predicate (indicating it is associated to a SPARQL query target)
     */
    hasShTarget():boolean {
        return this.graph.hasTriple(factory.namedNode(this.uri), SH.TARGET, null);
    }

    couldBeSkosConcept():boolean {
        return SHACLSpecificationEntity.couldBeSkosConcept(this.uri, this.provider);
    }

    static couldBeSkosConcept(nodeShapeUri:string, config:ISparnaturalSpecification):boolean {
        let specEntity:SHACLSpecificationEntity = config.getEntity(nodeShapeUri) as SHACLSpecificationEntity;
        if(specEntity) {
            let isItselfSkosConcept:boolean = (nodeShapeUri == SKOS.CONCEPT.value);
            let targetsSkosConcept:boolean = (specEntity.getShTargetClass().findIndex(t => t.value == SKOS.CONCEPT.value) > -1);

            // read all sh:property, including sh:deactivated, ones with sh:hasValue, etc.
            let propShapes = specEntity.graph.readProperty(factory.namedNode(nodeShapeUri), SH.PROPERTY).map(node => node.value);

            let hasPropertyRdfTypeSkosConcept:boolean = propShapes.findIndex(p => {
                let propertyShape:SHACLSpecificationProperty = config.getProperty(p) as SHACLSpecificationProperty;
                let path = propertyShape.getShPath();
                if(
                    path
                    &&
                    (path.value === RDF.TYPE.value)
                    &&
                    specEntity.graph.hasTriple(factory.namedNode(p), SH.HAS_VALUE, SKOS.CONCEPT)
                ) {
                    return true;
                }

                return false;
            }) > -1;

            let hasConstraintOnSkosInScheme = propShapes.findIndex(p => {
                let propertyShape:SHACLSpecificationProperty = config.getProperty(p) as SHACLSpecificationProperty;
                let path = propertyShape.getShPath();
                if(
                    path
                    &&
                    (path.value === SKOS.IN_SCHEME.value)
                    &&
                    specEntity.graph.hasTriple(factory.namedNode(p), SH.HAS_VALUE, null)
                ) {
                    return true;
                }

                return false;
            }) > -1;

            return isItselfSkosConcept || targetsSkosConcept || hasPropertyRdfTypeSkosConcept || hasConstraintOnSkosInScheme;
        }
    }


    static compare(item1: SHACLSpecificationEntity, item2: SHACLSpecificationEntity) {
        return SHACLSpecificationEntry.compare(item1, item2);
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

    getId(): string {
        return this.id;
    }

    getLabel(): string {
        return this.label;
    }

    getColor(): string | undefined {
        // return "slategray";
        return undefined;
    }

    getIcon(): string {
        return this.icon;
    }

    isRangeOf(n3store:RdfStore, shapeUri:any):boolean {
        return this.isRangeOfFunction(n3store, shapeUri);
    }

    // default implementation of all other functions

    getConnectedEntities(): string[] { return new Array<string>(); }
    getConnectedEntitiesTree(): DagIfc<ISpecificationEntity> { return new Dag<ISpecificationEntity>(); }
    hasConnectedEntities(): boolean { return false; }
    getConnectingProperties(range: string): string[] { return new Array<string>(); }
    getConnectingPropertiesTree(range: string): DagIfc<ISpecificationProperty> { return new Dag<ISpecificationProperty>(); }
    isLiteralEntity(): boolean { return true; }
    hasTypeCriteria(): boolean { return false; }
    getDefaultLabelProperty(): string | undefined { return undefined; }
    getOrder(): string|undefined { return undefined; }
    getTooltip(): string | undefined { return undefined; }
    getDatasource(): any { return null; }
    getTreeChildrenDatasource(): any { return null; }
    getTreeRootsDatasource(): any { return null; }
    getHighlightedIcon(): string { return ""; }
    getParents(): string[] { return []; }
    getChildren(): string[] { return []; }
    couldBeSkosConcept(): boolean {  return false; }
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


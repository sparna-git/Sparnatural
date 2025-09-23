import { DataFactory, NamedNode } from 'rdf-data-factory';
import { SHACLSpecificationProvider } from "./SHACLSpecificationProvider";
import { SHACLSpecificationEntry } from "./SHACLSpecificationEntry";
import { SHACLSpecificationProperty } from "./SHACLSpecificationProperty";
import ISHACLSpecificationEntity from "./ISHACLSpecificationEntity";
import { RdfStore } from "rdf-stores";
import { DagIfc, Dag } from "../../dag/Dag";
import { ISpecificationEntity } from "../ISpecificationEntity";
import ISpecificationProperty from "../ISpecificationProperty";
import { Term } from '@rdfjs/types';
import { GEOSPARQL, Model, NodeShape, PropertyShape, RDF, RDFS, SH, XSD, DatatypeRegistry } from 'rdf-shacl-commons';

const factory = new DataFactory();

export class SHACLSpecificationEntity extends SHACLSpecificationEntry implements ISHACLSpecificationEntity {

    constructor(uri:string, provider: SHACLSpecificationProvider, n3store: RdfStore, lang: string) {
        super(uri, provider, n3store, lang);
    }


    getLabel(): string {
        return this.shape.getLabel(this.lang);
    }

    getTooltip(): string | undefined {
        return (this.shape as NodeShape).getTooltip(this.lang);
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

        let propertyShapes:PropertyShape[] = (this.shape as NodeShape).getProperties();

        // filter properties not to be shown
        propertyShapes
        .forEach(ps => {
            if(SHACLSpecificationProperty.isSparnaturalSHACLSpecificationProperty(ps.resource.value, this.store)) {
                items.push(ps.resource.value);
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
        return this.shape.isLiteral();
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
        return (this.shape as NodeShape).getDefaultLabelProperty()?.resource.value;
    }

    getParents(): string[] {
        return (this.shape as NodeShape).getParents().map(r => r.value);
    }

    getChildren(): string[] {
        return (this.shape as NodeShape).getChildren().map(r => r.value);
    }

    /**
     * @returns all values of sh:targetClass on this entity, as RDF Terms
     */
    getShTargetClass():Term[] {
        return (this.shape as NodeShape).getShTargetClass();
    }

    /**
     * @returns true if this shape as an sh:target predicate (indicating it is associated to a SPARQL query target)
     */
    hasShTarget():boolean {
        return (this.shape as NodeShape).getShTarget()?.length > 0;
    }

    couldBeSkosConcept():boolean {
        return (this.shape as NodeShape).couldBeSkosConcept();
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
                    let graph:Model = new Model(n3store);
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
                    let graph:Model = new Model(n3store);
                    let dt = graph.readSingleProperty(factory.namedNode(shapeUri), SH.DATATYPE) as NamedNode;
                    return dt && DatatypeRegistry.asDatatype(dt).isDateDatatype();
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
                    let graph:Model = new Model(n3store);
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
                    let graph:Model = new Model(n3store);
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
                    let graph:Model = new Model(n3store);
                    let dt = graph.readSingleProperty(factory.namedNode(shapeUri), SH.DATATYPE) as NamedNode;
                    return dt && DatatypeRegistry.asDatatype(dt).isNumberDatatype();
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


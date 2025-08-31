import { DataFactory } from 'rdf-data-factory';
import { Quad_Subject, Term } from "@rdfjs/types";

import { Shape } from './Shape';
import { Resource } from '../Resource';
import { ShaclStoreModel, ShapeFactory } from './ShaclStoreModel';
import { RDFS } from '../vocabularies/RDFS';
import { SH } from '../vocabularies/SH';
import { StoreModel } from '../StoreModel';
import { VOLIPI } from '../vocabularies/VOLIPI';
import { SKOS } from '../vocabularies/SKOS';
import { RDF } from '../vocabularies/RDF';
import { DASH } from '../vocabularies/DASH';
import { FOAF } from '../vocabularies/FOAF';
import { SCHEMA } from '../vocabularies/SCHEMA';
import { DCT } from '../vocabularies/DCT';
import { PropertyShape } from './PropertyShape';

const factory = new DataFactory();

export class NodeShape extends Shape {

    constructor(resource:Resource, graph:ShaclStoreModel) {
        super(resource, graph);
    }

    /**
     * @returns all values of sh:targetClass on this entity, as RDF Terms
     */
    getShTargetClass():Resource[] {
        return this.graph.readProperty(this.resource, SH.TARGET_CLASS) as Resource[];
    }

    /**
     * @returns all targeted classes, either implicitly or explicitly through sh:targetClass
     */
    getTargetClasses():Resource[] {
        if(this.isNodeShapeAndClass()) {
            return [this.resource];
        } else {
            return this.getShTargetClass();
        }
    }

    /**
     * @returns true if this entity is both a NodeShape and a Class
     */
    isNodeShapeAndClass():boolean {
        return (
            this.graph.hasTriple(this.resource, RDF.TYPE, RDFS.CLASS)
            &&
            this.graph.hasTriple(this.resource, RDF.TYPE, SH.NODE_SHAPE)
        );
    }

    /**
     * @returns all values of sh:target on this entity, as RDF Terms
     */
    getShTarget():Resource[] {
        return this.graph.readProperty(this.resource, SH.TARGET) as Resource[];
    }

    getLabel(lang:string): string | undefined {
        // first try to read an rdfs:label
        let label = this.graph.readSinglePropertyInLang(this.resource, RDFS.LABEL, lang)?.value;
        
        if(!label) {
            // attempt to read it on the targetClass, if we have it
            if(this.graph.hasTriple(this.resource, SH.TARGET_CLASS, null)) {
                let targetClass = this.graph.readSingleProperty(this.resource, SH.TARGET_CLASS);
                label = this.graph.readSinglePropertyInLang(targetClass as Term, RDFS.LABEL, lang)?.value;
            }
        }

        if(!label) {
            // attempt to read the local part of the targetClass URI
            if(this.graph.hasTriple(this.resource, SH.TARGET_CLASS, null)) {
                let targetClass = this.graph.readSingleProperty(this.resource, SH.TARGET_CLASS);
                label = StoreModel.getLocalName(targetClass.value) as string;
            }
        }

        if(!label) {
            // default : read the local part of the URI
            label = StoreModel.getLocalName(this.resource.value) as string;
        }

        return label;
    }

    getTooltip(lang:string): string | undefined {
        let tooltip = this.graph.readSinglePropertyInLang(this.resource, VOLIPI.MESSAGE, lang)?.value;
        
        if(!tooltip) {
            // try with sh:description
            tooltip = this.graph.readSinglePropertyInLang(this.resource, SH.DESCRIPTION, lang)?.value;
        }

        if(this.graph.hasTriple(this.resource, SH.TARGET_CLASS, null)) {
            if(!tooltip) {
                // try to read an rdfs:comment on the class itself
                // note that we try to read the value even in case the target is a blank node, e.g. SPARQL target
                tooltip = this.graph.readSinglePropertyInLang(
                    this.graph.readSingleProperty(this.resource, SH.TARGET_CLASS) as Term,  
                    SKOS.DEFINITION, 
                    lang)?.value;
            }

            if(!tooltip) {
                // try to read an rdfs:comment on the class itself
                // note that we try to read the value even in case the target is a blank node, e.g. SPARQL target
                tooltip = this.graph.readSinglePropertyInLang(
                    this.graph.readSingleProperty(this.resource, SH.TARGET_CLASS) as Term,  
                    RDFS.COMMENT, 
                    lang)?.value;
            }
        }

        return tooltip;
    }
    
    /**
     * @returns all (non-decativated) properties available on this node shape, including inherited properties from superclasses
     */
    getProperties(): PropertyShape[] {

        // read all sh:property
        let propShapes:PropertyShape[] = 
            this.graph.readProperty(this.resource, SH.PROPERTY)
            .map(node => ShapeFactory.buildShape(node, this.graph) as PropertyShape);
                
        // add all properties from parents (either through sh:node or sh:targetClass/rdfs:subClassOf/^sh:targetClass)
        let parents:Term[] = this.getParents();
        parents.forEach(p => {
            let parentEntity = new NodeShape(p as Resource,this.graph);
            propShapes.push(...parentEntity.getProperties());
        });


        // dedup, although probably dedup is not necessary here
        var dedupShapes = [...new Set(propShapes)];
        // return dedup array
        return dedupShapes;
    }

    /**
     * @returns a property labelled with dash:propertyRole = dash:LabelRole
     */
    getDefaultLabelProperty(): PropertyShape | undefined {
        var items: Resource[] = [];

        // read all properties
        let propShapes = this.graph.readProperty(this.resource, SH.PROPERTY);

        propShapes.forEach(ps => {
            if (this.graph.hasTriple(
                ps as Resource,
                DASH.PROPERTY_ROLE,
                DASH.LABEL_ROLE
            )) {
                items.push(ps as Resource);
            }
        });

        // nothing found, see if we can inherit it
        if(items.length == 0) {
            let parents = this.getParents();
            parents.forEach(p => {
                // if not found already, set it to the parent default label prop - otherwise keep the value we found
                let parentEntity = new NodeShape(p,this.graph);   
                let parentDefaultLabelProp = parentEntity.getDefaultLabelProperty();
                // could be undefined or a string
                if(parentDefaultLabelProp) {
                    items.push(parentDefaultLabelProp.resource);
                };
            });
        } 
        
        if(items.length == 0) {
            // nothing found, check for SKOS.PREF_LABEL, FOAF.NAME, SCHEMA.NAME, DCTERMS.TITLE, RDFS.LABEL
            const PROPERTIES_TO_CHECK = [ SKOS.PREF_LABEL, FOAF.NAME, SCHEMA.NAME, DCT.TITLE, RDFS.LABEL ];
                
            for(let i=0; i<PROPERTIES_TO_CHECK.length; i++) {
                let prop = PROPERTIES_TO_CHECK[i];
                
                propShapes.forEach(ps => {
                    if (this.graph.hasTriple(
                        ps as Resource,
                        SH.PATH,
                        prop
                    )) {
                        items.push(ps as Resource);
                    }
                });

                if(items.length > 0) {
                    // break as soon as we find something
                    break;
                }
            }
        }
        
        if(items.length > 0) {
            // return the first one found
            return new PropertyShape(items[0], this.graph);
        } else {
            return undefined;
        }
        
    }

    getParents(): Resource[] {
        
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
        let parentsFromShNode = this.getShNode();
        
        // concat parents from superclasses and from node - deduplicated
        let parents = [...new Set([...parentsFromSuperClasses, ...parentsFromShNode])];
        return parents;
    }

    #findShapesTargetingClassIn(classes: Resource[]):Resource[] {
        // note : we exclude blank nodes
        return classes.filter(term => term.termType == "NamedNode")
        // we find the shape targeting this class - it can be the class itself
        .map(term => {
            if(this.graph.hasTriple(term as Resource, RDF.TYPE, RDFS.CLASS)) {
                return term as Resource;
            } else {
                return this.graph.findSingleSubjectOf(SH.TARGET_CLASS, term) as Resource;
            }                
        })
        // remove those for which the shape was not found
        .filter(term => (term != undefined));
    }

    getChildren(): Resource[] {
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
            .map(term => term as Resource);
    }

    /**
     * @returns the recursive superclasses of the target class of this Shape (can be the shape itself)
     */
    getAllSuperClassesOfTargetClass(): Resource[] {
        // retrieve target classes
        let targetClasses:Term[] = this.getTargetClasses();
        // then retrieve super classes of those classes
        let superClasses:Resource[] = [];
        targetClasses.forEach(tc => {
            let allSuperClasses = this.graph.readPropertyRec(tc, RDFS.SUBCLASS_OF);
            superClasses.push(...allSuperClasses as Resource[]);
        });
        return superClasses;
    }

    /**
     * @returns the immediate superclasses of the target class of this Shape (can be the shape itself)
     */
    getImmediateSuperClassesOfTargetClass(): Resource[] {
        return this.getSuperClassesOfTargetClass(1);
    }

    getSuperClassesOfTargetClass(level: number): Resource[] {
        // retrieve target classes
        let targetClasses:Resource[] = this.getTargetClasses();
        // then retrieve super classes of those classes
        let superClasses:Resource[] = [];
        targetClasses.forEach(tc => {
            let currentSuperClasses = this.#getSuperClassesAtLevel(tc, level);
            superClasses.push(...currentSuperClasses);
        });
        return superClasses;
    }

    /**
     * @returns the immediate subclasses of the target class of this Shape (can be the shape itself)
     */
    getSubClassesOfTargetClass(): Resource[] {
        // retrieve target classes
        let targetClasses:Resource[] = this.getTargetClasses();
        // then retrieve sub classes of those classes
        let subClasses:Resource[] = [];
        targetClasses.forEach(tc => {
            let currentSubClasses = this.graph.findSubjectsOf(RDFS.SUBCLASS_OF, tc)
            subClasses.push(...currentSubClasses as Resource[]);
        });
        return subClasses;
    }

    /**
     * @returns all super classes, recursively, of the provided classes. This is currently not used.
     */
    #getSuperClassesRec(classNode:Term): Resource[] {
        var items: Resource[] = [];
        let superClasses = this.graph.readProperty(classNode, RDFS.SUBCLASS_OF);
        items.push(...superClasses as Resource[]);
        superClasses.forEach(sc => {
            items.push(...this.#getSuperClassesRec(sc));
        });
        return items;
    }

    /**
     * @returns the superClasses of the provided class, at a certain level
     */
    #getSuperClassesAtLevel(classNode:Term, level:number): Resource[] {
        if(level < 1) {
            return null;
        }
        var items: Resource[] = [];
        let superClasses = this.graph.readProperty(classNode, RDFS.SUBCLASS_OF);
        items.push(...superClasses as Resource[]);
        if(level == 1) {
            return items;
        } else {
            var result: Resource[] = [];
            items.forEach(i => result.push(...this.#getSuperClassesAtLevel(i, (level-1))));
            return result;
        }
    }

    /**
     * @returns the NodeShapes IRI that reference this one with sh:node
     */
    #getInverseOfShNodeForExplicitNodeShapes(): Term[] {
        let subjects:Quad_Subject[] = this.graph.findSubjectsOf(SH.NODE, this.resource);
        // keep only the sh:node references from NodeShapes, not property shapes or sh:or on property shapes
        // there could be more precise ways of doing this
        return subjects.filter(term => 
            term.termType == "NamedNode"
            &&
            this.graph.hasTriple(term, RDF.TYPE, SH.NODE_SHAPE)
        )

    }

    couldBeSkosConcept():boolean {
        return ShaclStoreModel.couldBeSkosConcept(this.resource, this.graph);
    }
}

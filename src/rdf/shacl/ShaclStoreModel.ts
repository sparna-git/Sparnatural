import { Term } from "@rdfjs/types/data-model";
import { RdfStore } from "rdf-stores";
import { SH } from "../vocabularies/SH";
import { StoreModel } from "../StoreModel";
import { DataFactory } from "rdf-data-factory";
import { RDF } from "../vocabularies/RDF";
import { PropertyShape } from "./PropertyShape";
import { NodeShape } from "./NodeShape";
import { Shape } from "./Shape";
import { Resource } from "../Resource";
import { SKOS } from "../vocabularies/SKOS";

const factory = new DataFactory();

export class ShapeFactory {

    static buildShape(resource: Term, graph: ShaclStoreModel): Shape {
        // the resource must be a named node or blank node
        if (resource.termType != "NamedNode" && resource.termType != "BlankNode") {
            throw new Error("The shape resource must be a named node or a blank node");
        }

        // if the resource has an sh:path, it is a property shape
        // otherwise it is a node shape
        if(graph.hasTriple(resource, SH.PATH, null)) {
            return new PropertyShape(resource, graph);
        } else {
            return new NodeShape(resource, graph);
        }
    }

}

export class ShaclStoreModel extends StoreModel {

    constructor(n3store: RdfStore) {
        super(n3store);
    }

    public static skolemizeAnonymousPropertyShapes(n3store: RdfStore) {

        // any subject of an sh:path...
        const quadsArray = n3store.getQuads(
            null,
            SH.PROPERTY,
            null,
            null
        );

        let i=0;
        for (const quad of quadsArray) {
            var propertyShapeNode = quad.object;
            if(propertyShapeNode.termType == "BlankNode") {
            // 1. get the base URI pointing to this property shape
            var nodeShape = quad.subject;
            if(nodeShape.termType == "NamedNode") {
                let uri = quad.subject.value;
                
                // 2. build a property shape URI from it
                let propertyShapeUri = uri+"_"+i;
                // 3. replace all triples where the blank node is subject
                n3store.getQuads(
                    propertyShapeNode,
                    null,
                    null,
                    null
                ).forEach(
                q => {
                    n3store.removeQuad(q);
                    n3store.addQuad(factory.quad(factory.namedNode(propertyShapeUri), q.predicate, q.object, q.graph));
                }
                );
                // 4. replace all triples where the blank node is object
                n3store.getQuads(
                    null,
                    null,
                    propertyShapeNode,
                    null
                ).forEach(
                q => {
                    n3store.removeQuad(q);
                    n3store.addQuad(factory.quad(q.subject, q.predicate, factory.namedNode(propertyShapeUri), q.graph));
                }
                );
            }
            }
            i++;
        }
    }


    /**
     * 
     * @returns All the subjects of type sh:NodeShape
     */
    readAllNodeShapes(): string[] {
        const quadsArray = this.store.getQuads(
            null,
            RDF.TYPE,
            SH.NODE_SHAPE,
            null
        );

        const itemsSet = new Set<string>();
        for (const quad of quadsArray) {
            var nodeShapeId = quad.subject.value;
            itemsSet.add(nodeShapeId);
        }

        return Array.from(itemsSet);
    }

    /**
     * 
     * @returns All the languages used in sh:name properties
     */
    readAllLanguages(): string[] {
        let languages = this.store
            .getQuads(null, SH.NAME, null, null)
            .map((quad: { object: any }) => quad.object.language);
        // deduplicate the list of languages
        return [...new Set(languages)];
    }

    /**
     * Reads the sh:node values in a sh:or list.
     * @param shOrList The sh:or list term.
     * @return A list of resources.
     */
    readShNodeInShOr(shOrList: Term): Term[] {
        let result: Term[] = [];
        const listItems = this.readListContent(shOrList);

        listItems.forEach(item => {
            if (item.termType === "NamedNode") {
                const nodeValue = this.store.getQuads(item, SH.NODE, null, null).map(quad => quad.object);
                if (nodeValue.length > 0) {
                    result.push(nodeValue[0]);
                } else {
                    const orValue = this.store.getQuads(item, SH.OR, null, null).map(quad => quad.object);
                    if (orValue.length > 0) {
                        result.push(...this.readShNodeInShOr(orValue[0]));
                    }
                }
            }
        });

        return result;
    }

    /**
     * Reads the sh:class values in a sh:or list.
     * @param shOrList The sh:or list term.
     * @return A list of resources.
     */
    readShClassInShOr(shOrList: Term): Term[] {
        let result: Term[] = [];
        const listItems = this.readListContent(shOrList);

        listItems.forEach(item => {
            if (item.termType === "NamedNode") {
                const classValue = this.store.getQuads(item, SH.CLASS, null, null).map(quad => quad.object);
                if (classValue.length > 0) {
                    result.push(classValue[0]);
                } else {
                    const orValue = this.store.getQuads(item, SH.OR, null, null).map(quad => quad.object);
                    if (orValue.length > 0) {
                        result.push(...this.readShClassInShOr(orValue[0]));
                    }
                }
            }
        });

        return result;
    }

    /**
     * Reads the sh:datatype values in a sh:or list.
     * @param shOrList The sh:or list term.
     * @return A list of resources.
     */
    readShDatatypeInShOr(shOrList: Term): Term[] {
        let result: Term[] = [];
        const listItems = this.readListContent(shOrList);

        listItems.forEach(item => {
            if (item.termType === "NamedNode") {
                const datatypeValue = this.store.getQuads(item, SH.DATATYPE, null, null).map(quad => quad.object);
                if (datatypeValue.length > 0) {
                    result.push(datatypeValue[0]);
                } else {
                    const orValue = this.store.getQuads(item, SH.OR, null, null).map(quad => quad.object);
                    if (orValue.length > 0) {
                        result.push(...this.readShDatatypeInShOr(orValue[0]));
                    }
                }
            }
        });

        return result;
    }

    /**
     * Reads the sh:nodeKind values in a sh:or list.
     * @param shOrList The sh:or list term.
     * @return A list of resources.
     */
    readShNodeKindInShOr(shOrList: Term): Term[] {
        let result: Term[] = [];
        const listItems = this.readListContent(shOrList);

        listItems.forEach(item => {
            if (item.termType === "NamedNode") {
                const nodeKindValue = this.store.getQuads(item, SH.NODE_KIND, null, null).map(quad => quad.object);
                if (nodeKindValue.length > 0) {
                    result.push(nodeKindValue[0]);
                } else {
                    const orValue = this.store.getQuads(item, SH.OR, null, null).map(quad => quad.object);
                    if (orValue.length > 0) {
                        result.push(...this.readShNodeKindInShOr(orValue[0]));
                    }
                }
            }
        });

        return result;
    }

    /**
     * Reads the sh:class, sh:node, sh:datatype, and sh:nodeKind values in a sh:or list.
     * @param shOrList The sh:or list term.
     * @return A list of resources.
     */
    readShClassAndShNodeAndShDatatypeAndShNodeKindInShOr(shOrList: Term): Term[] {
        let result: Term[] = [];
        result.push(...this.readShClassInShOr(shOrList));
        result.push(...this.readShNodeInShOr(shOrList));
        result.push(...this.readShDatatypeInShOr(shOrList));
        result.push(...this.readShNodeKindInShOr(shOrList));
        return result;
    }

    /**
     * 
     * @param nodeShape A NodeShape to test
     * @param graph the SHACL graph
     * @returns true if the node shape could be a SKOS Concept, by looking at its target class, its rdf:type constraint,
     * and its skos:inScheme property shape
     */
    static couldBeSkosConcept(nodeShape:Resource, graph:ShaclStoreModel):boolean {
        let specEntity:NodeShape = new NodeShape(nodeShape, graph);
        if(specEntity) {
            let isItselfSkosConcept:boolean = (nodeShape.value == SKOS.CONCEPT.value);
            let targetsSkosConcept:boolean = (specEntity.getShTargetClass().findIndex(t => t.value == SKOS.CONCEPT.value) > -1);

            // read all sh:property, including sh:deactivated, ones with sh:hasValue, etc.
            let propShapes:Term[] = specEntity.graph.readProperty(nodeShape, SH.PROPERTY);

            let hasPropertyRdfTypeSkosConcept:boolean = propShapes.findIndex(p => {
                let propertyShape:PropertyShape = new PropertyShape(p as Resource, specEntity.graph);
                let path = propertyShape.getShPath();
                if(
                    path
                    &&
                    (path.value === RDF.TYPE.value)
                    &&
                    specEntity.graph.hasTriple(p as Resource, SH.HAS_VALUE, SKOS.CONCEPT)
                ) {
                    return true;
                }

                return false;
            }) > -1;

            let hasConstraintOnSkosInScheme = propShapes.findIndex(p => {
                let propertyShape:PropertyShape = new PropertyShape(p as Resource, specEntity.graph);
                let path = propertyShape.getShPath();
                if(
                    path
                    &&
                    (path.value === SKOS.IN_SCHEME.value)
                    &&
                    specEntity.graph.hasTriple(p as Resource, SH.HAS_VALUE, null)
                ) {
                    return true;
                }

                return false;
            }) > -1;

            return isItselfSkosConcept || targetsSkosConcept || hasPropertyRdfTypeSkosConcept || hasConstraintOnSkosInScheme;
        }
    }

        /**
     * Renders the provided SHACL property path as a SPARQL property path syntax, using prefixed URIs.
     * @param path The SHACL property path to render in SPARQL.
     * @param usePrefixes True to use prefixes, false to use full URIs.
     * @return The rendered SPARQL property path.
     */
    pathToSparql(path: Term, usePrefixes: boolean = false): string {
        if (path.termType === "NamedNode") {
            if (usePrefixes) {
                return StoreModel.getLocalName(path.value);
            } else {
                return `<${path.value}>`;
            }
        } else if (path.termType === "BlankNode") {
            if (this.store.getQuads(path, RDF.FIRST, null, null).length > 0) {
                // This is an RDF list, indicating a sequence path
                const sequence: Term[] = this.readListContent(path);
                return sequence.map(t => this.pathToSparql(t, usePrefixes)).join("/");
            } else {
                if (this.store.getQuads(path, SH.ONE_OR_MORE_PATH, null, null).length > 0) {
                    return this.pathToSparql(this.store.getQuads(path, SH.ONE_OR_MORE_PATH, null, null)[0].object, usePrefixes) + "+";
                }
                if (this.store.getQuads(path, SH.INVERSE_PATH, null, null).length > 0) {
                    return "^" + this.pathToSparql(this.store.getQuads(path, SH.INVERSE_PATH, null, null)[0].object, usePrefixes);
                }
                if (this.store.getQuads(path, SH.ALTERNATIVE_PATH, null, null).length > 0) {
                    const list = this.store.getQuads(path, SH.ALTERNATIVE_PATH, null, null)[0].object;
                    const sequence: Term[] = this.readListContent(list);
                    return `(${sequence.map(t => this.pathToSparql(t, usePrefixes)).join("|")})`;
                }
                if (this.store.getQuads(path, SH.ZERO_OR_MORE_PATH, null, null).length > 0) {
                    return this.pathToSparql(this.store.getQuads(path, SH.ZERO_OR_MORE_PATH, null, null)[0].object, usePrefixes) + "*";
                }
                if (this.store.getQuads(path, SH.ZERO_OR_ONE_PATH, null, null).length > 0) {
                    return this.pathToSparql(this.store.getQuads(path, SH.ZERO_OR_ONE_PATH, null, null)[0].object, usePrefixes) + "?";
                }
            }
        }
        throw new Error("Unsupported SHACL property path");
    }
}

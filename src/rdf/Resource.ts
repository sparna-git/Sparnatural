import { Quad_Object, Quad_Subject, Term } from '@rdfjs/types';

/**
 * A RDF resource, either a NamedNode or a BlankNode
 */
export type Resource = import('@rdfjs/types').NamedNode | import('@rdfjs/types').BlankNode;

/**
 * Factory to create Resources from Terms, with a type check. If the Term is not a NamedNode or a BlankNode, an error is thrown.
 */
export class ResourceFactory {
    static fromTerm(t:Term): Resource {
        if(t.termType == "NamedNode" || t.termType == "BlankNode") {
            return t;
        } else {
            throw new Error("Cannot convert term to resource: "+t.value);
        }
    }
}
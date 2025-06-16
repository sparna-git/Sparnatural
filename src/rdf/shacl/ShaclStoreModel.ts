import { Term, Quad_Object } from "@rdfjs/types/data-model";
import { RdfStore } from "rdf-stores";
import { SH } from "../vocabularies/SH";
import { RDF } from "../vocabularies/RDF";
import { StoreModel } from "../StoreModel";

export class ShaclStoreModel extends StoreModel {

    constructor(n3store: RdfStore) {
        super(n3store);
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
}

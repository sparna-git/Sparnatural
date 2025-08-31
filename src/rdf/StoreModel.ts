import { Quad, Quad_Object, Quad_Predicate, Quad_Subject, Term } from "@rdfjs/types/data-model";
import { RdfStore } from "rdf-stores";
import { DataFactory } from "rdf-data-factory";
import { SH } from "./vocabularies/SH";
import { XSD } from "./vocabularies/XSD";
import { RDF } from "./vocabularies/RDF";

export class StoreModel {

    public store: RdfStore;
    protected factory = new DataFactory();

    constructor(n3store: RdfStore) {
        this.store = n3store;
    }

    public static getLocalName(uri:string):string{
        if(uri.includes('#')) return uri.split('#').pop() as string
        if(uri.includes('/')) return uri.split('/').pop() as string
        return uri;
    }

    /**
     * Reads the given property on an entity, and return values as an array
     **/
    readProperty(subject: Term, property: Term): Quad_Object[] {
        return this.store
            .getQuads(subject, property, null, null)
            .map(quad => quad.object);
    }

    /**
     * Reads the given property on an entity recursively, and return values as an array
     **/
    readPropertyRec(subject: Term, property: Term): Quad_Object[] {
        let values:Quad_Object[] = this.store
            .getQuads(subject, property, null, null)
            .map(quad => quad.object);
        
        let recValues:Quad_Object[] = [];
        values.forEach(v => {
            recValues.push(...this.readPropertyRec(v, property));
        });
        values.push(...recValues);

        return values;
    }

    /**
     * Reads the given property on an entity, and returns the first value found, or undefined if not found
     **/
    readSingleProperty(subject: Term, property: Term): Quad_Object | undefined {
        var values = this.readProperty(subject, property);
        if (values.length > 0) {
            return values[0];
        }
    }

    /**
     * Reads the given property on an entity, and returns the first value found cast to Number
     **/
    readSinglePropertyAsNumber(subject: Term, property: Term): number | undefined {
        var term = this.readSingleProperty(subject, property);
        if(term) {
            return Number.parseInt(term.value);
        }
    }

    /**
     * Finds all subjects having the given property with the given object, or undefined if not found
     **/
    findSubjectsOf(property: Term, object: Term): Quad_Subject[] {
        return this.store
            .getQuads(null, property, object, null)
            .map(quad => quad.subject);
    }

    /**
     * Finds the subjects having the given property with the given object, and returns the first value found, or undefined if not found
     */
    findSingleSubjectOf(property: Term, object: Term): Quad_Subject | undefined {
        var values = this.findSubjectsOf(property, object);

        if (values.length > 0) {
            return values[0];
        }
    }

    readPropertyInLang(
        subject: Term,
        property: Term,
        lang: string,
        defaultToNoLang = true
    ): Term[] {
        var values = this.store
            .getQuads(subject, property, null, null)
            .filter((quad: any) => quad.object.language == lang)
            .map((quad: Quad) => quad.object);

        if (values.length == 0 && defaultToNoLang) {
            values = this.store
                .getQuads(subject, property, null, null)
                .filter((quad: any) => quad.object.language == "")
                .map((quad: Quad) => quad.object);
        }

        return values;
    }

    /**
     * Reads the given property on an entity, and returns the first value found, or undefined if not found
     **/
    readSinglePropertyInLang(
        subject: Term,
        property: Term,
        lang: string,
        defaultToNoLang = true
    ): Term | undefined {
        var values = this.readPropertyInLang(subject, property, lang, defaultToNoLang);

        if (values.length > 0) {
            return values[0];
        }
    }

    size():number {
        return this.store.size
    }

    hasProperty(subject: Quad_Subject, property: Quad_Predicate) {
        return this.hasTriple(subject, property, null);
    }

    hasTriple(rdfNode: Quad_Subject, property: Quad_Predicate, value: Quad_Object | null): boolean {
        
        return (
            this.store.getQuads(
                rdfNode,
                property,
                value,
                null
            ).length > 0
        );
    }

    findSubjectsWithPredicate(property: Term, rdfNode: Term): Term[] {
        return this.store
            .getQuads(null, property, rdfNode, null)
            .map(quad => quad.subject);
    }

    /****** LIST HANDLING ********/

    listContains(rdfNode: any, propertyList: any, property: any, value: any) {
        let found: boolean = false;

        let listContent: any[] = this.readAsList(rdfNode, propertyList);
        listContent.forEach(node => {
            if (this.hasTriple(node, property, value)) found = true;
        });
        return found;
    }

    /**
     * returns RDFTerms
     */
    readAsList(rdfNode: any, property: any):Term[] {
        let result: Term[] = new Array<Term>();
        this.store
            .getQuads(rdfNode, property, null, null)
            .map((quad: { object: any }) => {
                result.push(...this.readListContent(quad.object))
            });
        return result;
    }

    /**
     * returns RDFTerms
     */
    readListContent(list: Term): Term[] {
        var result: Term[] = this.store
            .getQuads(list, RDF.FIRST, null, null)
            .map((quad: Quad) => quad.object);

        var subLists = this.readProperty(list, RDF.REST);
        if (subLists.length > 0) {
            result = result.concat(this.readListContent(subLists[0]));
        }

        return result;
    }

    readRootList(listId: any): any {
        var root = this.readSuperList(listId);
        if (root == null) {
            return listId;
        } else {
            return this.readRootList(root);
        }
    }

    readSuperList(listId: any) {
        const propertyQuads = this.store.getQuads(
            null,
            RDF.REST,
            listId,
            null
        );

        if (propertyQuads.length > 0) {
            return propertyQuads[0].subject;
        } else {
            return null;
        }
    }

    /******* END LIST HANDLING *********/

    /**
     * Finds the most suitable value of a given property for a list of languages.
     * Falls back to literals with no language if no better literal is found.
     * @param subject The subject resource.
     * @param langs The allowed languages.
     * @param properties The properties to check.
     * @return The best suitable value or null.
     */
    getBestStringLiteral(subject: Term, langs: string[], properties: Term[]): Term | null {
        let bestLiteral: Term | null = null;
        let bestLangIndex = -1;

        for (const property of properties) {
            const quads = this.store.getQuads(subject, property, null, null);
            for (const quad of quads) {
                const object = quad.object;
                if (object.termType === "Literal") {
                    const lang = object.language || "";
                    if (lang === "" && bestLiteral === null) {
                        bestLiteral = object;
                    } else {
                        let startLangIndex = bestLangIndex < 0 ? langs.length - 1 : bestLangIndex;
                        for (let i = startLangIndex; i >= 0; i--) {
                            const langPreference = langs[i];
                            if (langPreference.toLowerCase() === lang.toLowerCase()) {
                                bestLiteral = object;
                                bestLangIndex = i;
                            } else if (lang.includes("-") && lang.startsWith(langPreference) && bestLiteral === null) {
                                bestLiteral = object;
                            }
                        }
                    }
                }
            }
        }

        return bestLiteral;
    }

    /**
     * Render a list of RDFNode as a string, in plain text.
     * @param list The list of RDFNode to be displayed.
     * @return A comma-separated string.
     */
    public static render(list: Term[]): string {
        return this.renderWithPlainString(list, true);
    }

    /**
     * Render an RDFNode as a string, in plain text.
     * @param node The node to be rendered.
     * @return The rendered string.
     */
    public static renderNode(node: Term): string {
        return this.renderWithPlainString([node], true);
    }

    /**
     * Render a list of RDFNode as a comma-separated string. If plainString is true, make it a plain string,
     * otherwise uses HTML markup to display e.g. datatypes and languages in "sup" tags.
     * @param list The list of RDFNode to be displayed.
     * @param plainString True to retrieve a plain string, false to retrieve a piece of HTML.
     * @return The rendered string.
     */
    public static renderWithPlainString(list: Term[], plainString: boolean): string {
        if (!list || list.length === 0) {
            return "";
        }

        return list.map(item => this.renderSingleNode(item, plainString)).join(", ");
    }

    /**
     * Render an RDFNode as a string. If plainString is true, make it a plain string,
     * otherwise uses HTML markup to display e.g. datatypes and languages in "sup" tags.
     * @param node The node to be rendered.
     * @param plainString True to retrieve a plain string, false to retrieve a piece of HTML.
     * @return The rendered string.
     */
    public static renderSingleNode(node: Term, plainString: boolean): string {
        if (!node) {
            return "";
        }

        if (node.termType === "NamedNode") {
            return node.value; // Assuming short form is handled elsewhere.
        } else if (node.termType === "BlankNode") {
            return node.value;
        } else if (node.termType === "Literal") {
            if (plainString) {
                return node.value;
            }

            if (node.datatype && node.datatype.value !== RDF.LANG_STRING.value) {
                if (node.datatype.value !== XSD.STRING.value) {
                    return `"${node.value}"<sup>^^${node.datatype.value}</sup>`;
                } else {
                    return `"${node.value}"`;
                }
            } else if (node.language) {
                return `"${node.value}"<sup>@${node.language}</sup>`;
            } else {
                return node.value;
            }
        } else {
            return node.value;
        }
    }

}
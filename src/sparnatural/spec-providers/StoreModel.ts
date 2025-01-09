import { Quad, Quad_Object, Quad_Predicate, Quad_Subject, Term } from "@rdfjs/types/data-model";
import { RdfStore } from "rdf-stores";
import { RDF } from "./BaseRDFReader";
import { DataFactory } from "rdf-data-factory";
import { QuadPredicate } from "n3";

let DF = new DataFactory();

export class StoreModel {

    protected store: RdfStore;

    constructor(n3store: RdfStore) {
        this.store = n3store;
    }

    public static getLocalName(uri:string):string{
        if(uri.includes('#')) return uri.split('#').pop() as string
        return uri.split('/').pop() as string
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
    readSingleProperty(subject: Term, property: Term): Term | undefined {
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

}
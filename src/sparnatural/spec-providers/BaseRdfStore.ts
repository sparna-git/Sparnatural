import { DataFactory } from 'rdf-data-factory';
import { Model } from 'rdf-shacl-commons';
import { RdfStore } from 'rdf-stores';

const factory = new DataFactory();

export class BaseRdfStore {
    protected lang: string;
    protected store: RdfStore;
    protected graph: Model;

    constructor(n3store: RdfStore, lang: string) {
        this.store = n3store;
        this.lang = lang;
        this.graph = new Model(n3store);
    }
}

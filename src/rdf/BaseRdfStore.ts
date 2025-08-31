import { DataFactory } from 'rdf-data-factory';
import { RdfStore } from 'rdf-stores';
import { StoreModel } from './StoreModel';

const factory = new DataFactory();

export class BaseRdfStore {
    protected lang: string;
    protected store: RdfStore;
    protected graph: StoreModel;

    constructor(n3store: RdfStore, lang: string) {
        this.store = n3store;
        this.lang = lang;
        this.graph = new StoreModel(n3store);
    }
}

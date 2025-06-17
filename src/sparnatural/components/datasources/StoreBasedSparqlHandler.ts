import { Store } from 'n3';
import { QueryEngine } from '@comunica/query-sparql-rdfjs-lite';
import { SparqlHandlerIfc } from './SparqlHandler';

export class StoreBasedSparqlHandler implements SparqlHandlerIfc {
    private store: Store;
    private engine: QueryEngine;

    constructor(store: Store) {
        this.store = store;
        this.engine = new QueryEngine();
    }

    executeSparql(
        sparql:string,
        callback: (data: any) => void,
        errorCallback?:(error: any) => void)
    : void {
        // Wrap the async execution in a Promise
        (async () => {
            try {
                const bindingsStream = await this.engine.queryBindings(sparql, {
                    sources: [this.store]
                });

                var results:{
                    head:{
                        vars: string[]
                    },
                    results:{
                        bindings: object[]
                    }
                } = {
                    head: {
                        vars: []
                    },
                    results: {
                        bindings: []
                    }
                } ;

                let first:boolean = true;
                // serialize results into SPARQL JSON format
                bindingsStream.on('data', (binding) => {
                    // Convert each binding to a JSON object
                    const result: any = {};
                    
                    binding.forEach((value:any, key:any) => {
                        // console.log(`Key: ${key.value}, Value: ${value.value}, Type: ${this.getJsonType(value.termType)}`);
                        result[key.value] = {
                            value: value.value,
                            type: this.getJsonType(value.termType)
                        };
                        // cheating : we read the first binding to read variables
                        if(first) {
                            results.head.vars.push(key.value);
                        }
                        first = false;
                    });
                    results.results.bindings.push(result);
                });

                bindingsStream.on('end', () => {
                    // The data-listener will not be called anymore once we get here.
                    console.log(JSON.stringify(results, null, 2));
                    callback(results);
                });

                bindingsStream.on('error', (error) => {
                    console.error(error);
                });

                

            } catch (error) {
                console.error('Error executing SPARQL query:', error);
                if (errorCallback) {
                    errorCallback(error);
                } else {
                    throw error;
                }
            }
        })();
    }

    private getJsonType(termType: string): string {
        switch (termType) {
            case 'NamedNode': return 'uri';
            case 'BlankNode': return 'bnode';
            case 'Literal': return 'literal';
            default: return termType.toLowerCase();
        }
    }
}

import { Store, DataFactory } from 'n3';
import { StoreBasedSparqlHandler } from '../StoreBasedSparqlHandler';
import '@jest/globals';

const { namedNode, literal } = DataFactory;

jest.setTimeout(10000); // Increase timeout for async operations

describe('StoreBasedSparqlHandler', () => {
    let store: Store;
    let handler: StoreBasedSparqlHandler;

    beforeEach(() => {
        // Create a new Store before each test
        store = new Store();
        
        // Add some sample triples
        store.addQuad(
            namedNode('http://example.org/john'),
            namedNode('http://example.org/name'),
            literal('John Doe')
        );
        store.addQuad(
            namedNode('http://example.org/john'),
            namedNode('http://example.org/age'),
            literal('30', 'http://www.w3.org/2001/XMLSchema#integer')
        );
        
        // Initialize the handler
        handler = new StoreBasedSparqlHandler(store);
    });

    test('should execute a simple SPARQL query', (done: jest.DoneCallback) => {
        const sparqlQuery = `
            SELECT ?name
            WHERE {
                ?person <http://example.org/name> ?name .
            }
        `;

        handler.executeSparql(
            sparqlQuery,
            (results) => {
                try {
                    expect(results.results.bindings).toBeDefined();
                    expect(results.results.bindings.length).toBe(1);
                    expect(results.results.bindings[0].name.value).toBe('John Doe');
                    done();
                } catch (error) {
                    done(error);
                }
            },
            (error) => {
                done(error);
            }
        );
    });

    test('should handle queries with multiple results', (done: jest.DoneCallback) => {
        // Add another person to the store
        store.addQuad(
            namedNode('http://example.org/jane'),
            namedNode('http://example.org/name'),
            literal('Jane Smith')
        );

        const sparqlQuery = `
            SELECT ?name ?person
            WHERE {
                ?person <http://example.org/name> ?name .
            }
            ORDER BY ?name
        `;

        handler.executeSparql(
            sparqlQuery,
            (results) => {
                try {
                    expect(results.results.bindings).toBeDefined();
                    expect(results.results.bindings.length).toBe(2);
                    expect(results.results.bindings[0].name.value).toBe('Jane Smith');
                    expect(results.results.bindings[1].name.value).toBe('John Doe');
                    expect(results.results.bindings[0].person.value).toBe('http://example.org/jane');
                    expect(results.results.bindings[1].person.value).toBe('http://example.org/john');
                    done();
                } catch (error) {
                    done(error);
                }
            },
            (error) => {
                done(error);
            }
        );
    });

    test('should handle query errors', (done: jest.DoneCallback) => {
        const invalidQuery = 'INVALID SPARQL QUERY';

        handler.executeSparql(
            invalidQuery,
            () => {
                done(new Error('Should not succeed with invalid query'));
            },
            (error) => {
                expect(error).toBeDefined();
                done();
            }
        );
    });
});

import { getSettings } from "../../../settings/defaultSettings";
import { RDFTerm } from "../AbstractWidget";
import { AutocompleteSparqlQueryBuilderIfc, ListSparqlQueryBuilderIfc, TreeSparqlQueryBuilderIfc } from "./SparqlBuilders";
import { MultipleEndpointSparqlFetcher, SparqlFetcher, SparqlFetcherFactory, SparqlFetcherIfc, UrlFetcher } from "./UrlFetcher";


/**
 * Interface for objects that can provide data to a ListWidget :
 * either through a SPARQL query, or through custom mean (calling an API)
 */
export interface ListDataProviderIfc {

    getListContent(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
    ):void
}

/**
 * An implementation of ListDataProviderIfc that does nothing !
 */
export class NoOpListDataProvider implements ListDataProviderIfc {

    getListContent(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpListDataProvider is being called for typePredicate "+typePredicate)
    }
}

/**
 * Implementation of ListDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlListDataProvider implements ListDataProviderIfc {
    
    queryBuilder:ListSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlFetcherIfc;

    constructor(
        sparqlFetcherFactory:SparqlFetcherFactory,
        queryBuilder: ListSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = sparqlFetcherFactory.buildSparqlFetcher();        
    }

    getListContent(
        domainType: string,
        predicate: string,
        rangeType: string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domainType,
            predicate,
            rangeType,
            lang,
            defaultLang,
            typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(sparql,(data:{results:{bindings:any}}) => {
            // 3. parse the results
            let result = new Array<{term:RDFTerm, label:string, group?:string}>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const solution = data.results.bindings[index];
                if(solution.uri) {
                    // if we find a "uri" column...
                    // read uri key & label key
                    result[result.length] = {term:solution.uri, label:solution.label.value, group:solution.group?.value};
                } else if(solution.value) {
                    // if we find a "value" column...
                    // read value key & label key
                    result[result.length] = {term:solution.value, label:solution.label.value, group:solution.group?.value};
                } else {
                    // try to determine the payload column by taking the column other than label
                    let columnName = this.getRdfTermColumn(solution);
                    if(columnName) {
                        result[result.length] ={term:solution[columnName], label:solution.label.value, group:solution.group?.value};
                    } else {
                        throw Error("Could not determine which column to read from the result set")
                    }
                }
            }

            // 4. call the callback
            callback(result);            
        },
        errorCallback
        );

    }

    getRdfTermColumn(aBindingSet:any):string|undefined {
        let foundKey:string|undefined = undefined;
        for (const key of Object.keys(aBindingSet)) {
            if(key != "label") {
                if(!foundKey) {
                    foundKey = key;
                } else {
                    // it means there are more than one column, don't know which one to take, break
                    return undefined;
                }
            }
            // console.log(`${key}: ${(aBindingSet as {[key: string]: string})[key]}`);
        }
        return foundKey;
    }

}


/**
 * @deprecated
 * Interface for objects that can provide data to a LiteralListWidget :
 * either through a SPARQL query, or through custom mean (calling an API)
 */
export interface LiteralListDataProviderIfc {

    getListContent(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(values:{literal:string}[]) => void
    ):void

}


/**
 * @deprecated
 * Implementation of LiteralListDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlLiteralListDataProvider implements LiteralListDataProviderIfc {
    
    queryBuilder:ListSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlFetcher;

    constructor(
        sparqlEndpointUrl: any,
        queryBuilder: ListSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = new SparqlFetcher(
            UrlFetcher.build(getSettings()),
            sparqlEndpointUrl
        );
    }

    getListContent(
        domainType: string,
        predicate: string,
        rangeType: string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(values:{literal:string}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domainType,
            predicate,
            rangeType,
            lang,
            defaultLang,
            typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(sparql,(data:{results:{bindings:any}}) => {
            // 3. parse the results
            let result = new Array<{literal:string}>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const element = data.results.bindings[index];
                // reads the 'value' column
                if(element.value.value) {
                    result[result.length] ={literal:element.value.value};
                }
            }

            // 4. call the callback
            callback(result);
            
        },
        errorCallback
        );

    }

}

/**
 * @deprecated
 * Implementation of ListDataProviderIfc that wraps a LiteralListDataProviderIfc so that the same ListWidget
 * can be used with LiteralList
 */
export class ListDataProviderFromLiteralListAdpater implements ListDataProviderIfc {

    literalListDataProvider: LiteralListDataProviderIfc

    constructor(
        literalListDataProvider: LiteralListDataProviderIfc
    ) {
        this.literalListDataProvider = literalListDataProvider;
    }

    getListContent(
        domainType: string,
        predicate: string,
        rangeType: string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string}[]) => void
    ):void {
        this.literalListDataProvider.getListContent(
            domainType,
            predicate,
            rangeType,
            lang,
            defaultLang,
            typePredicate,
            (values:{literal:string}[]) => {
                let result = new Array<{term:RDFTerm, label:string}>;
                values.forEach(function(value) {
                    result[result.length] ={term:{type:"literal",value:value.literal}, label:value.literal};
                })
                callback(result);
            }
        );
    }

}


/**
 * Interface for objects that can provide data to an AutocompleteWidget :
 * either through a SPARQL query, or through custom mean (calling an API)
 */
export interface AutocompleteDataProviderIfc {

    /**
     * Used by new Awesomplete implementation
     */
    getAutocompleteSuggestions(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
    ):void
}

/**
 * An AutocompleteDataProviderIfc that does nothing
 */
export class NoOpAutocompleteProvider implements AutocompleteDataProviderIfc {
    getAutocompleteSuggestions(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpAutocompleteProvider is being called for typePredicate "+typePredicate)
    }
}

/**
 * Implementation of AutocompleteDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlAutocompleDataProvider implements AutocompleteDataProviderIfc {
    
    queryBuilder:AutocompleteSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlFetcherIfc;

    constructor(
        sparqlFetcherFactory: SparqlFetcherFactory,
        queryBuilder: AutocompleteSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = sparqlFetcherFactory.buildSparqlFetcher();
    }

    getAutocompleteSuggestions(
        domain: string,
        predicate: string,
        range: string,
        key: string,
        lang: string,
        defaultLang: string,
        typePredicate: string,
        callback:(items:{term:RDFTerm;label:string;group?:string}[]) => void,
        errorCallback?:(payload:any) => void
    ): void {

        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domain,
            predicate,
            range,
            key,
            lang,
            defaultLang,
            typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(sparql,(data:{results:{bindings:any}}) => {
            // 3. parse the results
            let result = new Array<{term:RDFTerm, label:string;group?:string}>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const solution = data.results.bindings[index];
                if(solution.uri) {
                    // read uri key & label key
                    result[result.length] ={term:solution.uri, label:solution.label.value, group:solution.group?.value};
                } else if(solution.value) {
                    result[result.length] ={term:solution.value, label:solution.label.value, group:solution.group?.value};
                } else {
                    // try to determine the payload column by taking the column other than label
                    let columnName = this.getRdfTermColumn(solution);
                    if(columnName) {
                        result[result.length] ={term:solution[columnName], label:solution.label.value};
                    } else {
                        throw Error("Could not determine which column to read from the result set")
                    }
                }
            }

            // 4. call the callback
            callback(result);            
        },
        errorCallback
        );
    }

    getRdfTermColumn(aBindingSet:any):string|undefined {
        let foundKey:string|undefined = undefined;
        for (const key of Object.keys(aBindingSet)) {
            if(key != "label") {
                if(!foundKey) {
                    foundKey = key;
                } else {
                    // it means there are more than one column, don't know which one to take, break
                    return undefined;
                }
            }
            // console.log(`${key}: ${(aBindingSet as {[key: string]: string})[key]}`);
        }
        return foundKey;
    }  

}

/**
 * Interface for objects that can provide data to a TreeWidget
 */
export interface TreeDataProviderIfc {

    getRoots(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
    ):void

    getChildren(
        node:string,
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
    ):void

}


export class NoOpTreeDataProvider implements TreeDataProviderIfc {
    getRoots(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpTreeDataProvider is being called for typePredicate "+typePredicate)
    }

    getChildren(
        node:string,
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpTreeDataProvider is being called for typePredicate "+typePredicate)
    }
}

export class SparqlTreeDataProvider implements TreeDataProviderIfc {
    
    queryBuilder:TreeSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlFetcherIfc;

    constructor(
        sparqlFetcherFactory:SparqlFetcherFactory,
        queryBuilder: TreeSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = sparqlFetcherFactory.buildSparqlFetcher();        
    }

    getRoots(
        domainType: string,
        predicate: string,
        rangeType: string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildRootsSparqlQuery(
            domainType,
            predicate,
            rangeType,
            lang,
            defaultLang,
            typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(
            sparql,
            this.#getParser(callback),
            errorCallback
        );

    }

    getChildren(
        node: string,
        domainType: string,
        predicate: string,
        rangeType: string,
        lang:string,
        defaultLang:string,
        typePredicate:string,
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildChildrenSparqlQuery(
            node,
            domainType,
            predicate,
            rangeType,
            lang,
            defaultLang,
            typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(
            sparql,
            this.#getParser(callback),
            errorCallback
        );

    }

    #getParser(
        callback:(items:{term:RDFTerm;label:string;hasChildren:boolean;disabled:boolean}[]) => void
    ):(data: any) => void {
        return (data) => {
            // 3. parse the results
            let result = new Array<{term:RDFTerm, label:string,hasChildren:boolean,disabled:boolean}>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const solution = data.results.bindings[index];

                result[result.length] = {
                    term:solution.uri,
                    label:solution.label.value,
                    // make sure to parse the value as a boolean so that it is not a string
                    hasChildren:solution.hasChildren?((solution.hasChildren.value === "true")?true:false):true,
                    disabled:solution.count?solution.count.value == 0:false
                };
            }

            // 4. call the callback
            callback(result);    
        }
    }

}
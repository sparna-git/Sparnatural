import { RDFTerm } from "../AbstractWidget";
import { AutocompleteSparqlQueryBuilderIfc, ListSparqlQueryBuilderIfc, TreeSparqlQueryBuilderIfc } from "./SparqlBuilders";
import { SparqlHandlerIfc } from "./SparqlHandler";

/**
 * An item returned by a list widget datasource
 */
export interface RdfTermDatasourceItem {
    term:RDFTerm;
    label:string;
    group?:string;
    itemLabel?:string;
}

/**
 * Datasource item for a tree. The "group" variable is not used in that case.
 */
export interface RdfTermTreeDatasourceItem extends RdfTermDatasourceItem {
    hasChildren:boolean;
    disabled:boolean;
}

/**
 * Interface for objects that can provide data to a ListWidget :
 * either through a SPARQL query, or through custom mean (calling an API)
 */
export interface ListDataProviderIfc {

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void;
    
    getListContent(
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void
}

/**
 * An implementation of ListDataProviderIfc that does nothing !
 */
export class NoOpListDataProvider implements ListDataProviderIfc {

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        // nothing
    }

    getListContent(
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpListDataProvider is being called for predicate "+predicate)
    }
}

/**
 * Implementation of ListDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlListDataProvider implements ListDataProviderIfc {
    
    queryBuilder:ListSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlHandlerIfc;
    lang: string;
    defaultLang: string;
    typePredicate: string;

    constructor(
        sparqlFetcher:SparqlHandlerIfc,
        queryBuilder: ListSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = sparqlFetcher;        
    }

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        this.lang = lang;
        this.defaultLang = defaultLang;
        this.typePredicate = typePredicate;
    }

    getListContent(
        domainType: string,
        predicate: string,
        rangeType: string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domainType,
            predicate,
            rangeType,
            this.lang,
            this.defaultLang,
            this.typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(sparql,(data:{results:{bindings:any}}) => {
            // 3. parse the results
            let result = new Array<RdfTermDatasourceItem>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const solution = data.results.bindings[index];
                if(solution.uri) {
                    // if we find a "uri" column...
                    // read uri key & label key
                    result[result.length] = {term:solution.uri, label:solution.label.value, group:solution.group?.value, itemLabel:solution.itemLabel?.value};
                } else if(solution.value) {
                    // if we find a "value" column...
                    // read value key & label key
                    result[result.length] = {term:solution.value, label:solution.label.value, group:solution.group?.value, itemLabel:solution.itemLabel?.value};
                } else {
                    // try to determine the payload column by taking the column other than label
                    let columnName = this.getRdfTermColumn(solution);
                    if(columnName) {
                        result[result.length] ={term:solution[columnName], label:solution.label.value, group:solution.group?.value, itemLabel:solution.itemLabel?.value};
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
 * An implementation of ListDataProviderIfc that sorts items of another data provider
 */
export class SortListDataProvider implements ListDataProviderIfc {
    
    delegate: ListDataProviderIfc;
    lang: string;

    constructor(
        delegate: ListDataProviderIfc
    ) {
        this.delegate = delegate;
    }

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        this.lang = lang;
        this.delegate.init(lang, defaultLang, typePredicate);
    }

    getListContent(
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        this.delegate.getListContent(
            domain,
            predicate,
            range,
            (items:RdfTermDatasourceItem[]) => {
                // sort according to lang
                var collator = new Intl.Collator(this.lang);

                items.sort((a: any, b: any) => {
                    return collator.compare(
                    a.label,
                    b.label
                    );
                });

                callback(items);
            },
            errorCallback
        );
    }
}


/**
 * Interface for objects that can provide data to an AutocompleteWidget :
 * either through a SPARQL query, or through custom mean (calling an API)
 */
export interface AutocompleteDataProviderIfc {

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void;

    /**
     * Used by new Awesomplete implementation
     */
    getAutocompleteSuggestions(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void
}

/**
 * An AutocompleteDataProviderIfc that does nothing
 */
export class NoOpAutocompleteProvider implements AutocompleteDataProviderIfc {
    
    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        // nothing
    }
    
    getAutocompleteSuggestions(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpAutocompleteProvider is being called for predicate "+predicate)
    }
}

/**
 * Implementation of AutocompleteDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlAutocompleDataProvider implements AutocompleteDataProviderIfc {
    
    lang: string;
    defaultLang: string;
    typePredicate: string;

    queryBuilder:AutocompleteSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlHandlerIfc;

    constructor(
        sparqlFetcher: SparqlHandlerIfc,
        queryBuilder: AutocompleteSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = sparqlFetcher;
    }

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        this.lang = lang;
        this.defaultLang = defaultLang;
        this.typePredicate = typePredicate;
    }

    getAutocompleteSuggestions(
        domain: string,
        predicate: string,
        range: string,
        key: string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ): void {

        

        if(key.startsWith("http") && SparqlAutocompleDataProvider.isValidUrl(key, ["http", "https"])) {
            // valid URI given, return it directly
            let result = new Array<RdfTermDatasourceItem>;
            result.push({
                term:{
                    type: "uri",
                    value: key
                },
                label:key
            });
            callback(result);  
            return;
        } 

        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domain,
            predicate,
            range,
            key,
            this.lang,
            this.defaultLang,
            this.typePredicate
        );        

        // 2. execute it
        this.sparqlFetcher.executeSparql(sparql,(data:{results:{bindings:any}}) => {
            // 3. parse the results
            let result = new Array<RdfTermDatasourceItem>;
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

    static isValidUrl(s:string, protocols:string[]) {
        try {
            let url = new URL(s);
            return protocols
                ? url.protocol
                    ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
                    : false
                : true;
        } catch (err) {
            return false;
        }
    };

}

/**
 * Interface for objects that can provide data to a TreeWidget
 */
export interface TreeDataProviderIfc {

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void;

    getRoots(
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void

    getChildren(
        node:string,
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void

}


export class NoOpTreeDataProvider implements TreeDataProviderIfc {

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        // nothing
    }

    getRoots(
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpTreeDataProvider is being called for predicate "+predicate)
    }

    getChildren(
        node:string,
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // does nothing !
        console.warn("Warning, a NoOpTreeDataProvider is being called for predicate "+predicate)
    }
}

export class SparqlTreeDataProvider implements TreeDataProviderIfc {
   
    lang: string;
    defaultLang: string;
    typePredicate: string;

    queryBuilder:TreeSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlHandlerIfc;


    constructor(
        sparqlFetcher:SparqlHandlerIfc,
        queryBuilder: TreeSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = sparqlFetcher;        
    }

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        this.lang = lang;
        this.defaultLang = defaultLang;
        this.typePredicate = typePredicate;
    }

    getRoots(
        domainType: string,
        predicate: string,
        rangeType: string,
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildRootsSparqlQuery(
            domainType,
            predicate,
            rangeType,
            this.lang,
            this.defaultLang,
            this.typePredicate
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
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildChildrenSparqlQuery(
            node,
            domainType,
            predicate,
            rangeType,
            this.lang,
            this.defaultLang,
            this.typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(
            sparql,
            this.#getParser(callback),
            errorCallback
        );

    }

    #getParser(
        callback:(items:RdfTermTreeDatasourceItem[]) => void
    ):(data: any) => void {
        return (data) => {
            // 3. parse the results
            let result = new Array<RdfTermTreeDatasourceItem>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const solution = data.results.bindings[index];

                result[result.length] = {
                    term:solution.uri,
                    label:solution.label.value,
                    itemLabel:solution.itemLabel?.value,
                    // make sure to parse the value as a boolean so that it is not a string
                    // we also test on "1" because Virtuoso returns this as a result instead of a true boolean
                    hasChildren:solution.hasChildren?((solution.hasChildren.value === "true" || solution.hasChildren.value == 1)?true:false):true,
                    disabled:solution.count?solution.count.value == 0:false
                };
            }

            // 4. call the callback
            callback(result);    
        }
    }

}

/**
 * An implementation of ListDataProviderIfc that sorts items of another data provider
 */
export class SortTreeDataProvider implements TreeDataProviderIfc {
    
    delegate: TreeDataProviderIfc;
    lang: string;

    constructor(
        delegate: TreeDataProviderIfc
    ) {
        this.delegate = delegate;
    }

    init(
        lang:string,
        defaultLang:string,
        typePredicate:string,
    ):void {
        this.lang = lang;
        this.delegate.init(lang, defaultLang, typePredicate);
    }

    getRoots(
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        this.delegate.getRoots(
            domain,
            predicate,
            range,
            (items:RdfTermTreeDatasourceItem[]) => {
                var collator = new Intl.Collator(this.lang);					
                items.sort(function(a:{label:string}, b:{label:string}) {
                    return collator.compare(a.label,b.label);
                });

                callback(items);
            },
            errorCallback
        );
    }

    getChildren(
        node:string,
        domain:string,
        predicate:string,
        range:string,
        callback:(items:RdfTermTreeDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        this.delegate.getChildren(
            node,
            domain,
            predicate,
            range,
            (items:RdfTermTreeDatasourceItem[]) => {
                callback(items);
            },
            errorCallback
        );
    }

}
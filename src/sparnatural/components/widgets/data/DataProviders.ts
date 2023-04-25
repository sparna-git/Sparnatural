import { getSettings } from "../../../settings/defaultSettings";
import { AutocompleteSparqlQueryBuilderIfc, ListSparqlQueryBuilderIfc } from "./SparqlBuilders";
import { SparqlFetcher, UrlFetcher } from "./UrlFetcher";


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
        typePredicate:string,
        callback:(items:{uri:string;label:string}[]) => void
    ):void

}

/**
 * Implementation of ListDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlListDataProvider implements ListDataProviderIfc {
    
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
        typePredicate:string,
        callback:(items:{uri:string;label:string}[]) => void
    ):void {
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domainType,
            predicate,
            rangeType,
            lang,
            typePredicate
        );

        // 2. execute it
        this.sparqlFetcher.executeSparql(sparql,(data:{results:{bindings:any}}) => {
            // 3. parse the results
            let result = new Array<{uri:string, label:string}>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const element = data.results.bindings[index];
                if(element.uri.value) {
                    // read uri key & label key
                    result[result.length] ={uri:element.uri.value, label:element.label.value};
                } else if(element.value.value) {
                    result[result.length] ={uri:element.value.value, label:element.value.value};
                }
            }

            // 4. call the callback
            callback(result);
            
        });

    }

}


/**
 * Interface for objects that can provide data to a LiteralListWidget :
 * either through a SPARQL query, or through custom mean (calling an API)
 */
export interface LiteralListDataProviderIfc {

    getListContent(
        domain:string,
        predicate:string,
        range:string,
        lang:string,
        typePredicate:string,
        callback:(values:{literal:string}[]) => void
    ):void

}


/**
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
        typePredicate:string,
        callback:(values:{literal:string}[]) => void
    ):void {
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domainType,
            predicate,
            rangeType,
            lang,
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
            
        });

    }

}

/**
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
        typePredicate:string,
        callback:(items:{uri:string;label:string}[]) => void
    ):void {
        this.literalListDataProvider.getListContent(
            domainType,
            predicate,
            rangeType,
            lang,
            typePredicate,
            (values:{literal:string}[]) => {
                let result = new Array<{uri:string, label:string}>;
                values.forEach(function(value) {
                    result[result.length] ={uri:value.literal, label:value.literal};
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

    autocompleteUrl(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        lang:string,
        typePredicate:string
    ):string

    listLocation(data:any):any;

    elementLabel(element:any):string;

    elementRdfTerm(element:any):any;

}

/**
 * Implementation of AutocompleteDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlAutocompleDataProvider implements AutocompleteDataProviderIfc {
    
    queryBuilder:AutocompleteSparqlQueryBuilderIfc;
    sparqlFetcher:SparqlFetcher;

    constructor(
        sparqlEndpointUrl: any,
        queryBuilder: AutocompleteSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlFetcher = new SparqlFetcher(
            UrlFetcher.build(getSettings()),
            sparqlEndpointUrl
        );
    }

    autocompleteUrl(domain: string, predicate: string, range: string, key: string, lang: string, typePredicate: string): string {
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            domain,
            predicate,
            range,
            key,
            lang,
            typePredicate
        );

        // 2. encode it into a URL
        return this.sparqlFetcher.buildUrl(sparql);
    }

    listLocation(data: any) {
        return data.results.bindings;
    }

    elementLabel(element: any): string {
        return element.label.value;
    }

    elementRdfTerm(element: any) {
        if(element.value) return element.value
        else return element.uri;
    }

}
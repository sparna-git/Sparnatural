import { RDFTerm } from "../widgets/AbstractWidget";
import { AutocompleteDataProviderIfc, ListDataProviderIfc, RdfTermDatasourceItem, RdfTermTreeDatasourceItem, TreeDataProviderIfc } from "./DataProviders";
import { AutocompleteSparqlQueryBuilderIfc, ListSparqlQueryBuilderIfc, TreeSparqlQueryBuilderIfc } from "./SparqlBuilders";
import { SparqlHandlerIfc } from "./SparqlHandler";


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


export class NoOpTreeDataProvider implements TreeDataProviderIfc {
  init(lang: string, defaultLang: string, typePredicate: string): void {
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


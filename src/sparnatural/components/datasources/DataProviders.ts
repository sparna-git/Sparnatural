import { RDFTerm } from "../widgets/AbstractWidget";
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
  init(lang: string, defaultLang: string, typePredicate: string): void;

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
 * An implementation of ListDataProviderIfc that sorts items of another data provider
 */
export class SortListDataProvider implements ListDataProviderIfc {
  delegate: ListDataProviderIfc;
  lang: string;

  constructor(delegate: ListDataProviderIfc) {
    this.delegate = delegate;
  }

  init(lang: string, defaultLang: string, typePredicate: string): void {
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
          return collator.compare(a.label, b.label);
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
  init(lang: string, defaultLang: string, typePredicate: string): void;

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
 * Interface for objects that can provide data to a TreeWidget
 */
export interface TreeDataProviderIfc {
  init(lang: string, defaultLang: string, typePredicate: string): void;

  getRoots(
    domain: string,
    predicate: string,
    range: string,
    callback: (
      items: {
        term: RDFTerm;
        label: string;
        hasChildren: boolean;
        disabled: boolean;
      }[]
    ) => void,
    errorCallback?: (payload: any) => void
  ): void;

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
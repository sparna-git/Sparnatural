import { Term } from "@rdfjs/types/data-model";
import { ListDataProviderIfc, RdfTermDatasourceItem, AutocompleteDataProviderIfc, TreeDataProviderIfc, RdfTermTreeDatasourceItem, ValuesListDataProviderIfc } from "./DataProviders";
import { AutocompleteSparqlQueryBuilderIfc, ListSparqlQueryBuilderIfc, TreeSparqlQueryBuilderIfc, ValuesListSparqlQueryBuilderIfc } from "./SparqlBuilders";
import { sameTerm } from "../../SparnaturalQueryIfc";
import { SparqlHandlerIfc } from "rdf-shacl-commons";

export abstract class BaseSparqlListDataProvider {
    
    sparqlHandler:SparqlHandlerIfc;
    lang: string;
    defaultLang: string;
    typePredicate: string;

    constructor(
        sparqlHandler:SparqlHandlerIfc
    ) {
        this.sparqlHandler = sparqlHandler;        
    }

    init(lang: string, defaultLang: string, typePredicate: string): void {
        this.lang = lang;
        this.defaultLang = defaultLang;
        this.typePredicate = typePredicate;
    }

    doExecuteWithCallback(
        sparqlQuery: string,
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {

        // 2. execute it
        this.sparqlHandler.executeSparql(sparqlQuery,(data:{results:{bindings:any}}) => {
            // 3. parse the results
            let result = new Array<RdfTermDatasourceItem>;
            for (let index = 0; index < data.results.bindings.length; index++) {
                const solution = data.results.bindings[index];
                // this is to avoid corner-cases with GraphDB queries returning only count=0 in aggregation queries.
                // we need at least 2 bindings anyway
                if(Object.keys(solution).length > 1) {
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
            }

            // 4. call the callback
            callback(result);
        },
        errorCallback
    );
  }

  getRdfTermColumn(aBindingSet: any): string | undefined {
    let foundKey: string | undefined = undefined;
    for (const key of Object.keys(aBindingSet)) {
        if (key != "label") {
            if (!foundKey) {
            foundKey = key;
            } else {
            // it means there are more than one column, don't know which one to take, break
            return undefined;
            }
        }
    }
    return foundKey;
  }

}


/**
 * Implementation of ListDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlListDataProvider extends BaseSparqlListDataProvider implements ListDataProviderIfc {
    
    queryBuilder:ListSparqlQueryBuilderIfc;

    constructor(
        sparqlHandler:SparqlHandlerIfc,
        queryBuilder: ListSparqlQueryBuilderIfc
    ) {
        super(sparqlHandler); 
        this.queryBuilder = queryBuilder;
               
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
        super.doExecuteWithCallback(
            sparql,
            callback,
            errorCallback
        );
  }

}


export class SparqlValuesListDataProvider extends BaseSparqlListDataProvider implements ValuesListDataProviderIfc {
    
    queryBuilder:ValuesListSparqlQueryBuilderIfc;

    constructor(
        sparqlHandler:SparqlHandlerIfc,
        queryBuilder: ValuesListSparqlQueryBuilderIfc
    ) {
        super(sparqlHandler);  
        this.queryBuilder = queryBuilder;      
    }


    getListContent(
        values:Term[],
        callback:(items:RdfTermDatasourceItem[]) => void,
        errorCallback?:(payload:any) => void
    ):void {
        // 1. create the SPARQL
        let sparql = this.queryBuilder.buildSparqlQuery(
            values,
            this.lang,
            this.defaultLang,
            this.typePredicate
        );

        // 2. execute it
        super.doExecuteWithCallback(
            sparql,
            callback,
            errorCallback
        );
  }

}


/**
 * Implementation of AutocompleteDataProviderIfc that executes a SPARQL query against an endpoint,
 * and read the 'uri' and 'label' columns.
 */
export class SparqlAutocompleDataProvider
  implements AutocompleteDataProviderIfc
{
  lang: string;
  defaultLang: string;
  typePredicate: string;

    queryBuilder:AutocompleteSparqlQueryBuilderIfc;
    sparqlHandler:SparqlHandlerIfc;

    constructor(
        sparqlHandler: SparqlHandlerIfc,
        queryBuilder: AutocompleteSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlHandler = sparqlHandler;
    }

    init(lang: string, defaultLang: string, typePredicate: string): void {
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
      this.sparqlHandler.executeSparql(sparql,(data:{results:{bindings:any}}) => {
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

  getRdfTermColumn(aBindingSet: any): string | undefined {
    let foundKey: string | undefined = undefined;
    for (const key of Object.keys(aBindingSet)) {
      if (key != "label") {
        if (!foundKey) {
          foundKey = key;
        } else {
          // it means there are more than one column, don't know which one to take, break
          return undefined;
        }
        return foundKey;
      }
    }
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

export class SparqlTreeDataProvider implements TreeDataProviderIfc {
   
    lang: string;
    defaultLang: string;
    typePredicate: string;

    queryBuilder:TreeSparqlQueryBuilderIfc;
    sparqlHandler:SparqlHandlerIfc;


    constructor(
        sparqlHandler:SparqlHandlerIfc,
        queryBuilder: TreeSparqlQueryBuilderIfc
    ) {
        this.queryBuilder = queryBuilder;
        this.sparqlHandler = sparqlHandler;        
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
        this.sparqlHandler.executeSparql(
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
    this.sparqlHandler.executeSparql(
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
 * @param items Merges the datasource items based on their equality, in the case that multiple groups
 * (= multiple datasets) return the same RDF term (= the same URI or literal value). In that case a single result is kept,
 * with a group that is the concatenation of the groups of the merged items.
 * @returns a new list of datasource items in which the items have been merge based on their rdfTerm equality.
 */
export function mergeDatasourceResults(items:RdfTermDatasourceItem[]):RdfTermDatasourceItem[] {
    let result:RdfTermDatasourceItem[] = new Array<RdfTermDatasourceItem>();

    // iterate on each item
    items.forEach(item => {
        // if it wasn't already added...
        if(!result.some(itemInResult => sameTerm(itemInResult.term, item.term))) {
            // find all items with the same URI
            let sameTerms = items.filter(i => sameTerm(item.term, i.term));
            // add the first identical item of this in our result table, with a merged group
            let newTerm:RdfTermDatasourceItem = {
                term: sameTerms[0].term,
                label : sameTerms[0].label,
                itemLabel: sameTerms[0].itemLabel,
                group: sameTerms.map(i => i.group).join(" + ")
            }
            result.push(newTerm);
        }

    });

    return result;
}
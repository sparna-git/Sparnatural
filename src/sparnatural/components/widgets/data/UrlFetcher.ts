import LocalCacheData from "../../../datastorage/LocalCacheData";
import { Catalog } from "../../../settings/Catalog";


/**
 * Fetches a URL
 */
export class UrlFetcher {

    private localCacheDataTtl:number;
    // private extraHeaders: Map<string, string>;
    private extraHeaders: any;

    // private constructor
    public constructor(localCacheDataTtl:any, extraHeaders:Map<string,string>) {
        this.localCacheDataTtl = localCacheDataTtl;
        this.extraHeaders = extraHeaders;
    }

    fetchUrl(
        url:string,
        callback: (data: {}) => void,
        errorCallback?:(error: any) => void
    ): void {
    
        var headers = new Headers();
        if(this.extraHeaders) {
            // honor extra headers
            for (const k in this.extraHeaders) {
                headers.append(k, this.extraHeaders[k]);
            }
        }
        headers.append(
            "Accept",
            "application/sparql-results+json, application/json, */*;q=0.01"
        );
        let init = {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default"
        };
        
        let temp = new LocalCacheData();
        try {
            let fetchpromise:Promise<Response> = temp.fetch(url, init, this.localCacheDataTtl);        
            fetchpromise
            .then((response: Response) => {
                if (!response.ok) {
                    if(errorCallback) errorCallback(response);
                }
                return response.json();
            })
            .catch((error) => {
                if(errorCallback) errorCallback("There was a problem calling "+url);
            })
            .then((data: any) => {
                if(data) callback(data);
            });
        } catch (error) {
            if(errorCallback) errorCallback("There was a problem calling "+url);
        }
    }

}

export interface SparqlHandlerIfc {
    executeSparql(
        sparql:string,
        callback: (data: any) => void,
        errorCallback?:(error: any) => void
    ):void;
}

export class SparqlHandlerFactory {

    protected catalog:Catalog;
    protected lang:string;
    protected localCacheDataTtl:any;
    protected extraHeaders:Map<string,string>;

    constructor(
        catalog:Catalog,
        lang:string,
        localCacheDataTtl:any,
        extraHeaders:Map<string,string>
    ) {
        this.catalog = catalog;
        this.lang = lang;
        this.localCacheDataTtl = localCacheDataTtl;
        this.extraHeaders = extraHeaders;
    }

    buildSparqlHandler(endpoints:string[]):SparqlHandlerIfc {   
        // if more than one endpoint
        if(endpoints.length > 1) {
            // extract selected endpoints from full catalog
            let subCatalog = this.catalog.extractSubCatalog(endpoints);
            return new MultipleEndpointSparqlFetcher(
                new UrlFetcher(this.localCacheDataTtl, this.extraHeaders),
                subCatalog,
                this.lang
            );
        } else {
            // only one single endpoint
            let endpoint:string = endpoints[0]
            return new EndpointSparqlHandler(new UrlFetcher(this.localCacheDataTtl, this.extraHeaders), endpoint);
        }
    }

}

/**
 * Executes a SPARQL query against a remote endpoint at a known URL
 */
export class EndpointSparqlHandler implements SparqlHandlerIfc {

    urlFetcher:UrlFetcher;
    sparqlEndpointUrl: any;
  
    constructor(
        urlFetcher:UrlFetcher,
        sparqlEndpointUrl: any
    ) {
        this.urlFetcher = urlFetcher,
        this.sparqlEndpointUrl = sparqlEndpointUrl;
    }

    buildUrl(sparql:string):string {
        var separator = this.sparqlEndpointUrl.indexOf("?") > 0 ? "&" : "?";

        var url =
            this.sparqlEndpointUrl +
            separator +
            "query=" +
            encodeURIComponent(sparql) +
            "&format=json";

        return url;
    }

    executeSparql(
        sparql:string,
        callback: (data: {}) => void,
        errorCallback?:(error: any) => void
    ):void {
        let url = this.buildUrl(sparql);

        this.urlFetcher.fetchUrl(
            url,
            callback,
            errorCallback
        );
    }
}


export class MultipleEndpointSparqlFetcher implements SparqlHandlerIfc {

    urlFetcher:UrlFetcher;
    catalog: Catalog;
    addExtraEndpointColumn:boolean;
    // name of the extra column to add in the result set to express the endpoint
    extraColumnName = "group";
    lang:string;
  
    constructor(
        urlFetcher:UrlFetcher,
        catalog: Catalog,
        lang:string
    ) {
        this.urlFetcher = urlFetcher,
        this.catalog = catalog;
        this.addExtraEndpointColumn = true;
        this.lang = lang;
    }

    executeSparql(
        sparql:string,
        callback: (data: any) => void,
        errorCallback?:(error: any) => void
    ):void {

        const promises:Promise<{}>[] = [];
        for(const i in this.catalog.getServices()) {
            console.log("Calling "+this.catalog.getServices()[i].getEndpointURL())
            let fetcher = new EndpointSparqlHandler(this.urlFetcher, this.catalog.getServices()[i].getEndpointURL());

            promises[promises.length] = new Promise((resolve, reject) => {
                fetcher.executeSparql(
                    sparql,
                    (data: any) =>{resolve({ endpoint: this.catalog.getServices()[i], sparqlResult: data })},
                    (error: any)=>{reject(error)}
                )
            });         
        }

        // then wait for all Promises        
        Promise.all(promises).then((values:any[]) => {
          let finalResult:any = {};
          
          // copy the same head as first result, with an extra "endpoint" column
          finalResult.head = values[0].sparqlResult.head;
          finalResult.head.vars.push(this.extraColumnName);

          // prepare the "results" section
          finalResult.results = {
            // same distinct as first result
            distinct: values[0].sparqlResult.results.distinct,
            // never ordered
            ordered: false,
            // prepare bindings section
            bindings: []
          };

          // then for each SPARQL results of structure {endpoint : xx, sparqlJson: {...}}
          for (const v of values) {            
            // add an extra "endpoint" column with the endpoint at the end of each binding
            finalResult.results.bindings.push(
              // remap each binding to add the endpoint column at the end
              // then unpack the array
              ...v.sparqlResult.results.bindings.map((b: { [x: string]: { type: string; value: any; }; }) => {
                if(this.addExtraEndpointColumn) {
                    b[this.extraColumnName] = {type: "literal", value:v.endpoint.getTitle(this.lang)};
                }
                return b;
              })
            );
          }
          
          // TODO : handle errors
          // and then call the callback
          callback(finalResult);
        });        
    }
}
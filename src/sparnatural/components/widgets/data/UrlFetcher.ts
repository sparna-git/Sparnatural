import LocalCacheData from "../../../datastorage/LocalCacheData";
import ISettings from "../../../settings/ISettings";


/**
 * Fetches a URL
 */
export class UrlFetcher {

    private localCacheDataTtl:number;
    // private extraHeaders: Map<string, string>;
    private extraHeaders: any;

    // private constructor
    private constructor(localCacheDataTtl:any, extraHeaders:Map<string,string>) {
        this.localCacheDataTtl = localCacheDataTtl;
        this.extraHeaders = extraHeaders;
        
    }

    // static factory builder method from settings
    static build(settings:ISettings):UrlFetcher {
        return new UrlFetcher(settings.localCacheDataTtl, settings.headers);
    }

    fetchUrl(
        url:string,
        callback: (data: {}) => void,
        errorCallback?:(error: any) => void
    ): void {
    
        var headers = new Headers();
        // honor extra headers
        for (const k in this.extraHeaders) {
            headers.append(k, this.extraHeaders[k]);
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

/**
 * Executes a SPARQL query against the triplestore
 */
export class SparqlFetcher {

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
        callback: (data: any) => void,
        errorCallback?:(error: any) => void
    ) {
        let url = this.buildUrl(sparql);

        this.urlFetcher.fetchUrl(
            url,
            callback,
            errorCallback
        );
    }
}


export class MultipleEndpointSparqlFetcher {

    urlFetcher:UrlFetcher;
    sparqlEndpointUrls: string[];
  
    constructor(
        urlFetcher:UrlFetcher,
        sparqlEndpointUrls: string[]
    ) {
        this.urlFetcher = urlFetcher,
        this.sparqlEndpointUrls = sparqlEndpointUrls;
    }

    #buildUrl(endpoint:string, sparql:string):string {
        var separator = endpoint.indexOf("?") > 0 ? "&" : "?";

        var url =
            endpoint +
            separator +
            "query=" +
            encodeURIComponent(sparql) +
            "&format=json";

        return url;
    }

    executeSparql(
        sparql:string,
        callback: (data: any) => void,
        errorCallback?:(error: any) => void
    ) {

        const promises:Promise<{}>[] = [];
        for(const e in this.sparqlEndpointUrls) {
            let url = this.#buildUrl(e,sparql);

            // build array of Promises
            promises[promises.length] = new Promise((resolve, reject) => {
                this.urlFetcher.fetchUrl(
                    url,
                    (data: any) =>{resolve({ endpoint: e, sparqlResult: data })},
                    (error: any)=>{reject(error)}
                )
            });            
        }

        // then wait for all Promises
        let finalResult:any = {};
        Promise.all(promises).then((values:any) => {
          // copy the same head as first result, with an extra "endpoint" column
          finalResult.head = values[0].sparqlResult.head;
          finalResult.head.vars.push("endpoint");

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
              ...v.sparqlJson.results.bindings.map((b: { endpoint: { type: string; value: any; }; }) => {
                b.endpoint = {type: "uri", value:v.endpoint};
                return b;
              })
            );
          }
        });

        // and then call the callback
        callback(finalResult);

        // TODO : handle errors
    }
}
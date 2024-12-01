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
        return this.fetchUrlWithParameters(
            url,
            {},
            callback,
            errorCallback
        );
    }

    fetchUrlWithParameters(
        url:string,
        providedParameters:{},
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

        
        let defaultParameters = {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default"
        };

        let parameters = {
            ...defaultParameters,
            ...providedParameters
        }
        
        let temp = new LocalCacheData();
        try {
            let fetchpromise:Promise<Response> = temp.fetch(url, parameters, this.localCacheDataTtl);        
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
import { getSettings } from "../../../settings/defaultSettings";
import AbstractHandler from "../AbstractHandler";

export interface ListDataSourceResult {
  label: { value: string } 
  uri: { value: string },
  value: { value: string }
}

export abstract class AbstractSparqlListHandler extends AbstractHandler {
    constructor(
      sparqlEndpointUrl: string,
      semanticPostProcess: (sparql: any) => string,
      language: string,
      searchPath: string
    ) {
      super(sparqlEndpointUrl, semanticPostProcess, language, language);
    }
  
    abstract listUrl(domain: string, property: string, range: string): string;
}

/**
 * Handles a list widget based on a provided SPARQL query in which
 * $domain, $property and $range will be replaced by actual values.
 **/
export class SparqlTemplateListHandler extends AbstractSparqlListHandler {
    queryString: any;
    constructor(
      sparqlEndpointUrl: string,
      semanticPostProcess: (sparql: any) => string,
      language: string,
      queryString: string
    ) {
      super(sparqlEndpointUrl, semanticPostProcess, language, null);
      this.queryString = queryString;
    }
    /**
     * Constructs the SPARQL query to use for list widget search.
     **/
    listUrl(domain: string, property: string, range: string): string {
      var reDomain = new RegExp("\\$domain", "g");
      var reProperty = new RegExp("\\$property", "g");
      var reRange = new RegExp("\\$range", "g");
      var reLang = new RegExp("\\$lang", "g");
      var sparql = this.queryString
        .replace(reDomain, "<" + domain + ">")
        .replace(reProperty, "<" + property + ">")
        .replace(reRange, "<" + range + ">")
        .replace(reLang, "'" + this.language + "'");
      sparql = sparql.replace("\\", "");
      return this.buildURL(sparql);
    }

    buildHttpRequest() {

      var headers = new Headers();
      headers.append(
          "Accept",
          "application/sparql-results+json, application/json, */*;q=0.01"
      );
      let requestOptions = {
          method: "GET",
          headers: headers,
          mode: "cors",
          cache: "default",
      } as {[key:string]:any};
  
      const config = getSettings().dataEndpoints.find((val)=>{
      if(val?.endpoint === this.sparqlEndpointUrl)
      return val
      })
      
      if(config) {
          // the sparqlEndpointUrl equals an endpoint in Settings.dataEndpoints
          for (const [key, value] of Object.entries(config)) {
              if(key === 'endpoint') {
                  if (typeof value !== 'string') {
                      console.error('endpoint in dataEndpoints must be a string!')
                  }
                  this.sparqlEndpointUrl = value as string
              } else {
                  requestOptions[key] = value
              }
              
          }
      } 
  
          return requestOptions
      }
}
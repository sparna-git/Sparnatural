
export interface DataSourceResult {
    label: { value: string } 
    uri: { value: string },
    value: { value: string } 
}

export default abstract class AbstractHandler {
    sparqlEndpointUrl;
    semanticPostProcess;
    language;
    searchPath;
    listOrder;
  
    constructor(
      sparqlEndpointUrl: string,
      semanticPostProcess: (sparql: any) => string,
      language: string,
      searchPath: string
    ) {
      this.sparqlEndpointUrl = sparqlEndpointUrl;
      this.semanticPostProcess = semanticPostProcess;
      this.language = language;
      this.searchPath = searchPath != null ? searchPath : "rdfs:label";
      this.listOrder = "alphabetical";
    }
    /**
     * Post-processes the SPARQL query and builds the full URL for list content
     **/
    buildURL(sparql: string): string {
      sparql = this.semanticPostProcess(sparql);
      var separator = this.sparqlEndpointUrl.indexOf("?") > 0 ? "&" : "?";
  
      var url =
        this.sparqlEndpointUrl +
        separator +
        "query=" +
        encodeURIComponent(sparql) +
        "&format=json";
      return url;
    }
    listLocation(
      domain: string,
      property: string,
      range: string,
      data: { results: { bindings: any } }
    ) {
      return data.results.bindings;
    }
  
    elementLabel(element: DataSourceResult) {
      return element.label.value;
    }
  
    /* TODO : rename to elementValue */
    elementUri(element: DataSourceResult) {
      if (element.uri) {
        return element.uri.value;
      } else if (element.value) {
        return element.value.value;
      }
    }
    abstract buildHttpRequest(): {[key:string]:any}
  
  }
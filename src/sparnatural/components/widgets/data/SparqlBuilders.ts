
export interface ListSparqlQueryBuilderIfc  {

    buildSparqlQuery(
        domain:string,
        predicate:string,
        range:string,
        language: any,
        defaultLanguage: any,
        typePath: string
    ):string;

}

export class ListSparqlTemplateQueryBuilder implements ListSparqlQueryBuilderIfc {
    
    queryString: string;
    sparqlPostProcessor: any;

    constructor(
        queryString: string,
        sparqlPostProcessor: any,

    ) {
        this.queryString = queryString;
        this.sparqlPostProcessor = sparqlPostProcessor;
    }

    buildSparqlQuery(
        domain: string,
        property: string,
        range: string,        
        language: any,
        defaultLanguage: any,
        typePath: string
    ): string {
        var reDomain = new RegExp("\\$domain", "g");
        var reProperty = new RegExp("\\$property", "g");
        var reRange = new RegExp("\\$range", "g");
        var reLang = new RegExp("\\$lang", "g");
        var reDefaultLang = new RegExp("\\$defaultLang", "g");
        var reType = new RegExp("\\$type", "g");
    
        var sparql = this.queryString
          .replace(reDomain, "<" + domain + ">")
          .replace(reProperty, "<" + property + ">")
          .replace(reRange, "<" + range + ">")
          .replace(reLang, "'" + language + "'")
          .replace(reDefaultLang, "'" + defaultLanguage + "'")
          .replace(reType, typePath);
          
        sparql = this.sparqlPostProcessor.semanticPostProcess(sparql);

        return sparql;
    }

}

export interface AutocompleteSparqlQueryBuilderIfc  {

    buildSparqlQuery(
        domain:string,
        predicate:string,
        range:string,
        key:string,
        language: any,
        defaultLang : any,
        typePath: string
    ):string;

}

export class AutocompleteSparqlTemplateQueryBuilder implements AutocompleteSparqlQueryBuilderIfc {
    
    queryString: string;
    sparqlPostProcessor: any;

    constructor(
        queryString: string,
        sparqlPostProcessor: any,

    ) {
        this.queryString = queryString;
        this.sparqlPostProcessor = sparqlPostProcessor;
    }

    buildSparqlQuery(
        domain: string,
        property: string,
        range: string,
        key:string,        
        language: any,
        defaultLanguage : any,
        typePath: string
    ): string {
        var reDomain = new RegExp("\\$domain", "g");
        var reProperty = new RegExp("\\$property", "g");
        var reRange = new RegExp("\\$range", "g");
        var reKey = new RegExp("\\$key", "g");
        var reLang = new RegExp("\\$lang", "g");
        var reDefaultLang = new RegExp("\\$defaultLang", "g");
        var reType = new RegExp("\\$type", "g");
    
        var sparql = this.queryString
          .replace(reDomain, "<" + domain + ">")
          .replace(reProperty, "<" + property + ">")
          .replace(reRange, "<" + range + ">")
          .replace(reKey, "" + key + "")
          .replace(reLang, "'" + language + "'")
          .replace(reDefaultLang, "'" + defaultLanguage + "'")
          .replace(reType, typePath);
          
        sparql = this.sparqlPostProcessor.semanticPostProcess(sparql);

        return sparql;
    }

}
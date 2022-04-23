export default interface Settings  {
    config: string,
    language: string,
    addDistinct?: boolean,
    typePredicate?: string,
    maxDepth?: number,
    maxOr?: number,
    sendQueryOnFirstClassSelected?: boolean,
    backgroundBaseColor?: string, //TODO '250,136,3'
    sparqlPrefixes?: any,
    defaultEndpoint?: any,
    localCacheDataTtl?: number, 
    filterConfigOnEndpoint?: boolean,
    langSearch:any
    autocomplete:any //Handler function
    list:any //Handler function
    dates:any //Handler function?
    tooltipConfig?:any
    statistics:{
        countClassUrl: (aClass:any) =>void,
        countPropertyUrl : (domain, property, range) => void,
        countPropertyWithoutRangeUrl : (domain, property) => void,
        elementCount: (data) => void
    }
    onQueryUpdated: (queryString, queryJson,pivotJson?) => void
    onSubmit:(form:any)=>void
}
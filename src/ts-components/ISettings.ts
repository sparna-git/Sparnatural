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
}
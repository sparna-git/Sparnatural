import Tab from "@triply/yasgui"
export default interface Settings  {
    currentTab?: Tab,
    noTypeCriteriaForObjects:any,
    config: any,
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
        countPropertyUrl : (domain:any, property:any, range:any) => void,
        countPropertyWithoutRangeUrl : (domain:any, property:any) => void,
        elementCount: (data:any) => void
    }
    onQueryUpdated: (queryString:any, queryJson:any,pivotJson?:any) => void
    onSubmit:(form:any)=>void
}
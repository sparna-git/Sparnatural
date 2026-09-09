   /**
   * {
   *   queryString: "...",
   *   queryTemplate: "...",
   *   labelPath: "...",
   *   labelProperty: "...",
   *   childrenPath: "...",
   *   childrenProperty: "...",
   *   noSort: true
   * }
   **/
export interface IDatasource {
  queryString?: string;
  queryTemplate?: any;
  labelPath?: any;
  labelProperty?: any;
  childrenPath?: any;
  childrenProperty?: any;
  sparqlEndpointUrl?: any;
  noSort?: boolean;
}
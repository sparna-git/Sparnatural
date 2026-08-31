   /**
   * {
   *   queryString: "...",
   *   queryTemplate: "...",
   *   labelPath: "...",
   *   labelProperty: "...",
   *   descriptionPath: "...",
   *   descriptionProperty: "...",
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
  // only used by the query templates that read a description
  descriptionPath?: any;
  descriptionProperty?: any;
  childrenPath?: any;
  childrenProperty?: any;
  sparqlEndpointUrl?: any;
  noSort?: boolean;
}
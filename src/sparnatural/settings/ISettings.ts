import {  DataSourceResult } from "../components/widgets/AbstractHandler";

interface ISettings {
  config: {[key:string]:any};
  language: string;
  addDistinct?: boolean;
  limit?:number;
  typePredicate?: string;
  maxDepth: number;
  maxOr: number;
  sparqlPrefixes?: { [key: string]: string };
  defaultEndpoint?: string;
  localCacheDataTtl?: number;
  dataEndpoints:Array<{
    endpoint: string;
    credentials: "omit" | "same-origin" | "include";
    cache: "default" | "reload" | "no-cache";
    mode: "cors" | "no-cors" | 'same-origin' | 'navigate';
    method: "GET" | "POST"
    headers:{
      [key: string]: string;
    }
  }>;
  // TODO : this should not be exposed.
  // Only the language parametre is exposed, but the actual labels content should not
  langSearch?: any;
  debug: boolean;
  submitButton?: boolean;
  autocomplete?:AutocompleteHook;
  list?:ListHook;
  dates?: DatesHook
}

export interface PreLoadQueries {
  queries: Array<{ queryName: string; query: string }>;
}

// LowLevelHook is providing callbacks instead of an AbstractHandler
export interface LowLevelHook {
  elementLabel: (element: DataSourceResult) => string;
}

export interface ListHook extends LowLevelHook {
  listUrl: (domain: string, property: string, range: string) => string;
  elementUri: (element: DataSourceResult) => string;
  listLocation: (domain: string, property: string, range: string, data: {
    results: {
        bindings: any;
    };
  }) => {
      results: {
          bindings: any;
      };
  }
}

export interface AutocompleteHook extends LowLevelHook {
  [x: string]: any;
  autocompleteUrl: (domain: string, property: string, range: string, key: string) => string;
  elementUri: (element: DataSourceResult) => string;
  getData: (domain: string, property: string, range: string) => {
    label:string;
    uri:string;
  };
}

export interface DatesHook extends LowLevelHook {
  datesUrl: (domain: string, property: string, range: string, key: string) => string;

  elementStart: (element: {
      start: {
          year: number;
      };
  }) => number;
  elementEnd: (element: {
      stop: {
          year: number;
      };
  }) => number;
}

export default ISettings;

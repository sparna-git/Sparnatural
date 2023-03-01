import SparnaturalComponent from "../components/SparnaturalComponent";

export interface PreLoadQueries {
  queries: Array<{ queryName: string; query: string }>;
}

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
  autocomplete?:{
    autocompleteUrl: (domain: any, property: any, range: any, key: any) => void,
    listLocation: (domain: any, property: any, range: any, data: any) => any,
    elementLabel: (element: any) => any,
    elementUri: (element: any) => any,
    enableMatch: (domain: any, property: any, range: any) => boolean
  };
  list?: {
    listUrl: (domain: any, property: any, range: any) => void,
    listLocation: (domain: any, property: any, range: any, data: any) => any,
    elementLabel: (element: any) => any,
    elementUri: (element: any) => any
  };
  dates?: any;  
}

export default ISettings;

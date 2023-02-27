import SparnaturalComponent from "../components/SparnaturalComponent";

export interface PreLoadQueries {
  queries: Array<{ queryName: string; query: string }>;
}

interface ISettings {
  config: any;
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
    endpoint:string;
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
  autocomplete?: any;
  list?: any;
  dates?: any;  
}

export default ISettings;

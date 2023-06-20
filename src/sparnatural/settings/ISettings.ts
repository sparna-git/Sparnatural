import SparnaturalComponent from "../components/SparnaturalComponent";

export interface PreLoadQueries {
  queries: Array<{ queryName: string; query: string }>;
}

interface ISettings {
  config: any;
  language: string;
  defaultLanguage: string;
  addDistinct?: boolean;
  limit?:number;
  typePredicate?: string;
  maxDepth: number;
  maxOr: number;
  sparqlPrefixes?: { [key: string]: string };
  defaultEndpoint?: string;
  localCacheDataTtl?: number;
  // TODO : this should not be exposed.
  // Only the language parametre is exposed, but the actual labels content should not
  langSearch?: any;
  debug: boolean;
  submitButton?: boolean;
  autocomplete?: any;
  list?: any;
  dates?: any;  
  headers?: any;
}

export default ISettings;

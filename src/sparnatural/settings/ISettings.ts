import SparnaturalComponent from "../components/SparnaturalComponent";

export interface PreLoadQueries {
  queries: Array<{ queryName: string; query: string }>;
}

interface ISettings {
  src: any;
  language: string;
  defaultLanguage: string;
  addDistinct?: boolean;
  limit?:number;
  typePredicate: string;
  maxDepth: number;
  maxOr: number;
  sparqlPrefixes?: { [key: string]: string };
  defaultEndpoint?: string;
  catalog?: string;
  localCacheDataTtl?: number;
  debug: boolean;
  submitButton?: boolean;
  headers?: any;
  datasources? : {
    autocomplete: any,
    list: any,
    tree: {
      roots: any,
      children: any
    }
  }
}

export default ISettings;

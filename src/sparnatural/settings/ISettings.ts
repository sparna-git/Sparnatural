import SparnaturalComponent from "../components/SparnaturalComponent";
import { AutocompleteDataProviderIfc, ListDataProviderIfc, TreeDataProviderIfc } from "../components/widgets/data/DataProviders";

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
  configuration? : {
    headers?: any;
    autocomplete?: {
      dataProvider?: AutocompleteDataProviderIfc,
      maxItems?: number
    },
    list?: {
      datasource?: ListDataProviderIfc["getListContent"],
    },   
    tree?: {
      rootsDatasource: TreeDataProviderIfc["getRoots"],
      childrenDatasource: TreeDataProviderIfc["getChildren"]
    }
  }
}

export default ISettings;

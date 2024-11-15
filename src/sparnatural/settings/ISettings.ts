import { AutocompleteConfiguration } from "../components/widgets/AutoCompleteWidget";
import { SparqlHandlerIfc } from "../components/widgets/data/SparqlHandler";
import { ListConfiguration } from "../components/widgets/ListWidget";
import { MapConfiguration } from "../components/widgets/MapWidget";
import { NumberConfiguration } from "../components/widgets/NumberWidget";
import { TreeConfiguration } from "../components/widgets/treewidget/TreeWidget";

interface ISettings {
  src: any;
  language: string;
  defaultLanguage: string;
  addDistinct?: boolean;
  limit?: number;
  typePredicate: string;
  maxDepth: number;
  maxOr: number;
  sparqlPrefixes?: { [key: string]: string };
  endpoints?: string[];
  catalog?: string;
  localCacheDataTtl?: number;
  debug: boolean;
  submitButton?: boolean;
  customization? : {
    autocomplete?: Partial<AutocompleteConfiguration>,
    list?: Partial<ListConfiguration>,   
    tree?: Partial<TreeConfiguration>,
    number?: Partial<NumberConfiguration>,
    map?: Partial<MapConfiguration>,
    headers?: Map<string,string>,
    sparqlHandler?: SparqlHandlerIfc
  }
}

export default ISettings;

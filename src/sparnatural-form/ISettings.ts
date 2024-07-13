import { AutocompleteConfiguration } from "../sparnatural/components/widgets/AutoCompleteWidget";
import { ListConfiguration } from "../sparnatural/components/widgets/ListWidget";
import { MapConfiguration } from "../sparnatural/components/widgets/MapWidget";
import { NumberConfiguration } from "../sparnatural/components/widgets/NumberWidget";
import { TreeConfiguration } from "../sparnatural/components/widgets/treewidget/TreeWidget";

interface ISettings {
  src: any;
  language: string;
  defaultLanguage: string;
  query:string;
  form:string;
  typePredicate: string;
  customization? : {
    headers?: Map<string,string>;
    autocomplete?: Partial<AutocompleteConfiguration>,
    list?: Partial<ListConfiguration>,   
    tree?: Partial<TreeConfiguration>,
    number?: Partial<NumberConfiguration>,
    map?: Partial<MapConfiguration>
  }
}

export default ISettings;

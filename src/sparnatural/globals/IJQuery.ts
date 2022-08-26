
export {};
declare global {
  // Custom type definitions for the jquery.nice-select plugin
  // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/dc178ad6fe32416622ec37de703bb72279ab4bb4/types/jquery/README.md#authoring-type-definitions-for-jquery-plugins
  interface JQuery {
    niceSelect: (method?: any, settings?: any) => JQuery<HTMLElement>;
    getSelectedItemData: () => void;
    easyAutocomplete: (options: any) => void;
    datepicker: (method: any) => Date;
    jstree: (options: any) => any;
  }
}

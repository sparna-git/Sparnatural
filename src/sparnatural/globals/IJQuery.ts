
export {};
declare global {
  interface JQuery {
    getSelectedItemData: () => void;
    easyAutocomplete: (options: any) => void;
    datepicker: (method: any) => Date;
    jstree: (options: any) => any;
  }
}

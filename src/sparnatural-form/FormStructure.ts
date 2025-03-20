export interface Form {
  bindings: Binding[];
  // the variables config of the form, more specifically the list of variables
  // that we want to keep for an on-screen display
  variables?: {
    onscreen?: string[];
  };
}

/**
 * An association between a variable name and a form field
 */
export interface Binding {
  variable: string;
  node: Node;
}

export interface Node {
  type: string;
  name: Name;
  help?: Name;
}

export interface Name {
  en: string;
  fr: string;
}

export interface Form {
  bindings: Binding[];
}

export interface Binding {
  variable: string;
  node: Node;
}

export interface Node {
  type: string;
  name: Name;
}

export interface Name {
  en: string;
  fr: string;
}

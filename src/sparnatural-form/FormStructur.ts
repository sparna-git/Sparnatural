export class Form {
  bindings: Binding[];

  constructor(bindings: Binding[]) {
    this.bindings = bindings;
  }
}

export class Binding {
  variable: string;
  node: Node;
  constructor(variable: string, node: Node) {
    this.variable = variable;
    this.node = node;
  }
}
export class Node {
  type: string;
  name: Name;
  constructor(type: string, name: Name) {
    this.type = type;
    this.name = name;
  }
}

export class Name {
  en: string;
  fr: string;
  constructor(en: string, fr: string) {
    this.en = en;
    this.fr = fr;
  }
}

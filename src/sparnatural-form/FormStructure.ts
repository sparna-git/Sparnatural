export class Form {
    bindings: Binding[];

    constructor(bindings: Binding[]) {
        this.bindings = bindings;
    }
}

export class Binding {
    variable: string;
    node: {
        type: string;
        name: {
            en: string;
            fr: string;
        };
    };

    constructor(variable: string, node: any) {
        this.variable = variable;
        this.node = node;
    }
}

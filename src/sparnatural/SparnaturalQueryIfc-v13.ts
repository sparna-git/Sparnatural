


export type SparnaturalQuery = {
  type: 'query';
  subType: 'select';
  context: ContextDefinition[];
  // variables: (TermVariable | PatternBind)[] | [Wildcard];
  // idea : we could support Wildcard, in this case all variables get selected
  variables: (TermVariable | PatternBind)[];
  solutionModifiers: SolutionModifiers;
  distinct?: true;
  where: PatternBgpSameSubject;
};

export type PatternBind = PatternBase & {
  subType: 'bind';
  expression: Expression;
  variable: TermVariable;
};



export type TermBase = { type: 'term'; subType: string };
export type TermLiteralBase = TermBase & {
  subType: 'literal';
  value: string;
};
export type TermLiteralStr = TermLiteralBase & { langOrIri: undefined };
export type TermLiteralLangStr = TermLiteralBase & { langOrIri: string };
export type TermLiteralTyped = TermLiteralBase & { langOrIri: TermIri };
export type TermLiteral = TermLiteralStr | TermLiteralLangStr | TermLiteralTyped;

export type TermVariable = TermBase & {
  subType: 'variable';
  value: string;
};

export type TermIriBase = TermBase & { subType: 'namedNode' };
export type TermIriFull = TermIriBase & { value: string };
export type TermIri = TermIriFull;

// Specific labelled IRI
export type TermLabelledIri = TermIriFull & { label: string; };

// Specific typed variables
export type TermTypedVariable = TermVariable & { class: TermIri };

export type GraphTerm = TermIri | TermLiteral | TermLabelledIri;
export type Term = GraphTerm | TermVariable | TermTypedVariable;


export type PatternBase = { type: 'pattern'; subType: string };

export type PatternBgpSameSubject = PatternBase & {
  subType: 'bgpSameSubject';
  subject: TermTypedVariable;
  predicateObjectPairs: PredicateObjectPair[];
};

export type PredicateObjectPair = {
  type: 'predicateObjectPair';
  predicate: TermIri;
  objects: ObjectCriteria[];
};


export type ObjectCriteria = {
  type: 'objectCriteria';
  variable: TermTypedVariable;
  // the name of the variable is repeated at each row
  values?:ValuePatternRow[];
  filters?: LabelledFilter[];
  predicateObjectPairs?: PredicateObjectPair[];
};

export type LabelledFilter = {
  label: string;
  filter:  
    DateFilter | 
    MapFilter | 
    NumberFilter | 
    SearchFilter;
}

export interface DateFilter {
  // a date string in ISO format
  // e.g. "2023-10-05T14:48:00.000Z"
  // or for just a year "2023" or "-0450" (for 450 BC)
  // undefined if not set
  start?: string | undefined;
  stop?: string | undefined;
};

export interface MapFilter {
  coordType: 'Polygon' | 'Rectangle';
  coordinates: LatLng[][];
}

export interface NumberFilter {
  // either min or max need to be defined
  min?: number | undefined;
  max?: number | undefined;
}

export interface SearchFilter {
  // this is interpreted as a regexp when using plain SPARQL queries
  // or as a fulltext search string when using a triplestore with fulltext search capabilities
  search: string;
}

export interface LatLng {
  lat: number;
  lng: number;
  alt?: number | undefined;
}




export type ExpressionBase = Node & { type: 'expression'; subType: string };

type ExpressionAggregateBase = ExpressionBase & {
  subType: 'aggregate';
  distinct: boolean;
  expression: [Expression];
};
export type ExpressionAggregateDefault = ExpressionAggregateBase & {
  expression: [Expression];
  aggregation: string;
};
export type ExpressionAggregateSeparator = ExpressionAggregateBase & {
  expression: [Expression];
  aggregation: string;
  separator: string;
};
export type ExpressionAggregate =
  | ExpressionAggregateDefault
  | ExpressionAggregateSeparator;

export type ExpressionOperation = ExpressionBase & {
  subType: 'operation';
  operator: string;
  args: Expression[];
};

export type ExpressionFunctionCall = ExpressionBase & {
  subType: 'functionCall';
  function: TermIri;
  distinct: boolean;
  args: Expression[];
};

export type Expression =
  | ExpressionOperation
  | ExpressionFunctionCall
  | ExpressionAggregate
  | TermIri
  | TermVariable
  | TermLiteral;




export type ContextDefinitionBase_ = Node & { type: 'contextDef'; subType: string };
export type ContextDefinitionPrefix = ContextDefinitionBase_ & {
  subType: 'prefix';
  key: string;
  value: TermIriFull;
};
export type ContextDefinitionBase = ContextDefinitionBase_ & {
  subType: 'base';
  value: TermIriFull;
};
export type ContextDefinition = ContextDefinitionPrefix | ContextDefinitionBase;  






export type SolutionModifierBase = Node & { type: 'solutionModifier'; subType: string };
export type Ordering = {
  descending: boolean;
  expression: Expression;
};
export type SolutionModifierOrder = SolutionModifierBase & {
  subType: 'order';
  orderDefs: Ordering[];
};
export type SolutionModifierLimitOffset = SolutionModifierBase
  & { subType: 'limitOffset'; limit: number };
export type SolutionModifier =
  | SolutionModifierOrder
  | SolutionModifierLimitOffset;
export type SolutionModifiers = {
  order?: SolutionModifierOrder;
  limitOffset?: SolutionModifierLimitOffset;
};


/**
 * A single list of assignments maps the variable identifier to the value
 * 
 VALUES (?x ?y) { (ex:Museum1 "foo") }

"values": [
{
  "x": {
    "type": "term",
    "subType": "namedNode",
    "value": "Museum1",
    "prefix": "ex"
  },
  "y": {
    "type": "term",
    "subType": "literal",
    "value": "foo"
  }
}
]

 */
export type ValuePatternRow = Record<string, TermIri | TermLiteral | TermLabelledIri | undefined>;
export type PatternValues = PatternBase & {
  subType: 'values';
  variables: TermVariable[];
  values: ValuePatternRow[];
};




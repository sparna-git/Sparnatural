
/***** Main Sparnatural Query Structure *****/

export type SparnaturalQuery = {
  type: 'query';
  subType: 'select';
  // When we will implement prefixes and base URIs, we will add this:
  // context: ContextDefinition[];
  // variables: (TermVariable | PatternBind)[] | [Wildcard];
  // idea : we could support Wildcard, in this case all variables get selected
  variables: (TermVariable | PatternBind)[];
  solutionModifiers: SolutionModifiers;
  distinct?: true;
  where: PatternBgpSameSubject;
};

export type PatternBase = { type: 'pattern'; subType: string };

export type PatternBind = PatternBase & {
  subType: 'bind';
  expression: Expression;
  variable: TermVariable;
};

/***** End Main Sparnatural Query Structure *****/




/***** BGP-same-subject extension of Sparnatural *****/

// Extension : BGP with same subject
export type PatternBgpSameSubject = PatternBase & {
  subType: 'bgpSameSubject';
  subject: TermTypedVariable;
  predicateObjectPairs: PredicateObjectPair[];
};

// Extension : predicate-object pair in a BGP with same subject
export type PredicateObjectPair = {
  type: 'predicateObjectPair';
  predicate: TermIri;
  object: ObjectCriteria;
};

// Extension : object criteria in a predicate-object pair
export type ObjectCriteria = {
  type: 'objectCriteria';
  variable: TermTypedVariable;
  // the name of the variable is repeated at each row
  values?:ValuePatternRow[];
  filters?: LabelledFilter[];
  predicateObjectPairs?: PredicateObjectPair[];
};

// Extension : a filter with a label
export type LabelledFilter = {
  type: 'labelledFilter';
  label: string;
  filter:  
    DateFilter | 
    MapFilter | 
    NumberFilter | 
    SearchFilter;
}

// Extension : a date filter
export interface DateFilter {
  type: "dateFilter";
  // a date string in ISO format
  // e.g. "2023-10-05T14:48:00.000Z"
  // or for just a year "2023" or "-0450" (for 450 BC)
  // undefined if not set
  start?: string | undefined;
  stop?: string | undefined;
};

// Extension : a map filter
export interface MapFilter {
  type: "mapFilter";
  coordType: 'Polygon' | 'Rectangle';
  coordinates: LatLng[][];
}

// Extension : a lat/lng coordinate inside a MapFilter
export interface LatLng {
  lat: number;
  lng: number;
  alt?: number | undefined;
}

// Extension : a number filter
export interface NumberFilter {
  type: "numberFilter";
  // either min or max need to be defined
  min?: number | undefined;
  max?: number | undefined;
}

// Extension : a search filter
export interface SearchFilter {
  type: "searchFilter";
  // this is interpreted as a regexp when using plain SPARQL queries
  // or as a fulltext search string when using a triplestore with fulltext search capabilities
  search: string;
}

/***** End BGP-same-subject extension of Sparnatural *****/


/***** Context definition, for defining prefixes and base URIs *****/

/* When we will implement prefixes and base URIs, we will add this:

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
*/

/***** End Context definition *****/


/***** Solution modifiers (order and limit/offset) *****/

export type SolutionModifierBase = Node & { type: 'solutionModifier'; subType: string };
export type Ordering = {
  descending: boolean;
  // expression: Expression;
  // we limit the ordering to only a variable
  expression: TermVariable;
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

/***** End Solution modifiers *****/


/***** Values clause *****/

/**
 * A single list of assignments maps the variable identifier to the value
 * 
 VALUES (?x ?y) { (<http://example.com/Museum1> "foo") }

"values": [
{
  "x": {
    "type": "term",
    "subType": "namedNode",
    "value": "http://example.com/Museum1"
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

/***** End Values clause *****/


/***** Generic Expression structure (function calls, operations, or aggregates) *****/

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

/***** End Generic Expression structure *****/


/***** Base RDF terms : literals with lang/datatypes, and IRIs, and variables *****/

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

/** When we will implement prefixes, we will add this:

export type TermIriPrefixed = TermIriBase & {
  value: string;
  prefix: string;
};

export type TermIri = TermIriFull;
**/

// Extension : Specific labelled IRI
export type TermLabelledIri = TermIriFull & { subType: 'labelledIri';label: string; };

// Extension Specific typed variables
export type TermTypedVariable = TermBase & {
  subType: 'typedVariable';
  value: string;
  class: TermIri;
};

export type GraphTerm = TermIri | TermLiteral | TermLabelledIri;
export type Term = GraphTerm | TermVariable | TermTypedVariable;

/***** End RDF terms *****/











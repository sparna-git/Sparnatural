import {
  LabelledCriteria,
  Criteria,
  RDFTerm,
  RdfTermCriteria,
  DateCriteria,
  MapCriteria,
  NumberCriteria,
  SearchCriteria,
  VariableExpression,
} from "../SparnaturalQueryIfc";

import {
  PatternBind,
  ObjectCriteria,
  GraphTerm,
  TermIri,
  TermLabelledIri,
  TermLiteral,
  TermIriFull,
  ValuePatternRow,
  LabelledFilter,
  DateFilter,
  MapFilter,
  NumberFilter,
  SearchFilter,
} from "../SparnaturalQueryIfc-v13";

// A generic mapper type
type Mapper<I, O> = (input: I) => O;

/**
 * e.g. TermIri or TermLiteral to LabelledCriteria<RdfTermCriteria>
 * @param term The graph term to convert
 * @returns The labelled criteria, or null if the term type is unsupported
 */
export function graphTermToLabelledCriteria(
  term: GraphTerm
): LabelledCriteria<RdfTermCriteria> | null {
  if (term.subType === "namedNode") {
    const iri = term as TermIri | TermLabelledIri;
    return {
      label: "label" in iri ? iri.label : iri.value,
      criteria: {
        rdfTerm: {
          type: "uri",
          value: iri.value,
        },
      },
    };
  }

  if (term.subType === "literal") {
    const lit = term as TermLiteral;

    const rdfTerm: RDFTerm = {
      type: "literal",
      value: lit.value,
    };

    const lo = lit.langOrIri;
    if (typeof lo === "string") rdfTerm["xml:lang"] = lo;
    if (lo && typeof lo === "object") {
      rdfTerm.datatype = (lo as TermIriFull).value;
    }

    return {
      label: lit.value,
      criteria: { rdfTerm },
    };
  }

  return null;
}

/**
 * Translates the object values in a v13 ObjectCriteria to labelled criteria in v1
 * @param variableName The variable name to extract from each value row
 * @param obj The ObjectCriteria containing the values
 * @returns An array of labelled criteria
 */
export function translateObjectValues(
  variableName: string,
  obj: ObjectCriteria
): LabelledCriteria<Criteria>[] {
  const values = obj.values;
  if (!values || values.length === 0) return [];

  const first = values[0];

  // Case A — GraphTerm[]
  if (typeof first === "object" && first !== null && "subType" in first) {
    return (values as unknown as GraphTerm[])
      .map(graphTermToLabelledCriteria)
      .filter(Boolean) as LabelledCriteria<Criteria>[];
  }

  // Case B — VALUES rows
  return translateValueRows(variableName, values as ValuePatternRow[]);
}

/**
 * Translates v13 VALUES rows to labelled criteria in v1
 * @param variableName The variable name to extract from each value row
 * @param rows The VALUES rows
 * @returns An array of labelled criteria
 */
export function translateValueRows(
  variableName: string,
  rows: ValuePatternRow[]
): LabelledCriteria<Criteria>[] {
  return rows.flatMap((row) => {
    const term = row[variableName];
    if (!term) return [];

    const converted = graphTermToLabelledCriteria(term);
    return converted ? [converted] : [];
  });
}

/** Translates v13 labelled filters to v1 labelled criteria
 * @param filters The labelled filters to translate
 * @returns An array of labelled criteria
 */
export function translateFilters(
  filters: LabelledFilter[]
): LabelledCriteria<Criteria>[] {
  return filters.map((lf) => {
    const mapper = filterToCriteriaMap[lf.filter.type];
    if (!mapper) {
      throw new Error(`Unknown filter type: ${lf.filter.type}`);
    }
    return {
      label: lf.label,
      criteria: mapper(lf),
    };
  });
}

/**
 * Translates v13 labelled filters to v1 labelled criteria
 * @param filters The labelled filters to translate
 * @returns An array of labelled criteria
 */

const filterToCriteriaMap: Record<
  LabelledFilter["filter"]["type"],
  Mapper<LabelledFilter, Criteria>
> = {
  dateFilter: (lf) => {
    const f = lf.filter as DateFilter;
    return { start: f.start, stop: f.stop };
  },

  numberFilter: (lf) => {
    const f = lf.filter as NumberFilter;
    return { min: f.min, max: f.max };
  },

  searchFilter: (lf) => {
    const f = lf.filter as SearchFilter;
    return { search: f.search };
  },

  mapFilter: (lf) => {
    const f = lf.filter as MapFilter;
    return {
      coordType: f.coordType,
      coordinates: f.coordinates,
    };
  },
};

/**
 * Converts a v13 PatternBind to a v1 VariableExpression
 * @param bind A v13 PatternBind
 * @returns A v1 VariableExpression
 */

export function patternBindToVariableExpression(
  bind: PatternBind
): VariableExpression {
  return {
    expression: {
      type: "aggregate",
      aggregation: bind.expression.aggregation,
      distinct: bind.expression.distinct,
      expression: {
        termType: "Variable",
        value: bind.expression.expression[0].value,
      },
    },
    variable: {
      termType: "Variable",
      value: bind.variable.value,
    },
  };
}

// Second part

/**
 * Converts labelled criteria to labelled filters (v1 to v13)
 * @param vals An array of labelled criteria v1
 * @returns An array of labelled filters v13
 */

const criteriaToFilterRegistry: Array<{
  match: (c: Criteria) => boolean;
  build: (label: string, c: Criteria) => LabelledFilter;
}> = [
  {
    match: (c): c is DateCriteria => "start" in c || "stop" in c,
    build: (label, c) => ({
      type: "labelledFilter",
      label,
      filter: {
        type: "dateFilter",
        start: (c as DateCriteria).start,
        stop: (c as DateCriteria).stop,
      },
    }),
  },
  {
    match: (c): c is NumberCriteria => "min" in c || "max" in c,
    build: (label, c) => ({
      type: "labelledFilter",
      label,
      filter: {
        type: "numberFilter",
        min: (c as NumberCriteria).min,
        max: (c as NumberCriteria).max,
      },
    }),
  },
  {
    match: (c): c is SearchCriteria => "search" in c,
    build: (label, c) => {
      const sc = c as SearchCriteria;
      return {
        type: "labelledFilter",
        label,
        filter: {
          type: "searchFilter",
          search: sc.search,
        },
      };
    },
  },
  {
    match: (c): c is MapCriteria => "coordinates" in c,
    build: (label, c) => {
      const mc = c as MapCriteria;

      return {
        type: "labelledFilter",
        label,
        filter: {
          type: "mapFilter",
          coordType: mc.coordType,
          coordinates: mc.coordinates,
        },
      };
    },
  },
];

/**
 * Converts labelled criteria to labelled filters (v1 to v13)
 * @param vals An array of labelled criteria v1
 * @returns An array of labelled filters v13
 */
export function labelledCriteriaToFilters(
  vals: LabelledCriteria<Criteria>[]
): LabelledFilter[] {
  return vals.flatMap((v) => {
    const entry = criteriaToFilterRegistry.find((r) => r.match(v.criteria));
    return entry ? [entry.build(v.label, v.criteria)] : [];
  });
}

/**
 * Converts labelled criteria with RDFTerm to flat values (v1 to v13)
 * @param vals An array of labelled criteria v1
 * @returns An array of flat value patterns v13
 */
export function labelledCriteriaToFlatValues(
  vals: LabelledCriteria<Criteria>[]
): Array<{
  type: "term";
  subType: "namedNode" | "literal";
  value: string;
  label: string;
  langOrIri?: string;
}> {
  return vals
    .filter(
      (v): v is LabelledCriteria<RdfTermCriteria> => "rdfTerm" in v.criteria
    )
    .map((v) => {
      const t = v.criteria.rdfTerm;

      if (t.type === "uri") {
        return {
          type: "term",
          subType: "namedNode",
          value: t.value,
          label: v.label,
        };
      }

      return {
        type: "term",
        subType: "literal",
        value: t.value,
        label: v.label,
        langOrIri: t["xml:lang"] ?? t.datatype,
      };
    });
}

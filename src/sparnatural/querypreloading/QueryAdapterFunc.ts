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

/* ===============================================================
   Generic helpers
   =============================================================== */

type Mapper<I, O> = (input: I) => O;

/* ===============================================================
   GraphTerm → v1 RdfTermCriteria
   =============================================================== */

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

/* ===============================================================
   VALUES (v13) → LabelledCriteria (v1)
   =============================================================== */

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

/* ===============================================================
   Filters v13 → Criteria v1 (GENERIC)
   =============================================================== */

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

/* ===============================================================
   Criteria v1 → Filters v13 (GENERIC)
   =============================================================== */

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

export function labelledCriteriaToFilters(
  vals: LabelledCriteria<Criteria>[]
): LabelledFilter[] {
  return vals.flatMap((v) => {
    const entry = criteriaToFilterRegistry.find((r) => r.match(v.criteria));
    return entry ? [entry.build(v.label, v.criteria)] : [];
  });
}

/* ===============================================================
   Criteria v1 → VALUES v13
   =============================================================== */

export function labelledCriteriaToValues(
  variable: string,
  vals: LabelledCriteria<Criteria>[]
): ValuePatternRow[] {
  return vals
    .filter((v) => "rdfTerm" in v.criteria)
    .map((v) => {
      const t = (v.criteria as RdfTermCriteria).rdfTerm;

      return {
        [variable]:
          t.type === "uri"
            ? { type: "term", subType: "namedNode", value: t.value }
            : {
                type: "term",
                subType: "literal",
                value: t.value,
                langOrIri: t["xml:lang"] ?? undefined,
              },
      };
    });
}

/* ===============================================================
   PatternBind (v13) → VariableExpression (v1)
   =============================================================== */

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

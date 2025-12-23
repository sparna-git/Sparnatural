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

/**
 * Translates ObjectCriteria values from v13 format to v1 LabelledCriteria array.
 *
 * @param variableName - The name of the variable to extract from ValuePatternRow
 * @param obj - The ObjectCriteria containing the values to translate
 * @returns An array of LabelledCriteria with RdfTermCriteria for widget rendering
 */
export function translateObjectValues(
  variableName: string,
  obj: ObjectCriteria
): LabelledCriteria<Criteria>[] {
  const values = obj.values;
  if (!values || values.length === 0) return [];

  const first = values[0];

  // Case A — direct GraphTerm[] (detected by presence of 'subType' property)
  if (typeof first === "object" && first !== null && "subType" in first) {
    return (values as unknown as GraphTerm[])
      .map(translateGraphTerm)
      .filter((v): v is LabelledCriteria<RdfTermCriteria> => v !== null);
  }

  // Case B — VALUES rows (Record<string, GraphTerm>)
  return translateValueRows(variableName, values as ValuePatternRow[]);
}

/**
 * Converts a single GraphTerm (IRI or Literal) to a LabelledCriteria<RdfTermCriteria>.
 *
 * @param term - The GraphTerm to convert (TermIri, TermLabelledIri, or TermLiteral)
 * @returns A LabelledCriteria wrapping the RdfTermCriteria, or null if subType is unknown
 */
export function translateGraphTerm(
  term: GraphTerm
): LabelledCriteria<RdfTermCriteria> | null {
  // Handle named nodes (IRIs)
  if (term.subType === "namedNode") {
    const iri = term as TermIri | TermLabelledIri;
    return {
      // Use the label if available (TermLabelledIri), otherwise use the IRI value
      label: "label" in iri ? iri.label : iri.value,
      criteria: {
        rdfTerm: {
          type: "uri",
          value: iri.value,
        },
      },
    };
  }

  // Handle literals (strings with optional language tag or datatype)
  if (term.subType === "literal") {
    const lit = term as TermLiteral;

    const rdfTerm: RDFTerm = {
      type: "literal",
      value: lit.value,
    };

    // Add language tag if langOrIri is a string (e.g., "en", "fr")
    const lo = lit.langOrIri;
    if (typeof lo === "string") rdfTerm["xml:lang"] = lo;
    // Add datatype if langOrIri is an IRI object (e.g., xsd:date)
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
 * Translates an array of ValuePatternRow (VALUES clause rows) to LabelledCriteria.
 *
 * Each row is a Record mapping variable names to GraphTerm values.
 * This function extracts the term for the specified variable from each row.
 *
 * @param variableName - The variable name to look up in each row
 * @param rows - Array of ValuePatternRow records
 * @returns Array of LabelledCriteria for all successfully converted terms
 */
export function translateValueRows(
  variableName: string,
  rows: ValuePatternRow[]
): LabelledCriteria<Criteria>[] {
  const res: LabelledCriteria<Criteria>[] = [];

  rows.forEach((row) => {
    // Extract the term for this variable from the row
    const term = row[variableName];
    if (!term) return;

    const converted = translateGraphTerm(term);
    if (converted) res.push(converted);
  });

  return res;
}

/**
 * Translates an array of LabelledFilter (v13 format) to LabelledCriteria (v1 format).
 *
 * @param filters - Array of LabelledFilter from the v13 query format
 * @returns Array of LabelledCriteria for widget rendering
 * @throws Error if an unknown filter type is encountered
 */
export function translateFilters(
  filters: LabelledFilter[]
): LabelledCriteria<Criteria>[] {
  return filters.map((lf) => {
    const f = lf.filter;

    // Date filter: start and/or stop date in ISO format
    if (f.type === "dateFilter") {
      const df = f as DateFilter;
      const criteria: DateCriteria = {
        start: df.start !== undefined ? String(df.start) : undefined,
        stop: df.stop !== undefined ? String(df.stop) : undefined,
      };
      return { label: lf.label, criteria };
    }

    // Number filter: min and/or max numeric values
    if (f.type === "numberFilter") {
      const nf = f as NumberFilter;
      const criteria: NumberCriteria = {
        min: nf.min,
        max: nf.max,
      };
      return { label: lf.label, criteria };
    }

    // Search filter: fulltext or regex search string
    if (f.type === "searchFilter") {
      const sf = f as SearchFilter;
      const criteria: SearchCriteria = {
        search: sf.search,
      };
      return { label: lf.label, criteria };
    }

    // Map filter: geographic polygon or rectangle coordinates
    if (f.type === "mapFilter") {
      const mf = f as MapFilter;
      const criteria: MapCriteria = {
        coordType: mf.coordType,
        coordinates: mf.coordinates,
      };
      return { label: lf.label, criteria };
    }

    throw new Error(
      `Unknown filter type: ${(f as LabelledFilter["filter"]).type}`
    );
  });
}

/**
 * Converts a PatternBind (v13 aggregate expression) to a VariableExpression (v1 format).
 *
 * @param bind - The PatternBind containing the aggregate expression
 * @returns A VariableExpression compatible with the v1 query format
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

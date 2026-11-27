import type { Binding, BindingTerm, QueryResult } from "@ldforge/core";
import type { SparnaturalQuery } from "../../sparnatural/SparnaturalQueryIfc-v13";
import type { SparnaturalQueryIfc } from "../../sparnatural/SparnaturalQueryIfc";
import type { ISparnaturalSpecification } from "../../sparnatural/spec-providers/ISparnaturalSpecification";

export type VisualQuery = SparnaturalQuery | SparnaturalQueryIfc;
export type BindingResult = Extract<QueryResult, { kind: "bindings" }>;
export interface QueryNode {
  variable: string;
  rdfType?: string;
  property?: string;
  children: QueryNode[];
}
export interface ResultMetadata {
  roots: QueryNode[];
  labels: Map<string, string>;
  properties: Map<string, string>;
  countVariables: string[];
}
export const variableName = (value: string) => value.replace(/^[?$]/, "");

/** Both public Sparnatural query formats remain accepted by the integration. */
export function describeQuery(
  query?: VisualQuery,
  configuration?: ISparnaturalSpecification
): ResultMetadata {
  const metadata: ResultMetadata = {
    roots: [],
    labels: new Map(),
    properties: new Map(),
    countVariables: [],
  };
  if (!query) return metadata;
  function label(id: string | undefined, kind: "entity" | "property") {
    if (!id) return undefined;
    return (
      kind === "entity"
        ? configuration?.getEntity(id)
        : configuration?.getProperty(id)
    )?.getLabel();
  }
  function record(node: QueryNode) {
    const name = node.variable;
    const title =
      label(node.property, "property") || label(node.rdfType, "entity");
    if (title) metadata.labels.set(name, title);
    if (node.property) metadata.properties.set(name, node.property);
    node.children.forEach(record);
  }
  if ("where" in query) {
    const convert = (
      object: SparnaturalQuery["where"]["predicateObjectPairs"][number]["object"],
      property: string
    ): QueryNode => ({
      variable: variableName(object.variable.value),
      rdfType: object.variable.rdfType,
      property,
      children: (object.predicateObjectPairs ?? []).map((pair) =>
        convert(pair.object, pair.predicate.value)
      ),
    });
    metadata.roots = [
      {
        variable: variableName(query.where.subject.value),
        rdfType: query.where.subject.rdfType,
        children: query.where.predicateObjectPairs.map((pair) =>
          convert(pair.object, pair.predicate.value)
        ),
      },
    ];
  } else {
    const convert = (branches: SparnaturalQueryIfc["branches"]): QueryNode[] =>
      branches.map((branch) => ({
        variable: variableName(branch.line.o),
        rdfType: branch.line.oType,
        property: branch.line.p,
        children: convert(branch.children ?? []),
      }));
    const first = query.branches[0]?.line;
    if (first)
      metadata.roots = [
        {
          variable: variableName(first.s),
          rdfType: first.sType,
          children: convert(query.branches),
        },
      ];
  }
  metadata.roots.forEach(record);
  for (const selected of query.variables) {
    if (
      "expression" in selected &&
      selected.expression.aggregation.toLowerCase() === "count"
    )
      metadata.countVariables.push(variableName(selected.variable.value));
  }
  return metadata;
}

/** Identity includes RDF type/language/datatype; equal labels never merge distinct IRIs. */
export function termKey(term: BindingTerm): string {
  return JSON.stringify([
    term.type,
    term.value,
    term.datatype,
    term["xml:lang"],
  ]);
}
export function groupRows(
  rows: readonly Binding[],
  variable: string
): Binding[][] {
  const groups = new Map<string, Binding[]>();
  rows.forEach((row, index) => {
    const term = row[variable];
    // An unbound root must never merge unrelated solution rows.
    const key = term ? termKey(term) : `unbound:${index}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });
  return [...groups.values()];
}
export function displayValue(row: Binding, variable: string): string {
  return row[`${variable}_label`]?.value || row[variable]?.value || "";
}
export function webUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    /* RDF values can be non-URLs. */
  }
}
export function imageUrl(term: BindingTerm | undefined): string | undefined {
  const url = webUrl(term?.value);
  return url && /\.(?:png|jpe?g|gif|webp|svg|avif)(?:[?#]|$)/i.test(url)
    ? url
    : undefined;
}

/** Adapters are view-local. The editor retains the original terms for JSON and CSV. */
export function mapResult(
  result: QueryResult,
  metadata: ResultMetadata
): QueryResult {
  if (result.kind !== "bindings" || result.variables.includes("geometry"))
    return result;
  const wkt = result.variables.find((variable) =>
    result.bindings.some(
      (row) =>
        row[variable]?.datatype ===
        "http://www.opengis.net/ont/geosparql#wktLiteral"
    )
  );
  const find = (pattern: RegExp) =>
    result.variables.find((variable) =>
      pattern.test(metadata.properties.get(variable) ?? variable)
    );
  const lat = find(/(?:latitude|(?:^|[/#_:])lat$)/i);
  const long = find(/(?:longitude|(?:^|[/#_:])(?:long|lon|lng)$)/i);
  if (!wkt && !(lat && long)) return result;
  const root = metadata.roots[0]?.variable || result.variables[0];
  return {
    kind: "bindings",
    variables: [...result.variables, "geometry", "geometryLabel", "geoLink"],
    bindings: result.bindings.map((row) => {
      let geometry = wkt ? row[wkt]?.value : undefined;
      if (!wkt && lat && long && row[lat] && row[long]) {
        const latitude = Number(row[lat].value),
          longitude = Number(row[long].value);
        if (
          row[lat].value.trim() &&
          row[long].value.trim() &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        )
          geometry = `POINT(${longitude} ${latitude})`;
      }
      return {
        ...row,
        ...(geometry
          ? { geometry: { type: "literal" as const, value: geometry } }
          : {}),
        ...(root
          ? {
              geometryLabel: {
                type: "literal" as const,
                value: displayValue(row, root),
              },
            }
          : {}),
        ...(root && row[root]?.type === "uri" ? { geoLink: row[root] } : {}),
      };
    }),
  };
}
export function chartResult(
  result: QueryResult,
  metadata: ResultMetadata
): QueryResult {
  if (result.kind !== "bindings" || result.variables.includes("chart_value"))
    return result;
  const count = metadata.countVariables.find((name) =>
    result.variables.includes(name)
  );
  if (!count) return result;
  const categories = result.variables.filter(
    (name) =>
      name !== count &&
      !metadata.countVariables.includes(name) &&
      !(name.endsWith("_label") && result.variables.includes(name.slice(0, -6)))
  );
  return {
    kind: "bindings",
    variables: ["chart_label", "chart_value"],
    bindings: result.bindings.map((row) => ({
      chart_label: {
        type: "literal",
        value:
          categories.map((name) => displayValue(row, name)).join(" / ") ||
          "COUNT",
      },
      ...(row[count] ? { chart_value: row[count] } : {}),
    })),
  };
}

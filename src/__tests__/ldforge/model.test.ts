import {
  chartResult,
  describeQuery,
  groupRows,
  mapResult,
  webUrl,
} from "../../integrations/ldforge/model";
import type {
  BindingResult,
  VisualQuery,
} from "../../integrations/ldforge/model";
import type { ISparnaturalSpecification } from "../../sparnatural/spec-providers/ISparnaturalSpecification";

const uri = (value: string) => ({ type: "uri" as const, value });
const literal = (value: string) => ({ type: "literal" as const, value });
const v13 =
  require("../jsonv13-translator/cases/01-simple-person-knows-person/query.json") as VisualQuery;
const configuration = {
  getEntity: () => ({ getLabel: () => "Person" }),
  getProperty: () => ({ getLabel: () => "Knows" }),
} as unknown as ISparnaturalSpecification;

test("v13 and legacy query structures describe the same nested result paths", () => {
  const old: VisualQuery = {
    variables: [],
    branches: [
      {
        line: {
          s: "?x",
          sType: "http://example.com/Person",
          p: "http://example.com/Person_knows",
          o: "?o",
          oType: "http://example.com/Person",
        },
      },
    ],
  };
  expect(describeQuery(v13, configuration)).toEqual(
    describeQuery(old, configuration)
  );
  expect(describeQuery(v13, configuration).labels.get("o")).toBe("Knows");
});
test("group by RDF identity, preserve order, keep unbound roots separate", () => {
  const rows = [
    { x: uri("https://example.org/1"), x_label: literal("Same") },
    { x: uri("https://example.org/2"), x_label: literal("Same") },
    { x: uri("https://example.org/1") },
    {},
    {},
  ];
  expect(groupRows(rows, "x").map((group) => group.length)).toEqual([
    2, 1, 1, 1,
  ]);
  expect(
    groupRows(
      [{ x: literal("1") }, { x: { ...literal("1"), datatype: "integer" } }],
      "x"
    )
  ).toHaveLength(2);
});
test("WKT and coordinate adaptation leaves original bindings intact and does not discard incomplete rows", () => {
  const result: BindingResult = {
    kind: "bindings",
    variables: ["x", "lat", "long"],
    bindings: [
      {
        x: uri("https://example.org/1"),
        lat: literal("52"),
        long: literal("4"),
      },
      { x: uri("https://example.org/2"), lat: literal("") },
    ],
  };
  const mapped = mapResult(result, describeQuery(v13)) as BindingResult;
  expect(mapped.bindings[0].geometry.value).toBe("POINT(4 52)");
  expect(mapped.bindings[1].geometry).toBeUndefined();
  expect(result.bindings[0].geometry).toBeUndefined();
  const wkt: BindingResult = {
    kind: "bindings",
    variables: ["shape"],
    bindings: [
      {
        shape: {
          ...literal("POINT(4 52)"),
          datatype: "http://www.opengis.net/ont/geosparql#wktLiteral",
        },
      },
    ],
  };
  expect(
    (mapResult(wkt, describeQuery()) as BindingResult).bindings[0].geometry
      .value
  ).toBe("POINT(4 52)");
});
test("COUNT aliases produce view-local charts while labels and raw data are retained", () => {
  const query = {
    ...v13,
    variables: [
      {
        type: "pattern",
        subType: "bind",
        variable: {
          type: "term",
          subType: "variable",
          value: "total",
        },
        expression: {
          type: "expression",
          subType: "aggregate",
          aggregation: "count",
          expression: [{ type: "term", subType: "variable", value: "x" }],
          distinct: false,
        },
      },
    ],
  } as VisualQuery;
  const result: BindingResult = {
    kind: "bindings",
    variables: ["x", "x_label", "total"],
    bindings: [
      {
        x: uri("https://example.org/1"),
        x_label: literal("Alice"),
        total: literal("3"),
      },
    ],
  };
  const mapped = chartResult(result, describeQuery(query)) as BindingResult;
  expect(mapped.bindings[0].chart_label.value).toBe("Alice");
  expect(mapped.bindings[0].chart_value).toBe(result.bindings[0].total);
  expect(result.variables).toEqual(["x", "x_label", "total"]);
});
test("only absolute HTTP(S) result links are accepted", () => {
  for (const input of [
    "javascript:alert(1)",
    "data:image/png,test",
    "relative",
    "//example.org",
  ])
    expect(webUrl(input)).toBeUndefined();
  expect(webUrl("https://example.org/a")).toBe("https://example.org/a");
});

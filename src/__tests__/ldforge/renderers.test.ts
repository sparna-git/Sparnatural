/** @jest-environment jsdom */
import {
  createGridRenderer,
  createLabelledTableRenderer,
} from "../../integrations/ldforge/renderers";
import { describeQuery } from "../../integrations/ldforge/model";
import type {
  BindingResult,
  ResultMetadata,
} from "../../integrations/ldforge/model";

// The integration's DOM behavior is under test; optional library loaders never run here.
jest.mock(
  "@ldforge/core",
  () => ({ createSvgIcon: () => () => document.createElement("span") }),
  { virtual: true }
);
jest.mock("@ldforge/geo", () => ({ createGeoRenderer: jest.fn() }), {
  virtual: true,
});
jest.mock("@ldforge/charts", () => ({ createChartRenderer: jest.fn() }), {
  virtual: true,
});
const uri = (value: string) => ({ type: "uri" as const, value });
const lit = (value: string) => ({ type: "literal" as const, value });
const data: BindingResult = {
  kind: "bindings",
  variables: ["person", "person_label", "group", "date", "image"],
  bindings: [
    {
      person: uri("https://example.org/alice"),
      person_label: lit("Alice"),
      group: lit("A"),
      date: lit("2020"),
      image: uri("https://example.org/a.jpg"),
    },
    {
      person: uri("https://example.org/alice"),
      person_label: lit("Alice"),
      group: lit("B"),
      date: lit("2021"),
    },
    {
      person: uri("https://example.org/other"),
      person_label: lit("Alice"),
      group: lit("C"),
      date: lit("2022"),
    },
  ],
};
function metadata(): ResultMetadata {
  return {
    ...describeQuery(),
    roots: [
      {
        variable: "person",
        children: [
          { variable: "group", children: [{ variable: "date", children: [] }] },
        ],
      },
    ],
    labels: new Map([
      ["group", "Membership"],
      ["date", "Since"],
    ]),
  };
}

test("Grid merges repeated identities, keeps same-label entities distinct and correlates nested branches", () => {
  const container = document.createElement("div");
  createGridRenderer(metadata).render(container, data);
  const cards = container.querySelectorAll("article");
  expect(cards).toHaveLength(2);
  expect(cards[0].querySelector("h3 a")?.getAttribute("href")).toBe(
    "https://example.org/alice"
  );
  const branches = cards[0].querySelectorAll(".ldforge-card-body > dl > dd");
  expect(branches[0].textContent).toContain("A");
  expect(branches[0].textContent).toContain("2020");
  expect(branches[0].textContent).not.toContain("2021");
  expect(branches[1].textContent).toContain("B");
  expect(branches[1].textContent).toContain("2021");
  expect(cards[0].querySelector("img")?.getAttribute("loading")).toBe("lazy");
  expect(data.bindings).toHaveLength(3);
});
test("Grid retains extra columns, unselected intermediate fields and empty states", () => {
  const container = document.createElement("div");
  createGridRenderer(() => ({
    ...metadata(),
    roots: [
      {
        variable: "person",
        children: [
          {
            variable: "unselected",
            children: [{ variable: "date", children: [] }],
          },
        ],
      },
    ],
  })).render(container, data);
  expect(container.textContent).toContain("2020");
  expect(container.textContent).toContain("Membership");
  createGridRenderer(metadata).render(container, { ...data, bindings: [] });
  expect(container.textContent).toBe("No results");
});
test("endpoint text is literal and unsafe URI/image schemes never become links", () => {
  const container = document.createElement("div");
  createGridRenderer(metadata).render(container, {
    kind: "bindings",
    variables: ["person", "person_label", "image"],
    bindings: [
      {
        person: uri("javascript:alert(1)"),
        person_label: lit("<script>alert(1)</script>"),
        image: uri("data:image/png,test.jpg"),
      },
    ],
  });
  expect(container.querySelector("script, img, a")).toBeNull();
  expect(container.textContent).toContain("<script>alert(1)</script>");
});
test("labelled table merges paired columns and retains links, sorting and filtering", () => {
  const container = document.createElement("div");
  createLabelledTableRenderer(metadata).render(container, data);
  expect(container.querySelectorAll("th")).toHaveLength(4);
  const link = container.querySelector("tbody a");
  expect(link?.textContent).toBe("Alice");
  expect(link?.getAttribute("href")).toBe("https://example.org/alice");
  expect(link?.getAttribute("rel")).toContain("noopener");
  const button = container.querySelectorAll(
    "th button"
  )[2] as HTMLButtonElement;
  button.click();
  button.click();
  expect(container.querySelector("tbody tr")?.textContent).toContain("2022");
  const input = container.querySelector("input")!;
  input.value = "2020";
  input.dispatchEvent(new Event("input"));
  expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
  expect(container.querySelector("caption")?.textContent).toBe("1 / 3 results");
});

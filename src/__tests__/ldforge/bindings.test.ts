/** @jest-environment jsdom */
import {
  createSparnaturalExecutor,
  createSparnaturalLDForge,
} from "../../integrations/ldforge";
import { createEditor } from "@ldforge/editor";
import type { SparnaturalSource } from "../../integrations/ldforge";
import type { EditorOptions } from "@ldforge/editor";
import type { QueryResult } from "@ldforge/core";

jest.mock(
  "@ldforge/editor",
  () => ({
    createEditor: jest.fn((_container, options) => {
      let query = options.query;
      let controller: AbortController;
      return {
        setQuery: jest.fn((value: string) => {
          query = value;
        }),
        getQuery: () => query,
        run: jest.fn(async () => {
          controller?.abort();
          controller = new AbortController();
          try {
            await options.executor.execute({
              query,
              signal: controller.signal,
            });
          } catch {
            /* IDE owns error display. */
          }
        }),
        setResultsContainer: jest.fn(),
        cancel: jest.fn(() => controller?.abort()),
        destroy: jest.fn(() => controller?.abort()),
      };
    }),
  }),
  { virtual: true }
);
jest.mock(
  "@ldforge/core",
  () => ({
    parseSparqlResults: (data: unknown) => {
      if (!data) throw new Error("Invalid response");
      return data;
    },
    createSvgIcon: () => () => document.createElement("span"),
  }),
  { virtual: true }
);
jest.mock(
  "@ldforge/renderers",
  () => ({
    createBooleanRenderer: () => ({ id: "boolean" }),
    createCardsRenderer: () => ({ id: "cards" }),
    createJsonRenderer: () => ({ id: "json" }),
    createTableRenderer: () => ({ id: "table" }),
  }),
  { virtual: true }
);
jest.mock(
  "@ldforge/geo",
  () => ({ createGeoRenderer: () => ({ id: "geo" }) }),
  { virtual: true }
);
jest.mock(
  "@ldforge/charts",
  () => ({ createChartRenderer: () => ({ id: "charts" }) }),
  { virtual: true }
);
class Source extends EventTarget implements SparnaturalSource {
  expandSparql = jest.fn((query: string) => `# expanded\n${query}`);
  disablePlayBtn = jest.fn();
  enablePlayBtn = jest.fn();
  executeSparql = jest.fn((_query: string, success: (data: unknown) => void) =>
    success(result)
  );
}
const result: QueryResult = {
  kind: "bindings",
  variables: ["x"],
  bindings: [{ x: { type: "literal", value: "one" } }],
};
const update = (source: Source) =>
  source.dispatchEvent(
    new CustomEvent("queryUpdated", {
      detail: {
        queryString: "SELECT ?x WHERE {}",
        queryJson: { variables: [], branches: [] },
      },
    })
  );
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
beforeEach(() => jest.clearAllMocks());

test("expand queries, submit through Sparnatural, clear on reset and remove listeners on destroy", async () => {
  const source = new Source();
  const integration = createSparnaturalLDForge(
    source,
    document.createElement("div")
  );
  update(source);
  expect(integration.editor.getQuery()).toBe("# expanded\nSELECT ?x WHERE {}");
  source.dispatchEvent(new Event("submit"));
  await flush();
  expect(source.executeSparql).toHaveBeenCalledTimes(1);
  expect(source.disablePlayBtn).toHaveBeenCalledTimes(1);
  expect(source.enablePlayBtn).toHaveBeenCalledTimes(1);
  source.dispatchEvent(new Event("resetEditor"));
  expect(integration.editor.getQuery()).toBe("");
  integration.destroy();
  integration.destroy();
  update(source);
  source.dispatchEvent(new Event("submit"));
  expect(source.executeSparql).toHaveBeenCalledTimes(1);
  expect(integration.editor.destroy).toHaveBeenCalledTimes(1);
});
test("a failed transport releases loading, and cancelled non-cooperative executors cannot leave it stuck", async () => {
  const source = new Source();
  const execute = jest
    .fn()
    .mockRejectedValueOnce(new Error("offline"))
    .mockImplementation(() => new Promise(() => {}));
  const integration = createSparnaturalLDForge(
    source,
    document.createElement("div"),
    { executor: { execute } }
  );
  await integration.editor.run();
  expect(source.enablePlayBtn).toHaveBeenCalledTimes(1);
  const running = integration.editor.run();
  await flush();
  integration.editor.cancel();
  await running;
  expect(source.enablePlayBtn).toHaveBeenCalledTimes(2);
  integration.destroy();
});
test("an earlier cancelled run cannot clear loading for a newer run", async () => {
  const source = new Source();
  let finish: (data: QueryResult) => void;
  const integration = createSparnaturalLDForge(
    source,
    document.createElement("div"),
    {
      executor: {
        execute: () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      },
    }
  );
  const first = integration.editor.run();
  await flush();
  const second = integration.editor.run();
  await flush();
  await first;
  expect(source.enablePlayBtn).not.toHaveBeenCalled();
  finish!(result);
  await second;
  expect(source.enablePlayBtn).toHaveBeenCalledTimes(1);
  integration.destroy();
});
test("results keep execution-time metadata, even if a host reuses a result object", async () => {
  const source = new Source();
  Object.assign(source, {
    sparnatural: {
      specProvider: {
        getEntity: () => ({ getLabel: () => "Person" }),
        getProperty: () => ({ getLabel: () => "Knows" }),
      },
    },
  });
  let finish: (data: QueryResult) => void;
  const integration = createSparnaturalLDForge(
    source,
    document.createElement("div"),
    {
      executor: {
        execute: () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      },
    }
  );
  const options = (createEditor as jest.Mock).mock.calls[0][1] as EditorOptions;
  const query = require("../jsonv13-translator/cases/01-simple-person-knows-person/query.json");
  source.dispatchEvent(
    new CustomEvent("queryUpdated", {
      detail: { queryString: "SELECT ?x WHERE {}", queryJson: query },
    })
  );
  const first = options.executor.execute({
    query: integration.editor.getQuery(),
    signal: new AbortController().signal,
  });
  await flush();
  update(source);
  const shared: QueryResult = {
    kind: "bindings",
    variables: ["x", "o"],
    bindings: [
      {
        x: { type: "literal", value: "one" },
        o: { type: "literal", value: "two" },
      },
    ],
  };
  finish!(shared);
  const firstResult = await first;
  const second = options.executor.execute({
    query: "SELECT ?x ?o WHERE {}",
    signal: new AbortController().signal,
  });
  await flush();
  finish!(shared);
  const secondResult = await second;
  expect(firstResult).not.toBe(secondResult);
  const grid = options.renderers!.find((renderer) => renderer.id === "grid")!;
  const container = document.createElement("div");
  grid.render(container, firstResult);
  expect(container.textContent).toContain("Knows");
  grid.render(container, secondResult);
  expect(container.textContent).not.toContain("Knows");
  integration.destroy();
});
test("callback adapters reject cancellation, malformed data and synchronous failures", async () => {
  const source = new Source();
  const executor = createSparnaturalExecutor(source);
  const controller = new AbortController();
  controller.abort();
  await expect(
    executor.execute({ query: "ASK {}", signal: controller.signal })
  ).rejects.toMatchObject({ name: "AbortError" });
  expect(source.executeSparql).not.toHaveBeenCalled();
  source.executeSparql.mockImplementationOnce((_query, success) =>
    success(null)
  );
  await expect(
    executor.execute({ query: "ASK {}", signal: new AbortController().signal })
  ).rejects.toThrow("Invalid response");
  source.executeSparql.mockImplementationOnce(() => {
    throw new Error("failed");
  });
  await expect(
    executor.execute({ query: "ASK {}", signal: new AbortController().signal })
  ).rejects.toThrow("failed");
});

test("forwards a separate results host while preserving Grid and query visibility", () => {
  const source = new Source();
  const host = document.createElement("div");
  const results = document.createElement("div");
  const integration = createSparnaturalLDForge(source, host, {
    resultsContainer: results,
    queryVisible: false,
  });
  const options = (createEditor as jest.Mock).mock.calls[
    (createEditor as jest.Mock).mock.calls.length - 1
  ][1] as EditorOptions;
  expect(options.resultsContainer).toBe(results);
  expect(options.renderers?.map((renderer) => renderer.id)).toContain("grid");
  expect(host.classList.contains("sparnatural-query-hidden")).toBe(true);
  expect(results.classList.contains("sparnatural-query-hidden")).toBe(false);
  integration.destroy();
});

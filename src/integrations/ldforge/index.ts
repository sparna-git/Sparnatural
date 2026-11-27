import { createEditor } from "@ldforge/editor";
import type { EditorOptions, ForgeEditor } from "@ldforge/editor";
import { parseSparqlResults } from "@ldforge/core";
import type { QueryExecutor, QueryRequest, QueryResult } from "@ldforge/core";
import {
  createBooleanRenderer,
  createCardsRenderer,
  createJsonRenderer,
  createTableRenderer,
} from "@ldforge/renderers";
import type { ISparnaturalSpecification } from "../../sparnatural/spec-providers/ISparnaturalSpecification";
import { describeQuery } from "./model";
import type { ResultMetadata, VisualQuery } from "./model";
import { createSparnaturalRenderers } from "./renderers";
import type { SparnaturalResultOptions } from "./renderers";
export type { SparnaturalResultOptions } from "./renderers";
export {
  createGridRenderer,
  createLabelledTableRenderer,
  createSparnaturalRenderers,
} from "./renderers";
export type { VisualQuery, ResultMetadata } from "./model";

/** Structural contract also usable by sparnatural-form and host wrappers. */
export interface SparnaturalSource extends EventTarget {
  expandSparql(query: string): string;
  executeSparql(
    query: string,
    success: (data: unknown) => void,
    error?: (error: unknown) => void
  ): void;
  disablePlayBtn(): void;
  enablePlayBtn(): void;
  sparnatural?: { specProvider?: ISparnaturalSpecification };
  sparnaturalForm?: { specProvider?: ISparnaturalSpecification };
}
export interface LDForgeOptions {
  /** Default: Sparnatural's transport, retaining catalog/custom handler behavior. */
  executor?: QueryExecutor;
  /** Host for the complete results panel, independent of query visibility. */
  resultsContainer?: HTMLElement;
  editorOptions?: Omit<EditorOptions, "executor">;
  queryVisible?: boolean;
  resultOptions?: SparnaturalResultOptions;
}
export interface SparnaturalLDForge {
  editor: ForgeEditor;
  setQueryVisible(visible: boolean): void;
  isQueryVisible(): boolean;
  destroy(): void;
}

// Host executors may ignore AbortSignal; cancellation must still release the play button.
function executeAbortably(
  executor: QueryExecutor,
  request: QueryRequest
): Promise<QueryResult> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      cleanup();
      reject(new DOMException("Query cancelled", "AbortError"));
    };
    const cleanup = () => request.signal.removeEventListener("abort", abort);
    if (request.signal.aborted) {
      abort();
      return;
    }
    request.signal.addEventListener("abort", abort, { once: true });
    Promise.resolve()
      .then(() => {
        if (request.signal.aborted)
          throw new DOMException("Query cancelled", "AbortError");
        return executor.execute(request);
      })
      .then(
        (result) => {
          cleanup();
          resolve(result);
        },
        (error) => {
          cleanup();
          reject(error);
        }
      );
  });
}

/** Adapt the callback transport; cancellation suppresses responses, not the underlying request. */
export function createSparnaturalExecutor(
  sparnatural: SparnaturalSource
): QueryExecutor {
  return {
    execute: ({ query, signal }: QueryRequest) =>
      new Promise<QueryResult>((resolve, reject) => {
        const abort = () => {
          cleanup();
          reject(new DOMException("Query cancelled", "AbortError"));
        };
        const cleanup = () => signal.removeEventListener("abort", abort);
        if (signal.aborted) {
          abort();
          return;
        }
        signal.addEventListener("abort", abort, { once: true });
        try {
          sparnatural.executeSparql(
            query,
            (data) => {
              cleanup();
              if (signal.aborted) return;
              try {
                resolve(parseSparqlResults(data));
              } catch (error) {
                reject(error);
              }
            },
            (error) => {
              cleanup();
              if (!signal.aborted)
                reject(
                  error instanceof Error ? error : new Error(String(error))
                );
            }
          );
        } catch (error) {
          cleanup();
          reject(error);
        }
      }),
  };
}

/** Mount an optional LDForge IDE; the Sparnatural core has no runtime dependency on it. */
export function createSparnaturalLDForge(
  sparnatural: SparnaturalSource,
  container: HTMLElement,
  options: LDForgeOptions = {}
): SparnaturalLDForge {
  let visualQuery: VisualQuery | undefined;
  let generatedQuery: string | undefined;
  let configuration =
    sparnatural.sparnatural?.specProvider ??
    sparnatural.sparnaturalForm?.specProvider;
  const metadata = new WeakMap<QueryResult, ResultMetadata>();
  const transport = options.executor ?? createSparnaturalExecutor(sparnatural);
  let activeRequest: symbol | undefined;
  let destroyed = false;
  let visible = options.queryVisible !== false;
  const editor = createEditor(container, {
    query: "",
    locale: "en",
    themeMainColor: "#1d78e0",
    editorRows: 12,
    autoGrow: false,
    ...options.editorOptions,
    ...(options.resultsContainer
      ? { resultsContainer: options.resultsContainer }
      : {}),
    controls: { tabs: false, ...options.editorOptions?.controls },
    renderers: options.editorOptions?.renderers ?? [
      ...createSparnaturalRenderers(
        (result) => metadata.get(result) ?? describeQuery(),
        options.resultOptions
      ),
      createTableRenderer(),
      createCardsRenderer(),
      createBooleanRenderer(),
      createJsonRenderer(),
    ],
    visiblePlugins:
      options.editorOptions?.visiblePlugins ??
      (options.editorOptions?.renderers
        ? options.editorOptions.renderers.map((renderer) => renderer.id)
        : ["tablex", "grid", "table", "json", "geo", "charts", "cards"]),
    executor: {
      async execute(request) {
        const id = Symbol();
        activeRequest = id;
        const description = describeQuery(
          request.query === generatedQuery ? visualQuery : undefined,
          configuration
        );
        sparnatural.disablePlayBtn();
        try {
          const result = await executeAbortably(transport, request);
          // A host can reuse a result object. Give each execution its own metadata key.
          const snapshot = { ...result };
          metadata.set(snapshot, description);
          return snapshot;
        } finally {
          if (activeRequest === id) {
            activeRequest = undefined;
            if (!destroyed) sparnatural.enablePlayBtn();
          }
        }
      },
    },
  });
  if (options.resultsContainer ?? options.editorOptions?.resultsContainer) {
    if (typeof editor.setResultsContainer !== "function") {
      editor.destroy();
      throw new Error(
        "Separate results require an LDForge editor build with resultsContainer support. See docs/LDForge-integration.md for local preview setup."
      );
    }
  }
  const init = (event: Event) => {
    configuration =
      (event as CustomEvent<{ config: ISparnaturalSpecification }>).detail
        ?.config ??
      sparnatural.sparnatural?.specProvider ??
      sparnatural.sparnaturalForm?.specProvider;
  };
  const updated = (event: Event) => {
    const detail = (
      event as CustomEvent<{ queryString: string; queryJson: VisualQuery }>
    ).detail;
    visualQuery = detail.queryJson;
    generatedQuery = sparnatural.expandSparql(detail.queryString);
    editor.setQuery(generatedQuery);
  };
  const submit = () => {
    void editor.run();
  };
  const reset = () => {
    editor.cancel();
    visualQuery = undefined;
    generatedQuery = undefined;
    editor.setQuery("");
  };
  const listeners: [string, EventListener][] = [
    ["init", init],
    ["queryUpdated", updated],
    ["submit", submit],
    ["reset", reset],
    ["resetEditor", reset],
  ];
  listeners.forEach(([name, listener]) =>
    sparnatural.addEventListener(name, listener)
  );
  const setQueryVisible = (value: boolean) => {
    visible = value;
    container.classList.toggle("sparnatural-query-hidden", !value);
  };
  setQueryVisible(visible);
  return {
    editor,
    setQueryVisible,
    isQueryVisible: () => visible,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.forEach(([name, listener]) =>
        sparnatural.removeEventListener(name, listener)
      );
      editor.destroy();
      if (activeRequest) sparnatural.enablePlayBtn();
      activeRequest = undefined;
      container.classList.remove("sparnatural-query-hidden");
    },
  };
}

import { createSvgIcon } from "@ldforge/core";
import type { Binding, QueryResult, ResultRendererPlugin } from "@ldforge/core";
import {
  createGeoRenderer,
  DEFAULT_GEO_LIBRARY_URL,
  DEFAULT_CLUSTER_LIBRARY_URL,
  DEFAULT_HEAT_LIBRARY_URL,
  DEFAULT_THREE_D_LIBRARY_URL,
} from "@ldforge/geo";
import type { GeoRendererOptions } from "@ldforge/geo";
import {
  createChartRenderer,
  DEFAULT_CHART_LIBRARY_URL,
} from "@ldforge/charts";
import type { ChartRendererOptions } from "@ldforge/charts";
import {
  chartResult,
  describeQuery,
  displayValue,
  groupRows,
  imageUrl,
  mapResult,
  webUrl,
} from "./model";
import type { QueryNode, ResultMetadata } from "./model";

export interface SparnaturalResultOptions {
  uriHrefAdapter?: (uri: string) => string;
  geo?: GeoRendererOptions;
  charts?: ChartRendererOptions;
}
export type MetadataProvider = (result: QueryResult) => ResultMetadata;
const gridIcon = createSvgIcon([
  "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
]);
const tableIcon = createSvgIcon(["M3 4h18v16H3zM3 10h18M10 4v16"]);

function appendValue(
  parent: HTMLElement,
  row: Binding,
  variable: string,
  options: SparnaturalResultOptions
) {
  const term = row[variable];
  if (!term) return;
  const doc = parent.ownerDocument;
  const href =
    term.type === "uri"
      ? webUrl(
          options.uriHrefAdapter
            ? options.uriHrefAdapter(term.value)
            : term.value
        )
      : undefined;
  const element = doc.createElement(href ? "a" : "span");
  element.textContent = displayValue(row, variable);
  element.title = term.value;
  if (href) {
    const link = element as HTMLAnchorElement;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  parent.append(element);
}
function visibleVariables(variables: readonly string[]) {
  return variables.filter(
    (name) =>
      !(name.endsWith("_label") && variables.includes(name.slice(0, -6)))
  );
}

/** TableX's paired labels, without rewriting RDF terms or the exported result. */
export function createLabelledTableRenderer(
  metadata: MetadataProvider,
  options: SparnaturalResultOptions = {}
): ResultRendererPlugin {
  return {
    id: "tablex",
    label: { en: "Labelled table", nl: "Tabel met labels" },
    icon: tableIcon,
    supports: (result) => result.kind === "bindings",
    render(container, result) {
      if (result.kind !== "bindings") return;
      const doc = container.ownerDocument;
      const names = visibleVariables(result.variables);
      const labels = metadata(result).labels;
      const search = doc.createElement("input");
      search.type = "search";
      search.placeholder = "Filter results";
      search.setAttribute("aria-label", "Filter results");
      search.className = "sparnatural-result-filter";
      const table = doc.createElement("table");
      table.className = "sparnatural-result-table";
      const caption = table.createCaption();
      caption.textContent = "Query results";
      const head = table.createTHead().insertRow();
      const body = table.createTBody();
      let sortBy: string | undefined,
        descending = false;
      const headers: HTMLTableCellElement[] = [];
      const draw = () => {
        const filter = search.value.toLocaleLowerCase();
        const rows = result.bindings.filter((row) =>
          names.some((name) =>
            `${displayValue(row, name)} ${row[name]?.value ?? ""}`
              .toLocaleLowerCase()
              .includes(filter)
          )
        );
        if (sortBy)
          rows.sort(
            (a, b) =>
              displayValue(a, sortBy!).localeCompare(
                displayValue(b, sortBy!),
                undefined,
                { numeric: true }
              ) * (descending ? -1 : 1)
          );
        headers.forEach((cell, index) =>
          cell.setAttribute(
            "aria-sort",
            names[index] === sortBy
              ? descending
                ? "descending"
                : "ascending"
              : "none"
          )
        );
        body.replaceChildren();
        for (const row of rows) {
          const tr = body.insertRow();
          for (const name of names)
            appendValue(tr.insertCell(), row, name, options);
        }
        caption.textContent = `${rows.length} / ${result.bindings.length} results`;
      };
      for (const name of names) {
        const cell = doc.createElement("th");
        cell.scope = "col";
        const button = doc.createElement("button");
        button.type = "button";
        button.textContent = labels.get(name) || name;
        button.addEventListener("click", () => {
          descending = sortBy === name ? !descending : false;
          sortBy = name;
          draw();
        });
        cell.append(button);
        head.append(cell);
        headers.push(cell);
      }
      search.addEventListener("input", draw);
      container.replaceChildren(search, table);
      draw();
    },
  };
}

/** Entity cards retain row correlations by recursively grouping each query branch. */
export function createGridRenderer(
  metadata: MetadataProvider,
  options: SparnaturalResultOptions = {}
): ResultRendererPlugin {
  return {
    id: "grid",
    label: { en: "Grid", nl: "Raster" },
    icon: gridIcon,
    supports: (result) => result.kind === "bindings",
    render(container, result) {
      if (result.kind !== "bindings") return;
      const doc = container.ownerDocument;
      const info = metadata(result);
      const names = visibleVariables(result.variables);
      // Handwritten queries still have a useful flat grid, without visual-query metadata.
      const root = info.roots.find((node) =>
        result.variables.includes(node.variable)
      ) ?? {
        variable: names[0],
        children: [] as QueryNode[],
      };
      const grid = doc.createElement("div");
      grid.className = "ldforge-cards sparnatural-result-grid";
      grid.setAttribute("role", "list");
      grid.setAttribute("aria-label", "Query results grid");
      const fields = (
        parent: HTMLElement,
        rows: readonly Binding[],
        nodes: readonly QueryNode[],
        used: Set<string>
      ) => {
        const list = doc.createElement("dl");
        for (const node of nodes) {
          used.add(node.variable);
          // Unselected intermediate nodes keep their selected descendants visible.
          const hasValue = rows.some((row) => row[node.variable]);
          if (!hasValue) {
            fields(parent, rows, node.children, used);
            continue;
          }
          const title = doc.createElement("dt");
          title.textContent = info.labels.get(node.variable) || node.variable;
          list.append(title);
          for (const group of groupRows(
            rows.filter((row) => row[node.variable]),
            node.variable
          )) {
            const value = doc.createElement("dd");
            appendValue(value, group[0], node.variable, options);
            fields(value, group, node.children, used);
            list.append(value);
          }
        }
        if (list.childElementCount) parent.append(list);
      };
      const groups = root.variable
        ? groupRows(result.bindings, root.variable)
        : [];
      for (const rows of groups) {
        const row = rows[0];
        const card = doc.createElement("article");
        card.className = "ldforge-card";
        card.setAttribute("role", "listitem");
        const image = rows
          .flatMap((item) => Object.values(item))
          .map(imageUrl)
          .find(Boolean);
        if (image) {
          const img = doc.createElement("img");
          img.src = image;
          img.alt = "";
          img.setAttribute("loading", "lazy");
          img.referrerPolicy = "no-referrer";
          img.addEventListener("error", () => img.remove(), { once: true });
          card.append(img);
        }
        const content = doc.createElement("div");
        content.className = "ldforge-card-body";
        const heading = doc.createElement("h3");
        appendValue(heading, row, root.variable, options);
        if (!heading.textContent) heading.textContent = "Result";
        content.append(heading);
        const used = new Set([root.variable]);
        fields(content, rows, root.children, used);
        const extra: QueryNode[] = names
          .filter((name) => !used.has(name))
          .map((variable): QueryNode => ({ variable, children: [] }));
        fields(content, rows, extra, used);
        card.append(content);
        grid.append(card);
      }
      if (!groups.length) {
        const empty = doc.createElement("p");
        empty.textContent = "No results";
        container.replaceChildren(empty);
      } else container.replaceChildren(grid);
    },
  };
}

function adaptRenderer(
  renderer: ResultRendererPlugin,
  metadata: MetadataProvider,
  adapt: (result: QueryResult, metadata: ResultMetadata) => QueryResult
): ResultRendererPlugin {
  return {
    ...renderer,
    supports: (result) => renderer.supports(adapt(result, metadata(result))),
    render: (container, result, context) =>
      renderer.render(container, adapt(result, metadata(result)), context),
  };
}
// Preserve native browser imports under Webpack as well as Vite.
const loadExternalModule = (url: string): Promise<unknown> =>
  import(/* webpackIgnore: true */ url);
export function createSparnaturalRenderers(
  metadata: MetadataProvider = () => describeQuery(),
  options: SparnaturalResultOptions = {}
) {
  return [
    createLabelledTableRenderer(metadata, options),
    createGridRenderer(metadata, options),
    adaptRenderer(
      createGeoRenderer({
        ...options.geo,
        loadLibrary:
          options.geo?.loadLibrary ??
          (() =>
            loadExternalModule(
              options.geo?.libraryUrl ?? DEFAULT_GEO_LIBRARY_URL
            )),
        loadClusterLibrary:
          options.geo?.loadClusterLibrary ??
          (() =>
            loadExternalModule(
              options.geo?.clusterLibraryUrl ?? DEFAULT_CLUSTER_LIBRARY_URL
            )),
        loadHeatLibrary:
          options.geo?.loadHeatLibrary ??
          (() =>
            loadExternalModule(
              options.geo?.heatLibraryUrl ?? DEFAULT_HEAT_LIBRARY_URL
            )),
        loadThreeDLibrary:
          options.geo?.loadThreeDLibrary ??
          (() =>
            loadExternalModule(
              options.geo?.threeDLibraryUrl ?? DEFAULT_THREE_D_LIBRARY_URL
            )),
      }),
      metadata,
      mapResult
    ),
    adaptRenderer(
      createChartRenderer({
        ...options.charts,
        loadLibrary:
          options.charts?.loadLibrary ??
          (() =>
            loadExternalModule(
              options.charts?.libraryUrl ?? DEFAULT_CHART_LIBRARY_URL
            )),
      }),
      metadata,
      chartResult
    ),
  ];
}

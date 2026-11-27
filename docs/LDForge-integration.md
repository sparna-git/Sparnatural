_[Home](index.html) > LDForge integration_

# LDForge editor and result integration

Sparnatural generates SPARQL independently of any query editor or result viewer.
The development page, Hello Sparnatural example and starter use an optional
[LDForge](https://github.com/mightymax/ldforge) integration. The core
`<spar-natural>` component does not import LDForge. Existing Yasgui applications
can continue using `sparnatural-bindings.js`; those functions are unchanged.

> This guide describes the integration on this branch; the Sparnatural integration
> must be published before it can be installed from the registry.
> This working branch uses the unpublished LDForge separate-results API in its
> examples. Before building, follow [local archive setup](#testing-the-unpublished-ldforge-extension).
> A released editor version containing this API must be required before merging
> or publishing these examples.

## Browser bundles

Build with `npm install` followed by `npm run build`. Serve the generated files
through HTTP, rather than opening HTML through `file:` URLs. The integration is
included in the generated `hello-sparnatural.zip` and `sparnatural-starter.zip`.
For another host page, copy **all** files from `dist/browser`, retaining their
relative paths, including lazy JavaScript chunks and source maps:

```html
<link rel="stylesheet" href="sparnatural.css" />
<link rel="stylesheet" href="sparnatural-ldforge.css" />

<spar-natural
  src="config.ttl"
  endpoint="https://dbpedia.org/sparql"
  lang="en"
  defaultLang="en"
  limit="1000"
></spar-natural>
<div id="ldforge"></div>

<script src="sparnatural.js"></script>
<script src="sparnatural-ldforge.js"></script>
<script>
  const integration = SparnaturalLDForge.createSparnaturalLDForge(
    document.querySelector("spar-natural"),
    document.getElementById("ldforge")
  );
</script>
```

Load Sparnatural's other theme, font and widget assets as in the supplied
examples. The integration stylesheet includes LDForge's editor and result styles.
Do not load Triply Yasgui or `sparnatural-yasgui-plugins.js` in these migrated pages.

## Bundler integration

Install the optional peers only when using the integration:

```sh
npm install sparnatural @ldforge/core@^1.0.2 @ldforge/editor@^1.4.1 \
  @ldforge/renderers@^1.1.2 @ldforge/geo@^1.1.2 @ldforge/charts@^1.0.2
```

```javascript
import "sparnatural";
import "sparnatural/ldforge/styles.css";
import { createSparnaturalLDForge } from "sparnatural/ldforge";

const integration = createSparnaturalLDForge(
  document.querySelector("spar-natural"),
  document.getElementById("ldforge"),
  { queryVisible: false },
);

integration.setQueryVisible(true);
integration.editor.setQuery("SELECT * WHERE { ?s ?p ?o } LIMIT 10");
await integration.editor.run();
// On SPA/component unmount:
integration.destroy();
```

This is an ESM entry intended for a bundler with package-exports support.
TypeScript consumers should use `moduleResolution: "bundler"` or an appropriate
Node ESM resolution mode. Import the existing Sparnatural styles and theme as
usual. Importing Sparnatural's main entry alone does not load this integration.

## Events and execution

`createSparnaturalLDForge(source, container, options?)` binds these events:

| Source event             | Behavior                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `init`                   | Store the specification provider for entity and property labels.                                                      |
| `queryUpdated`           | Expand the SPARQL text and replace the editor query without executing it. Keep the visual query for result structure. |
| `submit`                 | Execute the current editor text.                                                                                      |
| `reset` or `resetEditor` | Cancel the active query and clear the editor text and visual-query metadata.                                          |

Execution from either Sparnatural or LDForge uses the same transport. By default,
it calls `source.executeSparql()`, retaining Sparnatural's endpoint catalog,
custom handler and authentication configuration. This callback API returns SPARQL
Results JSON and supports SELECT/ASK results. Stopping a query suppresses its late
response but cannot abort that callback transport's underlying network request.
Loading finishes on success, error and cancellation. Sparnatural's own
`enablePlayBtn()` policy is retained: it removes the spinner; the visual query
builder decides when its submit button becomes available again.

For an abortable HTTP transport, or graph queries, supply an LDForge executor:

```javascript
import { createHttpExecutor } from "@ldforge/core";
const integration = createSparnaturalLDForge(sparnatural, container, {
  executor: createHttpExecutor({
    endpoint: sparnatural.getAttribute("endpoint"),
    method: "GET",
    // headers: { Authorization: 'Bearer ...' },
  }),
});
```

This explicit executor bypasses Sparnatural's catalog and custom handler. Hosts
own endpoint selection, headers and CORS. No credentials or workspace are stored
by the integration. `destroy()` removes event listeners, cancels execution and
destroys the editor; call it before removing or remounting an integration.

Options are `queryVisible` (default `true`), `resultsContainer`, `executor`, `editorOptions` and
`resultOptions`. `editorOptions` forwards LDForge editor configuration, including
controls and renderer replacement. The default theme color is `#1d78e0`; override it
with `editorOptions.themeMainColor`. Query tabs are hidden by default. LDForge UI
localization supports English and Dutch; its default here is English, even when
Sparnatural's configuration labels are French. Set
`editorOptions: { locale: 'nl' }` for Dutch LDForge controls. The Sparnatural
Labelled table and Grid messages currently use English.

## Result views and migration differences

| Previous view          | LDForge integration                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TableX                 | **Labelled table** (`tablex`): clickable labels, column sorting and text filtering. `?x_label` is displayed as the label of `?x`; the paired label column is hidden. |
| Grid                   | **Grid** (`grid`): merge rows by the root RDF term, preserve nested query branches, show property labels and an image.                                               |
| Map                    | **Map** (`geo`): adapt WKT literals or latitude/longitude columns to LDForge geometry bindings.                                                                      |
| Stats                  | **Charts** (`charts`): adapt the first selected COUNT aggregate and other selected category columns. A scalar COUNT appears as a single bar.                         |
| Response               | **JSON** (`json`): normalized typed results, rather than the raw HTTP response.                                                                                      |
| General table          | **Table** (`table`): LDForge's native RDF table and resource inspector.                                                                                              |
| Handwritten card query | **Cards** (`cards`): LDForge's standard `card_title`, `card_text`, `card_image`, `card_button`, `card_button_url` contract.                                          |

Grid accepts both v13 and legacy visual-query JSON. Rows with the same root IRI
merge even if repeated labels differ; different IRIs with the same label stay
separate. Related values group within each parent branch, keeping correlations
such as a membership and its date. Unbound roots remain separate. If the visual
root is not selected, Grid groups by the first displayed result variable and
shows a flat summary. Missing intermediate variables cannot establish entity
identity; selected descendants remain visible. Extra selected columns are also
shown. Image discovery uses HTTP(S) URLs with common image extensions; failed
images disappear. Images load directly from their source, without an image proxy.

Manual SPARQL edits use the generic result layout rather than stale visual-query
metadata. Metadata is captured per execution; editing the visual query while a
request runs does not change that response's labels or structure. View adapters
never alter the editor's original RDF terms, row count, JSON or CSV export.

This is not a Yasr plugin API shim. DataTables options, `bindingSetAdapter`,
configuration icons, the old Grid's exact layout, Stats' standalone numeric/polar
views and Map's searched-area overlay/size-based polygon layers are not ported.
Use the native Table for RDF details and larger datasets, and provide custom
LDForge renderers through `editorOptions.renderers` for application-specific
presentation. Labelled table and Grid render all returned rows; use a query LIMIT
for large datasets.

To retain custom destination URLs, use:

```javascript
const integration = createSparnaturalLDForge(sparnatural, container, {
  resultOptions: {
    uriHrefAdapter: (uri) =>
      uri.replace(
        "http://fr.dbpedia.org/resource/",
        "https://fr.wikipedia.org/wiki/",
      ),
  },
});
```

Only absolute HTTP(S) links are clickable. Labels are text, never HTML. Blank
nodes and unsafe link schemes remain plain text. Source URIs remain unchanged in
JSON and CSV.

## Maps and charts

A selected literal typed `geo:wktLiteral` is adapted to `geometry`. Alternatively,
latitude/longitude are recognized from their variable or configured property
names. Coordinates must use WGS84; longitude comes first in the generated WKT.
Incomplete rows remain in the result, and LDForge reports unsupported/invalid
geometry. Multiple coordinate pairs are not guessed: alias the desired pair to
`geometry` in a handwritten query. Existing LDForge geometry/chart/card bindings
can also be used directly. Without a visual COUNT aggregate, use `chart_label`
and `chart_value` in handwritten chart queries.

Map/chart libraries load only when their views are used. Defaults are pinned
jsDelivr modules (Leaflet 1.9.4, Chart.js 4.6.1, Supercluster 8.0.1, simpleheat
0.4.0 and MapLibre GL JS 6.18.0). The default basemap uses OpenStreetMap tiles.
Deployments must permit the needed scripts, styles, images and tiles in CSP and
respect each provider's terms. To self-host them, pass LDForge's loader/style/tile
options under `resultOptions.geo` and `resultOptions.charts`, for example:

```javascript
const integration = createSparnaturalLDForge(sparnatural, container, {
  resultOptions: {
    geo: {
      loadLibrary: () => import("leaflet"),
      stylesheetUrl: "/leaflet.css",
      tileUrl: false,
    },
    charts: { loadLibrary: () => import("chart.js/auto") },
  },
});
```

Install those host libraries when using these loaders. Also override the optional
cluster, heatmap and 3D loaders/styles if those modes must work without a CDN.
See [LDForge's renderer reference](https://github.com/mightymax/ldforge/blob/main/docs/renderers.md)
for supported geometry, loader contracts and renderer options.

## Local development and checks

Run `npm run dev` and open <http://127.0.0.1:4174/dev-page/>. The preview binds to
loopback and reloads on source changes. Its DBpedia configuration is included in
the repository; value suggestions and live query execution need network access.
`npm start` remains available with the original Webpack defaults.

Run `npm test -- --runInBand src/__tests__/ldforge` for integration unit tests and
`npm run build` to validate the browser bundles and generated example archives.
The unit tests cover query formats, grouping, labels, unsafe URLs, coordinate and
COUNT adaptation, transport failures, cancellation, reset and disposal.

## Separate, full-width results

The development pages keep Sparnatural on the left and the query editor on the
right, with results below both columns. Hello Sparnatural and the starter also
use separate query/results hosts, so hiding the query leaves results visible.

```html
<div class="row">
  <div class="col-md-7"><spar-natural></spar-natural></div>
  <div class="col-md-5"><div id="ldforge"></div></div>
</div>
<div id="ldforge-results"></div>
```

```javascript
const integration = createSparnaturalLDForge(
  sparnatural,
  document.getElementById("ldforge"),
  {
    resultsContainer: document.getElementById("ldforge-results"),
  },
);
```

This moves the complete result UI: view selection (including Sparnatural's
entity-grouped, nested Grid), status, loading, errors, documentation and CSV.
`queryVisible` affects only the query host. Omitting `resultsContainer` retains
the combined layout. Both hosts must belong to the same document. The integration
stylesheet styles both; place custom CSS variables on a shared ancestor or both
hosts. `destroy()` cleans up owned content in both while preserving the hosts.

### Testing the unpublished LDForge extension

The separate-container API is currently a local LDForge change; the published
`@ldforge/editor@1.4.1` does not contain it. The dependency range is retained for
review, and separate-host use reports a clear error on an older editor. Before
merging/publishing the migrated examples, require the released editor version
that contains this API and validate using that registry package.

For now, install a real npm archive of the local editor (including its built
styles/types) without committing absolute paths or changing dependency manifests:

```sh
node scripts/use-local-ldforge.mjs ~/Code/LDMax/LDForge
npm run dev
```

The helper builds and packs only the editor, installs it with `--no-save
--package-lock=false`, and never publishes or changes versions. Restart an already
running dev server after installing. The archive remains in the temporary path
printed by the helper. Re-run the helper after LDForge source changes; `npm install`
restores registry dependencies. Other LDForge dependencies use the declared
registry versions. No local links, vendored bundles or tarballs belong in the PR.

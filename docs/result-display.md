_[Home](index.html) > Result display_

# LDForge result views

Sparnatural generates a query; the optional LDForge integration edits the SPARQL,
executes it and displays the results. The supplied examples register the views
below. See [LDForge integration](LDForge-integration.md) for setup and the
[legacy plugin reference](archives/result-display-yasgui.md) for existing Yasgui
applications. These are different plugin APIs, not interchangeable constructors.

## Labelled table

The **Labelled table** (`tablex`) presents `?x` using its `?x_label` when both
columns are selected. It hides the paired label column and keeps HTTP(S) resource
links clickable. Sorting uses the displayed label; the search field filters both
labels and original values. Configuration labels name the column headings when
visual-query metadata is available.

```sparql
SELECT ?person ?person_label WHERE {
  VALUES (?person ?person_label) {
    (<https://example.org/alice> "Alice")
    (<https://example.org/bob> "Bob")
  }
}
```

Sparnatural can generate these label columns from `dash:LabelRole` in a SHACL
configuration or `core:defaultLabelProperty` in older OWL configurations. See
[SHACL configuration](SHACL-based-configuration.md). To change the destination
of resource links, configure `resultOptions.uriHrefAdapter`; JSON and CSV still
contain the original URI. See the [custom destination example](LDForge-integration.md#result-views-and-migration-differences).

## Grid

**Grid** (`grid`) is the Sparnatural-specific entity view. It is distinct from
LDForge's generic Cards view. The integration supplies the configuration and the
visual query automatically; no `notifyQuery()` or `notifyConfiguration()` calls
are needed.

- Rows with the same root RDF term become one card. Distinct IRIs with identical
  labels stay separate.
- Nested query branches retain parent/child correlations, such as a membership
  and its date. Configuration property labels describe those fields.
- Additional selected columns remain visible. Common HTTP(S) image URLs are
  discovered automatically and displayed with lazy loading.
- Both v13 and legacy visual-query JSON are understood.

If the root variable is not selected, Grid uses the first displayed variable and
a flat layout. An unselected intermediate variable cannot identify related
entities; its selected descendants remain visible. Hand-edited SPARQL uses a
flat layout instead of potentially stale visual-query metadata. The original
bindings and CSV row count never change when Grid merges the presentation.

Labelled table and Grid render all returned rows. Use a query LIMIT for larger
results, or select the native Table for its additional RDF and viewport features.
The old Grid's exact styling and configuration icons are not reproduced.

## Cards

**Cards** (`cards`) is LDForge's generic grid: one card per result row, using these
exact variable names. It does not merge entities or reconstruct a visual query.

| Variable | Content |
| --- | --- |
| `card_title` | Plain-text title |
| `card_text` | Plain-text description |
| `card_image` | HTTP(S) or relative image URL |
| `card_button` | Link label |
| `card_button_url` | Link destination |

```sparql
# view=cards
SELECT ?card_title ?card_text ?card_button ?card_button_url WHERE {
  VALUES (?card_title ?card_text ?card_button ?card_button_url) {
    ("Alice" "First example" "Open resource" <https://example.org/alice>)
    ("Bob" "Second example" "Open resource" <https://example.org/bob>)
  }
}
```

At least one of the card fields must be selected. All are optional per row; a
button requires both its text and destination. Text is never interpreted as HTML.

## Map

**Map** (`geo`) uses LDForge's geographic renderer. The Sparnatural adapter
recognizes selected `geo:wktLiteral` values, or a latitude/longitude pair from
variable/configured property names. Handwritten queries can return `geometry`
and optional `geometryLabel`, `geoImage`, `geoDescription` and `geoLink` directly:

```sparql
# view=geo
SELECT ?geometry ?geometryLabel WHERE {
  VALUES (?geometry ?geometryLabel) {
    ("POINT(4.9 52.37)" "Amsterdam")
  }
}
```

Use WGS84 coordinates, longitude first. Points, lines, polygons and their multi
variants are supported. Invalid/incomplete geometry is reported without deleting
rows from the original result. The renderer offers normal, grouped, heatmap and
3D modes. The old searched-area overlay and polygon layers grouped by size are
not ported. External libraries load on activation; configure their loaders,
styles and tiles under `resultOptions.geo` to self-host them.

## Charts

**Charts** (`charts`) adapts the first selected visual-query COUNT aggregate to
`chart_value`, with the other selected fields providing the categories. A scalar
COUNT becomes a single bar. Handwritten queries use named bindings:

```sparql
# view=charts; chart=bar
SELECT ?chart_label ?chart_value WHERE {
  VALUES (?chart_label ?chart_value) { ("A" 2) ("B" 3) }
}
```

Bar, line, pie and doughnut charts are supported. The previous Stats plugin's
standalone numeric and polar views are not included. Chart.js loads only when
activated; configure `resultOptions.charts` for a host-provided loader.

## Native Table, JSON and CSV

**Table** (`table`) is LDForge's native RDF table with sorting, filtering, RDF
term details and a resource inspector. **JSON** (`json`) shows normalized typed
results, not the raw endpoint response. ASK results use the Boolean renderer;
CONSTRUCT/DESCRIBE require an executor that supports graph responses.

The CSV download includes the original complete result, regardless of the
selected view or Grid grouping. It retains original URI and literal values.
See the [LDForge renderer reference](https://github.com/mightymax/ldforge/blob/main/docs/renderers.md)
for complete binding contracts, native table viewport settings and external
library options.

_[Home](../index.html) > Hello Sparnatural_

# Hello Sparnatural with LDForge

This tutorial adapts the Hello Sparnatural page to your own knowledge graph.
Sparnatural supplies the visual query builder; LDForge supplies the SPARQL editor
and result views. You will serve the example locally, connect an endpoint,
configure two related classes, and inspect the generated query and results.

> These instructions describe the LDForge-enabled example in this branch, not an
> already published release. The separate-results layout currently requires the
> [local LDForge extension](../LDForge-integration.md#testing-the-unpublished-ldforge-extension).
> The [October 2024 tutorial](Hello-Sparnatural-yasgui.md), its
> [PDF](Hello-Sparnatural.pdf) and [Word file](Hello-Sparnatural.docx) are historical
> Yasgui versions, not instructions for the current editor.

## Prerequisites

You need a SPARQL endpoint, the class/property IRIs used in its dataset, a text
editor, and a spreadsheet editor if you configure Sparnatural through Excel.
The supplied configuration includes a Museum/Country example for DBpedia.
For your own dataset, choose two related classes and a property between them.

## Build or obtain the example

From the repository containing this integration:

```sh
npm install
node scripts/use-local-ldforge.mjs /path/to/LDForge
npm run build
```

The helper installs a local editor archive without publishing packages or changing
the dependency manifest. The [integration guide](../LDForge-integration.md)
explains that temporary prerequisite and how to restore registry dependencies.
Extract `dist/hello-sparnatural.zip` into a working directory. When a release
containing the LDForge integration becomes available, its matching archive can
be used instead. An older Yasgui release does not have these new bundle files.

| File | Purpose |
| --- | --- |
| `index.html` | Page layout, the visual builder and separate editor/result containers |
| `main.js` | Mounts the LDForge integration and handles the query visibility button |
| `config.ttl` | RDF configuration read by Sparnatural |
| `config.xlsx` | Editable configuration spreadsheet |
| `config-hello-sparnatural-foaf.xlsx` | Reference spreadsheet for the FOAF example |
| `example-queries.js` | Saved visual-query examples |
| `styles.css` | Application-specific page styles |
| `sparnatural.js`, `sparnatural.css` | Built query builder and styles |
| `sparnatural-ldforge.js`, `sparnatural-ldforge.css` | Built optional LDForge integration |
| Other generated JavaScript chunks and license notices | Required assets; keep them beside the bundles |
| `fa/` | Supplied Font Awesome assets |

Do not edit generated bundles. The current page does not load the older Triply
scripts or `sparnatural-yasgui-plugins.js`, even if an old asset remains in the
source folder for compatibility.

## Serve the page locally

<a id="_Toc9"></a>

From the extracted directory, start an HTTP server, for example:

```sh
python3 -m http.server 4180 --bind 127.0.0.1
```

Open <http://127.0.0.1:4180/>. Serve the page over HTTP instead of opening
`index.html` with `file:`. No browser security setting needs to be disabled.
For work on the repository itself, `npm run dev` serves the development page at
<http://127.0.0.1:4174/dev-page/>; it is separate from the extracted example.

The initial page shows the visual builder. **Toggle SPARQL query** reveals the
editor, while results have their own full-width area. A query is executed when
you submit it, not merely when you edit it or select another result view.

## Connect your endpoint

In `index.html`, set the attributes of the visual builder:

```html
<spar-natural
  src="myconfig.ttl"
  endpoint="https://your-endpoint.example/sparql"
  lang="en"
  defaultLang="en"
  distinct="true"
  limit="100"
  debug="true"
></spar-natural>
```

Use a real endpoint URL and a configuration file matching that dataset. Keep
`config.ttl` while trying the supplied DBpedia Museum/Country example.
`lang` chooses user-facing labels; `defaultLang` is a language available in the
dataset to use as fallback. See the [attribute reference](../Javascript-integration.md#html-attributes-reference).

The endpoint must permit browser requests from the origin hosting your page.
Check its CORS configuration or use an application-controlled
[SPARQL proxy](../SPARQL-proxy.md). Serve both page and endpoint through HTTPS
when deploying to an HTTPS site. For credentials, see
[authenticated endpoints](../Querying-a-password-protected-SPARQL-endpoint.md).
The default LDForge binding shares Sparnatural's transport configuration.

## Configure two related classes

The spreadsheet describes SHACL shapes that control the query builder; it does
not change your dataset. The configuration shape's identifier and the ontology
class/property IRI have different purposes. The example below uses FOAF
Organizations with `foaf:member` links to Persons. Substitute classes and
properties that actually occur in your endpoint.

### Entities sheet

Preserve the workbook's prefix declarations and column headings. Replace the
example entity rows with two `sh:NodeShape` entries:

| Field | Person | Organization |
| --- | --- | --- |
| Configuration identifier | `this:Person` | `this:Organization` |
| Type | `sh:NodeShape` | `sh:NodeShape` |
| Target class | `foaf:Person` | `foaf:Organization` |
| English label | Person | Organization |
| Order | 1 | 2 |
| Optional free Font Awesome icon | `fa-solid fa-user` | `fa-solid fa-building` |

Use the workbook's existing language-tagged label and description columns. Keep
`foaf` declared as `http://xmlns.com/foaf/0.1/` in its prefixes. The supplied FOAF
reference workbook can help compare the shape identifiers with the target classes.

### Properties sheet

Add a relation from Organization to Person:

| Field | Value |
| --- | --- |
| Configuration property identifier | `this:Organization_member` |
| Ontology property/path | `foaf:member` |
| Domain configuration entity | `this:Organization` |
| English label | member |
| Node kind | `sh:IRI` |
| Target class | `foaf:Person` |
| Search widget | `core:ListProperty` |

Column positions can differ between workbook revisions; use the headings rather
than fixed cell coordinates. The domain is the configuration entity, while the
target class is the ontology class as defined in the workbook. See the
[SHACL configuration guide](../how-to-configure-shacl/How-to-configure-Sparnatural-shacl.md)
for the complete spreadsheet format and widget choices.

For readable resource labels, configure a label property with
`dash:propertyRole dash:LabelRole`. Sparnatural generates paired result columns
such as `?Person` and `?Person_label`; LDForge's Labelled table presents the label
as a resource link. Grid can use it as a card title. These remain the original
URI/literal terms in JSON and CSV.

### Export the configuration

Convert the edited workbook to RDF Turtle using the spreadsheet conversion
workflow in the [configuration guide](../how-to-configure-shacl/How-to-configure-Sparnatural-shacl.md),
and save it as `myconfig.ttl` beside `index.html`. Re-export after each spreadsheet
change. Set `src="myconfig.ttl"` and reload the page.

## Verify the query and results

1. Select Organization, then Person through the member relation.
2. Choose a member or the widget's **Any** option.
3. Show the SPARQL editor and inspect the query. Shape identifiers should be
   expanded to the ontology IRIs and paths from your configuration.
4. Submit the query. Results appear below the query area.
5. Try Labelled table, Grid, native Table or JSON. CSV downloads the original
   result even when Grid groups several rows into one entity card.

Grid uses the visual query's branches to keep related values together. It is not
the same as LDForge's generic Cards view, which uses `card_title`, `card_text`
and related named bindings in handwritten queries. See the
[result-view reference](../result-display.md) for all views and migration differences.

If the builder is empty, inspect the network request for `myconfig.ttl` and check
its URL and RDF syntax. If suggestions or results fail, check the endpoint URL,
CORS, credentials and the class/property IRIs. Empty results can also mean the
dataset does not contain the relationship in your configuration. Browser network
and console tools help distinguish a failed request from an empty result.

## How the LDForge binding works

The page has separate query and result hosts. `main.js` mounts one integration:

```javascript
const integration = SparnaturalLDForge.createSparnaturalLDForge(
  document.querySelector("spar-natural"),
  document.getElementById("ldforge"),
  {
    resultsContainer: document.getElementById("ldforge-results"),
    queryVisible: false,
  },
);
```

The helper expands/synchronizes queries, handles submit/reset and uses
`sparnatural.executeSparql()` by default. The toggle calls
`setQueryVisible()` without hiding results. Hosts that remove the component
should call `destroy()` first. Do not add duplicate execution listeners.
See the [API and migration guide](../LDForge-integration.md) for customization,
theme color, executors and limitations of the old plugin migration.

## Save example queries

Observe `queryUpdated` to copy its visual-query JSON:

```javascript
sparnatural.addEventListener("queryUpdated", (event) => {
  console.log(JSON.stringify(event.detail.queryJson, null, 2));
});
```

Define `sparnatural` as the page's `<spar-natural>` element. Save the object as an
example variable in `example-queries.js`, then enable or add a link that calls
`sparnatural.loadQuery(example_1)`. Create examples only after the configuration
is stable; changing shape identifiers may require updating saved queries.
Loading an example updates the editor but does not itself execute the query.

## Deploy the example

Upload the complete generated folder, including configuration, styles, fonts,
lazy chunks and license notices. Keep its relative paths intact. Configure the
endpoint/proxy for the deployed origin and review the
[map/chart library settings](../LDForge-integration.md#maps-and-charts) if those
views must use self-hosted resources. The old PDF and Word tutorials remain
available as historical references; this Markdown page is the current guide.
